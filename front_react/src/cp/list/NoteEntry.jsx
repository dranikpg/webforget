import React from 'react';

import {Chip, Paper, Grid, Card, CardHeader, Button, CardActions, CardContent, Typography, CardActionArea } from "@material-ui/core";
import moment from 'moment';

import { Link } from 'react-router-dom';

const rootStyle = {
    marginBottom: '40px',
};

const chipdivStyle = {
    display: 'flex',
    flexWrap: 'wrap',
};

const chipStyle = {
    margin: '1px'
};

const descStyle = {
    paddingBottom: '2em'
};

export function render_tags(tags){
    let cs = [];
    for(var tk in tags){
        let tag = tags[tk];
        cs.push(
            <Chip
                style={chipStyle}
                variant="outlined"
                size="small"
                label={tag}
                /*onClick={handleClick}
                onDelete={handleDelete}*/
            />
        )
    }
    return <div style={chipdivStyle}> {cs} </div>;
}

class NoteEntry extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        let e = this.props.e;
        let llink = e.link;
        return (
            <Card style={rootStyle}>
                <CardActionArea>
                    <CardHeader
                        title={this.getTitle(e)}
                        subheader={this.getDate(e.date)}
                        onClick={()=>{
                            window.open(llink);
                        }}
                    />   
                </CardActionArea>
                <CardContent>
                    {e.descr.length > 0 && <Typography variant="body1"
                        style={descStyle}>
                        {e.descr}   
                    </Typography>}
                    <Grid container spacing={3}>
                        <Grid item>
                            <Button variant="outlined"
                                component={Link} to={"/edit/"+e.id}>
                                EDIT
                            </Button>
                        </Grid>
                        <Grid item>
                            {render_tags(e.tags)}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    }
    getwsite(url) {
        var hostname;
        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        return hostname;
    }
    
    getTitle(e){
        if(e.link === "")return e.title;
        else return e.title + "  (" + this.getwsite(e.link) + ")";
    }
    getDate(date){
        return moment(date, "YYYY-MM-DD").fromNow();
    }
}


export default NoteEntry;