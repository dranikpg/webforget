//USER
use super::schema::users;
#[derive(Queryable)]
pub struct User{
    pub id: i32,
    pub nick: String,
    pub pw: String,
    pub email: String,
}
#[derive(Insertable)]
#[table_name="users"]
pub struct NewUser<'a> {
    pub nick: &'a str,
    pub email: &'a str,
    pub pw: &'a str,
}