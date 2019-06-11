import React from 'react';

import State from '../store/UserStore';


const belowtbStyle = {
    paddingTop: '5em'
};

export class Splash extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (<p style={belowtbStyle}>SPLASH {this.props.msg}</p>)
    }
}

export default Splash;