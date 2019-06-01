from requests import *

s = Session()
url = "lol"

def init(u):
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

def notes_all():
	return s.get(url+"/ent/get")

def notes_create(title, desc, link, tags):
	data = {"title":title,"descr":desc,"link":link, "tags":tags}
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

#simple

def simple_login():
	auth_login("email1","pw1")
