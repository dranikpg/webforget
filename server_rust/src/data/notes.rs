use super::RConn;

use diesel;
use diesel::prelude::*;
use super::models::{Note, NewNote, UpdateNote};
use super::schema::notes;

use super::tags;


use super::pagination::*;

/*pub fn get(conn: &RConn, id: i32) -> Option<Note>{
    notes::table.find(id).get_result::<Note>(conn).ok()
}*/

pub fn get(conn: &RConn, id: i32, user_id: i32) -> Option<Note>{
    notes::table.filter(notes::id.eq(id)).filter(notes::user_id.eq(user_id))
            .get_result::<Note>(conn).ok()
}

pub fn get_all(conn: &RConn) -> Option<Vec<Note>> {
    notes::table.load(conn).ok()
}

pub fn get_user(conn: &RConn, user_id: i32) -> Option<Vec<Note>>{
    notes::table.filter(notes::user_id.eq(user_id)).load(conn).ok()
}

pub fn get_user_pg(conn: &RConn, user_id: i32,page: i64, pagesize: i64) -> Option<Vec<Note>>{
    let qbase = notes::table.filter(notes::user_id.eq(user_id)).order(notes::id.desc());
    let q: QueryResult<Vec<Note>> = qbase.paginate(page).per_page(pagesize).load_pp(conn);
    q.ok()
}

pub fn create(conn: &RConn, note: NewNote) -> Option<Note>{
    let user_id = note.user_id;
    let irs = diesel::insert_into(notes::table)
        .values(note).execute(conn);
    if irs.is_err(){
        return None;
    }
    let us = notes::table.filter(notes::user_id.eq(user_id))
        .order(notes::id.desc()).first(conn);
    return us.ok();
}

pub fn update_safe(conn: &RConn, id: i32, user_id: i32, note: UpdateNote) -> bool {
    let target = notes::table.filter(notes::id.eq(id)).filter(notes::user_id.eq(user_id));
    let r = diesel::update(target)
        .set(note).execute(conn);
    super::check_affected(r)
}

/*pub fn delete(conn: &RConn, id: i32) -> bool{
    let r = diesel::delete(notes::table).filter(notes::id.eq(id)).execute(conn);
    if r.is_err(){
        return false;
    }
    if r.unwrap() > 0 {true} else {false}
}*/

pub fn delete_safe(conn: &RConn, id: i32, user_id: i32) -> bool{
    tags::remove_all_safe(conn, id, user_id);
    let r =  diesel::delete(notes::table)
            .filter(notes::id.eq(id))
            .filter(notes::user_id.eq(user_id)).execute(conn);
    super::check_affected(r)
}