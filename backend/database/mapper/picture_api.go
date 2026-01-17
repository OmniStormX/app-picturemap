package mapper

import (
	"backend/cache"
	"backend/database"
	"backend/modal/picture"
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

// GetPictureList 查询所有图片
func GetPictureList(page, pageSize uint) ([]picture.Picture, error) {
	var pics []picture.Picture
	var result string
	result, err := cache.CacheInstance.Client.Get(context.Background(), fmt.Sprintf(cache.PictureList, page, pageSize)).Result()
	if err != redis.Nil {
		err = json.Unmarshal([]byte(result), &pics)
		if err != nil {
			return nil, err
		} else {
			return pics, nil
		}

	}

	// 查询所有图片
	offset := (page - 1) * pageSize
	err = database.DB.Offset(int(offset)).Limit(int(pageSize)).Find(&pics).Error
	if err != nil {
		return nil, err
	}

	data, err := json.Marshal(pics)
	if err != nil {
		return nil, err
	}

	cache.CacheInstance.Client.Set(context.Background(),
		fmt.Sprintf(cache.PictureList,
			page,
			pageSize,
		),
		data,
		cache.CacheExpireTime)
	return pics, nil
}

func GetPictureByName(name string) (*picture.Picture, error) {
	var pic picture.Picture
	// 从缓存中查询
	var result string
	result, err := cache.CacheInstance.Client.Get(context.Background(), fmt.Sprintf(cache.GetPictureByName, name)).Result()
	if err != redis.Nil {
		err = json.Unmarshal([]byte(result), &pic)
		if err != nil {
			return nil, err
		}
		return &pic, nil
	}

	err = database.DB.Where("name = ?", name).First(&pic).Error
	if err != nil {
		return nil, err
	}
	// 缓存查询结果
	data, err := json.Marshal(pic)
	if err != nil {
		return nil, err
	}
	cache.CacheInstance.Client.Set(context.Background(),
		fmt.Sprintf(cache.GetPictureByName, name),
		data,
		cache.CacheExpireTime)
	return &pic, nil
}

func CreatePicture(pic *picture.Picture) error {
	// 从布隆过滤器里查找
	exists, err := cache.CacheInstance.Client.Do(context.Background(), "bf.exists", cache.BloomFilterPictureName, pic.Name).Result()
	if exists == 1 {
		return fmt.Errorf("picture name %s already exists", pic.Name)
	}

	err = database.DB.Create(&pic).Error
	if err != nil {
		return err
	}

	err = database.DB.Create(&pic).Error
	if err != nil {
		return err
	}
	cache.CacheInstance.Client.Do(context.Background(), "bf.add", cache.BloomFilterPictureName, pic.Name)
	return nil
}
