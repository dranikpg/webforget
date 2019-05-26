#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
extern crate rocket_contrib;
extern crate rocket_codegen;

#[macro_use]
extern crate diesel;
extern crate dotenv;
extern crate r2d2;
extern crate r2d2_diesel;

extern crate bcrypt;

#[macro_use]
extern crate serde_derive;

mod data;
mod server;

use server::data::*;
#[get("/")]
pub fn test( conn: Conn) -> &'static str{
    "lol"
}

fn main() {
    rocket::ignite()
        .manage(data::init())
        .mount("/",
            routes![
                server::auth::r_create,
                server::auth::r_create_f,
                server::auth::r_login,
                server::auth::r_login_f,
                server::auth::r_logout,
                server::auth::r_auto,
                server::auth::r_auto_f,
            ])
        .launch();
}