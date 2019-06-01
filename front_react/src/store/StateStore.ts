import { EventEmitter } from 'events';
import axios, { AxiosResponse } from 'axios';

import {APIURL} from '../util'

import Dispatcher from '../dispatcher';
import AT from '../actions/types';
import {profile_present, profile_request, profile_impossible} from '../actions/func';

import {FAction, User} from '../common';

let user: User|null|undefined = undefined;
let online: boolean = false;

let authrq: boolean = false;

const LEVENT = 'L';
const SEVENT = 'S';

class StateStore extends EventEmitter{

    constructor(){
        super();
        Dispatcher.register(this._action.bind(this));
    }

    _action(action: FAction){
        switch(action.actionType){
            case AT.LOAD:{
                this._init(); break;
            }
            case AT.PROFILE_PRESENT:{
                this.emit(SEVENT); break;
            }
            case AT.PROFILE_REQUEST:{
                this.emit(SEVENT); break;
            }
        }
    }

    _init(){
        online = navigator.onLine;
        if(online){
            this._load_online();
        }else{
            this._load_offline();
        }
    }

    _load_offline(){
        let nick = localStorage.get("user.nick");
        if(nick==null){
            alert("Please connect to the internet to setup the app");
            profile_impossible();
        }else{
            user = {nick: nick, email: localStorage.get("user.email")};
            profile_present(user);
        }
    }

    _load_online(){
        axios.get(APIURL+"/auth/auto",{withCredentials: true}).then(function (rsp){
            if(rsp.status != 200){
                profile_request();
            }else{
                user = rsp.data;
                profile_present(user);
            }
        }).catch(function (err){
            profile_request();
        });
    }

    //

    create_account(nick: string, email:string, pw:string){
        if(authrq)return; authrq = true;
        axios.post(APIURL+"/auth/create",
            {pw: pw, email: email, nick: nick},
            {withCredentials: true})
        .then(this._login_return.bind(this))
        .catch(this._login_fail.bind(this))
        .finally(function f(){authrq=false;})
    }

    login(email: string, pw: string){
        if(authrq)return; authrq = true;
        axios.post(APIURL+"/auth/login",
            {pw: pw, email: email},
            {withCredentials: true})
        .then(this._login_return.bind(this))
        .catch(this._login_fail.bind(this))
        .finally(function f(){authrq=false;})
    }

    _login_return(resp: AxiosResponse){
        if(resp.status != 200)this._login_fail(resp.status);
        else{
            user = resp.data;
            console.log(user, document.cookie);
            this.emit(LEVENT);
            profile_present(user);
        }
    }

    _login_fail(err: any){
        console.log(err);
        user = null;
        this.emit(LEVENT);
    }

    //

    online(){
        return online;
    }

    user(){
        return user;
    }

    //

    c_state(l: EventListener){
        this.on(SEVENT, l);
    }

    c_rm_state(l: EventListener){
        this.removeListener(SEVENT, l);
    }

    c_auth(l: EventListener){
        this.on(LEVENT, l);
    }
    
    c_rm_auth(l: EventListener){
        this.removeListener(LEVENT, l);
    }

}

export default new StateStore();