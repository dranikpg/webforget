package model

import (
	"webforget/server_go/app/shared/config"

	ai "github.com/night-codes/mgo-ai"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type TagMappingObj struct {
	ID       uint64 `bson:"id"`
	AuthorID uint64 `bson:"author_id"`
	Tag      string `bson:"tag"`
	NoteID   uint64 `bson:"note_id"`
}

type Tag struct {
	ID       uint64 `bson:"id"`
	Tag      string `bson:"tag"`
	AuthorID uint64 `bson:"author_id"`
}

var tagMappingCollection = "tagMapping"
var tagsCollection = "tags"

func (u User) IndexTagsForNote(id uint64, tags []string) error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tagMappingCollection)
	ai.Connect(session.DB(config.C.DbName).C("counters"))
	var resErr error
	for _, v := range tags {
		tagMappingObj := TagMappingObj{ID: ai.Next(tagMappingCollection), Tag: v, NoteID: id, AuthorID: u.ID}
		err := col.Insert(tagMappingObj)
		if err != nil {
			resErr = err
		}
	}
	return resErr
}

func (u User) RemoveTagsForNote(id uint64, tags []string) error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tagMappingCollection)
	var resErr error
	for _, v := range tags {
		err := col.Remove(bson.M{"author_id": u.ID, "note_id": id, "tag": v})
		if err != nil {
			resErr = err
		}
	}
	return resErr
}

func (u User) GetNotesByTags(tags []string) ([]uint64, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return nil, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tagMappingCollection)
	tagsInNote := make(map[uint64]int)
	for _, v := range tags {
		var res []TagMappingObj
		err = col.Find(bson.M{"author_id": u.ID, "tag": v}).All(&res)
		if err != nil {
			return nil, err
		}
		for _, val := range res {
			tagsInNote[val.NoteID]++
		}
	}
	var result []uint64
	for k, v := range tagsInNote {
		if len(tags) == v {
			result = append(result, k)
		}
	}
	return result, nil
}

func (u User) IndexTags(tags []string) error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tagsCollection)
	ai.Connect(session.DB(config.C.DbName).C("counters"))
	var resErr error
	for _, v := range tags {
		tag := Tag{ID: ai.Next(tagsCollection), Tag: v, AuthorID: u.ID}
		err := col.Insert(tag)
		if err != nil {
			resErr = err
		}
	}
	return resErr
}

func (u User) GetTagsWithPrefix(pref string, mx int) ([]string, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return nil, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tagsCollection)
	var res []Tag
	err = col.Find(bson.M{"author_id": u.ID, "tag": bson.M{"$regex": "^" + pref}}).Limit(mx).All(&res)
	resTags := make([]string, len(res))
	for i := range res {
		resTags[i] = res[i].Tag
	}
	return resTags, err
}

func (u User) RemoveTags(tags []string) error {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(tagsCollection)
	var resErr error
	for _, v := range tags {
		err := col.Remove(bson.M{"author_id": u.ID, "tag": v})
		if err != nil {
			resErr = err
		}
	}
	return resErr
}
