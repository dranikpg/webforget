from requests import *

s = Session()
url = "lol"

def init(u):
	global url
	url = u

def auth_create(nick, email, pw):
	data = {"nick":nick,"email":email, "pw":pw}
	return s.post(url+"/auth/create",json=data)

def auth_login(email, pw):
	global url
	data = {"pw":pw,"email":email}
	return s.post(url+"/auth/login",json=data)

def note_create(title, desc, link, tags):
	data = {"title":title,"descr":desc,"link":link, "tags":tags}
	return s.post(url+"/ent/create", json=data)

def notes_all():
	return s.get(url+"/ent/get")

def notes_set_tags(id, tags):
	return s.post(url+"/ent/update_tags/"+str(id),
		json = tags)

def test_login():
	auth_login("email1","pw1")
