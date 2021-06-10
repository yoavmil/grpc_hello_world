var path = require("path");
var myArgs = process.argv.slice(2);
myArgs[0] = path.resolve(myArgs[0]);
var command = path.resolve(myArgs.join(" "));
console.log(command);

var spawn = require("child_process").spawn;
var proc = spawn(command);
proc.stdout.on('data', function (data) {
  console.log('stdout: ' + data.toString());
});

proc.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});

proc.on('exit', function (code) {
  console.log('child process exited with code ' + code.toString());
});
