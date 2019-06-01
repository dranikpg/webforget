import React from 'react';

import State from '../store/StateStore';

export class Auth extends React.Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.lstate = this.upd_state.bind(this);
        State.c_state(this.lstate);
        this.llogin = this.upd_login.bind(this);
        State.c_auth(this.llogin);
        //auto test
        State.login("email1","pw1");
    }

    componentWillUnmount(){
        State.c_rm_state(this.lstate);
        State.c_rm_auth(this.llogin);
    }

    upd_login(){
        if(State.user() == null){
            console.log("A1: NO LOGIN");
        }else{
            console.log("A1: LOGGED IN");   
        }
    }

    upd_state(){
        if(State.user() == null){
        }else{
            let hs = this.props.history;
            if(hs.location.state != undefined && hs.location.state.coderd != undefined) hs.goBack();
            else hs.replace("/")
        }
    }

    render(){
        return (<p>Auth</p>)
    }
}

export default Auth;