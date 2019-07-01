package router

import (
	"webforget/server_go/app/controller"

	routing "github.com/jackwhelpton/fasthttp-routing"
	"github.com/jackwhelpton/fasthttp-routing/cors"
	"github.com/valyala/fasthttp"
)

func Start() {
	router := routing.New()
	options := cors.Options{
		AllowCredentials: true,
		AllowHeaders:     "*",
		AllowMethods:     "*",
		AllowOrigins:     "*",
	}
	router.Use(
		cors.Handler(options),
		//		access.Logger(log.Printf),
	)

	router.Post("/auth/create", controller.Register)
	router.Post("/auth/login", controller.Login)
	router.Get("/auth/auto", controller.CheckLogin)
	router.Get("/auth/logout", controller.Logout)

	router.Post("/ent/create", controller.CreateNote)
	router.Get("/ent/get", controller.GetPaged)
	router.Get("/ent/get/<id>", controller.GetNote)
	router.Get("/ent/get_arr", controller.GetNoteArray)
	router.Post("/ent/update/<id>", controller.UpdateNote)
	router.Post("/ent/update_tags/<id>", controller.UpdateNoteTags)
	router.Post("/ent/delete/<id>", controller.DeleteNote)

	router.Get("/tg/alike", controller.TagsWithPref)

	router.Post("/search", controller.Search)

	fasthttp.ListenAndServe(":8080", router.HandleRequest)
}
