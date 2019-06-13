
use rocket_contrib::json::Json;

use crate::data::{tags};

use super::auth::UserID;

use crate::server::data::Conn;

use rocket::http::RawStr;

type JVEC<T> = Option<Json<Vec<T>>>;

#[get("/tg/all")]
pub fn r_get_user(conn: Conn, user: UserID) -> JVEC<(String,i64)>{
    tags::get_user_wcount(&conn, user.id).map(|x|Json(x))
}

#[get("/tg/list")]
pub fn r_get_user_simple(conn: Conn, user: UserID) -> JVEC<String>{
    tags::get_user(&conn, user.id).map(|x|Json(x))
}

#[get("/tg/alike?<search>")]
pub fn r_get_user_alike(conn: Conn, user: UserID, search: &RawStr) -> JVEC<String>{
    tags::get_user_alike(&conn, user.id, search).map(|x|Json(x))
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