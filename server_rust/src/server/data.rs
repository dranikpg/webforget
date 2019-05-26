use crate::data::{PoolConn,Pool};

use rocket::request::FromRequest;
use rocket::request;
use rocket::{Outcome, Request, State};
use rocket::http::Status;
use std::ops::Deref;

pub struct Conn(pub PoolConn);
impl Deref for Conn{
    type Target = PoolConn;
    fn deref(&self) -> &Self::Target{
        &self.0
    }
}
impl<'a, 'r> FromRequest<'a, 'r> for Conn {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Conn, Self::Error> {
        let pool = request.guard::<State<Pool>>()?;
        //TOOD localcache
        match pool.get() {
            Ok(conn) => Outcome::Success(Conn(conn)),
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}