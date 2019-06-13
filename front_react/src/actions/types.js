let ct = 3;
export default{
    LOAD: ct++,             //auth load event
    OFFLINE: ct++,           //offline
    PROFILE_PRESENT: ct++,  //auth success
    PROFILE_REQUEST: ct++,  //auth request
    PROFILE_IMPOSSIBLE: ct++, //auth impossbile (no profile & connection)
    FULL_INIT_REQUEST: ct++,  //request full init 
    SYNC_END: ct++,           //end sync
    SYNC_AFTERBURN: ct++,     //sync afterburn
    FULL_INIT: ct++,          //start full mode
    NOTES_EXTEND: ct++,
    SEARCH: ct++,
    SEARCH_DISMISS:ct++,
    SEARCH_EXTEND: ct++,
    QUERY: ct++,
    QUERY_MORE: ct++,
    NOTES_DROP_LOCAL: ct++,
    TAGS_PREFIXS:ct++,
}