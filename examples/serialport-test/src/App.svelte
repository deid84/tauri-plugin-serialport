<script lang="ts">
  import { Serialport, availablePorts, type PortInfo } from 'tauri-plugin-serialport-api'

  // ── State ────────────────────────────────────────────────────────────────────

  let ports: Record<string, PortInfo> = {}
  let selectedPath = ''
  let baudRate = 115200
  let port: Serialport | undefined

  let isOpen = false
  let isListening = false
  let log: { ts: string; text: string; dir: 'in' | 'out' | 'sys' }[] = []
  let sendValue = ''
  let errorMsg = ''

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function addLog(text: string, dir: 'in' | 'out' | 'sys' = 'sys') {
    const ts = new Date().toLocaleTimeString('it-IT', { hour12: false })
    log = [...log, { ts, text, dir }]
  }

  // ── Port scanning ─────────────────────────────────────────────────────────────

  async function scanPorts() {
    try {
      ports = await availablePorts()
      errorMsg = ''
      if (Object.keys(ports).length === 0) addLog('No ports found.')
    } catch (e) {
      errorMsg = String(e)
    }
  }

  // ── Connection ────────────────────────────────────────────────────────────────

  async function connect() {
    try {
      port = new Serialport({ path: selectedPath, baudRate })
      await port.open()
      await port.onDisconnected((msg) => {
        addLog(`Disconnected: ${msg}`, 'sys')
        isOpen = false
        isListening = false
      })
      isOpen = true
      errorMsg = ''
      addLog(`Connected to ${selectedPath} @ ${baudRate} baud`, 'sys')
    } catch (e) {
      errorMsg = String(e)
    }
  }

  async function disconnect() {
    try {
      if (isListening) await stopListening()
      await port?.close()
      isOpen = false
      addLog('Disconnected.', 'sys')
    } catch (e) {
      errorMsg = String(e)
    }
  }

  // ── Background reader ─────────────────────────────────────────────────────────

  async function startListening() {
    try {
      await port?.listen((data) => addLog(String(data).trimEnd(), 'in'))
      await port?.startListening()
      isListening = true
      errorMsg = ''
      addLog('Listening started.', 'sys')
    } catch (e) {
      errorMsg = String(e)
    }
  }

  async function stopListening() {
    try {
      await port?.stopListening()
      port?.unlisten()
      isListening = false
      addLog('Listening stopped.', 'sys')
    } catch (e) {
      errorMsg = String(e)
    }
  }

  // ── Write ─────────────────────────────────────────────────────────────────────

  async function send() {
    if (!sendValue || !port) return
    try {
      const n = await port.write(sendValue + '\n')
      addLog(sendValue, 'out')
      addLog(`(${n} bytes sent)`, 'sys')
      sendValue = ''
      errorMsg = ''
    } catch (e) {
      errorMsg = String(e)
    }
  }

  function onSendKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') send()
  }

  // auto-scan on load
  scanPorts()
</script>

