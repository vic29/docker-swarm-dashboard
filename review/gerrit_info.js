const env = require('../environment/envHandler.js');

String.prototype.allTrim = String.prototype.allTrim ||
    function () {
        return this.replace(/\s+/g, ' ')
            .replace(/^\s+|\s+$/, '');
    };
String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const shell = require('shelljs');

const gerritHost = env.get('GERRIT_URL');
const gerritUser = env.get('GERRIT_USER');
const gerritPwd = env.get('GERRIT_PWD');
const collectReviewInfo = env.get('GERRIT_COLLECT') && gerritHost && gerritUser;

module.exports = {

    startCollect: function (stacks, finishedCallback) {
        if (collectReviewInfo) {
            let index = 0;

            function next() {
                if (index < stacks.length) {
                    const stackData = stacks[index++];
                    const name = stackData.name;
                    const found = name.match(/r\d+/gi);
                    if (found && found[0]) {
                        let reviewNum = found[0].replace('r', '').trim();
                        let cmd = 'curl --user ' + gerritUser + ':' + gerritPwd + ' http://' + gerritHost + ':80/a/changes/' + reviewNum;
                        shell.exec(cmd, {
                            async: true,
                            silent: true
                        }, function (code, stdout, stderr) {
                            if (stdout.startsWith(")]}'")) {
                                stdout = stdout.substring(4);
                            }
                            if (stdout.startsWith("Not found")) {
                                stdout = "{}";
                            }
                            try {
                                const gerritInfo = JSON.parse(stdout);
                                if (gerritInfo) {
                                    gerritInfo['reviewId'] = gerritInfo['_number'];
                                    gerritInfo['owner']['name'] = getUserNameFromGerrit(gerritInfo['owner']['_account_id']);
                                    gerritInfo['owner']['email'] = getUserEmailFromGerrit(gerritInfo['owner']['_account_id']);
                                    stackData.review = gerritInfo;
                                }
                            } catch (err) {
                                console.log("Invalid json while parsing gerrit reponse: '" + stdout + "'. error is: '" + stderr + "'");
                            }
                            next();
                        });
                    } else {
                        next();
                    }
                } else {
                    finishedCallback(stacks);
                }
            }
            next();
        } else {
            finishedCallback(stacks);
        }
    }

}

const userCache = {};

function getUserNameFromGerrit(userId) {
    if (userCache[userId] && userCache[userId].name) {
        return userCache[userId].name;
    }
    let name = '';
    try {
        let stdout = shell.exec('curl --user ' + gerritUser + ':' + gerritPwd + ' http://' + gerritHost + ':80/a/accounts/' + userId + '/name', {
            async: false,
            silent: true
        }).stdout;
        if (stdout.startsWith(")]}'")) {
            stdout = stdout.substring(4);
        }
        if (stdout.startsWith("Not found")) {
            stdout = "{}";
        }
        name = stdout.replaceAll('"', '').allTrim();

        if (!userCache[userId]) {
            userCache[userId] = {
                name: null,
                email: null
            };
        }
        userCache[userId].name = name;
    } catch (e) {
        console.log('Error while getting user name from gerrit: ', userId);
    }
    return name;
}

function getUserEmailFromGerrit(userId) {
    if (userCache[userId] && userCache[userId].email) {
        return userCache[userId].email;
    }
    let userEmail = '';
    try {
        let stdout = shell.exec('curl --user build:s7UJ2xPl http://' + gerritHost + ':80/a/accounts/' + userId + '/emails', {
            async: false,
            silent: true
        }).stdout;
        if (stdout.startsWith(")]}'")) {
            stdout = stdout.substring(4);
        }
        if (stdout.startsWith("Not found")) {
            stdout = "{}";
        }
        let emails = JSON.parse(stdout);
        userEmail = emails[0]['email'];

        if (!userCache[userId]) {
            userCache[userId] = {
                name: null,
                email: null
            };
        }
        userCache[userId].email = userEmail;
    } catch (e) {
        console.log('Error while getting user email from gerrit: ', userId);
    }
    return userEmail;
}