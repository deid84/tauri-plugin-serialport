import { invoke } from '@tauri-apps/api/core'
import { listen as tauriListen, type UnlistenFn } from '@tauri-apps/api/event'

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Number of bits per character — matches Rust `DataBits` enum variants. */
export type DataBits = 'Five' | 'Six' | 'Seven' | 'Eight'

/** Flow control mode — matches Rust `FlowControl` enum variants. */
export type FlowControl = 'None' | 'Software' | 'Hardware'

/** Parity checking mode — matches Rust `Parity` enum variants. */
export type Parity = 'None' | 'Odd' | 'Even'

/** Number of stop bits — matches Rust `StopBits` enum variants. */
export type StopBits = 'One' | 'Two'

/** Which buffer(s) to clear — matches Rust `ClearBuffer` enum variants. */
export type ClearBuffer = 'Input' | 'Output' | 'All'

/** Metadata returned by `availablePorts()` for each discovered port. */
export interface PortInfo {
  type: string
  vid: string
  pid: string
  serial_number: string
  manufacturer: string
  product: string
}

/** Payload shape of the read event emitted by the background reader. */
export interface ReadData {
  size: number
  data: number[]
}

export interface SerialportOptions {
  path: string
  baudRate: number
  encoding?: string
  dataBits?: DataBits
  flowControl?: FlowControl
  parity?: Parity
  stopBits?: StopBits
  /** Read timeout in milliseconds (default: 200). */
  timeout?: number
  /** Read buffer size in bytes (default: 1024). */
  size?: number
}

// ─── Standalone helpers ─────────────────────────────────────────────────────────

/** Returns all available serial ports with their metadata. */
export async function availablePorts(): Promise<Record<string, PortInfo>> {
  return invoke<Record<string, PortInfo>>('plugin:serialport|available_ports')
}

/** Closes every open serial port. */
export async function closeAll(): Promise<void> {
  return invoke('plugin:serialport|close_all')
}

// ─── Serialport class ───────────────────────────────────────────────────────────

export class Serialport {
  path: string
  isOpen: boolean
  encoding: string
  baudRate: number
  dataBits: DataBits
  flowControl: FlowControl
  parity: Parity
  stopBits: StopBits
  timeout: number
  size: number

  private _readUnlisten?: UnlistenFn
  private _disconnectedUnlisten?: UnlistenFn

  constructor(options: SerialportOptions) {
    this.path = options.path
    this.isOpen = false
    this.encoding = options.encoding ?? 'utf-8'
    this.baudRate = options.baudRate
    this.dataBits = options.dataBits ?? 'Eight'
    this.flowControl = options.flowControl ?? 'None'
    this.parity = options.parity ?? 'None'
    this.stopBits = options.stopBits ?? 'One'
    this.timeout = options.timeout ?? 200
    this.size = options.size ?? 1024
  }

