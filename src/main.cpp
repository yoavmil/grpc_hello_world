#include <fmt/format.h>
#include <future>

#include "server.h"
#include "client.h"

int main(int argc, char** argv) {
    auto serverThread = std::async(RunServer);
    
    std::vector<std::future<void>> futures;
    for (int i = 0; i < 100; i++) {
        futures.push_back(std::async(TalkToServer, "name_" + std::to_string(i)));
    }
    
    return 0;
}