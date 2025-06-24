use std::{collections::HashMap, sync::{Arc, Mutex}};

use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::serialport::{SerialPortInfo};

/// Access to the serialport APIs.
pub struct SerialPort<R: Runtime> {
    #[allow(dead_code)]
    pub(crate) app: AppHandle<R>,
    pub(crate) serialports: Arc<Mutex<HashMap<String, SerialPortInfo>>>,
}

