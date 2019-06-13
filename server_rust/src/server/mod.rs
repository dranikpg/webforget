pub mod data;
pub mod auth;
pub mod notes;
pub mod tags;
pub mod search;

pub mod cors;

use rocket::http::Status;

//responses

pub fn DOUBLE_LOGIN() -> Status {Status::new(400, "double login")}
pub fn FORBIDDEN() -> Status {Status::new(400,"forbidden")}
pub fn FAILED() -> Status {Status::new(400,"fail")}
pub fn SUCCESS() -> Status {Status::new(200,"OK")}