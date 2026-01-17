package mapper

import (
	"backend/cache"
	"backend/database"
	"backend/modal/picture"
	"backend/modal/tag"
	"context"
	"fmt"
	"log"
	"strconv"
)

// 根据标签名称查询标签
func FindByTag(tagName string) ([]tag.Tag, error) {

	var t []tag.Tag

	cacheResult, err := cache.CacheInstance.Client.HGet(context.Background(), cache.TagListHash, tagName).Result()
	if err == nil {
		count, err := strconv.Atoi(cacheResult)
		if err == nil {
			if count > 0 {
				return t, nil
			} else {
				return nil, fmt.Errorf("tag %s does not exist", tagName)
			}
		} else {
			return nil, err
		}
	}

	err = database.DB.Where("name = ?", tagName).Find(&t).Error
	if err != nil {
		return nil, err
	}

	cache.CacheInstance.Client.
		HSet(context.Background(), cache.TagListHash, tagName, len(t))
	return t, nil
}

func AddTag(t *tag.Tag) error {
	// 从布隆过滤器里查找标签是否存在
	exists, err := cache.CacheInstance.Client.Do(
		context.Background(),
		"bf.exists",
		cache.BloomFilterTag,
		fmt.Sprintf("%d:%s", 0, t.Name)).Result()
	if exists == 1 {
		return fmt.Errorf("tag %s already exists", t.Name)
	}

	err = database.DB.Create(t).Error
	if err != nil {
		return err
	}
	cache.CacheInstance.Client.
		HIncrBy(context.Background(), cache.TagListHash, t.Name, 1)
	return nil
}

// 根据图片ID添加标签
func AddTagFromPicture(pid int, tags []string) error {
	for _, tagName := range tags {
		t, err := FindByTag(tagName)
		if err != nil {
			return err
		}
		if len(t) == 0 {
			tag := &tag.Tag{
				Name: tagName,
				Pid:  pid,
			}
			err = AddTag(tag)
			if err != nil {
				return err
			}

			cache.CacheInstance.Client.
				HIncrBy(context.Background(), cache.TagListHash, tagName, 1)
		}
	}
	return nil
}

func DeleteTagFromPicture(pid int) error {
	err := database.DB.Where("pid = ?", pid).Delete(&tag.Tag{}).Error
	if err != nil {
		return err
	}
	return nil
}

func FindByTagFromPicture(tagToFind string, page uint, pageSize uint) ([]picture.Picture, error) {
	var pid []int
	err := database.DB.Table("tags").Where("name = ?", tagToFind).Pluck("pid", &pid).Error
	if err != nil {
		return nil, err
	}
	var pics []picture.Picture
	err = database.DB.Table("pictures").Where("pid IN ?", pid).Offset(int((page - 1) * pageSize)).Limit(int(pageSize)).Find(&pics).Error
	if err != nil {
		return nil, err
	}
	return pics, nil
}

func GetTagList() ([]tag.TagShow, error) {
	var tags []tag.TagShow
	// 查询所有不同的标签名称, 并统计每个标签的数量
	// 从缓存中查询标签列表
	// 如果缓存中不存在标签列表, 则从数据库中查询
	if exists, _ := cache.CacheInstance.Client.Exists(context.Background(), cache.TagListHash).Result(); exists == 1 {
		tagList, err := cache.CacheInstance.Client.
			HGetAll(context.Background(), cache.TagListHash).
			Result()
		log.Println("[GetTagList] tagList: ", tagList)
		if err == nil {
			for name, countStr := range tagList {
				count, err := strconv.Atoi(countStr)
				if err != nil {
					return nil, err
				}
				tags = append(tags, tag.TagShow{
					Count: count,
					Name:  name,
				})
			}
			return tags, nil
		}
	}

	err := database.DB.Table("tags").Select("name, COUNT(*) as count").Distinct().Group("name").Find(&tags).Error
	if err != nil {
		return nil, err
	}

	// 缓存标签列表
	for _, t := range tags {
		cache.CacheInstance.Client.
			HSet(context.Background(), cache.TagListHash, t.Name, t.Count)
	}
	// 不需要设置过期时间, 持久化维护
	return tags, nil
}
