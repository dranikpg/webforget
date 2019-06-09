import React from 'react'
import {Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";

import UserStore from './store/UserStore';
import NoteStore from './store/NoteStore';
import StateStore from './store/StateStore';

import {dp_fullinit_request} from './actions/func';

import Splash from './layouts/Splash.jsx'
import Auth from './layouts/Auth.jsx';
import Test from './layouts/Test';
import Base from './layouts/Base';

let frender = true;

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loading:StateStore.loading(),
            syncing: false, 
            authed:false, 
            full_loaded: false
        }
    }

    _upd_auth(){
        this.setState({
            ...this.state,
            authed: UserStore.authed()
        });
    }

    _upd_state(){
        this.setState({
                ...this.state,
                loading: StateStore.loading(),
                sync: StateStore.syncing(),
                full_loaded: StateStore.full_loaded()
        });
    }

    componentDidMount(){
        StateStore.c_state(this._upd_state.bind(this));
        UserStore.c_auth(this._upd_auth.bind(this));

        if(StateStore.loaded())this.check_full_mode();

        this.setState({
                loading:StateStore.loading(), 
                authed: UserStore.authed(),
                syncing: StateStore.syncing(),
                full_loaded: StateStore.full_loaded()});
    }
    
    render_splash(msg){
        return <Splash msg={msg} />;
    }

    render_auth(){
        return <Auth/>
    }

    render_main(){
        if(frender){
            setTimeout(()=>dp_fullinit_request(),10);
            frender = false;
        }
        return <Base/>;
    }

    render(){
        if(this.state.loading)return this.render_splash("Loading");
        if(!this.state.authed)return this.render_auth();
        if(this.state.syncing)return this.render_splash("Syncing");
        return this.render_main();
        /*return (
            <Switch>   
                <Route path="/" component={Test} />
            </Switch>
        );*/
    }
}

export default withRouter(App);