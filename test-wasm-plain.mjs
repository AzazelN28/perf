import fs from 'fs'

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

class RectFloat32 extends Float32Array {
  static random(min, max) {
    return new RectFloat32(
      random(min, max),
      random(min, max),
      random(min, max),
      random(min, max)
    )
  }

  constructor(x = 0, y = 0, width = 0, height = 0) {
    super([x, y, width, height])
  }

  get x() {
    return this[0]
  }

  set x(v) {
    this[0] = v
  }

  get y() {
    return this[1]
  }

  set y(v) {
    this[1] = v
  }

  get width() {
    return this[2]
  }

  set width(v) {
    this[2] = v
  }

  get height() {
    return this[3]
  }

  set height(v) {
    this[3] = v
  }

  contains({ x, y }) {
    return x >= this.x
      && y >= this.y
      && x <= this.x + this.width
      && y <= this.y + this.height
  }
}

class RectFloat32Composed {
  static random(min, max) {
    return new RectFloat32Composed(
      random(min, max),
      random(min, max),
      random(min, max),
      random(min, max)
    )
  }

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.data = new Float32Array([
      x, y, width, height
    ])
  }

  get x() {
    return this.data[0]
  }

  set x(v) {
    this.data[0] = v
  }

  get y() {
    return this.data[1]
  }

  set y(v) {
    this.data[1] = v
  }

  get width() {
    return this.data[2]
  }

  set width(v) {
    this.data[2] = v
  }

  get height() {
    return this.data[3]
  }

  set height(v) {
    this.data[3] = v
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

async function main() {
  console.log('Node.js', process.version)
  console.log('V8', process.versions.v8)
  const module = await WebAssembly.instantiate(await fs.promises.readFile('test-wasm.wasm'), {
    env: {
      memory: new WebAssembly.Memory({
        initial: 256,
        maximum: 256
      }),
      rand: Math.random
    }
  })

  const runs = process.argv[2] ? parseInt(process.argv[2], 10) : 100
  const size = process.argv[3] ? parseInt(process.argv[3]) : 1024 * 1024
  const point = Point.random()

  /**
   * Initialization
   */
  const sparse = new Array(size)
  const sparseFloat = new Array(size)
  const sparseFloatComposed = new Array(size)
  for (let i = 0; i < size; i++) {
    sparse[i] = Rect.random(-1000, 1000)
    sparseFloat[i] = RectFloat32.random(-1000, 1000)
    sparseFloatComposed[i] = RectFloat32Composed.random(-1000, 1000)
  }

  const compact = new Float32Array(size * 4)
  const rectPointer = new RectPointer(compact, 0)
  for (let i = 0; i < size; i++) {
    rectPointer.offset = i * 4
    rectPointer.randomize(-1000, 1000)
  }

  module.instance.exports.__wasm_call_ctors()
  module.instance.exports.start(size)
  for (let j = 0; j < runs; ++j) {
    console.log('=== perf run\x1B[0;33m', j, '\x1B[0m')

    performance.mark('wasm:start')
    module.instance.exports.update(size)
    performance.mark('wasm:end')
    const measure0 = performance.measure('wasm', 'wasm:start', 'wasm:end')

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

    performance.mark('instance-float32:start')
    for (let i = 0; i < size; i++) {
      sparseFloat[i].contains(point)
    }
    performance.mark('instance-float32:end')
    const measure3 = performance.measure('instance-float32', 'instance-float32:start', 'instance-float32:end')

    performance.mark('instance-float32-composed:start')
    for (let i = 0; i < size; i++) {
      sparseFloatComposed[i].contains(point)
    }
    performance.mark('instance-float32-composed:end')
    const measure4 = performance.measure('instance-float32-composed', 'instance-float32-composed:start', 'instance-float32-composed:end')

    const min = Math.min(measure0.duration, measure1.duration, measure2.duration, measure3.duration, measure4.duration)

    const color0 = measure0.duration === min ? '\x1B[0;32m' : '\x1B[0;31m'
    const color1 = measure1.duration === min ? '\x1B[0;32m' : '\x1B[0;31m'
    const color2 = measure2.duration === min ? '\x1B[0;32m' : '\x1B[0;31m'
    const color3 = measure3.duration === min ? '\x1B[0;32m' : '\x1B[0;31m'
    const color4 = measure4.duration === min ? '\x1B[0;32m' : '\x1B[0;31m'
    console.log(`  ${color0}wasm\x1B[0;33m`, measure0.duration, '\x1B[0m')
    console.log(`  ${color1}pointer\x1B[0;33m`, measure1.duration, '\x1B[0m')
    console.log(`  ${color2}instance\x1B[0;33m`, measure2.duration, '\x1B[0m')
    console.log(`  ${color3}instance-float32\x1B[0;33m`, measure3.duration, '\x1B[0m')
    console.log(`  ${color4}instance-float32-composed\x1B[0;33m`, measure4.duration, '\x1B[0m')
  }
}

main()
