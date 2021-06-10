
#include <uuid.h>
#include <glm/glm.hpp>
#include <vector>
#include <memory>
#include <unordered_map>
#include <future>

#include <fmt/format.h>

#include <grpcpp/ext/proto_server_reflection_plugin.h>
#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>

#include <amlib/MeshUtils.h>

#include "generated/meshutils.grpc.pb.h"
#include "MeshServer.h"

using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::ServerReader;
using grpc::Status;

class MeshSlicerService final : public MeshUtils::MeshSlicer::Service
{
public:
    void startWatchdog() { watchdogThread = std::async(std::launch::async, &MeshSlicerService::watchdogTimerEllapsed, this); }

private:
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
        {
            std::lock_guard guard(mutex);
            meshs.erase(request->uuid());
        }
        response->set_ok(true);
        return Status::OK;
    }

    virtual Status GetContour(ServerContext *context, const MeshUtils::ContourRequest *request, MeshUtils::Polygons *response) override
    {
        return Status(grpc::UNIMPLEMENTED, "not ready yet");
    }

    virtual Status KeepAlive(grpc::ServerContext *context, const MeshUtils::MeshID *request, MeshUtils::OkReply *response) override
    {
        std::shared_ptr<MeshHandle> handle = nullptr;
        {
            std::lock_guard guard(mutex);
            if (meshs.find(request->uuid()) != meshs.end())
                handle = meshs[request->uuid()];
        }
        if (handle)
            handle->lastInteraction = now();
        response->set_ok(handle != nullptr);

        return Status::OK;
    }

    using UUID = uint32_t;
    UuidBank<UUID> uuidBank;

    struct MeshHandle
    {
        UUID uuid;
        amlib::MeshUtils::Mesh mesh;
        std::chrono::time_point<std::chrono::steady_clock> lastInteraction;
    };

    std::unordered_map<UUID, std::shared_ptr<MeshHandle>> meshs;
    std::mutex mutex;
    void addMesh(const MeshUtils::Mesh *mesh, UUID uuid)
    {
        auto handle = std::make_shared<MeshHandle>();
        {
            std::lock_guard guard(mutex);
            meshs[uuid] = handle;
        }
        handle->mesh.facets.reserve(mesh->facets_size());
        for (const auto &facet : mesh->facets())
        {
            amlib::MeshUtils::Mesh::Facet amFacet;
            amFacet.v[0] = {facet.v0().x(), facet.v0().y(), facet.v0().z()};
            amFacet.v[1] = {facet.v1().x(), facet.v1().y(), facet.v1().z()};
            amFacet.v[2] = {facet.v2().x(), facet.v2().y(), facet.v2().z()};
            handle->mesh.facets.push_back(amFacet);
        }
        handle->uuid = uuid;
        handle->lastInteraction = now();
    }
    void watchdogTimerEllapsed()
    {
        auto rightNow = now();
        std::vector<UUID> toRemove;
        std::this_thread::sleep_for(std::chrono::seconds(watchDogSeconds));
        {
            std::lock_guard guard(mutex);

            for (auto &[uuid, handle] : meshs)
            {
                auto duration = std::chrono::duration_cast<std::chrono::seconds>(rightNow - handle->lastInteraction);
                if (duration.count() > watchDogSeconds)
                {
                    toRemove.push_back(uuid);
                }
            }
        }
        for (auto uuid : toRemove)
        {
            std::lock_guard guard(mutex);
            meshs.erase(uuid);
            uuidBank.release(uuid);        
        }
        startWatchdog();
    }
    int watchDogSeconds = 10;
    std::future<void> watchdogThread;
    std::chrono::time_point<std::chrono::steady_clock> now() { return std::chrono::steady_clock::now(); }
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
    meshService.startWatchdog();
    // Wait for the server to shutdown. Note that some other thread must be
    // responsible for shutting down the server for this call to ever return.
    server->Wait();
}