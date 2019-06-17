use rocket::http::{Status,RawStr};
use rocket::request::FromFormValue;
use rocket_contrib::json::Json;

use crate::data::{notes,tags};

use super::auth::UserID;
use crate::data::models::{Note,NoteWT,NewNote, UpdateNote};
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
    pub fn from_notewt(note: NoteWT) -> Self{
        let tags: Vec<String> = note.tagarr.unwrap_or(String::new()).split_ascii_whitespace().map(|x| String::from(x)).collect();
        NoteDto{
            id: note.id,
            title:note.title.unwrap_or(String::new()),
            descr: note.descr.unwrap_or(String::new()),
            link: note.link.unwrap_or(String::new()),
            date: note.cdate.format(FORMAT).to_string(),
            tags
        }
    }
}
//struct for receiving data
fn serde_default_date() -> &'static str{
    return "N";
}
//
pub struct IntArray(Vec<i32>);
impl<'r> FromFormValue<'r> for IntArray{    
    type Error = &'static str;
    fn from_form_value(param: &'r RawStr) -> Result<Self, Self::Error> {
        let mut err = false;
        let nums = param.split(',').map(|v|{
            let op = v.parse();
            if op.is_err(){
                err = true;
                return 0;
            }else{
                return op.unwrap();
            }
        }).collect();
        if err {
            return Err("FAILED");
        }else{
            return Ok(IntArray(nums));
        }
    }
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
            chrono::NaiveDate::parse_from_str(self.date, FORMAT)
		.unwrap_or(chrono::Utc::today().naive_utc())
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
#[get("/ent/get?<from>&<ps>")]
pub fn r_get_all(conn: Conn, user: UserID, from:i64, ps: i64) 
                        -> Option<Json<Vec<NoteDto>>>{
    let notes_o = notes::get_user_pg(&conn, user.id, from, ps);
    if notes_o.is_none(){
        return None;
    }
    let mut notes = notes_o.unwrap();
    let mut out =  with_tags(conn,notes);
    Some(Json(out))
}
#[get("/ent/get_arr?<arr>")]
pub fn r_get_arr(conn: Conn, user: UserID, arr: IntArray) -> Option<Json<Vec<NoteDto>>>{
    let res_o = notes::get_user_arr(&conn, user.id, &arr.0);
    res_o.map(|mut v|Json(with_tags(conn, v)))
}
#[get("/ent/get/<id>")]
pub fn r_get(conn: Conn, id: i32, user: UserID) -> Option<Json<NoteDto>>{
    notes::get(&conn, id, user.id).map(|n| Json(NoteDto::from_notewt(n)))
}
#[post("/ent/create",format = "application/json", data = "<note>")]
pub fn r_create(conn: Conn, user: UserID, note: Json<NoteNewDto>) -> Option<String>{
    info!("{:?}",note);
    let res = match notes::create(&conn, note.to_new(user.id)){
        Some(id) => {
            tags::create_missing(&conn, user.id, &note.tags);
            tags::add_missing(&conn, user.id, id.id, &note.tags);
            return Some(id.id.to_string());
        }
        None => return None
    };
}
#[post("/ent/update/<id>", format = "application/json", data = "<note>")]
pub fn r_update(conn: Conn, user: UserID, id: i32, note: Json<NoteUpdateDto>) -> Status{
    info!("{:?}", note);
    match notes::update_safe(&conn, id, user.id, note.0){
        true => super::SUCCESS(),
        false => super::FORBIDDEN()
    }
}
#[post("/ent/update_tags/<id>", format = "application/json", data = "<ts>")]
pub fn r_update_tags(conn: Conn, user: UserID, id: i32, ts: Json<Vec<String>>) -> Status{
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
pub fn r_delete(conn: Conn, user: UserID, id: i32) -> Status{
    match notes::delete_safe(&conn, id, user.id){
        true => super::SUCCESS(), 
        false => super::FORBIDDEN()
    }
}

pub fn with_tags(conn: Conn,mut notes: Vec<NoteWT>) -> Vec<NoteDto>{
    let mut out: Vec<NoteDto> = Vec::with_capacity(notes.len());
    for mut note in notes{
        out.push(NoteDto::from_notewt(note));
    }
    out
}
