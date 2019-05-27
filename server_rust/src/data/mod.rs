use r2d2;
use r2d2_diesel::ConnectionManager;

use diesel::prelude::*;
use diesel::mysql::MysqlConnection;
use dotenv::dotenv;
use std::env;

pub mod auth;
pub mod notes;

pub mod schema;
pub mod models;

pub type RConn = MysqlConnection;
pub type Pool = r2d2::Pool<ConnectionManager<RConn>>;
pub type PoolConn = r2d2::PooledConnection<ConnectionManager<RConn>>;


pub fn init() -> Pool{
    dotenv().ok();  
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    let manager = ConnectionManager::<MysqlConnection>::new(database_url);
    Pool::builder()
        .max_size(2)
        .build(manager).expect("Pool creation error")
}
