table! {
    notes (id) {
        id -> Integer,
        user_id -> Integer,
        title -> Varchar,
        descr -> Text,
        link -> Varchar,
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

allow_tables_to_appear_in_same_query!(
    notes,
    users,
);
