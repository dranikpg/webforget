import React, { Props } from 'react';

import State from '../store/UserStore';

import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Collapse from '@material-ui/core/Paper';
import Paper from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import '../styles/auth.css'

const fullw = {
    width:'100%'
};

class Auth extends React.Component{

    constructor(props){
        super(props);
        this.llogin = this.upd_login.bind(this);
        this.state = {
            newacc: false, 
            valid: false,

            rq: false,
            err: false,

            t_nick: "",
            t_pw: "",
            t_email: ""
        }
    }

    componentDidMount(){
        State.c_auth(this.llogin);
        //State.login("email1","pw1");
    }

    componentWillUnmount(){
        State.c_rm_auth(this.llogin);
    }

    upd_login(){
        this.setState({
            ...this.state,
            err: !State.authed(),
            rq: false
        })
    }

    send(){
        if(this.state.newacc){
            State.create_account(this.state.t_nick,this.state.t_email, this.state.t_pw);
        }else{
            State.login(this.state.t_email, this.state.t_pw);
        }
        this.setState({
            ...this.state,
            rq: true
        })
    }

    render(){
        return (
            <Container maxWidth="xs">
                <Typography 
                    align="center"
                    variant="h3" 
                    className="auth-logo">
                    WEBFORGET
                </Typography>
                <Box display="block">
                    <TextField
                        error={this.state.err}
                        disabled={this.state.rq}
                        variant="outlined"
                        value={this.state.t_email}
                        style={fullw}

                        onChange={this.upd_email.bind(this)}

                        label="email"
                        id="email"
                        margin="normal"
                    /> 
                </Box>
                <Box display="block">
                    <TextField
                        error={this.state.err}
                        disabled={this.state.rq}
                        variant="outlined"
                        value={this.state.t_pw}
                        style={fullw}

                        onChange={this.upd_pw.bind(this)}

                        type="password"
                        label="password"
                        id="password"
                        margin="normal"
                    /> 
                </Box>
                
                {this.render_3row()}

            </Container>
        ); 
    }

    render_3row(){
        return (
            <React.Fragment>
                <TextField
                    fullWidth
                    disabled={this.state.rq}

                    variant="outlined"
                    label="Create new account"
                    placeholder="nickname"

                    value={this.state.t_nick}
                    onChange={this.upd_nick.bind(this)}

                    id="nick"
                    margin="normal"
                /> 
                <Button style={{marginTop:20}}
                    disabled={!this.state.valid || this.state.rq || this.state.err}
                    onClick={this.send.bind(this)} 
                    variant="outlined" color="secondary" size="large">
                    {this.g_btn_text()}
                </Button>
            </React.Fragment>);
    }

    g_btn_text(){
        if(this.state.newacc)return "Sing up";
        else return "Login";
    }

    upd_email(event){
        this.update(event.target.value, this.state.t_pw, this.state.t_nick);
    }

    upd_nick(event){
        this.update(this.state.t_email, this.state.t_pw, event.target.value);
    }
    
    upd_pw(event){
        this.update(this.state.t_email, event.target.value, this.state.t_nick);
    }

    update(email, pw, nick){
        let valid = true;
        valid &= email.length > 2;
        //valid &= email.includes("@");
        valid &= pw.length > /*4*/2;

        
        let nc = nick.length > 0;

        this.setState({
            ...this.state,

            valid: valid,
            newacc: nc,
            err: false,

            t_email: email,
            t_nick: nick,
            t_pw: pw
        })
    }

}

export default Auth;