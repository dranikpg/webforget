import React from 'react';
import AppBar from '@material-ui/core/AppBar';

import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { Button } from '@material-ui/core';
import SearchBar from './SearchBar';

const toolbStyle = {paddingLeft: "5vw", paddingRight:"10vw" };
const typoStyle = {paddingRight: "5vw"};
const searchDivStyle = {flexGrow:1, textAlign: "center"};

class Bar extends React.Component{
    render(){
        return (
            <AppBar style={{width: "100vw"}}>
                <Toolbar style={toolbStyle}>
                    <Typography style={typoStyle} variant="h5">
                        Webforget
                    </Typography>
                    <Button variant="outlined" color="inherit">
                        ADD NOTE
                    </Button>
                    <div style={searchDivStyle}>
                        <SearchBar/>
                    </div>
                </Toolbar>
            </AppBar>
        );
    }
}
export default Bar;