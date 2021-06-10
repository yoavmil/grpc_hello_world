const { exec, execSync } = require("child_process");
var path = require('path');
var containerName = "envoy";

// check if the container already exists or running, then remove it
var existingContainerId = execSync(
  `docker ps --filter "name=${containerName}" -q`
).toString();
if (!!existingContainerId) {
  execSync(`docker rm -f ${containerName}`);
}

var proxyPort = 8080;
var envoyYamlPath = path.join(__dirname, "envoy.yaml");
var command = `docker run --name ${containerName} -d -p ${proxyPort}:${proxyPort} -v "${envoyYamlPath}":/etc/envoy/envoy.yaml:ro envoyproxy/envoy:v1.15.0`;
console.log(command);
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  if (stdout) {
    console.log(`stdout: ${stdout}`);
    return;
  }
});
