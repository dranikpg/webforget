import D from '../dispatcher'

import AT from './types'
import {FAction, User} from '../common';

export function start(){
    D.dispatch({
        actionType: AT.LOAD,
    });
}

export function profile_present(profile: User|null|undefined){
    D.dispatch({
        actionType: AT.PROFILE_PRESENT, 
        payload:  profile,
    });
}


export function profile_request(){
    D.dispatch({
        actionType: AT.PROFILE_REQUEST
    });
}

export function profile_impossible(){
    console.log("Profile impossible");
}
