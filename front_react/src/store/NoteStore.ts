import { EventEmitter } from "events";
import StateStore from "./StateStore";
import Dispatcher from "../dispatcher";

import AT from '../actions/types';
import {FAction, User, Note} from '../common';

import axios, { AxiosResponse, AxiosError } from "axios";
import {APIURL} from '../util'

export const PAGE_SIZE = 15;

enum ActionT{
    DELETE, CREATE, UPDATE
}

interface Update{
    action: ActionT,
    note: Note|undefined,
    id: number|undefined
}

let notes : Array<Note> = new Array<Note>(); //notes
let server_nc: number|undefined = undefined;                   //notes on server

let queried: boolean = false;               //queried
let unsync_create: number =  0;

let local_updates = new Array<Update>();    //updates to try next time

let sync_cd: number = 0;

const LISTC: string = 'LC';
const SYNC: string = 'Sc';

class NoteStore extends EventEmitter{

    constructor(){
        super();
        Dispatcher.register(this._action.bind(this));
    }

    _action(action :FAction){
        if(action.actionType == AT.PROFILE_PRESENT){
            this.init();//s
            let _self = this;
            /*setTimeout(function() { 
                _self.note_create_instant({
                    title:"delay_4",
                    descr:"delay_4",
                    link:"delay_4",
                    tags: ["delay_tag3","t2"],
                    /*//*/
                    id:0,
                    date: "",
                    sync:false
                });
             }, 7000);*/
        }
    }

    // init

    //called on profile init
    init(){
        if(this.online()){
            this.local_update_read();
            if(local_updates.length > 0) this.start_sync();
        }else{

        }
    }

    // SYNC

    local_updates_save(){
        localStorage.setItem("updates", JSON.stringify(local_updates));
        console.log("written updates", local_updates);
    }

    local_update_read(){ 
        let lc = localStorage.getItem("updates");
        if(lc == null) local_updates = [];
        else local_updates = JSON.parse(lc!);
        console.log("Loaded upd: " , local_updates);
    }


    start_sync(){
        console.log("sync go!");
        sync_cd = local_updates.length;
        for(var updk in local_updates){
            let upd = local_updates[updk];
            switch(upd.action){
                case ActionT.CREATE:{
                    this.note_created(upd.note!);
                    break;
                }
            }
        }
        this.emit(SYNC);
    }

    end_sync(){
        console.log("sync end");
        this.local_updates_save();

        let _self = this;
        setTimeout(function() { 
            _self.load_first();
        },5000);

        this.emit(SYNC);
    }

    upd_sync(){
        sync_cd--;
        if(sync_cd == 0){
            this.end_sync();
        }
    }

    syncing(): boolean{
        return sync_cd > 0;
    }

    // LOAD

    load_first(): boolean{
        if(!this.online()|| this.syncing())return false;
        console.log("first query");
        let page = 1;
        axios.get(APIURL+"/ent/get?page="+page+"&ps="+PAGE_SIZE,
            {withCredentials: true})
            .then(this._recv_first.bind(this))
            .catch(this._recv_first_fail.bind(this));
        return true;
    }

    _recv_first(resp : AxiosResponse){
        console.log(resp);
        server_nc = resp.data[1];
        let nts = resp.data[0];
        let mapped = [];
        let minid = 1000000;
        for(var notkey in nts){
            let note = nts[notkey];
            mapped[note.id] = note;
            minid = Math.min(note.id,minid);
        }
        for(notkey in notes){
            let note = notes[notkey];
            //if(note.id > 0 && note.id <  minid)break;
            if(mapped[note.id] != undefined) {
                console.log("deleting", note.id);
                delete mapped[note.id];
            }
        }

        for(notkey in mapped){
            let note = mapped[notkey];
            console.log("insertng", note);
            note.synced = true;
            notes.unshift(note);
        }
        
        this.emit(LISTC);
    }

    _recv_first_fail(err: AxiosError){

    }

    load_more(): boolean{
        if(!this.online()|| this.syncing() || queried)return false;
        queried = true;
        let page = this.next_server_page();
        axios.get(APIURL+"/ent/get?page="+page+"&ps="+PAGE_SIZE,
            {withCredentials: true})
            .then(this._recv_more.bind(this))
            .catch(this._recv_fail.bind(this));
        return true;
    }

