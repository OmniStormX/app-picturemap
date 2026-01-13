package utils

import (
	"image"

	"github.com/disintegration/imaging"
)

func ResizeImage16x9(imageFile image.Image) image.Image {
	image_10x10 := imaging.Resize(imageFile, 10, 10, imaging.Lanczos)
	return image_10x10
}

func ResizeImage160x90(imageFile image.Image) image.Image {
	image_100x100 := imaging.Resize(imageFile, 200, 200, imaging.Lanczos)
	return image_100x100
}

func SaveImage(imageFile image.Image, path string) {
	imaging.Save(imageFile, path)
}
