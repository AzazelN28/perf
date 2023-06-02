#define MAX_SIZE 1000000

float random_between(float min, float max)
{
  return min + ((float)(rand()) * (max - min));
}

typedef struct _point 
{
  float x;
  float y;
} point_t;

typedef struct _rect
{
  float x;
  float y;
  float width;
  float height;
} rect_t;

float contains(rect_t* rect, point_t* point)
{
  return point->x >= rect->x
      && point->y >= rect->y
      && point->x <= rect->x + rect->width
      && point->y <= rect->y + rect->height;
}

rect_t rects[MAX_SIZE];
point_t point;

void start(int size)
{
  point.x = random_between(-1000.0f, 1000.0f);
  point.y = random_between(-1000.0f, 1000.0f);
  
  for (int i = 0; i < size; ++i)
  {
    rects[i].x = random_between(-1000.0f, 1000.0f); 
    rects[i].y = random_between(-1000.0f, 1000.0f); 
    rects[i].width = random_between(-1000.0f, 1000.0f);
    rects[i].height = random_between(-1000.0f, 1000.0f);
  }

}

void update(int size)
{
  for (int i = 0; i < size; ++i)
  {
    contains(&rects[i], &point);
  }
}
