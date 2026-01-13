package database

import (
	"backend/modal/picture"
)

// GetPictureList 查询所有图片
func GetPictureList(page, pageSize uint) ([]picture.Picture, error) {
	var pics []picture.Picture
	// 查询所有图片
	offset := (page - 1) * pageSize
	err := DB.Offset(int(offset)).Limit(int(pageSize)).Find(&pics).Error
	if err != nil {
		return nil, err
	}
	return pics, nil
}

func GetPictureByID(id uint) (*picture.Picture, error) {
	var pic picture.Picture
	err := DB.Where("id = ?", id).First(&pic).Error
	if err != nil {
		return nil, err
	}
	return &pic, nil
}

func GetPictureByName(name string) (*picture.Picture, error) {
	var pic picture.Picture
	err := DB.Where("name = ?", name).First(&pic).Error
	if err != nil {
		return nil, err
	}
	return &pic, nil
}

func CreatePicture(pic *picture.Picture) error {
	return DB.Create(&pic).Error
}
