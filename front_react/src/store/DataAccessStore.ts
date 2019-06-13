import { EventEmitter } from "events";
import Dispatcher from '../dispatcher';
import AT from '../actions/types';

import { Search, FAction, Note } from "../common";
import SearchStore from "./SearchStore";
import NoteStore from "./NoteStore";
import { dp_notes, dp_search, dp_search_extend } from "../actions/func";


let searching: boolean = false;
let noansw: boolean = false;
let hasmore: boolean = false;

const CG = 'C';

class DataAccessStore extends EventEmitter{

    constructor(){
        super();  
        SearchStore.c_search(this._lst_search.bind(this));
        NoteStore.c_list(this._lst_notes.bind(this));
        Dispatcher.register(this._action.bind(this));
    }

    _action(a: FAction){
        if(a.actionType == AT.QUERY){
            if(a.payload == null)this.query_notes();
            else this.query_seach(a.payload! as Search);
        }else if(a.actionType == AT.QUERY_MORE){
            this.query_more(a.payload! as Search);
        }
    }

    query_seach(s: Search){
        searching = true;
        if(!SearchStore.is_same(s)){
            noansw = true;
            setTimeout(()=>{
                dp_search(s);
            },10);
        }
        this.emit(CG);
    }

    query_more(s: Search|undefined){
        if(searching){
            setTimeout(()=>{
                dp_search_extend(s!);
            },10);
        }else{
            if(!NoteStore.any_sent()) this.query_notes();
            else this.request_notes();
        }
    }

    query_notes(){
        searching = false;
        //check if online and not loaded
        if(!NoteStore.any_sent())noansw = true; 
        this.request_notes();
        this.emit(CG);
    }

    request_notes(){
        setTimeout(()=>dp_notes(), 10);
    }

    //

    _lst_search(){
        noansw = false;
        this.emit(CG);
    }

    _lst_notes(){
        noansw = false;
        this.emit(CG);
    }

    //

    get(): Array<Note>|undefined{
        if(noansw)return undefined;
        if(searching)return SearchStore.notes();
        else return NoteStore.notes();
    }

    has_more(): boolean{
        if(this.loading())return false;
        if(this.searching())return SearchStore.has_more();
        else return NoteStore.has_more();
    }

    searching(): boolean{
        return searching;
    }

    loading(): boolean{
        return noansw;
    }

    //
    c_data(l: EventListener){
        this.on(CG,l);
    }
    c_rm_data(l: EventListener){
        this.removeListener(CG,l);
    }
}

export default new DataAccessStore();