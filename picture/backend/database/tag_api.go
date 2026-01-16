package database

import (
	"backend/modal/picture"
	"backend/modal/tag"
)

// 根据标签名称查询标签
func FindByTag(tagName string) ([]tag.Tag, error) {
	var t []tag.Tag
	err := DB.Where("name = ?", tagName).Find(&t).Error
	if err != nil {
		return nil, err
	}
	return t, nil
}

func AddTag(t *tag.Tag) error {
	err := DB.Create(t).Error
	if err != nil {
		return err
	}
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
		}
	}
	return nil
}

func DeleteTagFromPicture(pid int) error {
	err := DB.Where("pid = ?", pid).Delete(&tag.Tag{}).Error
	if err != nil {
		return err
	}
	return nil
}

func FindByTagFromPicture(tagToFind string, page uint, pageSize uint) ([]picture.Picture, error) {
	var pid []int
	err := DB.Table("tags").Where("name = ?", tagToFind).Pluck("pid", &pid).Error
	if err != nil {
		return nil, err
	}
	var pics []picture.Picture
	err = DB.Table("pictures").Where("pid IN ?", pid).Offset(int((page - 1) * pageSize)).Limit(int(pageSize)).Find(&pics).Error
	if err != nil {
		return nil, err
	}
	return pics, nil
}

func GetTagList() ([]tag.Tag, error) {
	var tags []tag.Tag
	// 查询所有不同的标签名称, 并统计每个标签的数量
	err := DB.Select("name, COUNT(*) as count").Distinct().Group("name").Find(&tags).Error
	if err != nil {
		return nil, err
	}
	return tags, nil
}
