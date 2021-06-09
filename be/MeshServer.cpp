
#include <uuid.h>
#include <glm/glm.hpp>
#include <vector>
#include <memory>
#include <unordered_map>
#include <fmt/format.h>
#include <grpcpp/ext/proto_server_reflection_plugin.h>
#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>

#include "generated/meshutils.grpc.pb.h"
#include "MeshServer.h"

using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::ServerReader;
using grpc::Status;

class MeshSlicerService final : public MeshUtils::MeshSlicer::Service
{
    virtual Status UploadMesh(ServerContext *context, const MeshUtils::Mesh *request, MeshUtils::MeshID *response) override
    {
        auto uuid = uuidBank.generate();
        addMesh(request, uuid);
        response->set_uuid(uuid);
        return Status::OK;
    }
    virtual Status ReleaseMesh(ServerContext *context, const MeshUtils::MeshID *request, MeshUtils::OkReply *response) override
    {
        uuidBank.release(request->uuid());
        response->set_ok(true);
        return Status::OK;
    }
    virtual Status GetContour(ServerContext *context, const MeshUtils::ContourRequest *request, MeshUtils::Polygons *response) override
    {
        return Status(grpc::UNIMPLEMENTED, "not ready yet");
    }

private:
    using UUID = uint32_t;
    UuidBank<UUID> uuidBank;

    struct MeshHandle
    {
        UUID uuid;
        // TODO replace with amlib structure
        MeshUtils::Mesh mesh;
        std::chrono::time_point<std::chrono::steady_clock> lastInteraction;
    };

    std::unordered_map<UUID, std::shared_ptr<MeshHandle>>
        meshs;
    std::mutex mutex;
    void addMesh(const MeshUtils::Mesh *mesh, UUID uuid)
    {
        auto handle = std::make_shared<MeshHandle>();
        {
            std::lock_guard guard(mutex);
            meshs[uuid] = handle;
        }
        handle->mesh = *mesh;
        handle->uuid = uuid;
        handle->lastInteraction = std::chrono::steady_clock::now();
    }
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