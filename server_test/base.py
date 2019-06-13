from requests import *

s = Session()
url = "lol"

def init(u="http://localhost:8000"):
	global url
	url = u

#auth

def auth_create(nick, email, pw):
	data = {"nick":nick,"email":email, "pw":pw}
	return s.post(url+"/auth/create",json=data)

def auth_login(email, pw):
	global url
	data = {"pw":pw,"email":email}
	return s.post(url+"/auth/login",json=data)

#notes

def notes_all(page, ps=10):
	return s.get(url+"/ent/get?page="+str(page)+"&ps="+str(ps))

def notes_create(title, desc, link, tags, date=None):
	data = {"title":title,"descr":desc,"link":link, "tags":tags}
	if(date != None):
		data["date"] = date;
	return s.post(url+"/ent/create", json=data)

def notes_update_tags(id, tags):
	return s.post(url+"/ent/update_tags/"+str(id),
		json = tags)

def notes_update(id, title=None, descr=None, link=None):
	data = {}
	if (title != None):
		data["title"] = title
	if(descr != None):
		data["descr"] = descr
	if(link != None):
		data["link"] = link
	return s.post(url+"/ent/update/"+str(id),json=data)

#tags

def tags_all():
	return s.get(url+"/tg/all")

def tags_list():
	return s.get(url+"/tg/list")

#search

def search(title=None,tags=None,page=1,ps=10):
	data = {}
	if(title != None):
		data["title"] = title
	if(tags != None):
		data["tags"] = tags
	return s.post(url+"/search?page="+str(page)+"&ps="+str(ps),
		json=data)
#simple

def simple_login():
	auth_login("email1","pw1")

