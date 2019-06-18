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

func Register(ctx *routing.Context) error {
	nick := ctx.PostForm("nick")
	pw := ctx.PostForm("pw")
	email := ctx.PostForm("email")
	if len(nick) < 1 || len(pw) < 1 || len(email) < 1 {
		ctx.WriteString("{\"err\":\"nick, email or pw not found\"}")
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	user, err := model.NewUser(nick, email, pw)
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
	ctx.SetStatusCode(http.StatusOK)
	return nil
}

func Login(ctx *routing.Context) error {
	pw := ctx.PostForm("pw")
	email := ctx.PostForm("email")
	if len(pw) < 1 || len(email) < 1 {
		ctx.WriteString("{\"err\":\"nick, email or pw not found\"}")
		ctx.SetStatusCode(http.StatusBadRequest)
		return nil
	}
	user, err := model.Login(email, pw)
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
	ctx.SetStatusCode(http.StatusOK)
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
	cookie.SetDomain("*")
	cookie.SetPath("/")
	cookie.SetExpire(time.Now())
	cookie.SetHTTPOnly(true)
	cookie.SetKey("webforget-uid")
	cookie.SetValue("")
	cookie.SetSecure(true)
	ctx.Response.Header.SetCookie(&cookie)
	cookie = fasthttp.Cookie{}
	cookie.SetDomain("*")
	cookie.SetPath("/")
	cookie.SetExpire(time.Now())
	cookie.SetHTTPOnly(true)
	cookie.SetKey("webforget-token")
	cookie.SetValue("")
	cookie.SetSecure(true)
	ctx.Response.Header.SetCookie(&cookie)
	return nil
}
