import React from 'react';
import NoteStore from '../store/NoteStore';
import { copy_note, fresh_note } from '../util';
import { Container, TextField, Box, Grid, Button, Paper } from '@material-ui/core';

import TagEdit from '../cp/edit/TagEdit';
import { dp_note_delete, dp_note_create, dp_note_update } from '../actions/func';

const btnpStyle = {
    marginTop: 30
};

class Edit extends React.Component{
    constructor(props){
        super(props);
        this.state = {loading:true,obj: undefined};
    }
    componentDidMount(){
        this.id = this.props.match.params.id;
        if(this.id == null) this.load_new();
        else this.load_edit();
    }
    //
    load_edit(){
        this.setState({
            loading: true,
            obj: undefined
        });
        NoteStore.get_one(this.id,this.note_loaded.bind(this));
    }
    load_new(){
        this.setState({
            loading: false,
            obj: fresh_note()
        });
    }
    note_loaded(note){
        console.log(note);
        this.orig = note;
        let copy = {};
        copy_note(this.orig, copy)
    
        this.setState({
            loading: false,
            obj: copy,
        });
    }
    //

    render_loading(){
        return <p>Loading</p>;
    }

    render_nf(){
        return <p>Not found</p>;
    }

    render() {
        if(this.state.loading)return this.render_loading();
        else if(this.state.obj == null)return this.render_nf();
        else {
            let obj = this.state.obj;
            return (
                <Container maxWidth="sm" >
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={obj.title}  onChange={this.upd_title.bind(this)}
                        label="Title" id="title"
                        margin="normal" 
                    /> 
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={obj.link}  onChange={this.upd_link.bind(this)}
                        label="Link" id="link"
                        margin="normal" 
                        /> 
                    <TextField
                        multiline
                        rowsMax="10"
                        fullWidth
                        variant="outlined"
                        value={obj.descr}  onChange={this.upd_descr.bind(this)}
                        label="Description" id="descr"
                        margin="normal" 
                        /> 
                    <Box display="block">
                        <TagEdit val={obj.tags}/>
                    </Box>
                    <Paper style={btnpStyle}>
                        <Grid container
                        direction="row"
                        justify="space-between">
                                <Button onClick={this.a_cancel.bind(this)}>CANCEL</Button>
                                {this.orig!=undefined && <Button onClick={this.a_delete.bind(this)}>DELETE</Button>}
                                <Button onClick={this.a_apply.bind(this)} color="secondary">APPLY</Button>
                        </Grid>
                    </Paper>
                </Container>
        );
        }
    }

    a_cancel(){
        let h = this.props.history;
        if(h.length == 0){
            h.push("/");
        }else{
            h.goBack();
        }
    }

    a_delete(){
        dp_note_delete(this.orig.id);
        this.a_cancel();
    }

    a_apply(){
        if(this.orig == undefined){
            dp_note_create(this.state.obj);
        }else{
            copy_note(this.state.obj, this.orig);
            dp_note_update(this.orig);
        }
        this.a_cancel();
    }

    upd_title(event){
        this.state.obj.title = event.target.value;
        this.setState({...this.state});
    }
    upd_link(event){
        this.state.obj.link = event.target.value;
        this.setState({...this.state});
    }
    upd_descr(event){
        this.state.obj.descr = event.target.value;
        this.setState({...this.state});
    }

    //
}

export default Edit;