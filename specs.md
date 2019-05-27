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
|Create Account| POST /auth/create {nick,pw,email} | {login_info}/{err} |
|Login         | POST /auth/login {email,pw}       | {login_info}/{err} |
|Auto login(cookies)| GET  /auth/auto | {login_info} / ERR |
|Logout|POST /auth/logout | NONE |
|__Entries__|||
|All|GET /ent/all|[entry_dto]|
|Get|GET /ent/get/id|entry_dto|
|Create|POST /ent/crt/id {req_fields, tag_rules:true/false} |{entry_dto}/FAIL|
|Update|POST /ent/upd/id {...fields}|OK/FAIL|
|Delete|POST /ent/dlt/id |OK/FAIL|
|__Tags__|||
|All|/tg/all|[{title,count}]|
|Prefix|/tg/prefix|[title]|
|Rename|/tg/upd/id|{title}|
|__DISCOVER__ V2|||
|By tag|GET /get/t/<tag>|[entry_dto]|
|By tags|POST /get/t {incl,excl}|[entry_dto]|
|Random| GET /get/r?<size>|[entry_dto]|
|__Tag rules__ V3|||
|All|GET /rls/get|[rule]|  
|Get|GET /rls/get/id|{rule}|
|Create|POST /rls/crt|{rule}/FAIL|
|Update|POST /rls/upd/id {active/struct} | OK/FAIL|
|Delete|POST /rls/dlt/id|OK/FAIL|
|__Suggestion__ V4|||
