import React from 'react';

import State from '../store/StateStore';
import Notes from '../store/NoteStore';

import InfiniteScroll from 'react-infinite-scroller';

class Test extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            items: []
        };
        console.log(typeof Notes.c_list);
        Notes.c_list(this.upd_list.bind(this));
    }
    upd_list(){
        this.setState({items:Notes.notes()})
    }
    render(){
        let local = [];
        for(var key in this.state.items){
            local.push( <p> {JSON.stringify(this.state.items[key])} </p> );
        }
        console.log("render",this.state.items.length);
        return (
            <InfiniteScroll
                pageStart={0}
                initialLoad
                loadMore={this.loadFunc.bind(this)}
                hasMore={Notes.has_more()}
                loader={<div className="loader" key={0}>Loading...</div>}>
                <div>
                    {local}
                </div>
                </InfiniteScroll>
        );
    }
    loadFunc(page){
        Notes.load_more();
    }
}

export default Test;