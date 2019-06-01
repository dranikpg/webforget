### Routes

/load -auth check while loading

/auth -auth

/settings -settings

/note/id - detailed note view

/ - search (default all)

### Stores

StateStore - state callback, user data

NoteStore - store notes

TagStore - store tags 

SettingsStore - store settings

### Load process
- LOAD : State store check network / try auth
- PROFILE_REQUEST 
- PROFILE_PRESENT(authed/local data present): route "/", start tagstore load
- SEND_MSG(sent msg to load):