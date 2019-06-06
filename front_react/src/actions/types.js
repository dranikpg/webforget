let ct = 0;;

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
}