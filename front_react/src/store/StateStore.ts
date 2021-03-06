import { EventEmitter } from "events";
import Dispatcher from '../dispatcher';
import AT from '../actions/types';

import {FAction, User} from '../common';
import NoteStore from "./NoteStore";
import { dp_sync_end, dp_fullinit, dp_sync_start } from "../actions/func";

let loaded: boolean = false;
let full_loaded: boolean = false;
let online: boolean = false;

let sync: number = 0;
let syncr = false;

const LCHANGE = 'L';

class StateStore extends EventEmitter{

    constructor(){
        super();
        online = navigator.onLine;
        Dispatcher.register(this._action.bind(this));
    }

    //

    _action(a: FAction){
        console.log(a);
        switch(a.actionType){
            case AT.OFFLINE:{
                console.log("OFFLINE");
                online = false;
                break;
            }
            case AT.PROFILE_PRESENT:{
                this.set_loaded();
                break;
            }
            case AT.PROFILE_IMPOSSIBLE:{
                this.set_loaded();
                break;
            }
            case AT.PROFILE_REQUEST:{
                this.set_loaded();
                break;
            }
            case AT.FULL_INIT_REQUEST:{
                this.full_init_rq();
                break;
            }
            case AT.FULL_INIT:{
                this.set_full_loaded();
                break;
            }
        }
    }

    set_loaded(){
        if(loaded)return;
        loaded = true;
        this.emit(LCHANGE);
    }

    set_full_loaded(){
        if(full_loaded)return;
        full_loaded = true;
        this.emit(LCHANGE);
    }

    //

    sync_inc(){
        sync++;
    }

    sync_update(){
        sync--;
        console.log("SYNC--");
        if(sync == 0){
            this.sync_end();
        }
    }

    full_init_rq(){
        if(NoteStore.sync_required()){
            syncr = true;
            this.emit(LCHANGE);
        }else{
            setTimeout(()=>dp_fullinit(),10);
        }
    }

    sync_end(){
        syncr = false;
        setTimeout(()=>dp_sync_end(),10);
        this.emit(LCHANGE);
    }

    //

    sync_running(): boolean{
        return sync > 0;
    }

    syncing(): boolean{
        return syncr;
    }

    online() : boolean{
        return online;
    }

    loaded(): boolean{
        return loaded;
    }

    loading(): boolean{
        return !loaded;
    }

    full_loaded(): boolean{
        return full_loaded;
    }

    //
    c_state(l: EventListener){
        this.on(LCHANGE,l);
    }
    c_rm_state(l: EventListener){
        this.removeListener(LCHANGE,l);
    }
}

export default new StateStore();