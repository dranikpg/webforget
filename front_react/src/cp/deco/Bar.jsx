import React from 'react';
import { Link } from 'react-router-dom';

import { withRouter } from "react-router";
import withWidth,{isWidthUp } from '@material-ui/core/withWidth';


import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { Button, Grid,  } from '@material-ui/core';

import AddIcon from '@material-ui/icons/NoteAdd';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear'

import SearchDialog from '../SearchDialog';

const toolbStyle = {paddingLeft: "5vw", paddingRight:"5vw" };
const typoStyle = {paddingRight: "5vw"};
const searchDivStyle = {flexGrow:1, textAlign: "center"};

class Bar extends React.Component{

    constructor(props){
        super(props);
        this.state = {diagopen: false};
    }

    toggle_dialog(open){
        this.setState({diagopen:open});
    }

    launch_search(url){
        this.props.history.push(url);
        this.toggle_dialog(false);
    }

    render_lg(){
        return (<React.Fragment>
             <SearchDialog 
                search={this.props.search}
                close={()=>this.toggle_dialog(false)}
                open={this.state.diagopen}
                cb={this.launch_search.bind(this)}/>
            <Grid container spacing={5}>
                <Grid item>
                    <Typography style={typoStyle} variant="h5">
                        Webforget
                    </Typography>
                </Grid>
                <Grid item>
                    <Button variant="outlined" color="inherit"
                        component={Link} to={"/create"}>
                        ADD NOTE
                    </Button>
                </Grid>
                {this.props.search && <Grid item>
                    <Button variant="outlined"  color="inherit" component={Link} to={"/"}>
                        CLEAR
                    </Button>
                </Grid>}
                <Grid item>
                    <Button variant="outlined"  color="inherit" onClick={()=>this.toggle_dialog(true)}>
                       SEARCH
                    </Button>
                </Grid>
            </Grid>
        </React.Fragment>);
    }

    render_sm(){
        return (<React.Fragment>
            <SearchDialog 
                search={this.props.search}
                close={()=>this.toggle_dialog(false)}
                open={this.state.diagopen}
                cb={this.launch_search.bind(this)}/>
            <Grid container direction="row" justify="space-between" alignItems="center">
                <Grid item><Typography>WEBFORGET</Typography></Grid>
                <Grid item>
                    <Button size="small" component={Link} to={"/create"}>
                        <AddIcon color="secondary"/>
                    </Button>
                </Grid>
                {this.props.search && <Grid item>
                    <Button size="small" component={Link} to={"/"}>
                        <ClearIcon color="secondary"/>
                    </Button>
                </Grid>}
                <Grid item>
                    <Button size="small" onClick={()=>this.toggle_dialog(true)}>
                        <SearchIcon color="secondary"/>
                    </Button>
                </Grid>
            </Grid>
        </React.Fragment>);
    }   

    render(){
        let inner = undefined;
        if(isWidthUp("sm", this.props.width)) inner = this.render_lg();
        else inner = this.render_sm(); 
        return (
            <AppBar style={{width: "100vw"}}>
                <Toolbar style={toolbStyle}>
                    {inner}
                </Toolbar>
            </AppBar>
        );
    }
}
export default withWidth()(withRouter(Bar));