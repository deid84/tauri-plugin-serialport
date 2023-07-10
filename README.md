# Tauri Plugin SerialPort
A tauri plugin for managin serial port communication, created using serialport-rs crate.

## Installation
There are three general methods of installation that we can recommend.

1. Use crates.io and npm (easiest, and requires you to trust that our publishing pipeline worked)
2. Pull sources directly from Github using git tags / revision hashes (most secure)
3. Git submodule install this repo in your tauri project and then use file protocol to ingest the source (most secure, but inconvenient to use)

### RUST

Install the Core plugin by adding the following to your `Cargo.toml` file:

`src-tauri/Cargo.toml`

```toml
[dependencies]
tauri-plugin-serialport = { git = "https://github.com/deid84/tauri-plugin-serialport", tag = "v0.1.0" }
```

Use in `src-tauri/src/main.rs`:

```RUST
use tauri_plugin_serialport;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_serialport::init())
        .build()
        .run();
}
```

### WEBVIEW

`Install from a tagged release`

```
npm install github:deid84/tauri-plugin-serialport#v0.1.0
# or
yarn add github:deid84/tauri-plugin-serialport#v0.1.0
```

`Install from a branch (dev)`

```
npm install https://github.com/deid84/tauri-plugin-serialport\#master
# or
yarn add https://github.com/deid84/tauri-plugin-serialport\#master
```

`package.json`

```json
  "dependencies": {
    "tauri-plugin-serialport-api": "github:deid84/tauri-plugin-serialport#v0.1.0",
  }
```

`Use within your JS/TS:`

todo...