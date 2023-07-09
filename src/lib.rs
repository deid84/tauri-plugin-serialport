use tauri::{
  plugin::{Builder, TauriPlugin}, Manager, Runtime,
};

use api::{*};
use state::SerialPortState;
use std::{collections::HashMap, sync::{Mutex, Arc}};

mod api;
mod err;
mod state;

// type Result<T> = std::result::Result<T, Error>;

// #[derive(Debug, thiserror::Error)]
// pub enum Error {
//   #[error(transparent)]
//   Io(#[from] std::io::Error),
// }

// impl Serialize for Error {
//   fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
//   where
//     S: Serializer,
//   {
//     serializer.serialize_str(self.to_string().as_ref())
//   }
// }

// #[derive(Default)]
// struct MyState(Mutex<HashMap<String, String>>);

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
