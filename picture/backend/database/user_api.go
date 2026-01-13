package database

import modal_user "backend/modal/user"

// FindByUsername 根据用户名查询用户
func FindByUsername(username string) (*modal_user.User, error) {
	var user modal_user.User
	err := DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func AddUser(user *modal_user.User) error {
	err := DB.Create(&user).Error
	if err != nil {
		return err
	}
	return nil
}
