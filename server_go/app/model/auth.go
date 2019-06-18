package model

import (
	"errors"
	"strconv"
	"sync"
	"time"
	"webforget/server_go/app/shared/config"
	"webforget/server_go/app/shared/passhash"
	"webforget/server_go/app/shared/randstr"

	routing "github.com/jackwhelpton/fasthttp-routing"
	ai "github.com/night-codes/mgo-ai"
	"github.com/valyala/fasthttp"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type User struct {
	ID       uint64 `json:"-" bson:"id"`
	Nick     string `json:"nick" bson:"nick"`
	Email    string `json:"email" bson:"email"`
	PassHash string `json:"-" bson:"pass_hash"`
}

var usersCollection = "users"
var tokensCollection = "tokens"
var mailCheckMutex *sync.Mutex
var tokenGenMutex *sync.Mutex
var tokenLength = 32

func init() {
	mailCheckMutex = new(sync.Mutex)
	tokenGenMutex = new(sync.Mutex)
}

func NewUser(nick, email, pw string) (User, error) {
	ph, err := passhash.HashString(pw)
	if err != nil {
		return User{}, err
	}
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return User{}, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(usersCollection)
	ai.Connect(session.DB(config.C.DbName).C("counters"))
	mailCheckMutex.Lock()
	defer mailCheckMutex.Unlock()
	cnt, err := col.Find(bson.M{"email": email}).Count()
	if err != nil {
		return User{}, err
	}
	if cnt > 0 {
		return User{}, errors.New("email already used")
	}
	user := User{ID: ai.Next(usersCollection), Nick: nick, Email: email, PassHash: ph}
	err = col.Insert(user)
	return user, err
}

func Login(email, pw string) (User, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return User{}, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(usersCollection)
	var user User
	err = col.Find(bson.M{"email": email}).One(&user)
	if err != nil {
		return User{}, errors.New("wrong email")
	}
	match := passhash.MatchString(user.PassHash, pw)
	if !match {
		return User{}, errors.New("wrong password")
	}
	return user, nil
}

type AuthObj struct {
	Token  string `json:"token"`
	UserID uint64 `json:"user_id"`
}

func (u User) Auth(ctx *routing.Context) error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tokensCollection)
	var token string
	tokenGenMutex.Lock()
	defer tokenGenMutex.Unlock()
	for {
		token = randstr.Generate(tokenLength)
		cnt, err := col.Find(bson.M{"token": token}).Count()
		if err != nil {
			return err
		}
		if cnt == 0 {
			break
		}
	}
	ao := AuthObj{Token: token, UserID: u.ID}
	err = col.Insert(ao)
	if err != nil {
		return err
	}
	cookie := fasthttp.Cookie{}
	cookie.SetDomain("*")
	cookie.SetPath("/")
	cookie.SetExpire(time.Now().Add(time.Hour * 24 * 365))
	cookie.SetHTTPOnly(true)
	cookie.SetKey("webforget-uid")
	cookie.SetValue(strconv.FormatUint(u.ID, 10))
	cookie.SetSecure(true)
	ctx.Response.Header.SetCookie(&cookie)
	cookie = fasthttp.Cookie{}
	cookie.SetDomain("*")
	cookie.SetPath("/")
	cookie.SetExpire(time.Now().Add(time.Hour * 24 * 365))
	cookie.SetHTTPOnly(true)
	cookie.SetKey("webforget-token")
	cookie.SetValue(token)
	cookie.SetSecure(true)
	ctx.Response.Header.SetCookie(&cookie)
	return nil
}

func IsAuthorized(token string, id uint64) (bool, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return false, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tokensCollection)
	var ao AuthObj
	err = col.Find(bson.M{"token": token}).One(&ao)
	if err != nil {
		return false, err
	}
	return (ao.UserID == id), nil
}

func IsRequestHeaderAuthorized(h fasthttp.RequestHeader) (bool, error) {
	uid := string(h.Cookie("webforget-uid"))
	token := string(h.Cookie("webforget-token"))
	id, err := strconv.ParseUint(uid, 10, 64)
	if err != nil {
		return false, err
	}
	return IsAuthorized(token, id)
}

func (a AuthObj) Delete() error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tokensCollection)
	return col.Remove(bson.M{"token": a.Token})
}

func GetUserByID(id uint64) (User, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return User{}, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(usersCollection)
	var user User
	err = col.Find(bson.M{"id": id}).One(&user)
	if err != nil {
		return User{}, err
	}
	return user, nil
}

func GetAuthObjByRequestHeader(h fasthttp.RequestHeader) (AuthObj, error) {
	uid := string(h.Cookie("webforget-uid"))
	token := string(h.Cookie("webforget-token"))
	id, err := strconv.ParseUint(uid, 10, 64)
	if err != nil {
		return AuthObj{}, err
	}
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return AuthObj{}, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tokensCollection)
	var ao AuthObj
	err = col.Find(bson.M{"id": id, "token": token}).One(&ao)
	if err != nil {
		return AuthObj{}, err
	}
	return ao, nil
}

func GetUserByRequestHeader(h fasthttp.RequestHeader) (User, error) {
	auth, err := IsRequestHeaderAuthorized(h)
	if err != nil {
		return User{}, err
	}
	if !auth {
		return User{}, errors.New("not authorized")
	}
	uid := string(h.Cookie("webforget-uid"))
	id, _ := strconv.ParseUint(uid, 10, 64)
	user, err := GetUserByID(id)
	if err != nil {
		return User{}, err
	}
	return user, nil
}
