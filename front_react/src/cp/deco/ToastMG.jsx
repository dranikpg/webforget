import React from 'react';
import MessageStore from '../../store/MessageStore';
import { Snackbar, Button, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

class ToastMG extends React.Component{
    constructor(props){
        super(props);
        this.state={open:false, msg: undefined};
    }

    componentDidMount(){
        this.lst = ()=>{
            this.setState({open:true,msg:MessageStore.msg()})
        };
        MessageStore.c_msg(this.lst);
    }
    componentWillUnmount(){
        MessageStore.c_rm_msg(this.lst);
    }

    handle_close(){
        this.setState({...this.state,open:false});
    }
    handle_action(){
        this.state.msg.action.cb();
        this.handle_close();
    }   

    render(){
        if(!this.state.msg)return null;
        let msg = this.state.msg;
        return  (
        <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.open}
            autoHideDuration={msg.timeout}
            onClose={this.handle_close.bind(this)}
            message={<span id="message-id">{msg.msg}</span>}
            action={[
              this.render_actions(),
              <IconButton
                key="close"
                color="inherit"
                onClick={this.handle_close.bind(this)}
              >
                <CloseIcon />
              </IconButton>,
            ]}
        />);
    }

    render_actions(){
        let msg = this.state.msg;
        if(!msg.action)return null;
        else{
            return <Button key="undo" color="secondary" size="small" onClick={this.handle_action.bind(this)}>
                    {msg.action.msg}
                   </Button>
        }
    }
}

export default ToastMG;