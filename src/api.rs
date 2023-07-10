use crate::err::Err;
use crate::state::{ReadData, SerialPortInfo, SerialPortState};
use serialport::{DataBits, FlowControl, Parity, StopBits};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender, TryRecvError};
use std::thread;
use std::time::Duration;
use tauri::{command, AppHandle, Runtime, State, Window};

fn get_serialport<T, F: FnOnce(&mut SerialPortInfo) -> Result<T, Err>>(
    state: State<'_, SerialPortState>,
    port_name: String,
    f: F,
) -> Result<T, Err> {
    match state.serialports.lock() {
        Ok(mut map) => match map.get_mut(&port_name) {
            Some(serialport_info) => f(serialport_info),
            None => {
                Err(Err::String("Serial Port not found!".to_string()))
            }
        },
        Err(error) =>  Err(Err::String(format!("Failed to acquire file lock! {} ", error))),
    }
}

fn get_data_bits(value: Option<usize>) -> DataBits {
    match value {
        Some(value) => match value {
            5 => DataBits::Five,
            6 => DataBits::Six,
            7 => DataBits::Seven,
            8 => DataBits::Eight,
            _ => DataBits::Eight,
        },
        None => DataBits::Eight,
    }
}

fn get_flow_control(value: Option<String>) -> FlowControl {
    match value {
        Some(value) => match value.as_str() {
            "Software" => FlowControl::Software,
            "Hardware" => FlowControl::Hardware,
            _ => FlowControl::None,
        },
        None => FlowControl::None,
    }
}

fn get_parity(value: Option<String>) -> Parity {
    match value {
        Some(value) => match value.as_str() {
            "Odd" => Parity::Odd,
            "Even" => Parity::Even,
            _ => Parity::None,
        },
        None => Parity::None,
    }
}

fn get_stop_bits(value: Option<usize>) -> StopBits {
    match value {
        Some(value) => match value {
            1 => StopBits::One,
            2 => StopBits::Two,
            _ => StopBits::Two,
        },
        None => StopBits::Two,
    }
}

#[command]
pub fn available_ports() -> Vec<String> {
    let mut list = match serialport::available_ports() {
        Ok(list) => list,
        Err(_) => vec![],
    };
    list.sort_by(|a, b| a.port_name.cmp(&b.port_name));

    let mut name_list: Vec<String> = vec![];
    for i in &list {
        name_list.push(i.port_name.clone());
    }

    println!("Serial Ports List: {:?}", &name_list);

    name_list
}

#[command]
pub async fn cancel_read<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    port_name: String,
) -> Result<(), Err> {
    get_serialport(state, port_name.clone(), |serialport_info| {
        match &serialport_info.sender {
            Some(sender) => match sender.send(1) {
                Ok(_) => {}
                Err(error) => {
                    return Err(Err::String(format!("Failed to cancel serial port reading data: {}", error)));
                }
            },
            None => {}
        }
        serialport_info.sender = None;
        println!("Cancel {} serial port reading", &port_name);
        Ok(())
    })
}

