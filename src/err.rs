use serde::{Serialize, Serializer};

#[derive(Serialize, Clone)]
pub struct Result {
    pub code: isize,
    pub mess: String,
}

#[derive(thiserror::Error, Debug)]
pub enum Err {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("{0}")]
    String(String),
}

impl Serialize for Err {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
