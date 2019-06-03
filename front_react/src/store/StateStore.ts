import { EventEmitter } from 'events';
import axios, { AxiosResponse, AxiosError } from 'axios';

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
                this.init(); break;
            }
            case AT.PROFILE_PRESENT:{   
                this.emit(LEVENT);
                this.emit(SEVENT); break;
            }
            case AT.PROFILE_REQUEST:{
                this.emit(SEVENT); break;
            }
        }
    }

    init(){
        online = navigator.onLine;
        if(online){
            this._load_online();
        }else{
            this._load_offline();
        }
    }

    _load_offline(){
        let nick = localStorage.getItem("user.nick");
        if(nick==null){
            alert("Please connect to the internet to setup the app");
            user = null;
            profile_impossible();
        }else{
            console.log("Logged in offline");
            user = {nick: nick, email: localStorage.getItem("user.email")!};
            profile_present(user);
        }
    }

    _load_online(){
        let _this = this;
        axios.get(APIURL+"/auth/auto",{withCredentials: true}).then(function (rsp){
            user = rsp.data;
            console.log("present");
            _this._save_profile();
            profile_present(user);
        }).catch(function (err: AxiosError){    //try offline
            if(err.response){
                user = null; 
                profile_request();
            }else{ //network fault
                online = false;
                _this._load_offline();
            }
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
        if(resp.status != 200)this._login_fail(null);
        else{
            user = resp.data;
            this._save_profile();
            profile_present(user);
        }
    }

    _login_fail(err: AxiosError|null){
        user = null;
        this.emit(LEVENT);
    }

    _save_profile(){
        console.log(user);
        localStorage.setItem("user.nick", user!.nick);
        localStorage.setItem("user.email", user!.email);
    }

    //

    online(){
        return online;
    }

    authed(): boolean{
        return user != null;
    }

    user(){
        return user;
    }

    loading(){
        return user == undefined;
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