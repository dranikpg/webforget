package model

import (
	"errors"
	"time"
	"webforget/server_go/app/shared/config"

	ai "github.com/night-codes/mgo-ai"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var notesCollection = "notes"

type Note struct {
	ID          uint64    `bson:"id" json:"id"`
	AuthorID    uint64    `bson:"author_id" json:"-"`
	Title       string    `bson:"title" json:"title"`
	Description string    `bson:"description" json:"descr"`
	Link        string    `bson:"link" json:"link"`
	Tags        []string  `bson:"tags" json:"tags"`
	Date        time.Time `bson:"date" json:"-"`
	StrDate     string    `bson:"-" json:"date"`
}

func (u *User) NewNote(title, description, link string, tags []string, date time.Time) (Note, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return Note{}, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(notesCollection)
	ai.Connect(session.DB(config.C.DbName).C("counters"))
	note := Note{ID: ai.Next(notesCollection), AuthorID: u.ID, Title: title, Description: description, Link: link, Tags: tags, Date: date}
	err = col.Insert(note)
	if err != nil {
		return Note{}, err
	}
	err = IndexTagsForNote(note.ID, note.Tags)
	if err != nil {
		return Note{}, err
	}
	return note, nil
}

func (u *User) GetNoteByID(id uint64) (Note, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return Note{}, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(notesCollection)
	var res Note
	err = col.Find(bson.M{"id": id, "author_id": u.ID}).One(&res)
	if err != nil {
		return Note{}, err
	}
	return res, err
}

func (u *User) GetPaged(fromNum, pageSize int) ([]Note, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return []Note{}, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(notesCollection)
	var res []Note
	_ = col.Find(bson.M{"author_id": u.ID, "id": bson.M{"$lte": fromNum}}).Sort("-id").Limit(pageSize).All(&res)
	return res, nil
}

func (u *User) UpdateNote(id uint64, title, descr, link string) error {
	note, err := u.GetNoteByID(id)
	if err != nil {
		return errors.New("note not found")
	}
	if len(title) > 0 {
		note.Title = title
	}
	if len(descr) > 0 {
		note.Description = descr
	}
	if len(link) > 0 {
		note.Link = link
	}
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(notesCollection)
	return col.Update(bson.M{"id": id}, note)
}

func (u *User) UpdateNoteTags(id uint64, tags []string) error {
	note, err := u.GetNoteByID(id)
	if err != nil {
		return errors.New("note not found")
	}
	note.Tags = tags
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(notesCollection)
	return col.Update(bson.M{"id": id}, note)
	//TODO reindex tag mapping
}

func (u *User) DeleteNote(id uint64) error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(notesCollection)
	return col.Remove(bson.M{"id": id, "author_id": u.ID})
}
