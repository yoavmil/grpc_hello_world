get_target_property(gRPC_CPP_PLUGIN_EXECUTABLE gRPC::grpc_cpp_plugin IMPORTED_LOCATION_RELEASE)
set(GENERATED_DIR "${CMAKE_CURRENT_SOURCE_DIR}/be/generated")
set(PROTOS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/protos")
set(PROTO_FILES "${PROTOS_DIR}/helloworld.proto")
set(grpc_srcs 
 "${GENERATED_DIR}/helloworld.grpc.pb.cc"
 "${GENERATED_DIR}/helloworld.pb.cc"
)
set(grpc_hdrs
 "${GENERATED_DIR}/helloworld_mock.grpc.pb.h"
 "${GENERATED_DIR}/helloworld.grpc.pb.h"
 "${GENERATED_DIR}/helloworld.pb.h"
)
set(grpc_files "${grpc_srcs}" "${grpc_hdrs}")

add_custom_command(
 OUTPUT ${grpc_files}
 COMMAND "${Protobuf_PROTOC_EXECUTABLE}" 
 ARGS "${PROTO_FILES}" -I="${PROTOS_DIR}" --cpp_out="${GENERATED_DIR}" --plugin=protoc-gen-grpc="${gRPC_CPP_PLUGIN_EXECUTABLE}" --grpc_out="generate_mock_code=true:${GENERATED_DIR}"
 MAIN_DEPENDENCY ${PROTO_FILES}
 COMMENT "Running gRPC C++ protocol buffer compiler on ${PROTO_FILES}"
)

add_executable(main be/main.cpp be/server.cpp ${grpc_files})
include_directories()
target_link_libraries(main PRIVATE fmt::fmt gRPC::grpc++ gRPC::grpc++_reflection)