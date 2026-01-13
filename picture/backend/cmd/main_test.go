package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"
)

func TestRun(t *testing.T) {}

func TestMain(m *testing.M) {
	fmt.Println("== Go HTTP Client Test ==")

	token := register()
	if token == "" {
		token = login()
	}

	getPictureList(token)

	os.Exit(m.Run())
	// 如果你有已存在的图片文件名，可以打开下面这行
	// downloadImage("test_100x100.jpg")
}

func register() string {
	fmt.Println("-> POST /register")

	body := map[string]string{
		"username": "client_test",
		"password": "123456",
	}

	data, _ := json.Marshal(body)

	resp, err := http.Post(
		"http://localhost:8080"+"/register",
		"application/json",
		bytes.NewReader(data),
	)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	b, _ := io.ReadAll(resp.Body)
	fmt.Println("response:", string(b))

	var res map[string]any
	_ = json.Unmarshal(b, &res)
	token, _ := res["token"].(string)
	return token
}

/* ---------------- login ---------------- */

func login() string {
	fmt.Println("-> POST /login")

	body := map[string]any{
		"username":       "client_test",
		"password":       "123456",
		"login_by_token": false,
	}

	data, _ := json.Marshal(body)

	resp, err := http.Post(
		"http://localhost:8080"+"/login",
		"application/json",
		bytes.NewReader(data),
	)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	b, _ := io.ReadAll(resp.Body)
	fmt.Println("response:", string(b))

	var res map[string]any
	_ = json.Unmarshal(b, &res)

	msg := res["msg"].(map[string]any)
	token := msg["token"].(string)
	return token
}

/* ---------------- protected/list ---------------- */

func getPictureList(token string) {
	fmt.Println("-> GET /protected/list")

	req, _ := http.NewRequest(
		http.MethodGet,
		"http://localhost:8080"+"/protected/list",
		nil,
	)
	req.Header.Set("Authorization", token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	b, _ := io.ReadAll(resp.Body)
	fmt.Println("response:", string(b))
}

/* ---------------- download (optional) ---------------- */

func downloadImage(filename string) {
	fmt.Println("-> GET /download")

	resp, err := http.Get(
		"http://localhost:8080" + "/download?filename=" + filename,
	)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	fmt.Println("download size:", len(data))
}
