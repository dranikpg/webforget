import React from 'react'
import {Route, Switch } from "react-router-dom";

import Splash from './layouts/Splash'
import Auth from './layouts/Auth';

class App extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <Switch>   
                <Route path="/auth" component={Auth}/>
                <Route path="/" component={Splash}/>
            </Switch>
        );
    }
}

export default App;