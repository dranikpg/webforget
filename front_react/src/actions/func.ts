import D from '../dispatcher'

import AT from './types'
import {FAction, User, Search, Note} from '../common';

export function start(){
    D.dispatch({
        actionType: AT.LOAD,
    });
}

//

export function dp_offline(){
    D.dispatch({
        actionType: AT.OFFLINE
    });
}

//

export function dp_sync_start(){
    D.dispatch({
        actionType: AT.SYNC_START
    });
}

export function dp_sync_end(){
    setTimeout(dp_afterburn, 4000);
    D.dispatch({   
        actionType: AT.FULL_INIT,
    });
}

function dp_afterburn(){
    D.dispatch({
        actionType: AT.SYNC_AFTERBURN,
    });
}

//

export function dp_query(s: Search|undefined){
    D.dispatch({
        actionType: AT.QUERY,
        payload: s
    });
}

export function dp_query_more(){
    D.dispatch({
        actionType: AT.QUERY_MORE,
    });
}

//

export function dp_search(s: Search){
    D.dispatch({
        actionType: AT.SEARCH,
        payload: s
    });
} 

export function dp_search_extend(){
    D.dispatch({
        actionType: AT.SEARCH_EXTEND
    });
}

export function dp_notes(){
    D.dispatch({
        actionType: AT.NOTES_EXTEND
    });
}

//

export function dp_fullinit_request(){
    D.dispatch({
        actionType: AT.FULL_INIT_REQUEST,
    });
}

export function dp_fullinit(){
    D.dispatch({
        actionType: AT.FULL_INIT,
    });
}

export function dp_profile_present(profile: User|null|undefined){
    D.dispatch({
        actionType: AT.PROFILE_PRESENT, 
        payload:  profile,
    });
}


export function dp_profile_request(){
    D.dispatch({
        actionType: AT.PROFILE_REQUEST
    });
}

export function dp_profile_impossible(){
    D.dispatch({
        actionType: AT.PROFILE_IMPOSSIBLE
    });
}

//

export function dp_drop_local(){
    D.dispatch({
        actionType:AT.NOTES_DROP_LOCAL
    });
}

//

export function dp_tags_search(pref:string){
    D.dispatch({
        actionType: AT.TAGS_PREFIXS,
        payload:{pref:pref}
    });
}


//

export function dp_note_delete(id: number){
    D.dispatch({
        actionType: AT.NOTE_DELETE,
        payload: id
    })
}

export function dp_note_create(note: Note){
    D.dispatch({
        actionType: AT.NOTE_CREATE,
        payload: note
    })
}

export function dp_note_update(note: Note){
    D.dispatch({
        actionType: AT.NOTE_UPDATE,
        payload: note
    })
}