const Docker = require('dockerode');

// https://gist.github.com/jupeter/b39e11521452129af2af85cc855c91d7
// majd service docker restart

//var docker = new Docker({socketPath: '/var/run/docker.sock'});
const dockerHost = process.env.DOCKER_MANAGER_HOST; // like: http://localhost
const dockerPort = process.env.DOCKER_MANAGER_PORT; // like 2375
const dockerSocket = process.env.DOCKER_MANAGER_SOCKET || '/var/run/docker.sock';
const docker = dockerHost && dockerPort ? new Docker({host: dockerHost, port: dockerPort}) : new Docker({socketPath: dockerSocket});

const cron = require('node-cron');
const checkPeriodInMillisec = process.env.REFRESH_DELAY_IN_MILLISEC || 60*1000; // 60 sec
let checkInProgress = false;
let lastCheckedDate = new Date('2001-01-01');

module.exports = function(finishedCallback) {
    console.log('Starting Docker service inspect module');

    cron.schedule('* * * * * *', function() { // running a task every sec';
        try {
            if ( !checkInProgress ) {
                const nextRunDate = new Date();
                nextRunDate.setMilliseconds(nextRunDate.getMilliseconds() - checkPeriodInMillisec);
                if ( lastCheckedDate < nextRunDate ) {
                    console.time("Docker swarm collection time");

                    console.log('=======================================');
                    console.log('Collecting docker swarm information ...');

                    checkInProgress = true;
                    const newData = {
                      serviceGroups: [],
                      nodes: [],
                      config: {cloudName: process.env.SWARM_BASE_URL || "dc.loxon.swarm", labelPrefix: process.env.LABEL_PREFIX, deleteButtonEnable: process.env.DELETE_UI === 'true', deleteEPEnable: process.env.DELETE_EP === 'true'}
                    };

                    docker.listNodes(function(err, nodeData) {
                        newData.nodes = nodeData;
                        docker.listTasks(function(err, taskData) {
                            docker.listServices(function (err, serviceData) {
                            	for (let service of serviceData) {

                                    // Extend service with tasks (containers)
                                    service['tasks'] = taskData.filter(task => task.ServiceID === service.ID);

                            		const stackName = getArrayValue(service, ['Spec', 'TaskTemplate', 'ContainerSpec', 'Labels', 'com.docker.stack.namespace']);
                            		if ( stackName ) {
                            			addToStackService(newData.serviceGroups, stackName, service);
                            		} else {
                            			newData.serviceGroups.push({isStack:false, isService: true, name: getArrayValue(service, ['Spec', 'Name']), services: [service], review: null });
                            		}
                            	}

                                console.timeEnd("Docker swarm collection time");

                            	// console.log('listServices: ', JSON.stringify(finalList, null, 4));
                            	checkInProgress = false;
                                lastCheckedDate = new Date();
                            	finishedCallback(newData, lastCheckedDate);
                            });
                        });
                    });
                }
            }
        } catch(e) {
            console.log('General error occured: ', e);
            checkInProgress = false;
            lastCheckedDate = new Date();
            finishedCallback([], lastCheckedDate);
        }
    });
}

function getArrayValue(arr, keys) {
	let result = arr;
	try {
		for (let key of keys) { result = result[key]; }
	} catch (e) { result = null; }
	return result;
}
function addToStackService(finalList, stackName, service) {
	let found = false;
	for (let e of finalList) {
		if ( e.isStack && e.name == stackName ) {
			e.services.push(service);
			found = true;
		}
	}
	if (!found) {
		finalList.push({isStack:true, isService: false, name: stackName, services: [service], review: null });
	}
}
