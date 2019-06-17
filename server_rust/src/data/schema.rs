table! {
    notes (id) {
        id -> Integer,
        user_id -> Integer,
        title -> Nullable<Varchar>,
        descr -> Nullable<Text>,
        link -> Nullable<Varchar>,
        cdate -> Date,
    }
}

table! {
    tagmap (id) {
        id -> Integer,
        tag_id -> Integer,
        note_id -> Integer,
    }
}

table! {
    tags (id) {
        id -> Integer,
        user_id -> Integer,
        name -> Varchar,
    }
}

table! {
    users (id) {
        id -> Integer,
        nick -> Varchar,
        pw -> Varchar,
        email -> Varchar,
    }
}

joinable!(notes -> users (user_id));
joinable!(tagmap -> notes (note_id));
joinable!(tagmap -> tags (tag_id));
joinable!(tags -> users (user_id));

allow_tables_to_appear_in_same_query!(
    notes,
    tagmap,
    tags,
    users,
);
