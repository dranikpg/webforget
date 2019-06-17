import { Note,Search } from "./common";
import { type } from "os";

export const APIURL = process.env.REACT_APP_APIURL;


export function copy_note(src: any, dst: any){
    for(var key in src) dst[key] = src[key];
    dst.tags = [...src.tags];
}   

export function fresh_note(){
    return {tags: [], title:"", descr:"", link:"", date: curday()};
}

export function from_search_url(url:string): Search|null {
    if(url.length < 3)return null;
    let obj = obj_from_url(url);
    if(obj.tags){
        let ss = obj.tags.split(",");
        let set = [];
        for(var s of ss){
            set.push(s);
        }
        obj.tags = set;
    }    
    return obj as Search;
}

function obj_from_url(url: string):any {
    var query = url.substr(1);
    var result: any = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}


function curday(){
    let today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yyyy = today.getFullYear();
    
    let dds:string = ""+dd;
    let mms:string = ""+mm;
    
    if(dd<10) dds='0'+dd;
    if(mm<10) mms='0'+mm;
    return (mms+"-"+dds+"-"+yyyy);
}