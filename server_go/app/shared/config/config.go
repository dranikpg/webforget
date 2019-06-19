package config

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
)

type Config struct {
	DbConnString string `json:"db_conn_string,omitempty"`
	Port         int    `json:"port,omitempty"`
	DbName       string `json:"db_name,omitempty"`
}

var C Config

func Configure() {
	f, err := os.Open("config/config.json")
	if err != nil {
		log.Fatalln(err)
	}
	body, err := ioutil.ReadAll(f)
	if err != nil {
		log.Fatalln(err)
	}
	err = json.Unmarshal(body, &C)
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("App configured")
}
