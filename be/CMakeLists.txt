add_subdirectory(uuid)

# commands for generating the protobuf c++ files
get_target_property(gRPC_CPP_PLUGIN_EXECUTABLE gRPC::grpc_cpp_plugin IMPORTED_LOCATION_RELEASE)
set(GENERATED_DIR "${CMAKE_CURRENT_SOURCE_DIR}/generated")
set(PROTOS_DIR "${CMAKE_SOURCE_DIR}/protos")
set(PROTO_FILES "${PROTOS_DIR}/meshutils.proto")
set(grpc_srcs 
 "${GENERATED_DIR}/meshutils.grpc.pb.cc"
 "${GENERATED_DIR}/meshutils.pb.cc"
)
set(grpc_hdrs
 "${GENERATED_DIR}/meshutils_mock.grpc.pb.h"
 "${GENERATED_DIR}/meshutils.grpc.pb.h"
 "${GENERATED_DIR}/meshutils.pb.h"
)
set(grpc_files "${grpc_srcs}" "${grpc_hdrs}")

add_custom_command(
 OUTPUT ${grpc_files}
 COMMAND "${Protobuf_PROTOC_EXECUTABLE}" 
 ARGS "${PROTO_FILES}" -I="${PROTOS_DIR}" --cpp_out="${GENERATED_DIR}" --plugin=protoc-gen-grpc="${gRPC_CPP_PLUGIN_EXECUTABLE}" --grpc_out="generate_mock_code=true:${GENERATED_DIR}"
 MAIN_DEPENDENCY ${PROTO_FILES}
 COMMENT "Running gRPC C++ protocol buffer compiler on ${PROTO_FILES}"
)
# till here protobuf

# other packages
find_package(glm REQUIRED)

# *The project*
set(server_srcs 
    "main.cpp"
    "MeshServer.cpp"
)
set(server_hdrs 
    "MeshServer.h"
)
add_executable(main ${server_srcs} ${server_hdrs} ${grpc_files})

target_link_libraries(main PRIVATE fmt::fmt gRPC::grpc++ gRPC::grpc++_reflection)
target_link_libraries(main PRIVATE uuid)
target_link_libraries(main PRIVATE glm::glm)
