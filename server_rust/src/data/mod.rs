use r2d2;
use r2d2_diesel::ConnectionManager;

use diesel;
use diesel::prelude::*;
use diesel::mysql::MysqlConnection;
use dotenv::dotenv;
use std::env;

pub mod auth;
pub mod notes;
pub mod tags;

pub mod schema;
pub mod models;

pub mod pagination;

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

pub fn check_affected(qr: diesel::QueryResult<usize>) -> bool{
    if qr.unwrap_or(0) > 0 {true} else {false}
}


pub fn map2<T, U>(a: Option<T>, b: Option<U>) -> Option<(T,U)> {
    match a {
        Some(x) => match b {
            Some(y) => Some((x, y)),
            None => None,
        },
        None => None,
    }
}