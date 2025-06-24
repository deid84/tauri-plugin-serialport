use std::collections::HashMap;

use serialport::SerialPort;
use tauri::State;
use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::SerialportExt;

#[command]
pub(crate) async fn ping<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.serialport().ping(payload)
}

#[tauri::command]
pub fn available_ports<R: Runtime>(
    _app: AppHandle<R>,
    serial: State<'_, SerialPort<R>>,
) -> Result<HashMap<String, HashMap<String, String>>, Error> {
    serial.available_ports()
}