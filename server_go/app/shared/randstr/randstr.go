package randstr

import (
	"math/rand"
)

var alph = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

//Generate creates a random string of n size
func Generate(n int) string {
	var str string
	for i := 0; i < n; i++ {
		str += string(alph[rand.Intn(len(alph))])
	}
	return str
}
