const env = require('./environment/envHandler.js');

// WEB based variables
const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
module.exports = {
    getWebsocket: function() {
        return io;
    }
}
const http = require('http');
const shell = require('shelljs');
const portscanner = require('portscanner');
const path = require('path');
const _ = require('lodash');
const dockerLogsMaxRowNum = env.get('DOCKER_LOGS_MAX_ENTRY_NUM') || 2000;
const websocket = require('./websocketHandler.js');
const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = env.get('CRYPT_KEY');

let lastData = {
    config: {
        cloudName: 'Calculating ...'
    }
};
let lastCheckedDate = new Date();

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// END Web based variables

// Auto merge old file!
if (fs.existsSync('./data/tabs.json') && !fs.existsSync('./data/groups.dat')) {
    persistGroups(JSON.parse(fs.readFileSync('./data/tabs.json').toString()));
    fs.renameSync('./data/tabs.json', './data/tabs.json.backup');
}

if (!fs.existsSync('./data/groups.dat')) {
    try {
        fs.mkdirSync('data');
    } catch (err) {}
    projectGroups = JSON.parse(fs.readFileSync('./sample/groups.raw.json').toString());
} else {
    projectGroups = getGroups();
}

// Docker modules
const autoClean = require('./docker/docker_autoclean.js');
const gerritInfo = require('./review/gerrit_info.js');
const dockerLogs = require('./docker/docker_log.js');
require('./docker/docker_collect.js')(function (newData, lastCheckedDate) {
    gerritInfo.startCollect(newData, function (dataWithGerrit) {
        autoClean.startClean(dataWithGerrit, projectGroups);

        websocket.broadcast('docker-resources', projectGroups);
        // projectGroups.forEach(g => g.workspace = null);

        if (!_.isEqual(lastData, dataWithGerrit)) {
            lastData = dataWithGerrit;
            websocket.broadcast('docker', lastData);
        }
        websocket.broadcast('refresh', {
            lastCheckedDate: lastCheckedDate
        });
    });
});

websocket.onConnection(function (client) {
    publicOnlineUserNum();
    websocket.broadcast('docker', lastData);
    websocket.broadcast('refresh', {
        lastCheckedDate: lastCheckedDate
    });
    websocket.broadcast('tabs', projectGroups);

    client.on('tabs-refresh', function () {
        websocket.broadcast('tabs', projectGroups);
    });
    client.on('tabs-save', function (data) {
        if ( data.pwd === env.get('MASTER_PWD') ) {
            projectGroups = data.data;
            persistGroups(projectGroups);
            websocket.broadcast('tabs', projectGroups);
        } else {
            websocket.broadcast('bad-pwd', 'Bad master password');
        }
    });
    client.on('tabs-links', function (data) {
        projectGroups.forEach(t => {
            if (t.label === data.label) {
                if (data.links) {
                    t.links = data.links;
                }
                if (data.serviceFilter) {
                    t.serviceFilter = data.serviceFilter;
                }
            }
        });
        persistGroups(projectGroups);
        websocket.broadcast('tabs', projectGroups);
    });
    client.on('docker-logs', function (id) {
        dockerLogs(id, function (stream) {
            let rows = 0;
            stream.on('data', (chunk) => {
                rows++;
                if (rows === dockerLogsMaxRowNum) {
                    websocket.broadcast('docker-logs-' + id, '--- TOO LARGE STREM DATA ---');
                } else if (rows < dockerLogsMaxRowNum) {
                    websocket.broadcast('docker-logs-' + id, chunk.toString('utf8'));
                } else {
                    stream.destroy();
                }
            });

            stream.on('end', function () {
                websocket.broadcast('docker-logs-' + id, '--- STREAM END ---');
            });

            setTimeout(function () {
                stream.destroy();
            }, 5 * 60 * 1000);
        });
    });

    client.on('disconnect', function () {
        publicOnlineUserNum();
    });


});

