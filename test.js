function random(min, max) {
  return min + (Math.random() * (max - min))
}

class Point {
  static random(min, max) {
    return new Point(
      random(min, max),
      random(min, max)
    )
  }

  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}

class Rect {
  static random(min, max) {
    return new Rect(
      Point.random(min, max),
      Point.random(min, max)
    )
  }

  constructor(position = new Point(), size = new Point()) {
    this.position = position
    this.size = size
  }

  contains({ x, y }) {
    return x >= this.position.x
        && y >= this.position.y
        && x <= this.position.x + this.size.x
        && y <= this.position.y + this.size.y
  }
}

class PointPointer {
  constructor(memory, offset) {
    this.memory = memory
    this.offset = offset
  }

  get x() {
    return this.memory[this.offset]
  }

  set x(value) {
    this.memory[this.offset] = value
  }

  get y() {
    return this.memory[this.offset + 1]
  }

  set y(value) {
    this.memory[this.offset + 1] = value
  }

  randomize(min, max) {
    this.x = random(min, max)
    this.y = random(min, max)
  }
}

class RectPointer {
  #offset = 0

  constructor(memory, offset) {
    this.#offset = offset
    this.position = new PointPointer(memory, offset)
    this.size = new PointPointer(memory, offset + 2)
  }

  get offset() {
    return this.#offset
  }

  set offset(value) {
    this.position.offset = value
    this.size.offset = value + 2
  }

  randomize(min, max) {
    this.position.randomize(min, max)
    this.size.randomize(min, max)
  }

  contains({ x, y }) {
    return x >= this.position.x
        && y >= this.position.y
        && x <= this.position.x + this.size.x
        && y <= this.position.y + this.size.y
  }
}

console.log('Node.js', process.version)
console.log('V8', process.versions.v8)
const runs = process.argv[2] ? parseInt(process.argv[2]) : 2
const size = process.argv[3] ? parseInt(process.argv[3]) : 1024 * 1024
const point = Point.random(-1000, 1000)

/**
 * Initialization
 */
const sparse = new Array(size)
for (let i = 0; i < size; i++) {
  sparse[i] = Rect.random(-1000, 1000)
}

const compact = new Float32Array(size * 4)
const rectPointer = new RectPointer(compact, 0)
for (let i = 0; i < size; i++) {
  rectPointer.offset = i * 4
  rectPointer.randomize(-1000, 1000)
}

/**
 * Benchmark
 */
for (let j = 0; j < runs; j++) {
  console.log('=== perf run', j)
    
  performance.mark('pointer:start')
  for (let i = 0; i < size; i++) {
    rectPointer.offset = i * 4
    rectPointer.contains(point)
  }
  performance.mark('pointer:end')
  const measure1 = performance.measure('pointer', 'pointer:start', 'pointer:end')

  performance.mark('instance:start')
  for (let i = 0; i < size; i++) {
    sparse[i].contains(point)
  }
  performance.mark('instance:end')
  const measure2 = performance.measure('instance', 'instance:start', 'instance:end')

  const color1 = measure1.duration > measure2.duration ? '\x1B[0;31m' : '\x1B[0;32m'
  const color2 = measure1.duration > measure2.duration ? '\x1B[0;32m' : '\x1B[0;31m'
  console.log(`  ${color1}pointer\x1B[0m`, measure1.duration)
  console.log(`  ${color2}instance\x1B[0m`, measure2.duration)
}
