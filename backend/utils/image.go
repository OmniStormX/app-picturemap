package utils

import (
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/chai2010/webp"

	"github.com/disintegration/imaging"
	"golang.org/x/image/tiff"
)

var (
	Maxwidth  = 1400
	MaxHeight = 2800
)

func ResizeImage(imageFile image.Image, maxWidth, maxHeight int) image.Image {
	w := imageFile.Bounds().Max.X
	h := imageFile.Bounds().Max.Y
	if w < maxWidth && h < maxHeight {
		return imageFile
	}
	ratio := float64(w) / float64(h)
	if ratio > float64(maxWidth)/float64(maxHeight) {
		w = maxWidth
		h = int(float64(maxWidth) / ratio)
	} else {
		w = int(float64(maxHeight) * ratio)
		h = maxHeight
	}
	return imaging.Resize(imageFile, w, h, imaging.Lanczos)
}

func ResizeImage90x160(imageFile image.Image) image.Image {
	image_90x160 := imaging.Fill(imageFile, 90, 160, imaging.Center, imaging.Lanczos)
	return image_90x160
}

func ResizeImage9x16(imageFile image.Image) image.Image {
	image_9x16 := imaging.Fill(imageFile, 9, 16, imaging.Center, imaging.Lanczos)
	return image_9x16
}

func SaveImage(imageFile image.Image, path string) error {
	// 确保目录存在
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Println("create directory error:", err)
		return err
	}

	ext := strings.ToLower(filepath.Ext(path))

	// 确保图像转换为兼容格式
	img := imaging.Clone(imageFile) // 克隆图像以确保兼容性

	out, err := os.Create(path)
	if err != nil {
		log.Println("create file error:", err)
		return err
	}
	defer out.Close()

	var encodeErr error
	switch ext {
	case ".jpg", ".jpeg":
		encodeErr = jpeg.Encode(out, img, &jpeg.Options{Quality: 90})
	case ".png":
		encodeErr = png.Encode(out, img)
	case ".webp":
		options := &webp.Options{
			Lossless: false,
			Quality:  90, // Quality 是 float32 类型
		}
		encodeErr = webp.Encode(out, img, options)
	case ".gif":
		encodeErr = gif.Encode(out, img, nil)
	case ".tiff", ".tif":
		encodeErr = tiff.Encode(out, img, nil)
	default:
		// 默认使用JPEG格式
		encodeErr = jpeg.Encode(out, img, &jpeg.Options{Quality: 90})
	}

	if encodeErr != nil {
		log.Println("save image error:", encodeErr)
		return encodeErr
	}

	return nil
}
