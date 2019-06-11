import D from '../dispatcher'

import AT from './types'
import {FAction, User, Search} from '../common';

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

export function dp_sync_end(){
    setTimeout(dp_afterburn, 4000);
    D.dispatch({   
        actionType: AT.SYNC_END,
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

export function dp_search_dismiss(s: Search){
    D.dispatch({
        actionType: AT.SEARCH_DISMISS
    });
}

export function dp_search_extend(s: Search){
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
    setTimeout(()=>{
        D.dispatch({
            actionType: AT.FULL_INIT,
        });
    },5);
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
