import React from 'react';
import { dp_query, dp_query_more } from '../../actions/func';
import DAS from '../../store/DataAccessStore';
import State from '../../store/UserStore';
import NoteStore from '../../store/NoteStore';

import InfiniteScroll from 'react-infinite-scroller';
import NoteEntry from './NoteEntry';
import { LinearProgress, Typography } from '@material-ui/core';

let lastj = null;
let sent = false;

class NoteList extends React.Component{
    constructor(props){
        super(props);
        let it = DAS.get();
        if(it == undefined){
            this.state = {search:this.props.search,items:[]};
        }else{
            this.state = {search:this.props.search,items:it};
        }
        DAS.c_data(this.upd_list.bind(this));
    }

    componentWillReceiveProps(props){
        let s = props.search;
        sent = false;    
    }


    render_loading(){
        return <LinearProgress style={{width:"100%"}}/>;
    }  

    render(){
        if(DAS.loading())return this.render_loading();
        let local = [];
        if(sent){
            for(var key in this.state.items){
                local.push(<NoteEntry 
                        e={this.state.items[key]}
                        paddingb="10px" /> );
            }
        }        
        if(sent && local.length == 0){
            local.push(<Typography variant="h6">No notes found</Typography>)
        }
        return (
            <InfiniteScroll
                pageStart={0}
                initialLoad={true}
                loadMore={this.load_func.bind(this)}
                hasMore={!sent || DAS.has_more()}
                loader={<div style={{paddingBottom:10}} key={0}><LinearProgress style={{width:"100%"}}/></div>}
                threshold={800}>
                <div>
                    {local}
                </div>
                </InfiniteScroll>
        );
    }
    load_func(page){
        console.log("REQUEST");
        let s = this.props.search; 
        if(!sent){
            sent = true;
            setTimeout(()=>dp_query(this.props.search),10);
            if(s == null) lastj = null;
            else lastj = JSON.stringify(s);
        }
        else  setTimeout(()=>dp_query_more(),10);

    }
    has_more(){
        return DAS.has_more();
    }
    upd_list(){
        this.setState({items:DAS.get()})
    }
}

export default NoteList;