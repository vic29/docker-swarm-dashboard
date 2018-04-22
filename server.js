
// WEB based variables
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const http = require('http');
const shell = require('shelljs');
const portscanner = require('portscanner');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const dockerLogsMaxRowNum = process.env.DOCKER_LOGS_MAX_ENTRY_NUM || 2000;

let lastData = {config: {cloudName: 'Calculating ...'}};
let lastCheckedDate = new Date();

function randomInt(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}
// END Web based variables

// Docker modules
const autoClean = require('./docker_autoclean.js');
const gerritInfo = require('./gerrit_info.js');
const dockerLogs = require('./docker_log.js');
require('./docker_collect.js')(function(newData, lastCheckedDate) {
    gerritInfo.startCollect(newData, function(dataWithGerrit) {
        if ( ! _.isEqual(lastData, dataWithGerrit) ) {
          lastData = dataWithGerrit;
          broadcast('docker', lastData);
        }
        broadcast('refresh', {lastCheckedDate:lastCheckedDate});

        autoClean.startClean(dataWithGerrit);
    });
});

// Startup web Endpoints
if ( !fs.existsSync('./data/tabs.json') ) {
    try { fs.mkdirSync('data'); } catch(err){}
    tabsData = JSON.parse(fs.readFileSync('./tabs.sample.json').toString());
    fs.writeFileSync('./data/tabs.json', JSON.stringify(tabsData, null, 4) );
} else {
    tabsData = JSON.parse(fs.readFileSync('./data/tabs.json').toString());
}

io.on('connection', function(client) {
    publicOnlineUserNum();
    broadcast('docker', lastData);
    broadcast('refresh', {lastCheckedDate:lastCheckedDate});
    broadcast('tabs', tabsData);

    client.on('tabs-create', function(data) {
        tabsData.push(data);
        fs.writeFileSync('data/tabs.json', JSON.stringify(tabsData, null, 4) );
        broadcast('tabs', tabsData);
    });
    client.on('tabs-update', function(data) {
        tabsData.forEach(t => {
          if ( t.label === data.label ) {
            if ( data.links ) {
              t.links = data.links;
            }
            if ( data.serviceFilter ) {
              t.serviceFilter = data.serviceFilter;
            }
          }
        });
        fs.writeFileSync('data/tabs.json', JSON.stringify(tabsData, null, 4) );
        broadcast('tabs', tabsData);
    });
    client.on('tabs-delete', function(delLabel) {
        tabsData = tabsData.filter(e => e.label !== delLabel);
        fs.writeFileSync('data/tabs.json', JSON.stringify(tabsData, null, 4) );
        broadcast('tabs', tabsData);
    });
    client.on('docker-logs', function(id) {
      dockerLogs(id, function(stream) {
          let rows = 0;
          stream.on('data', (chunk) => {
            rows++;
            if (rows === dockerLogsMaxRowNum) {
              broadcast('docker-logs-' + id, '--- TOO LARGE STREM DATA ---');
            } else if ( rows < dockerLogsMaxRowNum ) {
              broadcast('docker-logs-' + id, chunk.toString('utf8'));
            } else {
              stream.destroy();
            }
          });

          stream.on('end', function(){
            broadcast('docker-logs-' + id, '--- STREAM END ---');
          });

          setTimeout(function() {
            stream.destroy();
        }, 5 * 60 * 1000);
      });
    });

    client.on('disconnect', function () {
        publicOnlineUserNum();
    });


});

function publicOnlineUserNum() {
    broadcast('online', Object.keys(io.sockets.sockets).length);
}
function broadcast(channel, msg) {
    io.sockets.emit(channel, msg);
}

app.use(express.static(path.join(__dirname, "/public")));

/*
************ ROUTES *************
*/
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/freeport', (req, res) => {
    try {
        let host = req.query.host || process.env.SWARM_BASE_URL || "dc.loxon.swarm";
        let from = req.query.from ? req.query.from : randomInt(10000, 30000);
        let to = req.query.to ? req.query.to : randomInt(from + 100, 40000);
        portscanner.findAPortNotInUse(from, to, host, function(error, port) {
            if ( error ) {
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
        if ( req.query.name ) {
            const queryName = req.query.name.replace('docker.loxon.eu/', '');
            const re = /(.+)\/(.+):(.*)/i;
            const found = queryName.match(re);
            if ( found ) {
                const repo = found[1];
                const imageName = found[2];
                const tag = found[3];
                console.log('Remove image: ', repo, imageName, tag);
                shell.exec("curl -k -L -u build:s7UJ2xPl -X DELETE --header 'Accept: text/plain' https://docker.loxon.eu/api/repositories/" + repo + "/" + imageName + "/tags/" + tag, function(code, stdout, stderr) {
                    res.send('success! repository: "' + repo + '" ; image: "' + imageName + '" ; tag: "' + tag + '"');
                });
            } else {
                res.status(400);
                res.send('Invalid image name! Right image format: repositoryName/imageName:tag');
            }
        } else {
            res.status(400);
            res.send('Invalid request! Please add "name" query parameter! Example: http://' + process.env.SWARM_BASE_URL + '/delete/image?name=testrepo/myimagename:1.0');
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
        if ( process.env.DELETE_EP === 'true' ) {
            if ( req.query.name || req.query.id ) {

                console.log('Remove ecosystem: ', req.query.name);
                shell.exec( commandPrefix + ' ' + req.query.name || req.query.id, function(code, stdout, stderr) {
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
                res.send('Invalid request! Please add "name" query parameter! Example: http://' + process.env.SWARM_BASE_URL + deleteUrl + '?name=my_name');
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

server.listen(8080);
console.log('Application running on ' + process.env.SWARM_BASE_URL);