    _recv_more(resp: AxiosResponse){
        server_nc = resp.data[1];
        let nts = resp.data[0];
        for (var ntkey in nts){
            let note = nts[ntkey];
            note.synced = true;
            notes.push(note);
        }
        queried = false;
        this.emit(LISTC);
    }

    _recv_fail(err: AxiosError){
        queried = false;
    }

    // CRATE

    unsync_cid(){
        let op  = localStorage.getItem("unsync_cid");
        if(op){
            let opi = parseInt(op);
            localStorage.setItem("unsync_cid", ""+(opi-1));
            return opi-1; 
        }else{
            localStorage.setItem("unsync_cid", ""+-1);
            return -1;
        }
    }


    note_create_instant(note: Note){
        if(this.syncing())return;
        note.id = this.unsync_cid();
        localStorage.setItem("unsync_cid", ""+note.id);
        notes.unshift(note);
        note.sync = false;
        unsync_create++;
        console.log("instant create:",note.id, unsync_create);
        this.note_created(note);
    }

    note_created(note: Note){
        if(!this.online())this._create_fail(note);
        else{
            let _self = this;
            axios.post(APIURL+"/ent/create", note, {withCredentials:true})
            .then((rsp) => {_self._create_then(note, rsp.data.id)})
            .catch((err) => {_self._create_fail(note)});
        }
    }

    _create_then(note: Note, newid: number){
        console.log("create success:",note, newid);
        
        for(var i = 0; i < notes.length; i++){
            if(notes[i].id == note.id){
                console.log("marked node as sync");
                notes[i].sync = true;
                break;
            }
        }
         //delete pending update
        for(var i = 0; i < local_updates.length; i++){
            if(local_updates[i].id == note.id){
                local_updates.splice(i);
            }
        }

        note.id = newid;
        unsync_create = Math.max(unsync_create-1,0);
    
        if(this.syncing()) this.upd_sync();
    }

    _create_fail(note: Note){
        console.log("create fail:",note);
        unsync_create++;
        if(!this.syncing()){
            local_updates.push({action: ActionT.CREATE, note: note , id: note.id!});
            this.local_updates_save();
        }else this.upd_sync();
    }


    // UPDATE

    note_update_instant(note: Note){
        note.sync = false;
        this.note_updated(note);
    }

    note_updated(note: Note){
        if(!this.online())this._upd_fail(note);
        else{
            let _self = this;
            axios.post(APIURL+"/ent/upd/"+note.id, note, {withCredentials:true})
            .then((rsp) => {
                return axios.post(APIURL+"/ent/upd_tags/"+note.id, note.tags, {withCredentials:true})
            })
            .then(function(rsp){
                _self._upd_then.bind(_self)(note);
            })
            .catch(function(err : AxiosError){
                _self._upd_fail.bind(_self)(note);
            });
        }
    }
    
    _upd_then(note: Note){
        //find node and mark as sync
        for(var i = 0; i < notes.length; i++){
            if(notes[i].id == note.id){
                notes[i].sync = true;
                break;
            }
        }
        //delete pending update
        for(var i = 0; i < local_updates.length; i++){
            if(local_updates[i].id == note.id){
                local_updates.splice(i);
                break;
            }
        }
    }

    _upd_fail(note: Note){
        //check if mention of this note already exists
        for(var i = 0; i < local_updates.length; i++){
            if(local_updates[i].id == note.id){
                return;
            }
        }
        local_updates.push({action: ActionT.UPDATE, note: note , id: note.id!})
    }
    
    //

    next_server_page(): number{
        return (notes.length-unsync_create)/PAGE_SIZE + 1;
    }

    //
    
    notes(): Array<Note>{
        return notes;
    }

    has_more(): boolean{
        if(this.online() && server_nc == undefined)return true;
        if(!this.online())return false;
        else return (notes.length-unsync_create) < server_nc!;
    }

    online() : boolean {
        return StateStore.online()
    }

    c_sync(l: EventListener){
        this.on(SYNC,l);
    }

    c_rm_sync(l: EventListener){
        this.removeListener(SYNC,l);
    }

    c_list(l: EventListener){
        this.on(LISTC, l);
    }   
    c_rm_list(l: EventListener){
        this.removeListener(LISTC,l);
    }
}

export default new NoteStore();