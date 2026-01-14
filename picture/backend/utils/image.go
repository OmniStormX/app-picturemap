package utils

import (
	"image"
	"log"

	"github.com/disintegration/imaging"
)

func ResizeImage90x160(imageFile image.Image) image.Image {
	image_90x160 := imaging.Fill(imageFile, 90, 160, imaging.Center, imaging.Lanczos)
	return image_90x160
}

func ResizeImage9x16(imageFile image.Image) image.Image {
	image_9x16 := imaging.Fill(imageFile, 270, 480, imaging.Center, imaging.Lanczos)
	return image_9x16
}

func SaveImage(imageFile image.Image, path string) {
	err := imaging.Save(imageFile, path)
	if err != nil {
		log.Println("save image error:", err)
	}
}
