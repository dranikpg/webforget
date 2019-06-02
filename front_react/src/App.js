import React from 'react'
import {Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";


import Splash from './layouts/Splash'
import Auth from './layouts/Auth.jsx';
import StateStore from './store/StateStore';

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {loading:StateStore.loading(), authed:false}
    }

    _upd_state(){
        let at =  StateStore.authed();
        if(at)StateStore.c_rm_state(this.l_state);
        this.setState({loading:false, authed: at});
    }
    componentDidMount(){
        if(StateStore.loading()){
            this.l_state = this._upd_state.bind(this);
            StateStore.c_state(this.l_state);
        }else{
            this.setState({loading:false, authed: StateStore.authed()});
        }
    }
    
    render_splash(){
        return <Splash/>;
    }
    render_auth(){
        return <Auth/>
    }

    render(){
        if(this.state.loading)return this.render_splash();
        if(!this.state.authed)return this.render_auth();
        return (
            <Switch>   
                <Route path="/" render={()=>{return (<p>HELLO 2</p>)}} />
            </Switch>
        );
    }
}

export default withRouter(App);