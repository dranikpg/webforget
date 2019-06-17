export interface FAction {
    actionType: number;
    payload: object | null;
}

export interface Search{
    tags: Set<String>|undefined,
    link: string|undefined,
    title: string|undefined,
    max_date: string|undefined,
    min_date: string|undefined
}

export interface User{
    nick: string, 
    email: string
}

export interface Note{
    id: number,
    title: string,
    descr: string,
    link: string, 
    date: string,
    tags: Array<string>,
}

export interface NoteUpdate{
    id: number,
    title: string|undefined,
    descr: string|undefined,
    link: string|undefined, 
    tags: Array<string>|undefined,
}

export interface Message{
    msg: string,
    timeout: number,
    warn: boolean
    action:undefined|{
        msg:string,
        cb: ()=>void
    }
}
