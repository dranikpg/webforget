import React from 'react';
import { withRouter } from "react-router";
import { Container } from '@material-ui/core';

import Bar from '../cp/deco/Bar';
import NoteList from '../cp/list/NoteList';
import ToastMG from '../cp/deco/ToastMG';
import { from_search_url } from '../util';
import StateStore from '../store/StateStore';
import { dp_search } from '../actions/func';

const belowtbStyle = {
    paddingTop: '5em'
};


class Base extends React.Component{
    constructor(props){
        super(props);
    }

    search(){
        let q = this.props.history.location.search;
        return from_search_url(q);
    }

    render(){
        let search = this.search();
        return (
            <React.Fragment>
                <Bar search={search} />
                <Container maxWidth="lg" style={belowtbStyle}>
                    <NoteList search={search}/>
                </Container>
                <ToastMG/>
            </React.Fragment>
            
        );
    }
}

export default withRouter(Base);