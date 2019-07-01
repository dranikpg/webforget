package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"webforget/server_go/app/model"

	routing "github.com/jackwhelpton/fasthttp-routing"
)

func TagsWithPref(ctx *routing.Context) error {
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
	pref := ctx.Form("search")
	max := ctx.Form("max")
	mx, err := strconv.Atoi(max)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	tags, err := user.GetTagsWithPrefix(pref, mx)
	if err != nil {
		log.Println(err)
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	if len(tags) == 0 {
		ctx.WriteString("[]")
		return nil
	}
	used := make(map[string]bool)
	for _, v := range tags {
		used[v] = true
	}
	var uniqueTags = make([]string, len(used))
	it := 0
	for k := range used {
		uniqueTags[it] = k
		it++
	}
	res, _ := json.Marshal(uniqueTags)
	ctx.Write(res)
	return nil
}
