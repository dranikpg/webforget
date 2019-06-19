package main

import (
	"runtime"
	"webforget/server_go/app/router"
	"webforget/server_go/app/shared/config"
)

func init() {
	runtime.GOMAXPROCS(runtime.NumCPU())
	config.Configure()
}

func main() {
	router.Start()
}
