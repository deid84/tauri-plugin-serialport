import { UnlistenFn } from "@tauri-apps/api/event";
export interface InvokeResult {
    code: number;
    message: string;
}
export interface ReadDataResult {
    size: number;
    data: number[];
}
export interface SerialportOptions {
    portName: string;
    baudRate: number;
    encoding?: string;
    dataBits?: 5 | 6 | 7 | 8;
    flowControl?: null | "Software" | "Hardware";
    parity?: null | "Odd" | "Even";
    stopBits?: 1 | 2;
    timeout?: number;
    size?: number;
    [key: string]: any;
}
interface Options {
    dataBits: 5 | 6 | 7 | 8;
    flowControl: null | "Software" | "Hardware";
    parity: null | "Odd" | "Even";
    stopBits: 1 | 2;
    timeout: number;
    [key: string]: any;
}
interface ReadOptions {
    timeout?: number;
    size?: number;
}
declare class Serialport {
    isOpen: boolean;
    unListen?: UnlistenFn;
    encoding: string;
    options: Options;
    size: number;
    constructor(options: SerialportOptions);
    /**
     * @description: Returns a list of all serial ports on system
     * @return {Promise<string[]>}
     */
    static available_ports(): Promise<string[]>;
    /**
     * @description: Forces serial port closure
     * @param {string} portName
     * @return {Promise<void>}
     */
    static forceClose(portName: string): Promise<void>;
    /**
     * @description: Closes all serial ports
     * @return {Promise<void>}
     */
    static closeAll(): Promise<void>;
    /**
     * @description: Stops listening on a serial port
     * @return {Promise<void>}
     */
    cancelListen(): Promise<void>;
    /**
     * @description: Stops reading data
     * @return {Promise<void>}
     */
    cancelRead(): Promise<void>;
    /**
     * @description: Changes serial port
     * @param {object} options
     * @return {Promise<void>}
     */
    change(options: {
        portName?: string;
        baudRate?: number;
    }): Promise<void>;
    /**
     * @description: Close serial port
     * @return {Promise<InvokeResult>}
     */
    close(): Promise<void>;
    /**
     * @description: Monitors serial port information
     * @param {function} fn
     * @return {Promise<void>}
     */
    listen(fn: (...args: any[]) => void, isDecode?: boolean): Promise<void>;
    /**
     * @description: Opens serial port
     * @return {*}
     */
    open(): Promise<void>;
    /**
     * @description: Reads serial port information
     * @param {ReadOptions} options { timeout, size }
     * @return {Promise<void>}
     */
    read(options?: ReadOptions): Promise<void>;
    /**
     * @description: Sets baudrate
     * @param {number} value
     * @return {Promise<void>}
     */
    setBaudRate(value: number): Promise<void>;
    /**
     * @description: Sets port name
     * @param {string} value
     * @return {Promise<void>}
     */
    setPortName(value: string): Promise<void>;
    /**
     * @description: Writes data to serial port
     * @param {string} value
     * @return {Promise<number>}
     */
    write(value: string): Promise<number>;
    /**
     * @description: Writes binary data to serial port
     * @param {Uint8Array} value
     * @return {Promise<number>}
     */
    writeBinary(value: Uint8Array | number[]): Promise<number>;
}
export { Serialport };
