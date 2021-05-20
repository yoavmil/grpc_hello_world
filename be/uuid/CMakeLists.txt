add_library(uuid INTERFACE )
target_include_directories(uuid INTERFACE .)

# tests
find_package(GTest CONFIG REQUIRED)
find_package(OpenMP)
include(GoogleTest)
enable_testing()
add_executable(uuid_tester uuid_test.cpp)
target_link_libraries(uuid_tester PRIVATE uuid)
target_link_libraries(uuid_tester PRIVATE GTest::gmock GTest::gtest GTest::gmock_main GTest::gtest_main)
target_link_libraries(uuid_tester PRIVATE PRIVATE OpenMP::OpenMP_CXX)

gtest_add_tests(TARGET uuid_tester AUTO)
add_test(NAME uuid_tester COMMAND uuid_tester)
