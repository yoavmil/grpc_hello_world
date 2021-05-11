#include <fmt/format.h>
#include <future>

#include "server.h"

int main(int argc, char** argv) {
    auto serverThread = std::async(RunServer);
    return 0;
}