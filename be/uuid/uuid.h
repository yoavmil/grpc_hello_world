#include <vector>
#include <mutex>

template<typename UUID_T>
class UuidBank {
    static_assert(std::numeric_limits<UUID_T>::is_integer, "'UUID_T' must be an integer");
    static_assert(std::numeric_limits<UUID_T>::is_signed == false, "'UUID_T' must be an unsigned");
public:
UUID_T generate() {
    std::lock_guard lock(mutex);
    if (released.size()) {
        auto ret = released.back();
        released.pop_back();
        return ret;
    }
    return ++last;
}

void release(UUID_T uuid) {
    std::lock_guard lock(mutex);
    released.push_back(uuid);
}

private:
    std::vector<UUID_T> released;
    std::mutex mutex;
    UUID_T last = 0;
};