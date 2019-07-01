package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"webforget/server_go/app/model"

	routing "github.com/jackwhelpton/fasthttp-routing"
)

type SearchData struct {
	Title  string   `json:"title"`
	Link   string   `json:"link"`
	DateMx string   `json:"date_mx"`
	DateMn string   `json:"date_mn"`
	Tags   []string `json:"tags"`
}

func Search(ctx *routing.Context) error {
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
	fr := ctx.Form("from")
	from, err := strconv.Atoi(fr)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	ps := ctx.Form("ps")
	pageSize, err := strconv.Atoi(ps)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	var searchData SearchData
	formBody := ctx.Request.Body()
	err = json.Unmarshal(formBody, &searchData)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	res, err := user.SearchNotes(from, pageSize, searchData.Title, searchData.Link, searchData.Tags)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	resBytes, err := json.Marshal(res)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	ctx.Write(resBytes)
	return nil
}
