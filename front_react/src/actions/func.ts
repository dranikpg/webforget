import D from '../dispatcher'

import AT from './types'
import {FAction, User} from '../common';

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

export function dp_fullinit_request(){
    setTimeout(()=>{
        D.dispatch({
            actionType: AT.FULL_INIT_REQUEST,
        });
    },5);
    
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
