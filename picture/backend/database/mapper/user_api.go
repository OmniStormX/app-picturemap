package mapper

import (
	"backend/cache"
	"backend/database"
	modal_user "backend/modal/user"
	"context"
	"fmt"
)

// FindByUsername 根据用户名查询用户
func FindByUsername(username string) (*modal_user.User, error) {
	var user modal_user.User
	// 从布隆过滤器里查找
	exists, err := cache.CacheInstance.Client.
		Do(context.Background(), "bf.exists", cache.BloomFilterUsername, username).
		Result()
	if exists == 0 {
		return nil, fmt.Errorf("user %s does not exist", username)
	}

	err = database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func AddUser(user *modal_user.User) error {
	// 从布隆过滤器里查找
	exists, err := cache.CacheInstance.
		Client.
		Do(
			context.Background(),
			"bf.exists",
			cache.BloomFilterUsername, user.Username).
		Result()

	if exists == 1 {
		return fmt.Errorf("user %s already exists", user.Username)
	}

	err = database.DB.Create(&user).Error
	if err != nil {
		return err
	}
	cache.CacheInstance.Client.
		Do(
			context.Background(),
			"bf.add",
			cache.BloomFilterUsername, user.Username)
	return nil
}
