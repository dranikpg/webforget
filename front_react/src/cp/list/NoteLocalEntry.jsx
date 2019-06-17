import React from 'react';
import { Card, ExpansionPanel, ExpansionPanelSummary,ExpansionPanelDetails, Typography, Switch, Grid, FormControl, FormControlLabel, FormGroup, Box, Paper } from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { render_tags } from './NoteEntry';

/*
PROPS
local: Local change
server: Server version
cb(bool) callback
 */

const topStyle = {
    margin: 0
};

const cardStyle = {
    display:'block'
};

class NoteLocalEntry extends React.Component{
    constructor(props){
        super(props);
        this.state={upd:true};
    }

    get_heading(){
        let action = this.props.local.action;
        if(action==0)return "Delete";
        else if(action==1)return "Create";
        else return "Update";
    }


    render_top(){
        return <Box style={{padding:10}}><FormGroup>
                <FormControlLabel
                control={
                    <Switch checked={this.state.upd} onChange={(event)=>{
                        let val = event.target.checked;
                        this.props.cb(this.props.local.id,val);
                        this.setState({upd:val});
                    }}
                    value="checkedA" />
                }
                label={this.get_heading()}/>
            </FormGroup></Box>
        
 
    }

    render_note(note){
        return (
            <div>
                <Typography variant="h6">{note.title}</Typography>
                <Typography variant="caption">{note.link}</Typography>
                <Typography>{note.descr}</Typography>
                {render_tags(note.tags)}
            </div>
        );
    }

    render_local(){
        if(this.props.local.action == 0)return null;//delete
        else  return (<ExpansionPanel defaultExpanded={true}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}>
                    <Typography>LOCAL</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    {this.render_note(this.props.local.note)}    
                </ExpansionPanelDetails>
            </ExpansionPanel>);
        
    }

    render_server(){
        if(this.props.server==null)return null;
        else return (<ExpansionPanel defaultExpanded={false}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}>
                    <Typography>SERVER</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    {this.render_note(this.props.server)}    
                </ExpansionPanelDetails>
            </ExpansionPanel>);

    }

    render(){
        return <div style={cardStyle}>
                {this.render_top()}
                {this.render_local()}
                {this.render_server()}
                </div>
    }
}

export default NoteLocalEntry;