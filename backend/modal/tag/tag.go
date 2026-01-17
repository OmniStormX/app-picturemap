package tag

type Tag struct {
	TagID int    `gorm:"primaryKey;autoIncrement;column:tag_id" json:"tag_id"`
	Name  string `gorm:"size:255;not null;column:name" json:"name"`
	Pid   int    `gorm:"not null;column:pid" json:"pid"`
}

type TagShow struct {
	Count int    `json:"count"`
	Name  string `json:"name"`
}
