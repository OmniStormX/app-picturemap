package modal_user

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `gorm:"size:255;unique;not null;uniqueIndex;column:username"`
	HashKey  string `gorm:"size:255;not null;column:hash_key"`
}
