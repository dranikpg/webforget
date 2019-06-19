import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button, DialogContentText, Typography, TextField, Container } from '@material-ui/core';

import withMobileDialog from '@material-ui/core/withMobileDialog';
import TagEdit from './edit/TagEdit';

class SearchDialog extends React.Component{
    constructor(props){
        super(props);
        /*if(this.props.search) this.state = {
            title:this.props.search.title,
            link: this.props.search.link,
            tags: this.get_tags()
        };*/
        this.state = this.clear_state();
    }
    componentWillReceiveProps(props){
        if(this.props.search) this.setState({
            title:this.props.search.title,
            link: this.props.search.link,
            tags: this.get_tags()
        });
        else this.setState(this.clear_state());
    }
    clear_state(){
        return {
            title: "",
            link : "",
            tags : []
        };
    }
    get_tags(){
        if(this.props.search.tags)return this.props.search.tags;
        else return [];
    }
    apply(){
        let buf = "?";
        if(this.state.title && this.state.title.length > 0) buf = buf + "title=" + this.state.title + "&";
        if(this.state.link && this.state.link.length > 0) buf = buf + "link=" + this.state.link + "&";
        if(this.state.tags && this.state.tags.length > 0) buf = buf + "tags=" + this.state.tags.join(",") + "&";
        if(buf.length == 1)buf = "";
        this.props.cb(buf);
    }
    clear(){
        this.setState(this.clear_state);
        this.props.cb("")
    }
    close(){
        this.props.close();
    }

    upd_title(event){
        this.setState({...this.state, title: event.target.value});
    }

    upd_link(event){
        this.setState({...this.state, link: event.target.value});
    }

    upd_tags(){

    }

    render(){
        let o = this.props.open;
        return (<Dialog
            fullScreen={this.props.fullScreen}
            fullWidth={!this.props.fullScreen}
            open={o}
            onClose={this.close.bind(this)}
          > 
            <DialogTitle>Search</DialogTitle>
            <DialogContent>
                <TextField fullWidth
                    label="Title"
                    value={this.state.title}
                    onChange={this.upd_title.bind(this)}
                    />
                <div style={{paddingTop:30}}></div>
                <TextField fullWidth
                    label="URL"
                    value={this.state.link}
                    onChange={this.upd_link.bind(this)}
                    />
                <div style={{paddingTop:30}}></div>
                <TagEdit dialog={true} val={this.state.tags}/>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={this.close.bind(this)} color="secondary">
                  CLOSE
                </Button>
                <Button size="large" onClick={this.clear.bind(this)} color="secondary">
                  CLEAR
                </Button>
                <Button size="large" onClick={this.apply.bind(this)} color="secondary" autoFocus>
                  APPLY
                </Button>
            </DialogActions>
          </Dialog>);
    }
}

export default withMobileDialog()(SearchDialog);