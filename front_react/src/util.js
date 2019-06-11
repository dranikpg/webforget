export const APIURL = process.env.REACT_APP_APIURL;

export function copy_note(src, dst){
    for(var key in src) dst[key] = src[key];
    dst.tags = [...src.tags];
}   

export function fresh_note(){
    return {tags: [], title:"", descr:"", link:"", date: curday()};
}

function curday(){
    let today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yyyy = today.getFullYear();
    
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    return (mm+"-"+dd+"-"+yyyy);
}