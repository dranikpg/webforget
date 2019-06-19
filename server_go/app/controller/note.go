package controller

import (
	"encoding/json"
	"net/http"

	routing "github.com/jackwhelpton/fasthttp-routing"
)

type NoteCreate struct {
	Title string
	Descr string
	Link  string
	Tags  []string
	Date  string
}

func CreateNote(ctx *routing.Context) error {
	formBody := ctx.Request.Body()
	var noteCreate NoteCreate
	err := json.Unmarshal(formBody, &noteCreate)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	//TODO create
	return nil
}
