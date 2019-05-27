use super::RConn;

use diesel;
use diesel::prelude::*;
use super::models::{Note, NewNote, UpdateNote};
use super::schema::notes;

fn check_res(qr: diesel::QueryResult<usize>) -> bool{
    if qr.unwrap_or(0) > 0 {true} else {false}
}

pub fn get_all(conn: &RConn) -> Option<Vec<Note>> {
    notes::table.load(conn).ok()
}

pub fn get_user(conn: &RConn, user_id: i32) -> Option<Vec<Note>>{
    notes::table.filter(notes::user_id.eq(user_id)).load(conn).ok()
}

pub fn create(conn: &RConn, user_id: i32, title: &str, link: &str) -> Option<Note>{
    let irs = diesel::insert_into(notes::table).values(
        &NewNote{
            user_id,
            title,
            link
        }
    ).execute(conn);
    if irs.is_err(){
        return None;
    }
    let us = notes::table.filter(notes::user_id.eq(user_id)).order(notes::id.desc()).first(conn);
    return us.ok();
}

pub fn update_safe<'a, T: Into<Option<&'a str>>>
    (conn: &RConn, id: i32, user_id: i32, title: T, link: T) -> bool {
    let r = diesel::update(notes::table).set(&UpdateNote{
        title: title.into(), 
        link: link.into()
    }).execute(conn);
    check_res(r)
}

/*pub fn delete(conn: &RConn, id: i32) -> bool{
    let r = diesel::delete(notes::table).filter(notes::id.eq(id)).execute(conn);
    if r.is_err(){
        return false;
    }
    if r.unwrap() > 0 {true} else {false}
}*/

pub fn delete_safe(conn: &RConn, id: i32, user_id: i32) -> bool{
    let r =  diesel::delete(notes::table)
            .filter(notes::id.eq(id))
            .filter(notes::user_id.eq(user_id)).execute(conn);
    check_res(r)
}