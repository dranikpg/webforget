
use super::RConn;

use diesel;
use diesel::QueryResult;
use diesel::prelude::*;
use super::models::{Note, NoteWT};

#[derive(Serialize, Deserialize)]
pub struct Search{
    pub title: Option<String>,
    pub link: Option<String>,
    pub date_mx: Option<String>,
    pub date_mn: Option<String>,
    pub tags: Option<Vec<String>>
}

pub fn search(conn: &RConn, user_id: i32, search: &Search,
     from: i32, pagesize: i32) 
    -> Option<Vec<NoteWT>>{
    let mut baseq = String::from("SELECT notes.id,notes.title,notes.descr,notes.link,notes.cdate, GROUP_CONCAT(tags.name SEPARATOR ' ') as tagarr
        FROM tagmap 
            JOIN tags ON tagmap.tag_id = tags.id 
            JOIN notes ON tagmap.note_id = notes.id ");
    baseq.push_str(&format!("WHERE notes.user_id = '{}' AND notes.id < '{}'  \n", user_id, from));

    if let Some(title) = &search.title{
        baseq.push_str(&format!("AND notes.title LIKE '%{}%' ", title));
    }
    if let Some(link) = &search.link{
        baseq.push_str(&format!("AND notes.link LIKE '%{}%' ", link));
    }

    if let Some(date) = &search.date_mx{
        baseq.push_str(&format!("AND notes.cdate <= '{}' ", date));
    }

    if let Some(date) = &search.date_mn{
        baseq.push_str(&format!("AND notes.cdate >= '{}' ", date));
    }
    
    baseq.push_str("GROUP BY notes.id ");

    if let Some(tags) = &search.tags{
        if tags.len() > 0{
            baseq.push_str("HAVING ");
        }
        for i in 0..tags.len(){
            if i != 0{
                baseq.push_str(" AND ");
            }
            baseq.push_str(&format!("SUM(CASE WHEN tags.name = '{}' 
                THEN 1 ELSE 0 END) > 0 ",tags[i]));
        }
    }
    baseq.push_str(&format!("LIMIT {}",pagesize));
    baseq.push(';');

    println!("{}",baseq);

    let rq: QueryResult<Vec<NoteWT>> = diesel::sql_query(&baseq).load(conn);
    rq.ok()
} 