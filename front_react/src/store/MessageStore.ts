import { EventEmitter } from "events";
import { FAction, Message } from "../common";
import Dispatcher from "../dispatcher";

import AT from '../actions/types';
import NoteStore from "./NoteStore";
import { dp_drop_local } from "../actions/func";

let msg: Message|undefined;

class MessageStore extends EventEmitter{
    constructor(){
        super();
        Dispatcher.register(this._action.bind(this));
        
    }
    _action(a: FAction){
        if(a.actionType == AT.SYNC_AFTERBURN){
           this.H_sync();
        }
    }

    // AUTO GEN MESSAGES

    H_sync(){
        if(NoteStore.local_size() > 0){
            let c = NoteStore.local_size();
            this.post_message({msg:"Failed to synchronize " + c + " notes with server", timeout: 10*1000, warn:false, action:{
                msg:"Drop local changes(app will load faster)",
                cb: ()=>{
                    dp_drop_local();
                }
            }});
        }
    }

    //

    post_message(_msg: Message){
        msg = _msg;
        this.emit('M');
    }

    //

    msg():Message|undefined{
        return msg;
    }

    //
    
    c_msg(l: EventListener){
        this.on('M', l);
    }
    c_rm_msg(l: EventListener){
        this.removeListener('M', l);
    }
}

export default new MessageStore();