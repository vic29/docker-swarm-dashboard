const env = require('../environment/envHandler.js');
const websocket = require('../websocketHandler.js');
const email = require('../sendEmail.js');

module.exports = {

    mark: function (dockerData, groups) {
        calculateGroupArea(dockerData, groups);
    }

}

function calculateGroupArea(fullData, groups) {
    try {
        // Workspace number calculations
        const totalAvailableResources = getTotalAvailableResources(fullData);
        const workspacePercent = 100 - (env.get('SYSMTEM_STANDBY_PERCENT') + env.get('LIMIT_RESERVED_GAP_PERCENT'));
        const workspaceTotalCPU = totalAvailableResources.cpu / 100 * workspacePercent;
        const workspaceTotalMemory = totalAvailableResources.memory / 100 * workspacePercent;
        let groupWeightSum = 0;
        groups.forEach(g => {
            groupWeightSum += g.allocation.weight;
        });
        const weightMemoryUnit = workspaceTotalMemory / groupWeightSum;
        const weightCPUUnit = workspaceTotalCPU / groupWeightSum;

        // Group usage calculations
        let totalDeclaredResources = {
            cpu: 0,
            memory: 0
        };
        groups.forEach(g => {
            g.workspace = {
                resource: {
                    usableTotalMemory: g.allocation.weight * weightMemoryUnit,
                    usableTotalCPU: g.allocation.weight * weightCPUUnit,
                    usedTotalMemory: 0,
                    usedTotalCPU: 0
                }
            }
            calculateGroupResource(fullData.serviceGroups, g);
            totalDeclaredResources.cpu += g.workspace.resource.usedTotalCPU;
            totalDeclaredResources.memory += g.workspace.resource.usedTotalMemory;
        });

        markOverloadedEcosystems(fullData, groups, totalDeclaredResources, totalAvailableResources);
    } catch (e) {
        const msg = 'General error in resource overload detection: ' + e;
        websocket.broadcast('server-error', msg);
        email.sendToSupport('Marking problem on ' + env.get('SWARM_BASE_URL'), msg);
        console.log(msg);
    }
}

function getTotalAvailableResources(fullData) {
    fullData.nodeTotal = {
        cpu: 0,
        memory: 0
    };
    fullData.nodes.filter(n => n.Spec.Availability === 'active' && n.Status.State === 'ready').forEach(n => {
        fullData.nodeTotal.cpu += n.Description.Resources.NanoCPUs;
        fullData.nodeTotal.memory += n.Description.Resources.MemoryBytes;
    });
    return fullData.nodeTotal;
}

function calculateGroupResource(dockerServiceGroups, oneGroup) {
    let inGroup = dockerServiceGroups
        .filter(s => JSON.stringify(s).toLowerCase().indexOf((oneGroup.serviceFilter ? oneGroup.serviceFilter.toLowerCase() : '-!-NOT-MATCHING-FILTER-!-')) > -1);

    inGroup.sort((a, b) => a.priority - b.priority);

    inGroup.forEach(ecosystem => {
        ecosystem.workspace = {
            resource: {
                usedTotalMemory: 0,
                usedTotalCPU: 0
            }
        };
        ecosystem.services.forEach(container => {
            try {
                oneGroup.workspace.resource.usedTotalMemory += container.Spec.TaskTemplate.Resources.Reservations.MemoryBytes;
                oneGroup.workspace.resource.usedTotalCPU += container.Spec.TaskTemplate.Resources.Reservations.NanoCPUs;

                ecosystem.workspace.resource.usedTotalMemory += container.Spec.TaskTemplate.Resources.Reservations.MemoryBytes;
                ecosystem.workspace.resource.usedTotalCPU += container.Spec.TaskTemplate.Resources.Reservations.NanoCPUs;
            } catch (e) {
                console.log('Error while counting used resources');
            }
        });
    });

    let memoryGAP = oneGroup.workspace.resource.usedTotalMemory - oneGroup.workspace.resource.usableTotalMemory;
    let cpuGAP = oneGroup.workspace.resource.usedTotalCPU - oneGroup.workspace.resource.usableTotalCPU;
    inGroup.forEach((eco, idx) => {
        if (memoryGAP > 0 || cpuGAP > 0) {
            memoryGAP = memoryGAP - eco.workspace.resource.usedTotalMemory;
            cpuGAP = cpuGAP - eco.workspace.resource.usedTotalCPU;
            eco.workspace.overloaded = idx + 1;
        }
    });
}

function markOverloadedEcosystems(dockerData, groups, totalDeclaredResources, totalAvailableResources) {
    // If swarm is overloaded
    let totalMemoryGAP = totalDeclaredResources.memory - totalAvailableResources.memory;
    let totalCPUGAP = totalDeclaredResources.cpu - totalAvailableResources.cpu;
    if (totalCPUGAP > 0 || totalMemoryGAP > 0) {
        dockerData.serviceGroups.filter(eco => eco.workspace.overloaded).sort((a, b) => a.workspace.overloaded - b.workspace.overloaded).forEach(eco => {
            if (totalCPUGAP > 0 || totalMemoryGAP > 0) {
                totalCPUGAP = totalCPUGAP - eco.workspace.resource.usedTotalCPU;
                totalMemoryGAP = totalMemoryGAP - eco.workspace.resource.usedTotalMemory;
                eco.markedMessage += '\nSwarm is overloaded, and remove this ecosystem, because this is over the project space!';
                eco.markedAsRemove = true;
            }
        });
    }
}