use serde::Serialize;
use serialport::{self, SerialPort};
use std::{
    collections::HashMap,
    sync::{mpsc::Sender, Arc, Mutex}, thread::JoinHandle,
};

#[derive(Default)]
pub struct SerialPortState {
    pub serialports: Arc<Mutex<HashMap<String, SerialPortInfo>>>,
}

pub struct SerialPortInfo {
    pub serialport: Box<dyn SerialPort>,
    pub sender: Option<Sender<usize>>,
    pub thread_handle: Option<JoinHandle<()>>,
}