package model

import (
	"webforget/server_go/app/shared/config"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func (u *User) SearchNotes(from, pageSize int, title, link string, tags []string) ([]Note, error) {
	session, err := mgo.Dial(config.C.DbConnString)
	if err != nil {
		return nil, err
	}
	defer session.Close()
	col := session.DB(config.C.DbName).C(notesCollection)
	ids, err := u.GetNotesByTags(tags)
	if err != nil {
		return nil, err
	}
	matchTags := make(map[uint64]bool)
	for _, v := range ids {
		matchTags[v] = true
	}
	searchQuery := bson.M{
		"id":    bson.M{"$lte": from},
		"title": bson.M{"$regex": title},
		"link":  bson.M{"$regex": link},
	}
	var res, result []Note
	err = col.Find(searchQuery).Sort("-id").All(&res)
	if err != nil {
		return nil, err
	}
	if len(tags) == 0 {
		return res[:min(pageSize, len(res))], nil
	}
	for _, v := range res {
		if len(result) >= pageSize {
			break
		}
		if matchTags[v.ID] {
			result = append(result, v)
		}
	}
	return result, nil
}
