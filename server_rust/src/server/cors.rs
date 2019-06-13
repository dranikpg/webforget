

use rocket::http::Method;

use rocket::{get, options, routes};
use rocket_cors::{Cors,AllowedHeaders, AllowedOrigins, Guard, Responder};


pub fn init() -> Cors{
    let allowed_origins = AllowedOrigins::all();
    rocket_cors::CorsOptions {
        allowed_origins,
        allowed_methods: vec![Method::Get, Method::Post].into_iter().map(From::from).collect(),
        allowed_headers: AllowedHeaders::all(),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors().unwrap()
}

/// Manually mount an OPTIONS route for your own handling
#[options("/auth/create")]
pub fn r_auth_create(cors: Guard<'_>) -> Responder<'_, &str> {
    cors.responder("")
}
#[options("/auth/login")]
pub fn r_auth_login(cors: Guard<'_>) -> Responder<'_, &str> {
    cors.responder("")
}
#[options("/auth/auto")]
pub fn r_auth_auto(cors: Guard<'_>) -> Responder<'_, &str> {
    cors.responder("")
}
#[options("/auth/logout")]
pub fn r_auth_logout(cors: Guard<'_>) -> Responder<'_, &str> {
    cors.responder("")
}