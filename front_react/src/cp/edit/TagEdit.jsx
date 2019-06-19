import React from 'react';
import { Box, Chip, Paper, TextField, Grid, Button, Typography, Popper, Tab, List, ListItem, ListItemText} from '@material-ui/core';
import { dp_tags_search } from '../../actions/func';
import TagStore from '../../store/TagStore';


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
        this.state = {
            items:props.val, 
            txt: "",
            sugg:[],
            anchor:undefined
        };
    }
    componentDidMount(){
        this.lst = ()=>{
            this.setState({
                ...this.state,
                sugg: TagStore.get(),
            });
        }
        TagStore.c_sugg(this.lst);
    }

    componentWillUnmount(){
        TagStore.c_rm_sugg(this.lst);
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
        let ntxt = ev.target.value;
        if(ntxt == ""){
            dp_tags_search("");
        }else{
            setTimeout(()=>{
                if(ntxt == this.state.txt) dp_tags_search(ntxt);
            },300); 
        }
        
        this.setState({
            ...this.state,
            txt: ntxt,
            anchor:ev.target
        });
    }

    add_tag(){
        let txt = this.state.txt;
        if(txt.length == 0)return;
        if(!this.state.items.includes(txt)){
            this.state.items.push(txt);
            this.state.items.sort();
            this.notify_cb();
        }
        this.setState({...this.state,txt:"", sugg:[]});
    }

    add_auto(txt){
        if(!this.state.items.includes(txt)){
            this.state.items.push(txt);
            this.state.items.sort();
            this.notify_cb();
        }
        this.setState({...this.state,txt:"", sugg:[]});
    }

    notify_cb(){
        if(this.props.cb != undefined)this.props.cb();
    }


    render() {
        let sugg = [];
        if(this.state.txt.length > 0){
            let rsugg = this.state.sugg;
            for(var sg of rsugg){
                sugg.push(
                    <ListItem button onClick={()=>{
                        this.add_auto(sg);
                    }}>
                        <ListItemText primary={sg}/>
                    </ListItem>);
            }
        }
        return (
            <Paper style={paperStyle}>
                <Typography variant="caption">
                    Click do delete
                </Typography>
                <div style={chiprootStyle}>
                    {this.getChips()}
                </div>
                {this.props.dialog && this.render_sugg_dialog(sugg)}
                {!this.props.dialog && this.render_sugg(sugg)} 
            </Paper>
        );
    }

    render_sugg(sugg){
        return  (<Grid container
                direction="row"
                justify="space-between"
                alignItems="baseline">
                <TextField
                    autoComplete="off"
                    margin="normal"
                    label="Add tag"
                    id="add-tag"
                    value={this.state.txt}
                    onKeyPress={this.field_catch.bind(this)}
                    onChange={this.upd_text.bind(this)}
                /> 
                <Popper open={this.state.anchor != undefined && sugg.length > 0} 
                        anchorEl={this.state.anchor}
                        placement="bottom-start">
                    <Paper>
                        <List dense>
                            {sugg}
                        </List>
                    </Paper>
                </Popper>

                <Button variant="outlined" size="small"
                    onClick={this.add_tag.bind(this)}>Add</Button>
        </Grid>);
    }

    render_sugg_dialog(sugg){
        return  (<Grid container
            direction="row"
            justify="space-between"
            alignItems="baseline">
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="baseline">
                <TextField
                    autoComplete="off"
                    margin="normal"
                    label="Add tag"
                    id="add-tag"
                    value={this.state.txt}
                    onKeyPress={this.field_catch.bind(this)}
                    onChange={this.upd_text.bind(this)}
                /> 

                <Button variant="outlined" size="small"
                    onClick={this.add_tag.bind(this)}>
                        Add
                </Button>
            </Grid>
            <List dense>
                {sugg}
            </List>
        </Grid>);
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