import React from 'react';
import { dp_query, dp_query_more } from '../../actions/func';
import DAS from '../../store/DataAccessStore';
import State from '../../store/UserStore';
import NoteStore from '../../store/NoteStore';

import InfiniteScroll from 'react-infinite-scroller';
import NoteEntry from './NoteEntry';

let lastj = null;

class NoteList extends React.Component{
    constructor(props){
        super(props);
        let it = DAS.get();
        if(it == undefined){
            this.state = {items:[]};
        }else{
            this.state = {items:it};
        }
        DAS.c_data(this.upd_list.bind(this));
    }


    render_loading(){
        return <p>Loading</p>
    }  

    render(){
        if(DAS.loading())return this.render_loading();
        let local = [];
        for(var key in this.state.items){
            local.push(<NoteEntry 
                    e={this.state.items[key]}
                    paddingb="10px" /> );
        }
        return (
            <InfiniteScroll
                pageStart={0}
                initialLoad={true}
                loadMore={this.load_func.bind(this)}
                hasMore={DAS.has_more()}
                loader={<div className="loader" key={0}>Loading...</div>}
                threshold={600}>
                <div>
                    {local}
                </div>
                </InfiniteScroll>
        );
    }
    load_func(page){
        let q = true;
        let s = this.props.search;
        if(lastj == s || JSON.stringify(s) == lastj) q = false;

        if(q){
            setTimeout(()=>dp_query(this.props.search),10);
            if(s == null) lastj = null;
            else lastj = JSON.stringify(s);
        }
        else  setTimeout(()=>dp_query_more(),10);

    }
    has_more(){
        console.log("RQ", DAS.has_more());
        return DAS.has_more();
    }
    upd_list(){
        this.setState({items:DAS.get()})
    }
}

export default NoteList;