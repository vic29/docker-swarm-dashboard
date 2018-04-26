const env = require('../environment/envHandler.js');
const removeByLabel = env.get('REMOVE_BY_LABEL');
const labelPrefix = env.get('LABEL_PREFIX');

const removeByResourceMissing = env.get('REMOVE_BY_MISSING_RESOURCE_ALLOCATION');
const allowedResourceGapPercent = env.get('LIMIT_RESERVED_GAP_PERCENT') || 10;

module.exports = {

    mark: function (dockerData, groups) {
        dockerData.serviceGroups.forEach(ecosystem => {
            const isTheReviewFinished = isReviewFinished(ecosystem);
            ecosystem.markedAsRemove = isTheReviewFinished || (!isTheReviewFinished && !gotInfoLabel(ecosystem)) || !isAllResourcesAllocatedInGoodWay(ecosystem);

            markBadPriority(ecosystem);
            markNotInAnyGroup(ecosystem, groups);
        });
    }

}

function isReviewFinished(ecosystem) {
    const result = ecosystem.review && (ecosystem.review["status"] === "MERGED" || ecosystem.review["status"] === "ABANDONED");
    if (result) {
        ecosystem.markedMessage += '\nReview is finished, no longer opened!';
    }
    return result;
}

function gotInfoLabel(ecosystem) {
    if (!removeByLabel) {
        return true;
    }
    const result = ecosystem.services.filter(s => {
        const sourceLabels = s.Spec ? s.Spec.Labels || {} : {};
        let labels = Object.keys(sourceLabels).map(function (objectKey, index) {
            return {
                key: objectKey,
                value: sourceLabels[objectKey]
            };
        }).filter(l => l.key.toLowerCase().startsWith(labelPrefix + '.info'));
        return labels.length > 0;
    }).length > 0;

    if (!result) {
        ecosystem.markedMessage += '\nThere is no "' + labelPrefix + '.info" label definition on any container!';
    }
    return result;
}

function isAllResourcesAllocatedInGoodWay(ecosystem) {
    if (!removeByResourceMissing) {
        return true;
    }
    return ecosystem.services.filter(s => {
        try {
            const reservedMemory = s.Spec.TaskTemplate.Resources.Reservations.MemoryBytes;
            const limitMemory = s.Spec.TaskTemplate.Resources.Limits.MemoryBytes;
            const currentMemoryGapInPercent = (limitMemory - reservedMemory) / reservedMemory * 100;

            const reservedCPU = s.Spec.TaskTemplate.Resources.Reservations.NanoCPUs;
            const limitCPU = s.Spec.TaskTemplate.Resources.Limits.NanoCPUs;
            const currentCPUGapInPercent = (limitCPU - reservedCPU) / reservedCPU * 100;

            if (reservedMemory > limitMemory || reservedCPU > limitCPU) {
                ecosystem.markedMessage += '\nReserved resource value is higher than Limit value';
                return true;
            }

            const result = currentMemoryGapInPercent > allowedResourceGapPercent || currentCPUGapInPercent > allowedResourceGapPercent;
            if (result) {
                ecosystem.markedMessage += '\nLimit and Reserved GAP is higher than ' + allowedResourceGapPercent + '%';
            }
            return result;
        } catch (e) {
            ecosystem.markedMessage += '\nInvalid or missing resource allocation (limit and/or reserved)';
            return true;
        }
    }).length <= 0;
}

function markNotInAnyGroup(eco, groups) {
    const sourceStr = JSON.stringify(eco).toLowerCase();
    let inGroupNum = groups.filter(g => {
        if (g.serviceFilter) {
            return sourceStr.indexOf(g.serviceFilter.toLowerCase()) > -1;
        } else {
            return false;
        }
    }).length;
    if (inGroupNum > 1) {
        eco.markedMessage += '\nEcosystem is in more than one group!';
        eco.markedAsRemove = true;
    } else if (inGroupNum <= 0) {
        eco.markedMessage += '\nEcosystem is not in any group!';
        eco.markedAsRemove = true;
    }
}

function markBadPriority(ecosystem) {
    const label = env.get('LABEL_PREFIX') + '.priority';
    const labelValues = ecosystem.services.filter(s => {
        const sourceLabels = s.Spec ? s.Spec.Labels || {} : {};
        let labels = Object.keys(sourceLabels).map(function (objectKey, index) {
            return {
                key: objectKey,
                value: sourceLabels[objectKey]
            };
        }).filter(l => l.key.toLowerCase() === label.toLowerCase());
        return labels.length > 0;
    }).map(s => s.Spec.Labels[label]);

    const prioValue = labelValues && labelValues.length > 0 ? parseInt(labelValues[0]) : 0;

    if (prioValue >= 0 && prioValue <= 100) {
        ecosystem.priority = prioValue;
    } else {
        ecosystem.markedMessage += '\nPriority value is invalid! Please define between 0 and 100 !';
        ecosystem.markedAsRemove = true;
    }
}