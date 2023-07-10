use tauri::{
  plugin::{Builder, TauriPlugin}, Manager, Runtime,
};

use api::{*};
use state::SerialPortState;
use std::{collections::HashMap, sync::{Mutex, Arc}};

mod api;
mod err;
mod state;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("serialport")
    .invoke_handler(tauri::generate_handler![
      available_ports,
      cancel_read,
      close,
      close_all,
      force_close,
      open,
      read,
      write,
      write_binary,
    ])
    .setup(move |app| {
      app.manage(SerialPortState {
        serialports: Arc::new(Mutex::new(HashMap::new()))
      });
      Ok(())
    })
    .build()
}
