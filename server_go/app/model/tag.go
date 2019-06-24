package model

import (
	"webforget/server_go/app/shared/config"

	ai "github.com/night-codes/mgo-ai"
	"gopkg.in/mgo.v2"
)

type TagMappingObj struct {
	ID     uint64 `bson:"id"`
	Tag    string `bson:"tag"`
	NoteID uint64 `bson:"note_id"`
}

var tagMappingCollection = "tagMapping"

//TODO authorid
func IndexTagsForNote(id uint64, tags []string) error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tagMappingCollection)
	ai.Connect(session.DB(config.C.DbName).C("counters"))
	var resErr error
	for _, v := range tags {
		tagMappingObj := TagMappingObj{ID: ai.Next(tagMappingCollection), Tag: v, NoteID: id}
		err := col.Insert(tagMappingObj)
		if err != nil {
			resErr = err
		}
	}
	return resErr
}
