package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"webforget/server_go/app/model"
	"webforget/server_go/app/shared/date"

	routing "github.com/jackwhelpton/fasthttp-routing"
)

type NoteCreate struct {
	Title string   `json:"title"`
	Descr string   `json:"descr"`
	Link  string   `json:"link"`
	Tags  []string `json:"tags"`
	Date  string   `json:"date"`
}

func CreateNote(ctx *routing.Context) error {
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() != "not authorized" {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		} else {
			ctx.SetStatusCode(http.StatusUnauthorized)
		}
		return nil
	}
	formBody := ctx.Request.Body()
	var noteCreate NoteCreate
	err = json.Unmarshal(formBody, &noteCreate)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	if len(noteCreate.Date) < 1 {
		noteCreate.Date = date.ToString(date.CurDate())
		return nil
	}
	if len(noteCreate.Title) < 2 || len(noteCreate.Link) < 2 || len(noteCreate.Descr) < 2 {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	nativeDate, err := date.FromString(noteCreate.Date)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	note, err := user.NewNote(noteCreate.Title, noteCreate.Descr, noteCreate.Link, noteCreate.Tags, nativeDate)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		log.Println(err)
		return nil
	}
	ctx.SetStatusCode(http.StatusOK)
	ctx.Write(note.ID)
	return nil
}

func GetNote(ctx *routing.Context) error {
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() != "not authorized" {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		} else {
			ctx.SetStatusCode(http.StatusUnauthorized)
		}
		return nil
	}
	noteID := ctx.Param("id")
	id, err := strconv.ParseUint(noteID, 10, 64)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	note, err := user.GetNoteByID(id)
	if err != nil {
		ctx.SetStatusCode(http.StatusNotFound)
		return nil
	}
	note.StrDate = date.ToString(note.Date)
	res, err := json.Marshal(note)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	ctx.Write(res)
	return nil
}

func GetPaged(ctx *routing.Context) error {
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() != "not authorized" {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		} else {
			ctx.SetStatusCode(http.StatusUnauthorized)
		}
		return nil
	}
	from := ctx.Form("from")
	ps := ctx.Form("ps")
	fromNum, err := strconv.Atoi(from)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	pageSize, err := strconv.Atoi(ps)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	notes, err := user.GetPaged(fromNum, pageSize)
	if err != nil {
		ctx.WriteString("[]")
		return nil
	}
	for i := range notes {
		notes[i].StrDate = date.ToString(notes[i].Date)
	}
	res, err := json.Marshal(notes)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		log.Println(err)
		return nil
	}
	ctx.Write(res)
	return nil
}

func GetNoteArray(ctx *routing.Context) error {
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() != "not authorized" {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		} else {
			ctx.SetStatusCode(http.StatusUnauthorized)
		}
		return nil
	}
	var arr []uint64
	stringArr := strings.Split(ctx.Form("arr"), ",")
	arr = make([]uint64, len(stringArr))
	for idx := range stringArr {
		arr[idx], err = strconv.ParseUint(stringArr[idx], 10, 64)
		if err != nil {
			ctx.SetStatusCode(http.StatusBadRequest)
			return nil
		}
	}
	var res = make([]model.Note, len(arr))
	for idx := range arr {
		res[idx], err = user.GetNoteByID(arr[idx])
		if err != nil {
			ctx.SetStatusCode(http.StatusNotFound)
			return nil
		}
	}
	resBytes, err := json.Marshal(res)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		log.Println(err)
		return nil
	}
	ctx.Write(resBytes)
	return nil
}

func UpdateNote(ctx *routing.Context) error {
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() != "not authorized" {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		} else {
			ctx.SetStatusCode(http.StatusUnauthorized)
		}
		return nil
	}
	formBody := ctx.Request.Body()
	var noteUpdate NoteCreate
	err = json.Unmarshal(formBody, &noteUpdate)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	noteID := ctx.Param("id")
	id, err := strconv.ParseUint(noteID, 10, 64)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	err = user.UpdateNote(id, noteUpdate.Title, noteUpdate.Descr, noteUpdate.Link)
	if err != nil {
		if err.Error() == "note not found" {
			ctx.SetStatusCode(http.StatusNotFound)
		} else {
			ctx.SetStatusCode(http.StatusInternalServerError)
		}
		return nil
	}
	ctx.SetStatusCode(http.StatusOK)
	return nil
}

func UpdateNoteTags(ctx *routing.Context) error {
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() != "not authorized" {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		} else {
			ctx.SetStatusCode(http.StatusUnauthorized)
		}
		return nil
	}
	formBody := ctx.Request.Body()
	var tags []string
	err = json.Unmarshal(formBody, &tags)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	noteID := ctx.Param("id")
	id, err := strconv.ParseUint(noteID, 10, 64)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	err = user.UpdateNoteTags(id, tags)
	if err != nil {
		if err.Error() == "note not found" {
			ctx.SetStatusCode(http.StatusNotFound)
		} else {
			log.Println(err)
			ctx.SetStatusCode(http.StatusInternalServerError)
		}
		return nil
	}
	ctx.SetStatusCode(http.StatusOK)
	return nil
}

func DeleteNote(ctx *routing.Context) error {
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() != "not authorized" {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		} else {
			ctx.SetStatusCode(http.StatusUnauthorized)
		}
		return nil
	}
	noteID := ctx.Param("id")
	id, err := strconv.ParseUint(noteID, 10, 64)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	err = user.DeleteNote(id)
	if err != nil {
		if err.Error() == "note not found" {
			ctx.SetStatusCode(http.StatusNotFound)
		} else {
			ctx.SetStatusCode(http.StatusInternalServerError)
		}
		return nil
	}
	ctx.SetStatusCode(http.StatusOK)
	return nil
}