  /**
   * Path sanitized for use in Tauri event names
   * (mirrors the Rust sanitization: `.` and `/` → `-`).
   */
  private get _eventPath(): string {
    return this.path.replace(/\./g, '-').replace(/\//g, '-')
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    if (this.isOpen) return
    await invoke('plugin:serialport|open', {
      path: this.path,
      baudRate: this.baudRate,
      dataBits: this.dataBits,
      flowControl: this.flowControl,
      parity: this.parity,
      stopBits: this.stopBits,
      timeout: this.timeout,
    })
    this.isOpen = true
  }

  /**
   * Closes the port.
   * Automatically unsubscribes any JS-side event listeners; the Rust side
   * stops the background reader and joins its thread.
   */
  async close(): Promise<void> {
    if (!this.isOpen) return
    this._readUnlisten?.()
    this._readUnlisten = undefined
    this._disconnectedUnlisten?.()
    this._disconnectedUnlisten = undefined
    await invoke('plugin:serialport|close', { path: this.path })
    this.isOpen = false
  }

  // ── Background reader + events ───────────────────────────────────────────────

  /**
   * Subscribes to data events emitted by the background reader.
   * If `decode` is true (default) the payload bytes are decoded to a string
   * using `this.encoding`; otherwise a raw `Uint8Array` is passed.
   *
   * Call `startListening()` to start the background reader that produces events.
   */
  async listen(fn: (data: string | Uint8Array) => void, decode = true): Promise<void> {
    this._readUnlisten?.()
    const readEvent = `plugin-serialplugin-read-${this._eventPath}`
    this._readUnlisten = await tauriListen<ReadData>(readEvent, ({ payload }) => {
      if (decode) {
        fn(new TextDecoder(this.encoding).decode(new Uint8Array(payload.data)))
      } else {
        fn(new Uint8Array(payload.data))
      }
    })
  }

  /** Unsubscribes from data events (does not stop the background reader). */
  unlisten(): void {
    this._readUnlisten?.()
    this._readUnlisten = undefined
  }

  /**
   * Subscribes to port disconnection events.
   * The callback receives the error message that caused the disconnection.
   */
  async onDisconnected(fn: (message: string) => void): Promise<void> {
    this._disconnectedUnlisten?.()
    const event = `plugin-serialplugin-disconnected-${this._eventPath}`
    this._disconnectedUnlisten = await tauriListen<string>(event, ({ payload }) => fn(payload))
  }

  /**
   * Starts the background reader thread on the Rust side.
   * The thread emits read events that `listen()` subscribes to.
   */
  async startListening(timeout?: number, size?: number): Promise<void> {
    return invoke('plugin:serialport|start_listening', {
      path: this.path,
      timeout: timeout ?? this.timeout,
      size: size ?? this.size,
    })
  }

  /** Stops the background reader thread. */
  async stopListening(): Promise<void> {
    return invoke('plugin:serialport|stop_listening', { path: this.path })
  }

  /** Sends a stop signal to the reader without waiting for thread completion. */
  async cancelRead(): Promise<void> {
    return invoke('plugin:serialport|cancel_read', { path: this.path })
  }

  // ── Synchronous reads ────────────────────────────────────────────────────────

  /** Reads up to `size` bytes, decoding them as UTF-8. Blocks for up to `timeout` ms. */
  async read(timeout?: number, size?: number): Promise<string> {
    return invoke('plugin:serialport|read', {
      path: this.path,
      timeout: timeout ?? this.timeout,
      size: size ?? this.size,
    })
  }

  /** Reads up to `size` bytes as a `Uint8Array`. Blocks for up to `timeout` ms. */
  async readBinary(timeout?: number, size?: number): Promise<Uint8Array> {
    const data = await invoke<number[]>('plugin:serialport|read_binary', {
      path: this.path,
      timeout: timeout ?? this.timeout,
      size: size ?? this.size,
    })
    return new Uint8Array(data)
  }

  // ── Write ────────────────────────────────────────────────────────────────────

  /** Writes a UTF-8 string. Returns the number of bytes written. */
  async write(value: string): Promise<number> {
    return invoke('plugin:serialport|write', { path: this.path, value })
  }

  /** Writes raw bytes. Returns the number of bytes written. */
  async writeBinary(value: Uint8Array | number[]): Promise<number> {
    return invoke('plugin:serialport|write_binary', {
      path: this.path,
      value: Array.from(value),
    })
  }

  // ── Port settings ────────────────────────────────────────────────────────────

  /** Updates the baud rate. If the port is open the change is applied immediately. */
  async setBaudRate(baudRate: number): Promise<void> {
    this.baudRate = baudRate
    if (!this.isOpen) return
    return invoke('plugin:serialport|set_baud_rate', { path: this.path, baudRate })
  }

  async setDataBits(dataBits: DataBits): Promise<void> {
    this.dataBits = dataBits
    if (!this.isOpen) return
    return invoke('plugin:serialport|set_data_bits', { path: this.path, dataBits })
  }

  async setFlowControl(flowControl: FlowControl): Promise<void> {
    this.flowControl = flowControl
    if (!this.isOpen) return
    return invoke('plugin:serialport|set_flow_control', { path: this.path, flowControl })
  }

  async setParity(parity: Parity): Promise<void> {
    this.parity = parity
    if (!this.isOpen) return
    return invoke('plugin:serialport|set_parity', { path: this.path, parity })
  }

  async setStopBits(stopBits: StopBits): Promise<void> {
    this.stopBits = stopBits
    if (!this.isOpen) return
    return invoke('plugin:serialport|set_stop_bits', { path: this.path, stopBits })
  }

  /** Updates the read timeout in milliseconds. If the port is open the change is applied immediately. */
  async setTimeout(timeout: number): Promise<void> {
    this.timeout = timeout
    if (!this.isOpen) return
    return invoke('plugin:serialport|set_timeout', { path: this.path, timeout })
  }

  // ── Signal lines ─────────────────────────────────────────────────────────────

  async writeRequestToSend(level: boolean): Promise<void> {
    return invoke('plugin:serialport|write_request_to_send', { path: this.path, level })
  }

  async writeDataTerminalReady(level: boolean): Promise<void> {
    return invoke('plugin:serialport|write_data_terminal_ready', { path: this.path, level })
  }

  async readClearToSend(): Promise<boolean> {
    return invoke('plugin:serialport|read_clear_to_send', { path: this.path })
  }

  async readDataSetReady(): Promise<boolean> {
    return invoke('plugin:serialport|read_data_set_ready', { path: this.path })
  }

  async readRingIndicator(): Promise<boolean> {
    return invoke('plugin:serialport|read_ring_indicator', { path: this.path })
  }

  async readCarrierDetect(): Promise<boolean> {
    return invoke('plugin:serialport|read_carrier_detect', { path: this.path })
  }

  // ── Buffer operations ────────────────────────────────────────────────────────

  async bytesToRead(): Promise<number> {
    return invoke('plugin:serialport|bytes_to_read', { path: this.path })
  }

  async bytesToWrite(): Promise<number> {
    return invoke('plugin:serialport|bytes_to_write', { path: this.path })
  }

  async clearBuffer(bufferType: ClearBuffer): Promise<void> {
    return invoke('plugin:serialport|clear_buffer', { path: this.path, bufferType })
  }

  async setBreak(): Promise<void> {
    return invoke('plugin:serialport|set_break', { path: this.path })
  }

  async clearBreak(): Promise<void> {
    return invoke('plugin:serialport|clear_break', { path: this.path })
  }
}
