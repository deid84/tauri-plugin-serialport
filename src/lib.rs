use tauri::{
  plugin::{Builder, TauriPlugin}, Manager, Runtime,
};

pub use models::*;
pub mod serialport;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Serialport;
#[cfg(mobile)]
use mobile::Serialport;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the serialport APIs.
pub trait SerialportExt<R: Runtime> {
  fn serialport(&self) -> &Serialport<R>;
}

impl<R: Runtime, T: Manager<R>> crate::SerialportExt<R> for T {
  fn serialport(&self) -> &Serialport<R> {
    self.state::<Serialport<R>>().inner()
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
      let serialport = desktop::init(app, api)?;
      app.manage(serialport);
      Ok(())
    })
    .build()
}
