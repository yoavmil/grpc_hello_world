#include <gtest/gtest.h>
#include <uuid.h>
#include <algorithm>

int main(int argc, char* argv[]) {
	::testing::InitGoogleTest(&argc, argv);
	return RUN_ALL_TESTS();
}

#define COUNT 132
TEST(UuidTest, parallel) {
    UuidBank<uint32_t> bank;
    std::mutex mutex;
    std::vector<uint32_t> ids;
    #pragma omp parallel num_threads(COUNT)
    {
        auto id = bank.generate();
        {
            std::lock_guard guard(mutex);
            ids.push_back(id);
        }
    }

    ASSERT_EQ(ids.size(), COUNT);

    std::sort(ids.begin(), ids.end());
    for (int i = 0; i < COUNT; i++) {
        ASSERT_EQ(i+1, ids[i]);
    }

    bank.release(5);
    auto reusedId = bank.generate();
    ASSERT_EQ(reusedId, 5);

    // release all of them
    #pragma omp parallel for
    for (int i = 0; i < COUNT; i++) {
        bank.release(i+1);
    }
}