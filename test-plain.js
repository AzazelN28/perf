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
      random(min, max),
      random(min, max),
      random(min, max),
      random(min, max)
    )
  }

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  contains({ x, y }) {
    return x >= this.x
        && y >= this.y
        && x <= this.x + this.width
        && y <= this.y + this.height
  }
}

class RectPointer {
  constructor(memory, offset) {
    this.memory = memory
    this.offset = offset
  }

  get x() {
    return this.memory[this.offset]
  }
  
  get y() {
    return this.memory[this.offset + 1]
  }

  get width() {
    return this.memory[this.offset + 2]
  }

  get height() {
    return this.memory[this.offset + 3]
  }
  
  set x(v) {
    this.memory[this.offset] = v
  }
  
  set y(v) {
    this.memory[this.offset + 1] = v
  }

  set width(v) {
    this.memory[this.offset + 2] = v
  }

  set height(v) {
    this.memory[this.offset + 3] = v
  }

  randomize(min, max) {
    this.x = random(min, max)
    this.y = random(min, max)
    this.width = random(min, max)
    this.height = random(min, max)
  }

  contains({ x, y }) {
    return x >= this.x
        && y >= this.y
        && x <= this.x + this.width
        && y <= this.y + this.height
  }
}

console.log('Node.js', process.version)
console.log('V8', process.versions.v8)
const runs = process.argv[2] ? parseInt(process.argv[2]) : 2
const size = process.argv[3] ? parseInt(process.argv[3]) : 1024 * 1024
const point = Point.random()

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
