use rocket::request;
use rocket::http::Status;
use rocket_contrib::json::Json;

use crate::data::{notes,tags};

use super::auth::User;
use crate::data::models::User as MUser;
use crate::data::models::{Note,NewNote, UpdateNote};
use crate::server::data::Conn;

#[get("/tg/all")]
pub fn r_get_user(conn: Conn, user: User) -> Option<Vec<String>>{
    tags::get_user(&conn, user.id)
}

/*Rename?
#[derive(Serialize, Deserialize)]
struct NamePack{
    prev: String,
    next: String
}
#[post("/tg/rename",format = "application/json", data = "<np>")]
pub fn r_rename(conn: Conn, user: User, np: Json<NamePack>) -> Status{
    match tags::rename(&conn, user.id, np.prev, np.next){
        true => super::SUCCESS(),
        false => super::FAILED()
    }
}
*/