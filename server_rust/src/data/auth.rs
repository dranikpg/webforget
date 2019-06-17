use super::RConn;

use diesel;
use diesel::prelude::*;
use super::models::{User, NewUser};
use super::schema::users;

use bcrypt::{DEFAULT_COST, hash, verify};

const COST: u32 = 7;

type E = diesel::result::Error;
pub fn create(conn: &RConn, nick: &str, email: &str, rpw: &str) -> Result<User, ()>{
    let pw = hash(&rpw, COST).unwrap();
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
            None => Err(())
        },
        Err(_) => Err(())
    }
}
pub fn get_by_email(conn: &RConn, email: &str) -> Option<User>{
    users::table.filter(users::email.eq(email)).get_result::<User>(conn).ok()
}
pub fn get(conn: &RConn, id: i32) -> Option<User>{
    users::table.find(id).get_result::<User>(conn).ok()
}
pub fn has(conn: &RConn, id: i32) -> bool{
    let r = users::table.filter(users::id.eq(id)).count().execute(conn);
    match r{
        Ok(c) => return c  > 0,
        Err(_e) => return false
    };
}
pub fn login(conn: &RConn, email: &str, pw: &str) -> Option<User>{
    println!("LOGIN");
    let us = get_by_email(conn, email);
    println!("GOT US");
    match us{
        Some(us) => if verified(&us,&pw) {Some(us)} else {None},
        None => None
    }
}
fn verified(us: &User, pw: &str) -> bool{
    return verify(pw,&us.pw).unwrap();
}