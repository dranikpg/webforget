package date

import (
	"errors"
	"strconv"
	"time"
)

//FromString converts YYYY-MM-DD string to time.Time
func FromString(s string) (time.Time, error) {
	if len(s) != 10 {
		return time.Time{}, errors.New("wrong format")
	}
	year := s[:4]
	month := s[5:7]
	day := s[8:]
	y, err := strconv.Atoi(year)
	if err != nil {
		return time.Time{}, errors.New("wrong format")
	}
	m, err := strconv.Atoi(month)
	if err != nil {
		return time.Time{}, errors.New("wrong format")
	}
	d, err := strconv.Atoi(day)
	if err != nil {
		return time.Time{}, errors.New("wrong format")
	}
	if m < 1 || m > 12 {
		return time.Time{}, errors.New("wrong format")
	}
	loc, _ := time.LoadLocation("")
	res := time.Date(y, time.Month(m), d, 0, 0, 0, 0, loc)
	return res, nil
}

func CurDate() time.Time {
	loc, _ := time.LoadLocation("")
	return time.Now().In(loc)
}

//ToString converts time.Time to YYYY-MM-DD string
func ToString(t time.Time) string {
	y := strconv.Itoa(t.Year())
	m := strconv.Itoa(int(t.Month()))
	d := strconv.Itoa(t.Day())
	for len(y) < 4 {
		y = "0" + y
	}
	for len(m) < 2 {
		m = "0" + m
	}
	for len(d) < 2 {
		d = "0" + d
	}
	return y + "-" + m + "-" + d
}