#[command]
pub fn close<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    port_name: String,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut serialports) => {
            if serialports.remove(&port_name).is_some() {
                Ok(())
            } else {
                Err(Err::String(format!("Serial port {} not opened!", &port_name)))
            }
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn close_all<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut map) => {
            for serialport_info in map.values() {
                if let Some(sender) = &serialport_info.sender {
                    match sender.send(1) {
                        Ok(_) => {}
                        Err(error) => {
                            println!("Failed to cancel serial port reading data: {}", error);
                            return Err(Err::String(format!("Failed to cancel serial port reading data: {}", error)));
                        }
                    }
                }
            }
            map.clear();
            Ok(())
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn force_close<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    port_name: String,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut map) => {
            if let Some(serial) = map.get_mut(&port_name) {
                if let Some(sender) = &serial.sender {
                    match sender.send(1) {
                        Ok(_) => {}
                        Err(error) => {
                            println!("Failed to cancel serial port reading data: {}", error);
                            return Err(Err::String(format!("Failed to cancel serial port reading data: {}", error)));
                        }
                    }
                }
                map.remove(&port_name);
                Ok(())
            } else {
                Ok(())
            }
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn open<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, SerialPortState>,
    _window: Window<R>,
    port_name: String,
    baud_rate: u32,
    data_bits: Option<usize>,
    flow_control: Option<String>,
    parity: Option<String>,
    stop_bits: Option<usize>,
    timeout: Option<u64>,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut serialports) => {
            if serialports.contains_key(&port_name) {
                return Err(Err::String(format!("Serial port {} not opened!", port_name)));
            }
            match serialport::new(port_name.clone(), baud_rate)
                .data_bits(get_data_bits(data_bits))
                .flow_control(get_flow_control(flow_control))
                .parity(get_parity(parity))
                .stop_bits(get_stop_bits(stop_bits))
                .timeout(Duration::from_millis(timeout.unwrap_or(200)))
                .open()
            {
                Ok(serial) => {
                    let data = SerialPortInfo {
                        serialport: serial,
                        sender: None,
                    };
                    serialports.insert(port_name, data);
                    Ok(())
                }
                Err(error) => Err(Err::String(format!(
                    "Access serial port {} failed: {}",
                    port_name,
                    error.description
                ))),
            }
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn read<R: Runtime>(
    _app: AppHandle<R>,
    window: Window<R>,
    state: State<'_, SerialPortState>,
    port_name: String,
    timeout: Option<u64>,
    size: Option<usize>,
) -> Result<(), Err> {
    get_serialport(state.clone(), port_name.clone(), |serialport_info| {
        if serialport_info.sender.is_some() {
            println!("Already reading data from serial port: {}", &port_name);
            Ok(())
        } else {
            println!("Start reading data from serial port: {}", &port_name);
            match serialport_info.serialport.try_clone() {
                Ok(mut serial) => {
                    let read_event = format!("plugin-serialport-read-{}", &port_name);
                    let (tx, rx): (Sender<usize>, Receiver<usize>) = mpsc::channel();
                    serialport_info.sender = Some(tx);
                    thread::spawn(move || loop {
                        match rx.try_recv() {
                            Ok(_) => {
                                println!("Stop reading data from serial port: {}", &port_name);
                                break;
                            }
                            Err(error) => match error {
                                TryRecvError::Disconnected => {
                                    println!("Disconnect from serial port {}", &port_name);
                                    break;
                                }
                                TryRecvError::Empty => {}
                            },
                        }
                        let mut serial_buf: Vec<u8> = vec![0; size.unwrap_or(1024)];
                        match serial.read(serial_buf.as_mut_slice()) {
                            Ok(size) => {
                                println!("Serial port: {} Read data size: {}", &port_name, size);
                                match window.emit(
                                    &read_event,
                                    ReadData {
                                        data: &serial_buf[..size],
                                        size,
                                    },
                                ) {
                                    Ok(_) => {}
                                    Err(error) => {
                                        println!("Failed to send data: {}", error)
                                    }
                                }
                            }
                            Err(_err) => {
                                
                            }
                        }
                        thread::sleep(Duration::from_millis(timeout.unwrap_or(200)));
                    });
                }
                Err(error) => {
                    return Err(Err::String(format!("读取 {} 串口失败: {}", &port_name, error)));
                }
            }
            Ok(())
        }
    })
}

#[command]
pub fn write<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    port_name: String,
    value: String,
) -> Result<usize, Err> {
    get_serialport(state, port_name.clone(), |serialport_info| {
        match serialport_info.serialport.write(value.as_bytes()) {
            Ok(size) => {
                Ok(size)
        }
            Err(error) => {
                Err(Err::String(format!(
                    "Write to serial port: {} failed: {}",
                    &port_name, error
                )))
            }
        }
    })
}

#[command]
pub fn write_binary<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    port_name: String,
    value: Vec<u8>,
) -> Result<usize, Err> {
    get_serialport(state, port_name.clone(), |serialport_info| match serialport_info
        .serialport
        .write(&value)
    {
        Ok(size) => {
            Ok(size)
        }
        Err(error) => {
            Err(Err::String(format!(
                "Write to serial port: {} failed: {}",
                &port_name, error
            )))
        }
    })
}