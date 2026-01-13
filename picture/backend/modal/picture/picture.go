package picture

type Picture struct {
	Pid uint `gorm:"primaryKey"`
	// TODO: Hash 要使用 name + hash 的方式生成一个唯一的 Hash
	Hash string `gorm:"size:255;not null;column:hash;uniqueIndex"`
	Name string `gorm:"size:255;not null;column:name;uniqueIndex"`
}
