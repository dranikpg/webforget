import React from 'react';

import State from '../store/StateStore';

export class Splash extends React.Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(State.user() == undefined){ //wait for define
            this.lst = this.upd_state.bind(this);
            State.c_state(this.lst);
        }else{
            this.upd_state();
        }
        
    }

    componentWillUnmount(){
        if(this.lst != undefined) State.c_rm_state(this.lst);
    }

    upd_state(){
        if(State.user() == null){
            this.props.history.push("/auth",{coderd:true});
        }else{
            console.log("SPLASH LOGGED IN");   
        }
    }

    render(){
        return (<p>SPLASH</p>)
    }
}

export default Splash;