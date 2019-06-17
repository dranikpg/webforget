import { EventEmitter } from "events";
import Dispatcher from '../dispatcher';
import AT from '../actions/types';
import { FAction, Search, Note} from "../common";
import StateStore from "./StateStore";
import NoteStore from "./NoteStore";
import Axios, { AxiosResponse } from "axios";
import { APIURL } from "../util";

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
        console.log(a);
        if(a.actionType == AT.SEARCH){
            this.search(a.payload as Search);
        }else if(a.actionType == AT.SEARCH_EXTEND){
            if(!StateStore.online())return;
            this.search_extend();
        }else if(a.actionType == AT.NOTE_DELETE) this.delwid(<number><unknown>a.payload);
    }

    delwid(id: number){
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
            if(resp.data.length == 0) hm = false;
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
            let ms: boolean = true;
            if(s.link != null) ms = ms && note.link.includes(s.link);
            if(s.title!= null) ms = ms && note.title.includes(s.title);
            ms = ms && this._matches_tags(s,note);
            if(ms)res.push(note);
        }
        this.emit(CG);
    }

    _matches_tags(s: Search, n: Note): boolean{
        if(s.tags!.length == 0)return true;
        let nss = new Set<String>(n.tags);
        for(var tag in s.tags){
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