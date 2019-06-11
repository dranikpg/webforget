import React from 'react';
import { Box, Chip, Paper, TextField, Grid, Button, Typography } from '@material-ui/core';

const paperStyle = {
    padding: 10
};

const chiprootStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin:1
};

class TagEdit extends React.Component{
    constructor(props){
        super(props);
        this.state = {items:props.val, txt: ""};
    }


    remove_tag(tag){
        console.log(tag);
        let is = this.state.items;
        for(var i = 0; i < is.length; i++){
            if(is[i] == tag){
                is.splice(i,1);
                this.notify_cb();
                break;
            }
        }
        this.setState({...this.state});
    }

    field_catch(ev){
        if(ev.key == 'Enter'){
            ev.preventDefault();
            this.add_tag();
        }
    }

    upd_text(ev){
        this.setState({...this.state,txt: ev.target.value});
    }

    add_tag(){
        let txt = this.state.txt;
        if(txt.length == 0)return;
        if(!this.state.items.includes(txt)){
            this.state.items.push(txt);
            this.state.items.sort();
            this.notify_cb();
        }
        this.setState({...this.state,txt:""});
    }

    notify_cb(){
        if(this.props.cb != undefined)this.props.cb();
    }

    render() {
        return (
            <Paper style={paperStyle}>
                <Typography variant="caption">
                    Click do delete
                </Typography>
                <div style={chiprootStyle}>
                    {this.getChips()}
                </div>
                <Grid container
                    direction="row"
                    justify="space-between"
                    alignItems="baseline">
                    <TextField
                        margin="normal"
                        label="Add tag"
                        id="add-tag"
                        value={this.state.txt}
                        onKeyPress={this.field_catch.bind(this)}
                        onChange={this.upd_text.bind(this)}
                    /> 
                    <Button variant="outlined" size="small"
                        onClick={this.add_tag.bind(this)}>Add</Button>
                </Grid>
                
            </Paper>
        );
    }

    getChips(){
        let car = this.state.items;
        if(car.length == 0)return <p>No tags</p>
        let out = [];
        for(var tag of car){
            let lc = tag;
            out.push(<Chip
                    label={tag} variant="outlined" 
                    onClick={()=>{this.remove_tag(lc)}}/>)
        } 
        return out;
    }


}

export default TagEdit;