import { EventEmitter } from "events";
import Dispatcher from '../dispatcher';
import AT from '../actions/types';
import { FAction, Search, Note} from "../common";
import StateStore from "./StateStore";
import NoteStore from "./NoteStore";
import Axios, { AxiosResponse } from "axios";
import { APIURL, copy_note } from "../util";
const PAGE_SIZE = 10;
const CG = 'C';

let search: Search|undefined = undefined;
let res: Array<Note> = new Array();
let hm = true;

let q = false;

class SearchStore extends EventEmitter{

    constructor(){
        super();
        Dispatcher.register(this._action.bind(this));
    }

    _action(a: FAction){
        if(a.actionType == AT.SEARCH){
            this.search(a.payload as Search);
        }else if(a.actionType == AT.SEARCH_EXTEND){
            if(!StateStore.online())return;
            this.search_extend();
        }else if(a.actionType == AT.NOTE_DELETE) this.note_delete(<number><unknown>a.payload);
        else if(a.actionType == AT.NOTE_UPDATE)this.note_update(<Note><unknown>a.payload);
        else if(a.actionType == AT.NOTE_CREATE)this.note_create(<Note><unknown>a.payload);
    }

    note_create(note: Note){
        if(this._matches(note)){
            res.unshift(note);
            this.emit(CG);
        }
    }
    //if note doesnt match - try to remove it
    note_update(note: Note){
        console.log(search, note);
        if(!this._matches(note))this.note_delete(note.id);
        else {
            for(var i = 0; i < res.length; i++){
                if(res[i].id == note.id) {
                    if(res[i] == note)return;
                    copy_note(note, res[i]);
                    this.emit(CG);
                    return;
                }
            }
        }
    }



    note_delete(id: number){
        console.log("DELWID",id);
        for(var i = 0; i < res.length; i++){
            if(res[i].id == id) {
                res.splice(i,1);
                this.emit(CG);
                return;
            }
        }
    }

    search(s: Search){
        hm = true;
        res.length = 0;
        search = s;
        if(StateStore.online()) this.search_online(s,1e7);
        else this.search_offline(s);
    }

    get_lid(){
        if(res.length == 0)return 1e7;
        else return res[res.length-1].id;
    }

    search_extend(){
        if(!this.has_more())return;
        if(!search)return;
        this.search_online(search!,this.get_lid());
    }
    
    search_online(s: Search, lid: number){
        if(q)return;
        Axios.post(APIURL+"/search?from="+lid+"&ps="+PAGE_SIZE, s,{withCredentials:true})
        .then((resp: AxiosResponse)=>{
            q = false;
            if(resp.data.length < PAGE_SIZE) hm = false;
            else hm = true;
            for(var m of resp.data){
                res.push(m);
            }
            this.emit(CG);
        })
        .catch((err)=>{
            q = false;
        })
    }

    search_offline(s: Search){
        let notes = NoteStore.notes();
        for(var notek in notes){
            let note = notes[notek];
            if(this._matches(note))res.push(note);
        }
        this.emit(CG);
    }

    _matches(note: Note){
        if(search == null)return true;
        let ms: boolean = true;
        if(search.link != null) ms = ms && note.link.toLowerCase().includes(search.link.toLowerCase());
        if(search.title!= null) ms = ms && note.title.toLowerCase().includes(search.title.toLowerCase());
        ms = ms && this._matches_tags(search,note);
        return ms;
    }

    _matches_tags(s: Search, n: Note): boolean{
        if(!s.tags || s.tags!.length == 0)return true;
        let nss = new Set<String>(n.tags);
        for(var tag of s.tags){
            if(!nss.has(tag))return false;
        }
        return true;
    }

    //

    notes(): Array<Note>{
        return res;
    }

    has_more(): boolean{
        return hm;
    }

    //

    c_search(l: EventListener){
        this.on(CG,l);
    }

    c_rm_search(l: EventListener){
        this.removeListener(CG,l);
    }
}

export default new SearchStore();