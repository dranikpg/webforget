use rocket::request;
use rocket::http::Status;
use rocket_contrib::json::Json;

use crate::data::{notes,tags};

use super::auth::User;
use crate::data::models::User as MUser;
use crate::data::models::{Note,NewNote, UpdateNote};
use crate::server::data::Conn;

const FORMAT: &'static str = "%Y-%m-%d";

//struct for returning data
#[derive(Serialize, Deserialize, Debug)]
pub struct NoteDto{
    id: i32,
    title: String,
    descr: String,
    link: String, 
    date: String,
    tags: Vec<String>,
}
impl NoteDto{
    pub fn from_note(note: Note) -> NoteDto{
        NoteDto{
            id: note.id,
            title: note.title,
            descr: note.descr,
            link: note.link,
            date: note.cdate.format(FORMAT).to_string(),
            tags: Vec::new()
        }
    }
    pub fn from_note_copy(note: &Note) -> NoteDto{
        NoteDto{
            id: note.id,
            title: note.title.clone(),
            descr: note.descr.clone(),
            link: note.link.clone(), 
            date: note.cdate.format(FORMAT).to_string(),
            tags: Vec::new()
        }
    }
    pub fn with_tags(&mut self, ts: Vec<String>) -> &NoteDto{
        self.tags =  ts;
        self
    }
    pub fn with_tags_o(&mut self, ts: Option<Vec<String>>) -> &NoteDto{
        if ts.is_some(){
            self.tags = ts.unwrap();
        }
        self
    }
}
//struct for receiving data
fn serde_default_date() -> &'static str{
    return "N";
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NoteNewDto<'a>{
    title: &'a str,
    descr: &'a str,
    link: &'a str,
    tags: Vec<String>,
    #[serde(default = "serde_default_date")]
    date: &'a str
}
impl<'a> NoteNewDto<'a>{
    pub fn to_new(&self, user_id: i32) -> NewNote{
        let date = if self.date == "N" {
            chrono::Utc::today().naive_utc()
        }else{
            chrono::NaiveDate::parse_from_str(self.date, FORMAT).unwrap()
        };
        NewNote{
            user_id,
            title: &self.title,
            descr: &self.descr,
            link: &self.link,
            cdate: date
        }
    }
}
//struct for updating data
type NoteUpdateDto<'a> = UpdateNote<'a>;
//routes
#[get("/ent/get?<page>&<ps>")]
pub fn r_get_all(conn: Conn, user: User, page:i64, ps: i64) 
                        -> Option<Json<(Vec<NoteDto>,i64)>>{
    let notes_o = notes::get_user_pg(&conn, user.id, page, ps);
    if notes_o.is_none(){
        return None;
    }
    let (notes,pc) = notes_o.unwrap();
    let mut out: Vec<NoteDto> = Vec::with_capacity(notes.len());
    for note in &notes{
        let mut dto = NoteDto::from_note_copy(note);
        dto.with_tags_o(tags::get(&conn, dto.id));
        out.push(dto);
    }

    Some(Json((out,pc)))
}
#[get("/ent/get/<id>")]
pub fn r_get(conn: Conn, id: i32, user: User) -> Option<Json<NoteDto>>{
    notes::get(&conn, id, user.id).map(|n| {
        let mut dto = NoteDto::from_note(n);
        dto.with_tags_o(tags::get(&conn,dto.id));
        Json(dto)
    })
}
#[post("/ent/create",format = "application/json", data = "<note>")]
pub fn r_create(conn: Conn, user: User, note: Json<NoteNewDto>) -> Option<Json<NoteDto>>{
    info!("{:?}",note);
    let res = match notes::create(&conn, note.to_new(user.id)){
        Some(n) => n,
        None => return None
    };
    tags::create_missing(&conn, user.id, &note.tags);
    tags::add_missing(&conn, user.id, res.id, &note.tags);
    let mut dto = NoteDto::from_note(res);
    dto.with_tags(note.tags.clone());
    Some(Json(dto))
}
#[post("/ent/update/<id>", format = "application/json", data = "<note>")]
pub fn r_update(conn: Conn, user: User, id: i32, note: Json<NoteUpdateDto>) -> Status{
    info!("{:?}", note);
    match notes::update_safe(&conn, id, user.id, note.0){
        true => super::SUCCESS(),
        false => super::FORBIDDEN()
    }
}
#[post("/ent/update_tags/<id>", format = "application/json", data = "<ts>")]
pub fn r_update_tags(conn: Conn, user: User, id: i32, ts: Json<Vec<String>>) -> Status{
    info!("{:?}", ts);
    let note_o = notes::get(&conn, id, user.id);
    if note_o.is_none(){
        return super::FAILED();
    }
    let note = note_o.unwrap();
    tags::remove_all(&conn, note.id);
    tags::create_missing(&conn, user.id, &ts);
    tags::add_missing(&conn, user.id, note.id, &ts);
    super::SUCCESS()
}
#[post("/ent/delete?<id>")]
pub fn r_delete(conn: Conn, user: User, id: i32) -> Status{
    match notes::delete_safe(&conn, id, user.id){
        true => super::SUCCESS(), 
        false => super::FORBIDDEN()
    }
}