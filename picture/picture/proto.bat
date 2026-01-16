@echo off
setlocal

protoc ^
  --plugin=protoc-gen-ts_proto=.\node_modules\.bin\protoc-gen-ts_proto.cmd ^
  --ts_proto_out=.\src\proto ^
  --ts_proto_opt=esModuleInterop=true,outputServices=generic-definitions ^
  --ts_proto_opt=outputServices=default ^
  -I .\api\proto ^
  .\api\proto\user\user.proto

endlocal
