import React from 'react';
import NoteStore from '../store/NoteStore';
import { dp_sync_start } from '../actions/func';
import { Container, Grid, Button, Typography, CircularProgress, LinearProgress, Divider } from '@material-ui/core';
import NoteLocalEntry from '../cp/list/NoteLocalEntry';

import axios from 'axios';
import { APIURL } from '../util';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';

const topgStyle = {
    padding: 10
};

class Sync extends React.Component{
    constructor(props){
        super();
        this.server = new Map;
        this.disabled = new Map;
        this.items = NoteStore.local_get();
        this.state = {
            loaded: false,
        }
        this.ids = [];
        for(let change of this.items){
            this.ids.push(change.id);
        }
    }
    componentDidMount(){
        this.load_server()
    }

    //load

    load_server(){
        this.query = true;

        let _self = this;
        axios.get(APIURL+"/ent/get_arr?arr="+this.ids.join(","), {withCredentials:true})
        .then((resp)=>{
            for(let entry of resp.data){
                _self.server[entry.id] = entry;
            }
            console.log(_self.server);
        })
        .finally(() => {
            _self.setState({..._self.state,loaded:true});
        });
    }

    get_caption_variant(){
        if (isWidthUp("sm", this.props.width)){
            return "h2";
        }else{
            return "heading1";
        }
    }

    upd_val(id, checked){
        if(checked) this.disabled.set(id,false);
        else this.disabled.set(id,true);
        console.log(this.disabled);
    }

    sync(){
        let idx = this.items.length-1;
        console.log(JSON.stringify(this.items), this.disabled);
        while(idx >= 0){
            let id = this.items[idx].id;
            console.log(id);
            if(this.disabled.get(id) == true) {
                console.log("splicing")
                this.items.splice(idx,1);
            }
            idx--;
        }
        console.log(JSON.stringify(this.items));
        dp_sync_start();
    }

    render(){
        let cs = [];
        for(let et of this.items){
            if(et.id==1)continue;
            let id = et.id;
            cs.push(<NoteLocalEntry local={et} server={this.server[id]} cb={this.upd_val.bind(this)} />);
            cs.push(<div><Divider style={{marginTop:"2em"}} variant="fullWidth" /> </div>)
        }
        return <Container>  
            <Grid container justify="space-between" alignItems="center" spacing={2}
                 style={topgStyle}>

                <Grid item>
                    <Typography variant={this.get_caption_variant()} textAlgin="center">Resolving conflicts</Typography>
                </Grid>

                <Grid item >
                    <Grid container justify="space-between" alignItems="center" spacing={2} >
                        {!this.state.loaded && <Grid item>
                            <LinearProgress/>
                            <Typography variant="body2">Loading server version...</Typography>
                        </Grid>}
                        <Grid item>
                            <Button onClick={this.sync.bind(this)} variant="outlined" size="large">SYNC</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {cs}
            
            </Container>
    }
}

export default withWidth()(Sync);