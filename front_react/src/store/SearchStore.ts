import { EventEmitter } from "events";
import Dispatcher from '../dispatcher';
import AT from '../actions/types';
import { FAction, Search, Note} from "../common";
import StateStore from "./StateStore";
import NoteStore from "./NoteStore";

const PAGE_SIZE = 10;
const CG = 'C';

let lastj: string|null = null;
let count: number = 0;
let res: Array<Note> = new Array();

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
        }
    }

    search(s: Search){
        lastj = JSON.stringify(s);
        res.length = 0;
        if(StateStore.online()) this.search_online(s,1);
        else this.search_offline(s);
    }

    search_extend(){
        if(lastj == null)return;
        if(!this.has_more())return;
        let curs = JSON.parse(lastj);
        let page = (res.length / PAGE_SIZE) + 1;
        this.search_online(curs,page);
    }
    
    search_online(s: Search, page: number){
        if(page != 1)return;
        //TODO
        this.search_offline(s);
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
        count = res.length;

        this.emit(CG);
    }

    _matches_tags(s: Search, n: Note): boolean{
        if(s.tags!.size == 0)return true;
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

    is_same(s: Search){
        return JSON.stringify(s) == lastj;
    }

    lastj(): string|null{
        return lastj;
    }

    has_more(): boolean{
        return res.length < count;
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