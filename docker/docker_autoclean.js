const env = require('../environment/envHandler.js');
const shell = require('shelljs');
const syntacticalCheckModule = require('./docker_markBySyntactically.js');
const resourceOverloadModule = require('./docker_markByResourceOverload.js');
let cleanInProgress = false;

module.exports = {

    startClean: function (dockerData, groups) {
        if (!cleanInProgress) {
            cleanInProgress = true;

            syntacticalCheckModule.mark(dockerData, groups);
            if (dockerData.serviceGroups.filter(ecosystem => ecosystem.markedAsRemove).length === 0) {
                resourceOverloadModule.mark(dockerData, groups);
            }

            dockerData.serviceGroups.filter(ecosystem => ecosystem.markedAsRemove).forEach(ecosystem => {
                let removeCommand = (ecosystem.isStack ? 'docker stack rm ' : 'docker service rm ') + ecosystem.name;
                if (env.get('EXEC_REMOVE_COMMAND')) {

                    shell.exec(removeCommand, {
                        async: true,
                        silent: true
                    }, function (code, stdout, stderr) { // TODO rewrite to docker engine REST API
                        if (stderr) {
                            console.log('Error while deleting ecosystem: ', ecosystem, stderr);
                        } else {
                            console.log('Ecosystem removed: ' + ecosystem.name + ' ; because: ', ecosystem.markedMessage);
                            console.log('=================================');
                            // TODO Send email based by label! ecosystem.markedMessage adatot, és a support-nak is!
                        }
                    });
                } else {
                    console.log('Ecosystem: ' + ecosystem.name + ' would be deleted, because: ', ecosystem.markedMessage);
                    console.log('=================================');
                }
            });

            cleanInProgress = false;
        }
    }

}