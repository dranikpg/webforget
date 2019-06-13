use crate::data::auth;
use crate::data::models::User as MUser;
use crate::server::data::Conn;

use rocket::{Request, Outcome};
use rocket::request;
use rocket::request::{FromRequest};
use rocket::http::{Status,Cookie, Cookies};
use rocket_contrib::json::Json;

// util structs
#[derive(Serialize,Deserialize, Debug)]
pub struct UserCDto{
    nick: String,
    pw: String,
    email: String
}
#[derive(Serialize,Deserialize)]
pub struct UserLDto{
    email: String,
    pw: String
}
#[derive(Serialize,Deserialize)]
pub struct UserDto{
    nick: String,
    email: String
}
// mature struct
pub struct User{
    pub id: i32,
    pub nick: String,
    pub email: String
}
impl User{
    pub fn from(u: MUser) -> Self{
        User{
            id:u.id,
            nick: u.nick,
            email: u.email
        }
    }
}
impl<'a, 'r> FromRequest<'a, 'r> for User {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<User, ()> {
        let conn = request.guard::<Conn>()?;
        let rid = request.cookies()
            .get/*_private*/("user_id")
            .and_then(|cookie| cookie.value().parse().ok());
        if rid.is_none(){
            return Outcome::Forward(())
        }
        let id = rid.unwrap();
        let us = auth::get(&conn, id);
        match us{
            Some(u) => Outcome::Success(User::from(u)),
            None => Outcome::Forward(())
        }
    }
}
pub struct UserID{
    pub id: i32
}
impl<'a, 'r> FromRequest<'a, 'r> for UserID {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<UserID, ()> {
        let conn = request.guard::<Conn>()?;
        let rid = request.cookies()
            .get/*_private*/("user_id")
            .and_then(|cookie| cookie.value().parse().ok());
        if rid.is_none(){
            return Outcome::Forward(())
        }
        let id = rid.unwrap();
        if auth::has(&conn, id){ 
            return Outcome::Success(UserID{id});
        }else {return Outcome::Forward(());}
    }
}

// utils
fn start_session(ck: &mut Cookies, userid: i32) {
    ck.add(Cookie::build("user_id", userid.to_string())
            .path("/")
        //  .secure(true)  
            .finish());
}
fn end_session(ck: &mut Cookies, userid: i32){
    ck.remove/*_private*/(Cookie::named("user_id"));
}
// route utils
pub type UserInfoT = Json<UserDto>;
pub fn user_info_rw(us: MUser) -> UserInfoT{
    Json(
        UserDto{
            nick: us.nick,
            email: us.email
        }
    )
}
pub fn user_info(us: User) -> UserInfoT{
    Json(
        UserDto{
            nick: us.nick, 
            email: us.email
        }
    )
}
pub fn user_info_c(us: &User) -> UserInfoT{
    Json(
        UserDto{
            nick: us.nick.clone(), 
            email: us.email.clone()
        }
    )
}
// routes
#[post("/auth/create", rank=1)]
pub fn r_create_f(_user: User) -> Status{
    super::DOUBLE_LOGIN()
}
#[post("/auth/create", format = "application/json", data = "<user>")]
pub fn r_create(mut ck: Cookies, conn: Conn, user: Json<UserCDto>) -> Result<UserInfoT, Status>{
    info!("{:?}", user);
    match auth::create(&conn,
        &user.nick,
        &user.email,
        &user.pw)
    {
        Ok(user) => {
            start_session(&mut ck, user.id);
            Ok(user_info_rw(user))
        }
        Err(_) => Err(super::FAILED())
    }
}
#[post("/auth/login", rank=1)]
pub fn r_login_f(_user: User) -> Status{
    super::DOUBLE_LOGIN()
}
#[post("/auth/login", format = "application/json", data = "<user>", rank=2)]
pub fn r_login(mut ck: Cookies, conn: Conn, user: Json<UserLDto>) -> Result<UserInfoT,Status>{
    let us = auth::login(&conn, &user.email, &user.pw);
    match us{
        Some(us) =>{
            start_session(&mut ck, us.id);
            Ok(user_info_rw(us))
        },
        None => Err(super::FAILED())
    }
}
#[get("/auth/logout")]
pub fn r_logout(user: UserID, mut ck: Cookies){
    end_session(&mut ck, user.id);
}
#[get("/auth/auto", rank = 1)]
pub fn r_auto(user: User) -> UserInfoT{
    user_info(user)
}
#[get("/auth/auto", rank = 2)]
pub fn r_auto_f() -> Status{
    super::FAILED()
}
