import React from 'react'
import {Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";

import UserStore from './store/UserStore';
import NoteStore from './store/NoteStore';
import StateStore from './store/StateStore';

import {dp_fullinit_request} from './actions/func';

import Splash from './layouts/Splash.jsx'
import Auth from './layouts/Auth.jsx';
import Base from './layouts/Base';
import Edit from './layouts/Edit';
import Sync from './layouts/Sync';

let frender = true;

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loading:StateStore.loading(),
            syncing: undefined, 
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
                syncing: StateStore.syncing(),
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
    
    render_splash(){
        return <Splash load={true} />;
    }

    render_sync(){
        return <Sync/>
    }

    render_auth(){
        return <Auth/>
    }

    render_main(){
        if(frender){
            setTimeout(()=>dp_fullinit_request(),10);
            frender = false;
        }
        if(this.state.full_loaded) return <Base/>;
        else return null;
    }

    render(){
        if(this.state.loading)return this.render_splash();
        if(!this.state.authed)return this.render_auth();
        if(this.state.syncing)return this.render_sync();
        return (
            <Switch>  
                <Route path="/create" component={Edit}/> 
                <Route path="/edit/:id" component={Edit}/> 
                <Route path="/" render={this.render_main.bind(this)}/>
            </Switch>
        );
    }
}

export default withRouter(App);