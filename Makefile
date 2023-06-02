all:
	clang --target=wasm32 -nostdlib -Wl,--no-entry -Wl,--allow-undefined -Wl,--export-all -Wl,--import-memory -Wl,--initial-memory=16777216 -Wl,--max-memory=16777216 test-wasm.c -o test-wasm.wasm
