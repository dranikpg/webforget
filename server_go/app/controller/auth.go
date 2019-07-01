package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
	"webforget/server_go/app/model"

	routing "github.com/jackwhelpton/fasthttp-routing"
	"github.com/valyala/fasthttp"
)

type UserInfo struct {
	Nick  string `json:"nick"`
	Email string `json:"email"`
	Pw    string `json:"pw"`
}

func Register(ctx *routing.Context) error {
	formBody := ctx.Request.Body()
	var userInfo UserInfo
	err := json.Unmarshal(formBody, &userInfo)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	if len(userInfo.Nick) < 2 || len(userInfo.Pw) < 2 || len(userInfo.Email) < 2 {
		ctx.WriteString("{\"err\":\"nick, email or pw not found\"}")
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	user, err := model.NewUser(userInfo.Nick, userInfo.Email, userInfo.Pw)
	if err != nil {
		if err.Error() != "email already used" {
			log.Println(err)
			ctx.SetStatusCode(http.StatusInternalServerError)
		} else {
			ctx.WriteString("{\"err\":\"email already used\"}")
			ctx.SetStatusCode(http.StatusBadRequest)
		}
		return nil
	}
	err = user.Auth(ctx)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		log.Println(err)
	}
	res, err := json.Marshal(user)
	if err != nil {
		log.Println(err)
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	ctx.SetStatusCode(http.StatusOK)
	ctx.Write(res)
	return nil
}

func Login(ctx *routing.Context) error {
	formBody := ctx.Request.Body()
	var userInfo UserInfo
	err := json.Unmarshal(formBody, &userInfo)
	if err != nil {
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	if len(userInfo.Pw) < 2 || len(userInfo.Email) < 2 {
		ctx.WriteString("{\"err\":\"nick, email or pw not found\"}")
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	user, err := model.Login(userInfo.Email, userInfo.Pw)
	if err != nil {
		if err.Error() == "wrong password" || err.Error() == "wrong email" {
			ctx.SetStatusCode(http.StatusBadRequest)
			ctx.WriteString("{\"err\":\"" + err.Error() + "\"}")
		} else {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		}
		return nil
	}
	err = user.Auth(ctx)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		log.Println(err)
	}
	res, err := json.Marshal(user)
	if err != nil {
		log.Println(err)
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	ctx.SetStatusCode(http.StatusOK)
	ctx.Write(res)
	return nil
}

func CheckLogin(ctx *routing.Context) error {
	authorized, err := model.IsRequestHeaderAuthorized(ctx.Request.Header)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		log.Println(err)
		return nil
	}
	if !authorized {
		ctx.SetStatusCode(http.StatusUnauthorized)
		return nil
	}
	user, err := model.GetUserByRequestHeader(ctx.Request.Header)
	if err != nil {
		if err.Error() == "not authorized" {
			ctx.SetStatusCode(http.StatusUnauthorized)
		} else {
			ctx.SetStatusCode(http.StatusInternalServerError)
			log.Println(err)
		}
		return nil
	}
	res, err := json.Marshal(user)
	if err != nil {
		log.Println(err)
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	ctx.Write(res)
	return nil
}

func Logout(ctx *routing.Context) error {
	authorized, err := model.IsRequestHeaderAuthorized(ctx.Request.Header)
	if err != nil {
		ctx.SetStatusCode(http.StatusInternalServerError)
		log.Println(err)
		return nil
	}
	if !authorized {
		ctx.SetStatusCode(http.StatusUnauthorized)
		return nil
	}
	ao, err := model.GetAuthObjByRequestHeader(ctx.Request.Header)
	if err != nil {
		log.Println(err)
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	err = ao.Delete()
	if err != nil {
		log.Println(err)
		ctx.SetStatusCode(http.StatusInternalServerError)
		return nil
	}
	cookie := fasthttp.Cookie{}
	cookie.SetDomain("localhost")
	cookie.SetPath("/")
	cookie.SetExpire(time.Now())
	cookie.SetHTTPOnly(true)
	cookie.SetValue("")
	cookie.SetSecure(true)
	cookie.SetKey("webforget-uid")
	ctx.Response.Header.SetCookie(&cookie)
	cookie.SetKey("webforget-token")
	ctx.Response.Header.SetCookie(&cookie)
	return nil
}
