import React from 'react';

import State from '../store/UserStore';

export class Splash extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (<p>SPLASH {this.props.msg}</p>)
    }
}

export default Splash;