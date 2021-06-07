#include <fmt/format.h>
#include <future>

#include "MeshServer.h"

int main(int argc, char** argv) {
    auto meshServerThread = std::async(startMeshServer);
    
    return 0;
}