package main

import (
	"backend/database"
	"backend/modal/picture"
	"backend/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRun(t *testing.T) {}

func TestMain(m *testing.M) {
	uploadTestFile()
	// fmt.Println("== Go HTTP Client Test ==")

	// token := register()
	// if token == "" {
	// 	token = login()
	// }

	// getPictureList(token)

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

func uploadTestFile() {
	// 初始化数据库连接

	testDir := "./img-test"
	uploadDir := "./uploads/img"

	// 确保上传目录存在
	err := os.MkdirAll(uploadDir, 0755)
	if err != nil {
		log.Fatal("Failed to create upload directory:", err)
	}

	// 遍历 img-test 目录中的所有图片文件
	err = filepath.Walk(testDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// 只处理文件，跳过目录
		if info.IsDir() {
			return nil
		}

		log.Println("Processing file:", path)
		// 检查是否为图片文件
		ext := strings.ToLower(filepath.Ext(path))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			return nil
		}

		fmt.Printf("Processing file: %s\n", path)

		// 计算文件哈希
		hash, err := hashFileByPath(path)
		if err != nil {
			log.Printf("Failed to hash file %s: %v", path, err)
			return nil // 继续处理其他文件
		}
		log.Println("Hash:", hash)

		// 检查图片是否已存在于数据库
		var existingPicture picture.Picture
		if database.DB.Where("hash = ?", hash).First(&existingPicture).Error == nil {
			log.Printf("Picture with hash %s already exists in database", hash)
			return nil // 继续处理其他文件
		}

		// 打开图片文件用于解码
		imgFile, err := os.Open(path)
		if err != nil {
			log.Printf("Failed to open file %s for image decoding: %v", path, err)
			return nil
		}
		defer imgFile.Close()

		// 根据文件扩展名解码图像
		var img image.Image
		switch ext {
		case ".png":
			img, err = png.Decode(imgFile)
		case ".jpg", ".jpeg":
			img, err = jpeg.Decode(imgFile)
		default:
			log.Printf("Unsupported image format: %s", ext)
			return nil
		}

		if err != nil {
			log.Printf("Failed to decode image %s: %v", path, err)
			return nil
		}

		// 获取文件名（不含扩展名）
		filenameWithoutExt := strings.TrimSuffix(info.Name(), filepath.Ext(info.Name()))

		// 生成缩略图
		pic_90x160 := utils.ResizeImage90x160(img)
		pic_9x16 := utils.ResizeImage9x16(img)

		// 保存原图和缩略图到上传目录，统一使用JPG格式
		originalDest := filepath.Join(uploadDir, filenameWithoutExt+".jpg")
		err = saveImageToFile(img, originalDest)
		if err != nil {
			log.Printf("Failed to save original image %s: %v", originalDest, err)
			return nil
		}

		thumb16x9Dest := filepath.Join(uploadDir, filenameWithoutExt+"_16x9.jpg")
		err = saveImageToFile(pic_90x160, thumb16x9Dest)
		if err != nil {
			log.Printf("Failed to save thumbnail 16x9 %s: %v", thumb16x9Dest, err)
			return nil
		}

		smallThumbDest := filepath.Join(uploadDir, filenameWithoutExt+"_160x90.jpg")
		err = saveImageToFile(pic_9x16, smallThumbDest)
		if err != nil {
			log.Printf("Failed to save thumbnail 160x90 %s: %v", smallThumbDest, err)
			return nil
		}

		// 创建图片记录并保存到数据库
		pictureRecord := picture.Picture{
			Name: filenameWithoutExt,
			Hash: hash,
		}
		result := database.DB.Create(&pictureRecord)
		if result.Error != nil {
			log.Printf("Failed to save picture record for %s: %v", path, result.Error)
			return nil
		}

		log.Printf("Successfully processed and saved %s with hash %s", path, hash)
		return nil
	})

	if err != nil {
		log.Fatal("Error walking through test directory:", err)
	}

	fmt.Println("Batch upload completed!")
}

// hashFileByPath 计算文件哈希值
func hashFileByPath(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 使用utils.HashFile计算哈希
	return utils.HashFile(file)
}

// saveImageToFile 将图像保存到指定文件
func saveImageToFile(img image.Image, destPath string) error {
	file, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer file.Close()

	return jpeg.Encode(file, img, &jpeg.Options{Quality: 90})
}
