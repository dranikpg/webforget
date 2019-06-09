import React from 'react';
import Bar from '../cp/deco/Bar';
import NoteList from '../cp/list/NoteList';
import { Container } from '@material-ui/core';

const belowtbStyle = {
    paddingTop: '5em'
};


class Base extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        console.log(typeof stl);
        return (
            <React.Fragment>
                <Bar/>
                <Container maxWidth="lg" style={belowtbStyle}>
                    <NoteList/>
                </Container>
            </React.Fragment>
            
        );
    }
}

export default (Base);