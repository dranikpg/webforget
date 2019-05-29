use crate::data::notes;
use crate::data::models::User as MUser;
use crate::data::models::{Note,NewNote, UpdateNote};
use crate::server::data::Conn;

use super::auth::User;

use rocket::request;
use rocket::http::Status;
use rocket_contrib::json::Json;

//struct for returning data
#[derive(Serialize, Deserialize)]
pub struct NoteDto{
    id: i32,
    title: String,
    descr: String,
    link: String
}
impl NoteDto{
    pub fn from_note(note: Note) -> NoteDto{
        NoteDto{
            id: note.id,
            title: note.title,
            descr: note.descr,
            link: note.link
        }
    }

    pub fn from_note_copy(note: &Note) -> NoteDto{
        NoteDto{
            id: note.id,
            title: note.title.clone(),
            descr: note.descr.clone(),
            link: note.link.clone()
        }
    }
}

//struct for receiving data
#[derive(Serialize, Deserialize)]
pub struct NoteNewDto{
    title: String,
    descr: String,
    link: String
}
impl NoteNewDto{
    pub fn to_new(&self, user_id: i32) -> NewNote{
        NewNote{
            user_id,
            title: &self.title,
            descr: &self.descr,
            link: &self.link
        }
    }
}

type NoteUpdateDto<'a> = UpdateNote<'a>;

//routes

#[get("/ent/all")]
pub fn r_get_all(conn: Conn) -> Json<Vec<Note>>{
    Json(notes::get_all(&conn).unwrap())
}

#[get("/ent/get/<id>")]
pub fn r_get(conn: Conn, id: i32, user: User) -> Option<Json<NoteDto>>{
    notes::get_safe(&conn, id, user.id).map(|n| Json(NoteDto::from_note(n)))
}

#[post("/ent/create",format = "application/json", data = "<note>")]
pub fn r_create(conn: Conn, user: User, note: Json<NoteNewDto>) -> Option<Json<NoteDto>>{
    notes::create(&conn, note.to_new(user.id))
        .map(|n| Json(NoteDto::from_note(n)))
}

#[post("/ent/update/<id>", format = "application/json", data = "<note>")]
pub fn r_update(conn: Conn, user: User, id: i32, note: Json<NoteUpdateDto>) -> Status{
    match notes::update_safe(&conn, id, user.id, note.0){
        true => super::SUCCESS(),
        false => super::FORBIDDEN()
    }
}

#[post("/ent/delete?<id>")]
pub fn r_delete(conn: Conn, user: User, id: i32) -> Status{
    match notes::delete_safe(&conn, id, user.id){
        true => super::SUCCESS(), 
        false => super::FORBIDDEN()
    }
}