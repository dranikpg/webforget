import React from 'react';

import State from '../store/UserStore';
import DAS from '../store/DataAccessStore';

import InfiniteScroll from 'react-infinite-scroller';
import { dp_query, dp_query_more } from '../actions/func';
import NoteStore from '../store/NoteStore';

class Test extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            items: []
        };
        DAS.c_data(this.upd_list.bind(this));
    }
    upd_list(){
        this.setState({items:DAS.get()})
    }
    render(){
        console.log("REDRAW", DAS.has_more());
        let local = [];
        for(var key in this.state.items){
            local.push( <p> {JSON.stringify(this.state.items[key])} </p> );
        }
        return (
            <InfiniteScroll
                pageStart={0}
                initialLoad={true}
                loadMore={this.loadFunc.bind(this)}
                hasMore={DAS.has_more()}
                loader={<div className="loader" key={0}>Loading fuck...</div>}>
                <div>
                    {local}
                </div>
                </InfiniteScroll>
        );
    }
    loadFunc(page){
        console.log("QUERY MORE");
        setTimeout(()=>dp_query_more(),10);
    }
    has_more(){
        console.log("RQ", DAS.has_more());
        return DAS.has_more();
    }
}

export default Test;