
## SERVER

NoteDTO = {id, title, descr, link, tags: string[], date:"YYYY-MM-DD"}

NoteCreateDTO = {title,descr,link,tags,date? DEFAULT CURDAY}

NoteUpdateDTO = {...any NoteCreateDTO fields except date}

UserInfo = {nick, email}

err = http code 400-599

|Name|Link|Return|Info|
|:-: |:-: |:-:   |:-:|
|__Auth__|||
|Create Account| POST /auth/create {nick,pw,email} | UserInfo / err | err = email already used|
|Login         | POST /auth/login {email,pw}       | UserInfo / err | err = wrong email or pw|
|Check login| GET  /auth/auto | UserInfo / err |
|Logout|POST /auth/logout |  |
|__Entries__|||
|Get paged|GET /ent/get?page&ps|[NoteDTO]|ps = pagesize. Empty set in case of page overflow|
|Get one|GET /ent/get/id|NoteDto|
|Get array| GET /ent/get_arr?arr|[NoteDTO]| arr=id1,id2,id3...
|Create|POST /ent/create NoteCreateDto | ID /err |
|Update|POST /ent/update/id {...fields}| OK / err|
|Update tags|POST /ent/update_tags/id [tags]| OK / err|
|Delete|POST /ent/delete/id | OK / err|
|__Tags__|||
|All|GET /tg/all|[{title,count}]|
|List|GET /tg/list|[title]|
|Alike| GET /tg/alike?pref&max| [title] |
|__Search__ V2||
|Search|POST /search?page&ps {title?,link?,date_mx?,date_mn?,tags?}|[NoteDTO]| ps = pagesize. Empty set in case of page overflow|
