import React from 'react'
import {Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";

import StateStore from './store/StateStore';
import NoteStore from './store/NoteStore';


import Splash from './layouts/Splash.jsx'
import Auth from './layouts/Auth.jsx';
import Test from './layouts/Test.jsx';

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loading:StateStore.loading(),
            syncing: false, 
            authed:false}
    }

    _upd_state(){
        this.setState({
                ...this.state,
                loading: false,
                authed: StateStore.authed()
        });
    }

    _upd_sync(){
        this.setState({
            ...this.state,
            syncing: NoteStore.syncing()
        });
    }

    componentDidMount(){
        if(StateStore.loading()){
            this.l_state = this._upd_state.bind(this);
            StateStore.c_state(this.l_state);
        }
        this.l_sync = this._upd_sync.bind(this);
        NoteStore.c_sync(this.l_sync);

        this.setState({
                loading:StateStore.loading(), 
                authed: StateStore.authed(),
                syncing: NoteStore.syncing()});
    }
    
    render_splash(msg){
        return <Splash msg={msg} />;
    }

    render_auth(){
        return <Auth/>
    }

    render(){
        if(this.state.loading)return this.render_splash("Loading");
        if(!this.state.authed)return this.render_auth();
        if(this.state.syncing)return this.render_splash("Syncing");
        return (
            <Switch>   
                <Route path="/" component={Test} />
            </Switch>
        );
    }
}

export default withRouter(App);