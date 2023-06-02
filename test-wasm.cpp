#include <cstdint>
#include <cstdlib>
#include <random>
#include <iostream>
#include <array>
#include <memory>
#include <chrono>


constexpr std::size_t size = 1024;

float random_between(float min, float max)
{
  return min + ((float)(std::rand() / RAND_MAX) * (max - min));
}

struct Point {
  float m_x = 0.0;
  float m_y = 0.0;

  Point() {
    m_x = random_between(-1000, 1000);
    m_y = random_between(-1000, 1000);
  }

  Point(float x, float y) : m_x(x), m_y(y) {}
};

struct Rect {
  float m_x = 0.0;
  float m_y = 0.0;
  float m_width = 0.0;
  float m_height = 0.0;

  Rect()
  {
    m_x = random_between(-1000, 1000);
    m_y = random_between(-1000, 1000);
    m_width = random_between(-1000, 1000);
    m_height = random_between(-1000, 1000);
  }

  bool contains(Point &point) noexcept
  {
    return point.m_x >= m_x
        && point.m_y >= m_y
        && point.m_x <= m_x + m_width
        && point.m_y <= m_y + m_height;
  }
};

int32_t main(int32_t argc, char** argv)
{
  std::srand(0);
  std::array<Rect, size> rects = {};

  auto start = std::chrono::high_resolution_clock::now();
  Point point;
  for (auto& rect : rects)
  {
    rect.contains(point);
  }
  
  auto end = std::chrono::high_resolution_clock::now();
  auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

  std::cout << "Task duration: " << duration.count() << " microseconds" << std::endl;

  return 0;
}