<main class="container">
  <h1>SerialPort Plugin — Tauri v2</h1>

  <!-- ── Port scanner ─────────────────────────────────────────────────────── -->
  <section>
    <div class="section-header">
      <h2>Available Ports</h2>
      <button on:click={scanPorts}>Refresh</button>
    </div>
    {#if Object.keys(ports).length > 0}
      <table>
        <thead>
          <tr><th>Path</th><th>Type</th><th>Manufacturer</th><th>VID</th><th>PID</th></tr>
        </thead>
        <tbody>
          {#each Object.entries(ports) as [path, info]}
            <tr
              class:selected={selectedPath === path}
              on:click={() => (selectedPath = path)}
            >
              <td>{path}</td>
              <td>{info.type || '—'}</td>
              <td>{info.manufacturer || '—'}</td>
              <td>{info.vid || '—'}</td>
              <td>{info.pid || '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="hint">No ports found. Click Refresh to scan.</p>
    {/if}
  </section>

  <!-- ── Connection ───────────────────────────────────────────────────────── -->
  <section>
    <div class="section-header">
      <h2>Connection</h2>
    </div>
    <div class="row">
      <input
        type="text"
        placeholder="Port path (e.g. /dev/ttyUSB0 or COM3)"
        bind:value={selectedPath}
        disabled={isOpen}
      />
      <select bind:value={baudRate} disabled={isOpen}>
        {#each [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600] as rate}
          <option value={rate}>{rate}</option>
        {/each}
      </select>
      {#if !isOpen}
        <button on:click={connect} disabled={!selectedPath}>Connect</button>
      {:else}
        <button class="danger" on:click={disconnect}>Disconnect</button>
      {/if}
    </div>
  </section>

  <!-- ── Listening ─────────────────────────────────────────────────────────── -->
  <section>
    <div class="section-header">
      <h2>Background Reader</h2>
    </div>
    <div class="row">
      {#if !isListening}
        <button on:click={startListening} disabled={!isOpen}>Start Listening</button>
      {:else}
        <button class="danger" on:click={stopListening}>Stop Listening</button>
      {/if}
      <span class="status" class:active={isListening}>
        {isListening ? 'Listening…' : 'Idle'}
      </span>
    </div>
  </section>

  <!-- ── Write ─────────────────────────────────────────────────────────────── -->
  <section>
    <div class="section-header">
      <h2>Send Data</h2>
    </div>
    <div class="row">
      <input
        type="text"
        placeholder="Type data and press Enter or Send"
        bind:value={sendValue}
        on:keydown={onSendKeydown}
        disabled={!isOpen}
      />
      <button on:click={send} disabled={!isOpen || !sendValue}>Send</button>
    </div>
  </section>

  <!-- ── Error ─────────────────────────────────────────────────────────────── -->
  {#if errorMsg}
    <div class="error">{errorMsg}</div>
  {/if}

  <!-- ── Log ───────────────────────────────────────────────────────────────── -->
  <section>
    <div class="section-header">
      <h2>Log</h2>
      <button on:click={() => (log = [])}>Clear</button>
    </div>
    <div class="log">
      {#each log as entry}
        <div class="log-line log-{entry.dir}">
          <span class="log-ts">{entry.ts}</span>
          <span class="log-dir">{entry.dir === 'in' ? '←' : entry.dir === 'out' ? '→' : '·'}</span>
          <span>{entry.text}</span>
        </div>
      {/each}
      {#if log.length === 0}
        <p class="hint">No data yet.</p>
      {/if}
    </div>
  </section>
</main>

<style>
  .container {
    max-width: 860px;
    margin: 0 auto;
    padding: 1.5rem;
    font-family: inherit;
  }

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1rem;
    margin: 0;
  }

  section {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  input[type="text"] {
    flex: 1;
    min-width: 200px;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  select {
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
  }

  button {
    padding: 0.4rem 0.9rem;
    border: none;
    border-radius: 6px;
    background: #396cd8;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  button.danger {
    background: #c0392b;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  th, td {
    text-align: left;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #eee;
  }

  tr.selected td {
    background: #e8f0ff;
  }

  tbody tr:hover td {
    background: #f5f5f5;
    cursor: pointer;
  }

  tr.selected:hover td {
    background: #dce8ff;
  }

  .status {
    font-size: 0.85rem;
    color: #888;
  }

  .status.active {
    color: #27ae60;
    font-weight: 600;
  }

  .error {
    background: #fdecea;
    border: 1px solid #e57373;
    border-radius: 6px;
    padding: 0.6rem 0.9rem;
    color: #c62828;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .log {
    font-family: monospace;
    font-size: 0.82rem;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 6px;
    padding: 0.75rem;
    min-height: 160px;
    max-height: 300px;
    overflow-y: auto;
  }

  .log-line {
    display: flex;
    gap: 0.5rem;
    line-height: 1.5;
  }

  .log-ts {
    color: #858585;
    flex-shrink: 0;
  }

  .log-dir {
    flex-shrink: 0;
    width: 1rem;
    text-align: center;
  }

  .log-in .log-dir  { color: #4ec9b0; }
  .log-out .log-dir { color: #9cdcfe; }
  .log-sys .log-dir { color: #858585; }
  .log-in           { color: #4ec9b0; }
  .log-out          { color: #9cdcfe; }
  .log-sys          { color: #858585; }

  .hint {
    color: #999;
    font-size: 0.85rem;
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    section {
      border-color: #444;
    }
    th, td {
      border-color: #333;
    }
    tbody tr:hover td {
      background: #2a2a2a;
    }
    tr.selected td {
      background: #1a2a4a;
    }
    tr.selected:hover td {
      background: #1e3257;
    }
    input[type="text"], select {
      background: #1e1e1e;
      color: #d4d4d4;
      border-color: #444;
    }
  }
</style>
