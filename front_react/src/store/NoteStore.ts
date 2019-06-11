import { EventEmitter } from "events";
import StateStore from "./StateStore";
import Dispatcher from "../dispatcher";

import AT from '../actions/types';
import {FAction, User, Note} from '../common';

import axios, { AxiosResponse, AxiosError } from "axios";
import {APIURL, copy_note} from '../util'
import { number } from "prop-types";

export const PAGE_SIZE = 10;

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
let unsync_create: number = 0;
let unsync_delete: number = 0;
let local_updates = new Array<Update>();    //updates to try next time

const LISTC: string = 'LC';

class NoteStore extends EventEmitter{

    constructor(){
        super();
        Dispatcher.register(this._action.bind(this));
    }

    _action(a :FAction){
        if(a.actionType == AT.NOTES_EXTEND) this.load_more();
        else if(a.actionType == AT.SYNC_END)this.end_sync();
        else if(a.actionType == AT.SYNC_AFTERBURN) this.afterburn_sync();
        else if(a.actionType == AT.NOTES_DROP_LOCAL) this.local_drop();
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

    local_delwid(id: number){
        for(var i = 0; i < local_updates.length; i++){
            if(local_updates[i].id == id){
                local_updates.splice(i);
                break;
            }
        }
    }

    local_drop(){
        local_updates = [];
        this.local_updates_save();
    }

    local_size(){
        return local_updates.length;
    }

    //

    sync_required(){
        if(!this.online())return;
        this.local_update_read();
        if(local_updates.length == 0)return;
        this.start_sync();
    }

    start_sync(){
        for(var updk in local_updates){
            let upd = local_updates[updk];
            switch(upd.action){
                case ActionT.CREATE:{
                    StateStore.sync_inc();
                    this.note_created(upd.note!);
                    break;
                }
                case ActionT.UPDATE:{
                    StateStore.sync_inc();
                    this.note_updated(upd.note!);
                    break;
                }
                case ActionT.DELETE:{
                    StateStore.sync_inc();
                    this.note_deleted(upd.id!);
                    break;
                }
            }
        }
    }

    end_sync(){
        this.local_updates_save();
    }

    afterburn_sync(){
        this.load_first();
    }

    upd_sync(){
        StateStore.sync_update();
    }

    syncing(): boolean{
        return StateStore.syncing();
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
                delete mapped[note.id];
            }
        }

        for(notkey in mapped){
            let note = mapped[notkey];
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
        this.local_delwid(note.id);

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
            axios.post(APIURL+"/ent/update/"+note.id, note, {withCredentials:true})
            .then((rsp) => {
                return axios.post(APIURL+"/ent/update_tags/"+note.id, note.tags, {withCredentials:true})
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
        console.log("Update success");
        //find node and mark as sync
        for(var i = 0; i < notes.length; i++){
            if(notes[i].id == note.id){
                notes[i].sync = true;
                break;
            }
        }
        //delete pending update
        this.local_delwid(note.id);

        if(this.syncing())this.upd_sync();
    }

    _upd_fail(note: Note){
        console.log("Update failed")
        if(this.syncing()) this.upd_sync();
        else {
            //check if mention of this note already exists
            for(var i = 0; i < local_updates.length; i++){
                if(local_updates[i].id == note.id){
                    let lo = local_updates[i];
                    if(lo.action == ActionT.CREATE){ //allow safe update of created unsynced notes
                        copy_note(note,lo.note);
                    }
                    return;
                }
            }
            local_updates.push({action: ActionT.UPDATE, note: note , id: note.id!});
            this.local_updates_save();
        }
    }

    //DELETE

    note_delete_instant(id: number){
        for(var i = 0; i < notes.length; i++){
            if(notes[i].id == id){
                notes.splice(i,1);
                break;
            }
        }
        unsync_delete++;
        this.note_deleted(id);
    }
    
    note_deleted(id: number){
        if(!this.online())this._del_fail(id);
        else{
            let _self = this;
            axios.post(APIURL+"/ent/delete?id="+id,{}, {withCredentials:true})
            .then(()=>_self._del_then(id))
            .catch(()=>_self._del_fail(id));
        }
    }

    _del_then(id: number){
        console.log("Delete success");
        this.local_delwid(id);
        unsync_delete = Math.max(0,unsync_delete-1);
        if(this.syncing())this.upd_sync();
    }

    _del_fail(id: number){
        console.log("Delete failed");
        if(this.syncing())this.upd_sync();
        else{
            this.local_delwid(id);
            local_updates.push({action:ActionT.DELETE,note: undefined, id: id});
            this.local_updates_save();
        }
    }
    
    // get one

    get_one(id: number, cb: (arg0: Note|null) => void){
        if(notes.length > 0) this._get_one_offline(id,true,cb);
        else this._get_one_online(id,cb);
    }

    _get_one_offline(id: number, tryonl: boolean, cb: (arg0: Note|null) => void){
        for(var note of notes){
            if(note.id == id){
                cb(note as Note);
                return;
            }
        }
        if(tryonl)this._get_one_online(id,cb);
        else cb(null);
    }

    _get_one_online(id: number, cb: (arg0: Note|null) => void){
        let _self = this;
        axios.get(APIURL+"/ent/get/"+id, {withCredentials:true})
            .then((rsp: AxiosResponse)=>{
                cb(rsp.data as Note)
            })
            .catch((err: AxiosError) => {
                _self._get_one_offline(id,false,cb);
            })
    }

    //

    next_server_page(): number{
        return Math.ceil((notes.length-unsync_create+unsync_delete)/PAGE_SIZE) + 1;
    }

    //

    server_count(){
        return server_nc;
    }
    
    notes(): Array<Note>{
        return notes;
    }

    has_more(): boolean{
        if(this.online() && server_nc == undefined)return true;
        if(!this.online())return false;
        return (notes.length-unsync_create) < server_nc!;
    }

    online() : boolean {
        return StateStore.online()
    }

    //

    c_list(l: EventListener){
        this.on(LISTC, l);
    }   
    c_rm_list(l: EventListener){
        this.removeListener(LISTC,l);
    }
}

export default new NoteStore();