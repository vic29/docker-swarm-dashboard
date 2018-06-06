const env = require('../environment/envHandler.js');
const Docker = require('dockerode');
const dockerLogsMaxRowNum = env.get('DOCKER_LOGS_MAX_ENTRY_NUM') || 2000
// https://gist.github.com/jupeter/b39e11521452129af2af85cc855c91d7
// majd service docker restart

//var docker = new Docker({socketPath: '/var/run/docker.sock'});
const dockerHost = env.get('DOCKER_MANAGER_HOST'); // like: http://localhost
const dockerPort = env.get('DOCKER_MANAGER_PORT'); // like 2375
const dockerSocket = env.get('DOCKER_MANAGER_SOCKET') || '/var/run/docker.sock';
const docker = dockerHost && dockerPort ? new Docker({
  host: dockerHost,
  port: dockerPort
}) : new Docker({
  socketPath: dockerSocket
});

module.exports = function (id, streamFunction) {
  const item = docker.getService(id);
  item.logs({
    follow: true,
    stdout: true,
    stderr: true,
    tail: dockerLogsMaxRowNum
  }, function (err, stream) {
    if (err) {
      return console.log(err.message);
    }

    streamFunction(stream);

  });

}
