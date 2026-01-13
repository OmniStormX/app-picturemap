protoc \
  --plugin=protoc-gen-ts_proto=./frontend-proto/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./frontend-proto/user/ \
  --ts_proto_opt=esModuleInterop=true,outputServices=generic-definitions \
  -I ./backend/api/proto \
  ./backend/api/proto/user/user.proto