import fs from 'fs'

async function main() {
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

  module.instance.exports.__wasm_call_ctors()
  for (let i = 0; i < runs; i++) {
    console.log('=== perf run', i)
    performance.mark('wasm:start')
    module.instance.exports.update()
    performance.mark('wasm:end')
    const measure = performance.measure('wasm', 'wasm:start', 'wasm:end')
    console.log('  wasm', measure.duration)
  }
}

main()