function publicOnlineUserNum() {
    websocket.broadcast('online', Object.keys(websocket.getOnlineConnections()).length);
}

function persistGroups(groupData) {
    fs.writeFileSync('./data/groups.dat', encrypt(groupData));
}

function getGroups() {
    try {
        return decrypt(fs.readFileSync('./data/groups.dat').toString());
    } catch (e) {
        console.log('Error while getting groups data!', e);
        return [];
    }
}



app.use(express.static(path.join(__dirname, "/public")));

/*
 ************ ROUTES *************
 */
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/freeport', (req, res) => {
    try {
        let host = req.query.host || env.get('SWARM_BASE_URL');
        let from = req.query.from ? req.query.from : randomInt(10000, 30000);
        let to = req.query.to ? req.query.to : randomInt(from + 100, 40000);
        portscanner.findAPortNotInUse(from, to, host, function (error, port) {
            if (error) {
                console.log('Error was');
                console.log(error);
            }
            res.send('' + port);
        });
    } catch (e) {
        res.status(400);
        res.send('Error occured! Please call the DockerAdmins with the request parameters!');
    }
});

app.get('/delete/image', (req, res) => {
    try {
        if (req.query.name) {
            const queryName = req.query.name.replace('docker.loxon.eu/', '');
            const re = /(.+)\/(.+):(.*)/i;
            const found = queryName.match(re);
            if (found) {
                const repo = found[1];
                const imageName = found[2];
                const tag = found[3];
                shell.exec("curl -k -L -u " + env.get('TMP_REPO_USER') + ":" + env.get('TMP_REPO_PWD') + " -X DELETE --header 'Accept: text/plain' https://docker.loxon.eu/api/repositories/" + repo + "/" + imageName + "/tags/" + tag, function (code, stdout, stderr) {
                    res.send('success! repository: "' + repo + '" ; image: "' + imageName + '" ; tag: "' + tag + '"');
                });
            } else {
                res.status(400);
                res.send('Invalid image name! Right image format: repositoryName/imageName:tag');
            }
        } else {
            res.status(400);
            res.send('Invalid request! Please add "name" query parameter! Example: http://' + env.get('SWARM_BASE_URL') + '/delete/image?name=testrepo/myimagename:1.0');
        }
    } catch (e) {
        res.status(400);
        res.send('Error occured! Please call the DockerAdmins with the request parameters!');
    }
});
app.get('/delete/stack', (req, res) => {
    processDelete('docker stack rm', '/delete/stack', req, res);
});
app.get('/delete/service', (req, res) => {
    processDelete('docker service rm', '/delete/service', req, res);
});
app.get('/delete/container', (req, res) => {
    processDelete('docker rm -f', '/delete/container', req, res);
});

function processDelete(commandPrefix, deleteUrl, req, res) {
    try {
        if (env.get('DELETE_EP')) {
            if (req.query.name || req.query.id) {
                shell.exec(commandPrefix + ' ' + req.query.name || req.query.id, function (code, stdout, stderr) {
                    if (stderr) {
                        res.status(400);
                        res.send(stderr);
                    } else {
                        let waitMillisec = 20000;
                        if (req.query && req.query.nowait) {
                            waitMillisec = 20;
                        }
                        setTimeout(function () {
                            res.send(stdout);
                        }, waitMillisec);
                    }
                });

            } else {
                res.status(400);
                res.send('Invalid request! Please add "name" query parameter! Example: http://' + env.get('SWARM_BASE_URL') + deleteUrl + '?name=my_name');
            }
        } else {
            res.status(400);
            res.send('Delete endpoint is not allowed!');
        }
    } catch (e) {
        res.status(400);
        res.send('Error while deleting ecosystem! Please inform the DockerAdmin@loxon.eu group!');
    }
}

function encrypt(object){
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update( JSON.stringify(object) ,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return JSON.parse(dec);
}

server.listen(8080);
console.log('\nApplication running on ' + env.get('SWARM_BASE_URL'));
