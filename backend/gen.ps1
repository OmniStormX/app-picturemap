$ErrorActionPreference = "Stop"

$args = @(
  "-I.",
  "api/proto/user/user.proto",
  "--js_out=import_style=commonjs:frontend/src/proto",
  "--grpc-web_out=import_style=typescript,mode=grpcwebtext:frontend/src/proto"
)

protoc @args
