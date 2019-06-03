export interface FAction {
    actionType: number;
    payload: object | null;
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
    sync: boolean,
}

export interface NoteUpdate{
    id: number,
    title: string|undefined,
    descr: string|undefined,
    link: string|undefined, 
    tags: Array<string>|undefined,
}
