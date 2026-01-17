package picture

type Picture struct {
	// TODO: Hash 要使用 name + hash 的方式生成一个唯一的 Hash
	// 添加 json 字段名
	Pid  uint   `gorm:"primaryKey;column:pid" json:"pid"`
	Hash string `gorm:"size:255;not null;column:hash;uniqueIndex" json:"hash"`
	Name string `gorm:"size:255;not null;column:name;uniqueIndex" json:"name"`
}
