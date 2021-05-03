cmake_minimum_required(VERSION 3.11...3.20)
project(
  grpc_hellow_world
  VERSION 0.1
  DESCRIPTION "gRPC sandbox"
  LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)

message("CMAKE_PREFIX_PATH ${CMAKE_PREFIX_PATH}")

find_package(gtest CONFIG REQUIRED)
find_package(protobuf CONFIG REQUIRED)
find_package(gRPC CONFIG REQUIRED)
find_package(fmt CONFIG REQUIRED)

add_subdirectory(src)
