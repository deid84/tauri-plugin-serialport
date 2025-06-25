#[cfg(desktop)]
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub mod serialport;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;

use crate::commands::*;

pub use error::Error;

#[cfg(desktop)]
use desktop::SerialPort;
#[cfg(mobile)]
use mobile::Serialport;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the serialport APIs.
pub trait SerialportExt<R: Runtime> {
    fn serialport(&self) -> &SerialPort<R>;
}

impl<R: Runtime, T: Manager<R>> crate::SerialportExt<R> for T {
    fn serialport(&self) -> &SerialPort<R> {
        self.state::<SerialPort<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("serialport")
        .invoke_handler(tauri::generate_handler![
            available_ports,
            cancel_read,
            close,
            close_all,
            open,
            start_listening,
            stop_listening,
            read,
            read_binary,
            write,
            write_binary,
            set_baud_rate,
            set_data_bits,
            set_flow_control,
            set_parity,
            set_stop_bits,
            set_timeout,
            write_request_to_send,
            write_data_terminal_ready,
            read_clear_to_send,
            read_data_set_ready,
            read_ring_indicator,
            read_carrier_detect,
            bytes_to_read,
            bytes_to_write,
            clear_buffer,
            set_break,
            clear_break,
        ])
        .setup(|app, api| {
            #[cfg(mobile)]
            let serialport = mobile::init(app, api)?;
            #[cfg(desktop)]
            let serialport = SerialPort {
                app: app.clone(),
                serialports: Arc::new(Mutex::new(HashMap::new())),
            };
            app.manage(serialport);
            Ok(())
        })
        .build()
}
