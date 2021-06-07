
#include <uuid.h>
#include <glm/glm.hpp>
#include <vector>
#include <memory>
#include <unordered_map>
#include <fmt/format.h>
#include <grpcpp/ext/proto_server_reflection_plugin.h>
#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>

#include "generated/helloworld.grpc.pb.h"
#include "MeshServer.h"

using grpc::ServerBuilder;
using grpc::Status;
using grpc::ServerContext;
using grpc::ServerReader;

// TODO replace with amlib structures
struct Facet
{
    glm::vec3 a, b, c;
};

struct Mesh
{
    std::vector<Facet> facets;
};

class MeshSlicerService final : public helloworld::MeshSlicer::Service 
{
    virtual Status UploadMesh(ServerContext* context, const helloworld::Mesh* request, helloworld::MeshID* response) override     {
        helloworld::Facet protoFacet;
        for (auto& protoFacet : request->facets()) {
            fmt::print("{},{},{}\n", protoFacet.v0().x(), protoFacet.v0().y(), protoFacet.v0().z());
        }
        auto uuid = uuidBank.generate();
        response->set_uuid(uuid);
        return Status::OK;
    }
private:
    using UUID = uint32_t;
    UuidBank<UUID> uuidBank;
    std::unordered_map<UUID, std::shared_ptr<Mesh>> meshs;
};

void startMeshServer()
{
    std::string server_address("0.0.0.0:9090");
    MeshSlicerService meshService;

    grpc::EnableDefaultHealthCheckService(true);
    grpc::reflection::InitProtoReflectionServerBuilderPlugin();
    ServerBuilder builder;
    // Listen on the given address without any authentication mechanism.
    builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
    // Register "service" as the instance through which we'll communicate with
    // clients. In this case it corresponds to an *synchronous* service.
    builder.RegisterService(&meshService);
    // Finally assemble the server.
    std::unique_ptr<grpc::Server> server(builder.BuildAndStart());
    std::cout << "Server listening on " << server_address << std::endl;

    // Wait for the server to shutdown. Note that some other thread must be
    // responsible for shutting down the server for this call to ever return.
    server->Wait();
}