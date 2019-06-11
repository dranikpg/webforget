import React from 'react';

import { Container } from '@material-ui/core';

import Bar from '../cp/deco/Bar';
import NoteList from '../cp/list/NoteList';
import ToastMG from '../cp/deco/ToastMG';

const belowtbStyle = {
    paddingTop: '5em'
};


class Base extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <React.Fragment>
                <Bar/>
                <Container maxWidth="lg" style={belowtbStyle}>
                    <NoteList/>
                </Container>
                <ToastMG/>
            </React.Fragment>
            
        );
    }
}

export default (Base);