use super::RConn;

use diesel;
use diesel::prelude::*;
use super::models::{Tag,TagID, NewTag, Tagmap, TagmapInsert};
use super::schema::{tags,tagmap} ;

pub fn get_all(conn: &RConn) -> Option<Vec<Tag>>{
    tags::table.load(conn).ok()
}

//better and faster version?
/*pub fn create_missing(conn: &RConn, user_id: i32, tags: &Vec<String>){
    //let mut buf = String::new();
    for tag in tags{
        let s = &format!(" IF NOT EXISTS (SELECT * FROM webforget.tags t WHERE t.name = '{}')
            INSERT INTO webforget.tags(name, user_id) VALUES('{}',{});",
        tag,tag, user_id);
        println!("{}",s);
        //buf.push_str(s);
        let query = diesel::sql_query(s);
        println!("{:?}", query.execute(conn));
    }
    /*let query = diesel::sql_query(buf);
    println!("{:?}", query.execute(conn));*/
}*/

pub fn create_missing(conn: &RConn, user_id: i32, tags: &Vec<String>){
    for tag in tags{
        if tags::table.filter(tags::name.eq(tag))
            .get_result::<Tag>(conn).is_err(){
            diesel::insert_into(tags::table).values(NewTag{
                user_id,
                name: &tag
            }).execute(conn);
        }
    }
}

//TODO BETTER UPDATE
pub fn remove_all(conn: &RConn, note_id: i32){
    diesel::delete(tagmap::table).filter(tagmap::note_id.eq(note_id))
            .execute(conn);
}

pub fn add_missing(conn: &RConn, user_id: i32, note_id: i32, tags: &Vec<String>){
    for tag in tags{
        let tag_id_o = tags::table.filter(tags::name.eq(tag)).get_result::<Tag>(conn).ok();
        if tag_id_o.is_none(){
            println!("ERR NON EXISTING TAG!");
            continue;
        }
        let tag_id = tag_id_o.unwrap().id;
        diesel::insert_into(tagmap::table).values(TagmapInsert{
            note_id,
            tag_id
        }).execute(conn);
    }
}

pub fn get(conn: &RConn, note_id: i32) -> Option<Vec<String>>{
    let tags_o: Option<Vec<Tagmap>> = tagmap::table.filter(tagmap::note_id.eq(note_id))
        .load(conn).ok();
    if tags_o.is_none(){
        return None;
    }
    let tags = tags_o.unwrap();
    let mut out: Vec<String> = Vec::with_capacity(tags.len());
    for tag in tags{
        let name = tags::table.find(tag.id).get_result::<Tag>(conn).ok();
        if name.is_some(){
            out.push(name.unwrap().name);
        }
    }
    Some(out)
}