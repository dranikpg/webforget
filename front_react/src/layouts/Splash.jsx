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
        if(this.props.load)
            return (<p style={belowtbStyle}>LOADING</p>)
        else {
            return <p style={belowtbStyle}SYNCING></p>
        }
    }
}

export default Splash;