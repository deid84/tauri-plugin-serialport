#[cfg(desktop)]
use std::{collections::HashMap, sync::{Arc, Mutex}};

use tauri::{
  plugin::{Builder, TauriPlugin}, Manager, Runtime,
};

pub mod serialport;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;

pub use error::{Error, Result};

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
/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("serialport")
    .invoke_handler(tauri::generate_handler![commands::ping])
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
