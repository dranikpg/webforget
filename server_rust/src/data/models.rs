//USER
use super::schema::users;
use diesel::sql_types::{Integer,Text,VarChar,Date, Nullable};

//

#[derive(Debug, QueryableByName)]
pub struct ID{
    #[sql_type = "Integer"]
    pub id: i32
}

//

#[derive(Debug, Identifiable, Queryable)]
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
//Entry
use super::schema::notes;
#[derive(Debug, Identifiable, Queryable,QueryableByName)]
//#[derive(Serialize, Deserialize)]
#[table_name="notes"]
pub struct Note{
    pub id: i32,
    pub user_id: i32,
    pub title: String,
    pub descr: String,
    pub link: String,
    pub cdate: chrono::NaiveDate  //string for parsing
}
#[derive(Debug, QueryableByName)]
#[table_name="notes"]
//note with tags array
pub struct NoteWT{
    pub id: i32,
    pub title: Option<String>,
    pub descr: Option<String>,
    pub link:  Option<String>,
    pub cdate: chrono::NaiveDate,
    #[sql_type = "Nullable<VarChar>"]
    pub tagarr: Option<String>
}

#[derive(Insertable)]
#[table_name="notes"]
pub struct NewNote<'a>{
    pub user_id: i32,
    pub title: &'a str,
    pub link: &'a str,
    pub descr: &'a str,
    pub cdate: chrono::NaiveDate,
}
#[derive(AsChangeset)]
#[derive(Serialize, Deserialize, Debug)]
#[table_name="notes"]
pub struct UpdateNote<'a>{
    pub title: Option<&'a str>,
    pub link: Option<&'a str>,
    pub descr: Option<&'a str>
}
//
use super::schema::tags;
#[derive(Debug, Identifiable, Queryable)]
pub struct Tag{
    pub id: i32,
    pub user_id: i32,
    pub name: String
}
#[derive(Debug, Identifiable, Queryable)]
#[table_name="tags"]
pub struct TagID{
    pub id: i32,
}
#[derive(Insertable)]
#[table_name="tags"]
pub struct NewTag<'a>{
    pub user_id: i32,
    pub name: &'a str
}
//
use super::schema::tagmap;
#[derive(Debug, Identifiable, Queryable)]
#[table_name="tagmap"]
pub struct Tagmap{
    pub id: i32, 
    pub tag_id: i32,
    pub note_id: i32
}
#[derive(Insertable)]
#[table_name="tagmap"]
pub struct TagmapInsert{
    pub tag_id: i32,
    pub note_id: i32,
}
