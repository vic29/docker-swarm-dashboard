
let envVars = {};

const fs = require('fs');
const dotenv = require('dotenv');

// Load PROD environents
loadConfig('./environment/prod.env');

// Load Diff environments
if (process.env.ENVFILE && fs.existsSync(process.env.ENVFILE)) {
    loadConfig(process.env.ENVFILE);
}

console.log('Starting app with variables:');
for (const key in envVars) {
    if (envVars.hasOwnProperty(key)) {
        const element = envVars[key];
        console.log(key + '=' + element + '\t(type=' + typeof element+ ')');
    }
}
module.exports = {

    get: function (key) {
        return envVars[key];
    }

}

function loadConfig(filePath) {
    const envConfig = dotenv.parse(fs.readFileSync(filePath));
    for (var k in envConfig) {
        if (process.env[k] === undefined) {
            const element = envConfig[k] === 'true' ? true : envConfig[k] === 'false' ? false :
                isNaN(parseInt(envConfig[k])) ? envConfig[k] : parseInt(envConfig[k]);
            envVars[k] = element;
        } else {
            envVars[k] = process.env[k];
        }
    }
}