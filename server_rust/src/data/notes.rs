use super::RConn;

use diesel;
use diesel::QueryResult;
use diesel::prelude::*;
use super::models::{ID,Note,NoteWT, NewNote, UpdateNote};
use super::schema::notes;

use super::tags;
use super::pagination::*;

pub fn first<T>(arro: Option<Vec<T>>) -> Option<T>{
    match arro{
        None=> None,
        Some(arr)=> {
            for el in arr{
                return Some(el);
            }
            return None;
        }
    }
}

pub fn get(conn: &RConn, id: i32, user_id: i32) -> Option<NoteWT>{
    let qbase = format!("SELECT notes.id,notes.title,notes.descr,notes.link,notes.cdate, GROUP_CONCAT(tags.name SEPARATOR ' ') as tagarr
                FROM notes JOIN tagmap on notes.id = tagmap.note_id JOIN tags on tagmap.tag_id = tags.id
                WHERE notes.id = '{}' AND notes.user_id = '{}' LIMIT 1", id, user_id);
    let q : QueryResult<Vec<NoteWT>> = diesel::sql_query(&qbase).load(conn);
    first(q.ok())
}

/*pub fn get_user_pg_2(conn: &RConn, user_id: i32,page: i64, pagesize: i64) -> Option<Vec<Note>>{
    let qbase = notes::table.filter(notes::user_id.eq(user_id)).order(notes::id.desc());
    let q: QueryResult<Vec<Note>> = qbase.paginate(page).per_page(pagesize).load_pp(conn);
    q.ok()
}*/

pub fn get_user_pg(conn: &RConn, user_id: i32, page: i64, pagesize: i64) -> Option<Vec<NoteWT>>{
    let offset = (page - 1) * pagesize;
    let qbase = format!("SELECT notes.id,notes.title,notes.descr,notes.link,notes.cdate, GROUP_CONCAT(tags.name SEPARATOR ' ') as tagarr
        FROM notes JOIN tagmap on notes.id = tagmap.note_id JOIN tags on tagmap.tag_id = tags.id 
        WHERE notes.user_id = '{}' GROUP BY notes.id LIMIT {},{};",user_id, offset, pagesize);
    let q : QueryResult<Vec<NoteWT>> = diesel::sql_query(&qbase).load(conn);
    q.ok()
}

pub fn get_user_arr(conn: &RConn, user_id: i32, ids: &[i32]) -> Option<Vec<NoteWT>>{
    let mut buf = String::with_capacity(ids.len() * 3);
    for x in 0..ids.len(){
        buf.push_str(&ids[x].to_string());
        if x != ids.len() - 1{
            buf.push(',');
        }
    }
    let qbase = format!("SELECT notes.id,notes.title,notes.descr,notes.link,notes.cdate, GROUP_CONCAT(tags.name SEPARATOR ' ') as tagarr
        FROM notes JOIN tagmap on notes.id = tagmap.note_id JOIN tags on tagmap.tag_id = tags.id 
        WHERE notes.user_id = '{}' AND notes.id IN ({}) GROUP BY notes.id", user_id, &buf);
    let q: QueryResult<Vec<NoteWT>> = diesel::sql_query(&qbase).load(conn);
    q.ok()
}

pub fn create(conn: &RConn, note: NewNote) -> Option<ID>{
    let user_id = note.user_id;
    let irs = diesel::insert_into(notes::table)
        .values(note).execute(conn);
    if irs.is_err(){
        return None;
    }
    let q = diesel::sql_query(&format!("SELECT notes.id from notes WHERE notes.user_id = '{}' ORDER BY notes.id LIMIT 1;",user_id)).load(conn);
    first(q.ok())
}

pub fn update_safe(conn: &RConn, id: i32, user_id: i32, note: UpdateNote) -> bool {
    let target = notes::table.filter(notes::id.eq(id)).filter(notes::user_id.eq(user_id));
    let r = diesel::update(target)
        .set(note).execute(conn);
    r.is_ok()
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