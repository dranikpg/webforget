import { EventEmitter } from "events";
import { FAction } from "../common";
import Dispatcher from "../dispatcher";

import AT from '../actions/types';
import Axios, { AxiosResponse } from "axios";
import { APIURL } from "../util";
import StateStore from "./StateStore";

let req = "";

let sugg : string[] = [];

interface searchRQ{
    pref: string
};

class TagStore extends EventEmitter{
    constructor(){
        super();
        Dispatcher.register(this._action.bind(this));
    }

    _action(a: FAction){
        if(a.actionType == AT.TAGS_PREFIXS){
            let srq = a.payload! as searchRQ;
            this.search(srq.pref);
        }
    }

    get(){
        return sugg;
    }

    search(pref:string){
        if(pref==""){
            sugg = [];
            this.emit('S');
        }else{
            req = pref;
            if(StateStore.online())this.search_online(pref);
        }
    }

    search_online(pref:string){
        Axios.get(APIURL+"/tg/alike?search="+pref+"&max=10", {withCredentials:true})
        .then((resp: AxiosResponse)=>{
            if(req != pref)return;
            sugg = resp.data;
            this.emit('S');
        })
        .catch(()=>{

        })
    }

    search_offline(){

    }

    c_sugg(l: EventListener){
        this.on('S', l);
    }

    c_rm_sugg(l: EventListener){
        this.removeListener('S',l);
    }

}

export default new TagStore();