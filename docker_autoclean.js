
console.log('Starting Docker autoclean module');

const shell = require('shelljs');
const cleanFeatureEnabled = process.env.AUTOCLEAN_ENABLE;
const labelPrefix = process.env.LABEL_PREFIX;
const cron = require('node-cron');

let cleanInProgress = false;

module.exports = {

    startClean: function(stackArray) {
        if ( cleanFeatureEnabled && !cleanInProgress ) {
            cleanInProgress = true;
            console.log('AutoRemove start');

            for (var i = 0; i < stackArray.length; i++) {
                const ecosystem = stackArray[i];
                const isInfoInvalid = isReviewOutdated(ecosystem) || (!isReviewOutdated(ecosystem) && !gotAnyInformation(ecosystem));
                if ( isInfoInvalid && isCleanByRound(ecosystem) ) {
                    let removeCommand = (ecosystem.isStack ? 'docker stack rm ' : 'docker service rm ') + ecosystem.name;
                    shell.exec(removeCommand, {async:true,silent:true}, function(code, stdout, stderr) { // TODO socket-esre átírni!
                        if (stderr) {
                            console.log('Error while deleting ecosystem: ', ecosystem, stderr);
                        } else {
                            console.log('Ecosystem removed: ', ecosystem.name);
                        }
                    });
                }
            }

            console.log('Autoremove finished!');
            cleanInProgress = false;
        }
    }

}

function gotAnyInformation(stackRow) {
    if (stackRow.review) { return true; }
    const loxonLabels = stackRow.services.filter(s => {
        const sourceLabels = s.Spec ? s.Spec.Labels || {} : {};
        let labels = Object.keys(sourceLabels).map(function(objectKey, index) {
            return {key: objectKey, value: sourceLabels[objectKey]};
        }).filter(l => l.key.toLowerCase().startsWith(labelPrefix));
        return labels.length > 0;
    });

    return loxonLabels.length > 0;
}
function isReviewOutdated(stackRow) {
  return stackRow.review && (stackRow.review["status"] == "MERGED" || stackRow.review["status"] == "ABANDONED");
}
let cleanCache={};
function isCleanByRound(stackRow) {
  let cleanRound = cleanCache[stackRow.name] || 0;
  cleanCache[stackRow.name] = cleanRound + 1;
  console.log('Mark ' + stackRow.name + ' to round ' + cleanCache[stackRow.name]);
  if ( cleanCache[stackRow.name] > 3 ) {
    delete cleanCache[stackRow.name];
    return true;
  }
  return false;
}
cron.schedule('59 59 * * * *', function() {
  console.log('Clear round cache');
  cleanCache={};
});
