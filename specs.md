### Schema
##### Mysql
users: VARCHAR nick, VARCHAR pw, VARCHAR email

notes: VARCHAR title, VARCHAR link, VARCHAR desc

tags: VARCHAR title, user_id, 

tag_match: note_id, tag_id

token impl depends on backend

## Server
login_info={nick}

entry_dto={}

rule={}

|Name|Link|Return|
|:-: |:-: |:-:   |
|__Auth__|||
|Create Account| POST /auth/create {nick,pw,email} | {login_info}/EC |
|Login         | POST /auth/login {email,pw}       | {login_info}/EC |
|Auto login(cookies)| GET  /auth/auto | {login_info} / EC |
|Logout|POST /auth/logout | NONE |
|__Entries__|||
|All|GET /ent/get?page&ps|[entry_dto, entry_count]|
|Get|GET /ent/get/id |entry_dto|
|Create|POST /ent/crt/id {req_fields} |{entry_dto}/EC|
|Update|POST /ent/update/id {...fields}|OK/FAIL|
|Update Tags|POST /ent/update_tags/id {...fields}|OK/FAIL|
|Delete|POST /ent/delete?id |OK/FAIL|
|__Tags__|||
|All|/tg/all|[{title,count}]|
|__Search__ V2|||
|__Tag rules__ V3|||
|__Suggestion__ V4|||
