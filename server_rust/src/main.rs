#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
extern crate rocket_contrib;
extern crate rocket_codegen;
extern crate rocket_cors;

#[macro_use]
extern crate diesel;
extern crate dotenv;
extern crate r2d2;
extern crate r2d2_diesel;

extern crate bcrypt;

#[macro_use]
extern crate serde_derive;

#[macro_use]
extern crate log;   
extern crate chrono;

mod data;
mod server;


use crate::server::cors;

//







fn main() {
    rocket::ignite()
        .manage(data::init())
        .attach(cors::init())
        .mount("/",
            routes![
                server::auth::r_create,
                server::auth::r_create_f,
                server::auth::r_login,
                server::auth::r_login_f,
                server::auth::r_logout,
                server::auth::r_auto,
                server::auth::r_auto_f,

                server::notes::r_get,
                server::notes::r_get_all,
                server::notes::r_get_arr,
                server::notes::r_create,
                server::notes::r_update,
                server::notes::r_update_tags,
                server::notes::r_delete,
                
                server::tags::r_get_user,
                server::tags::r_get_user_simple,
		        server::tags::r_get_user_alike,

                server::search::r_search,
                /*cors::r_auth_create,
                cors::r_auth_login,
                cors::r_auth_auto,
                cors::r_auth_logout,*/
            ])
        .launch();
}
