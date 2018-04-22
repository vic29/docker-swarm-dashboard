const Docker = require('dockerode');

// https://gist.github.com/jupeter/b39e11521452129af2af85cc855c91d7
// majd service docker restart

//var docker = new Docker({socketPath: '/var/run/docker.sock'});
const dockerHost = process.env.DOCKER_MANAGER_HOST; // like: http://localhost
const dockerPort = process.env.DOCKER_MANAGER_PORT; // like 2375
const dockerSocket = process.env.DOCKER_MANAGER_SOCKET || '/var/run/docker.sock';
const docker = dockerHost && dockerPort ? new Docker({host: dockerHost, port: dockerPort}) : new Docker({socketPath: dockerSocket});

module.exports = function(id, streamFunction) {
    console.log('Collecting logs: ', id);

    const item = docker.getService(id);
    item.logs({
        follow: true,
        stdout: true,
        stderr: true
      }, function(err, stream){
        if(err) {
          return console.log(err.message);
        }

        streamFunction(stream);

      });

}
