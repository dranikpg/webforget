
use rocket_contrib::json::Json;

use super::auth::UserID;
use crate::server::data::Conn;

use crate::data::search;
use super::notes::{NoteDto,with_tags};

#[post("/search?<from>&<ps>",format = "application/json", data = "<search>")]
pub fn r_search(conn: Conn, user: UserID, search: Json<search::Search>, from: i32, ps: i32)
        -> Option<Json<Vec<NoteDto>>> {
    let notes_o = search::search(&conn, user.id, &search, from,ps);
    if notes_o.is_none(){
        return None;
    }
    let dtos = with_tags(conn,notes_o.unwrap());
    Some(Json(dtos))
}
