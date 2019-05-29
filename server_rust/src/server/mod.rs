pub mod data;
pub mod auth;
pub mod notes;

use rocket::http::Status;

//responses

pub fn DOUBLE_LOGIN() -> Status {Status::new(403, "double login")}
pub fn FORBIDDEN() -> Status {Status::new(403,"forbidden")}
pub fn SUCCESS() -> Status {Status::new(200,"OK")}