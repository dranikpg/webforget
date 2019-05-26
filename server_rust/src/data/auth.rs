use super::RConn;

use diesel;
use diesel::prelude::*;
use super::models::{User, NewUser};
use super::schema::users;

use bcrypt::{DEFAULT_COST, hash, verify};

type E = diesel::result::Error;

pub fn create(conn: &RConn, nick: &str, email: &str, rpw: &str) -> Result<User, &'static str>{
    let pw = hash(&rpw, DEFAULT_COST).unwrap();
    let res = diesel::insert_into(users::table)
        .values(&NewUser{
            nick,
            email,
            pw: &pw
        })
        .execute(conn);
    match res{
        Ok(_) => match get_by_email(conn, email){
            Some(user) => Ok(user),
            None => Err("ERR: Failed to create account")
        },
        Err(r) => Err("ERR: Failed to create account")
    }
}
//
pub fn get_by_email(conn: &RConn, email: &str) -> Option<User>{
    users::table.filter(users::email.like(email)).get_result::<User>(conn).ok()
}
//
pub fn get(conn: &RConn, id: i32) -> Option<User>{
    users::table.find(id).get_result::<User>(conn).ok()
}
//
pub fn login(conn: &RConn, email: &str, pw: &str) -> Option<User>{
    let us = get_by_email(conn, email);
    match us{
        Some(us) => if us.verified(&pw) {Some(us)} else {None},
        None => None
    }
}

impl User{
    pub fn verified(&self, pw: &str) -> bool{
        return verify(pw,&self.pw).unwrap()
    }
}