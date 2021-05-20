/*
  This script creates .ts files from the .proto file, using protoc.exe and ts-proto npm package
  https://www.npmjs.com/package/ts-proto
*/

const { execFile } = require("child_process");
var path = require("path");

let protocPath = "./node_modules/protoc/protoc/bin/protoc.exe";
let pluginCmd = "--plugin=protoc-gen-ts_proto=.\\node_modules\\.bin\\protoc-gen-ts_proto.cmd";
let tsOutFolder = "./src/app/generated";
let protosFolder = path.resolve("../protos");
let protoName = "helloworld.proto";
let protoFullPath = path.join(protosFolder, protoName);

execFile(protocPath, [pluginCmd, `--ts_proto_out=${tsOutFolder}`, `--proto_path=${protosFolder}`, protoFullPath], (error, stdout, stderr) => {
  if (error) {
      console.log(`error: ${error.message}`);
      return;
  }
  if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
  }
  console.log(`stdout: ${stdout}`);
});
