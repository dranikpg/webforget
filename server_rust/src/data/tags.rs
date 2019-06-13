use super::RConn;

use diesel;
use diesel::prelude::*;
use super::models::{Tag,TagID, NewTag, Tagmap, TagmapInsert};
use super::schema::{tags,tagmap} ;

use super::check_affected;

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

pub fn remove_all_safe(conn: &RConn, note_id: i32, user_id: i32) -> Result<(),diesel::result::Error>{
    diesel::delete(tagmap::table).filter(tagmap::note_id.eq(note_id))
            .execute(conn).map(|x|())
}

pub fn add_missing(conn: &RConn, user_id: i32, note_id: i32, tags: &Vec<String>){
    for tag in tags{
        let tag_id_o = tags::table.filter(tags::name.eq(tag)).get_result::<Tag>(conn).ok();
        if tag_id_o.is_none(){
            //warn!("ERR NON EXISTING TAG!");
            continue;
        }
        let tag_id = tag_id_o.unwrap().id;
        diesel::insert_into(tagmap::table).values(TagmapInsert{
            note_id,
            tag_id
        }).execute(conn);
    }
}

/*pub fn rename(conn: &RConn, user_id: i32, name: &str, nname: &str) -> bool{
    let q = diesel::update(tags::table.filter(tags::user_id.eq(user_id)).filter(tags::name.eq(name)))
        .set(tags::name.eq(nname)).execute(conn);
    check_res(q)
}*/

pub fn get(conn: &RConn, note_id: i32) -> Option<Vec<String>>{
    let tags_r = tagmap::table.filter(tagmap::note_id.eq(note_id)).inner_join(tags::table);
    let tags_res: Option<Vec<(Tagmap,Tag)>> = tags_r.load(conn).ok();
    if tags_res.is_none(){
        return None;
    }
    let tags = tags_res.unwrap();
    let mut out: Vec<String> = Vec::with_capacity(tags.len());
    for tag in tags{
        out.push(tag.1.name);
    }
    Some(out)
}

//

pub fn get_user(conn: &RConn, user_id: i32) -> Option<Vec<String>>{
    let tags: Option<Vec<Tag>> = tags::table.filter(tags::user_id.eq(user_id))
        .load(conn).ok();
    tags.map(|mut ts| ts.iter_mut().map(|t|t.name.clone()).collect())
}

fn get_c(conn: &RConn, tid: i32) -> i64{
    let r: QueryResult<i64> = tagmap::table.filter(tagmap::tag_id.eq(tid))
        .count().first(conn);
    r.unwrap_or(0)
}

pub fn get_user_wcount(conn: &RConn, user_id: i32) -> Option<Vec<(String,i64)>>{
    let tags: Option<Vec<Tag>> = tags::table.filter(tags::user_id.eq(user_id))
        .load(conn).ok();
    tags.map(|mut ts| ts.iter_mut().map(|t|
        (t.name.clone(), get_c(conn, t.id))
    ).collect())
}

pub fn get_user_alike(conn: &RConn, user_id: i32, pref: &str) -> Option<Vec<String>>{
    let tags: Option<Vec<Tag>> = tags::table.filter(tags::user_id.eq(user_id))
	.filter(tags::name.like(format!("{}%",pref)))
        .load(conn).ok();
    tags.map(|mut ts| ts.iter_mut().map(|t|t.name.clone()).collect())
}
