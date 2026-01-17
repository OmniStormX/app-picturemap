package cache

import (
	"backend/configs"
	"backend/database"
	"backend/modal/tag"
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	Client *redis.Client
}

var SyncOnce sync.Once
var CacheInstance *Cache

const CacheExpireTime = 60 * 5 * time.Second

const PictureList = "picture_list:%d:%d"
const GetPictureByName = "get_picture_by_name:%s"
const GetPictureByTag = "get_picture_by_tag:%s:%d:%d"

const BloomFilterUsername = "bloom_filter:username"
const BloomFilterTag = "bloom_filter:tag"
const BloomFilterPid = "bloom_filter:pid"
const BloomFilterPictureName = "bloom_filter:picture_name"

const TagListHash = "tag_list_hash"

func NewCache() *Cache {
	SyncOnce.Do(func() {
		CacheInstance = &Cache{
			Client: redis.NewClient(&redis.Options{
				Addr:     fmt.Sprintf("%s:%s", configs.EnvMap["REDIS_HOST"], configs.EnvMap["REDIS_PORT"]),
				Password: configs.EnvMap["REDIS_PASSWORD"],
				DB:       0,
			}),
		}
	})
	return CacheInstance
}

func init() {
	CacheInstance.Client = NewCache().Client
	ctx := context.Background()
	_, err := CacheInstance.Client.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}
	log.Println("client: ", CacheInstance.Client)
	// init bloom filter
	if exists, _ := CacheInstance.Client.Exists(ctx, BloomFilterUsername).Result(); exists == 0 {
		_, err = CacheInstance.Client.Do(ctx, "bf.reserve", BloomFilterUsername, 0.001, 1000000).Result()
	}
	if exists, _ := CacheInstance.Client.Exists(ctx, BloomFilterTag).Result(); exists == 0 {
		_, err = CacheInstance.Client.Do(ctx, "bf.reserve", BloomFilterTag, 0.001, 1000000).Result()
	}
	if exists, _ := CacheInstance.Client.Exists(ctx, BloomFilterPid).Result(); exists == 0 {
		_, err = CacheInstance.Client.Do(ctx, "bf.reserve", BloomFilterPid, 0.001, 1000000).Result()
	}
	if exists, _ := CacheInstance.Client.Exists(ctx, BloomFilterPictureName).Result(); exists == 0 {
		_, err = CacheInstance.Client.Do(ctx, "bf.reserve", BloomFilterPictureName, 0.001, 1000000).Result()
	}
	if err != nil {
		panic(err)
	}

	addUserNameIntoBloomFilter()
	addTagNameIntoBloomFilter()
	addPictureNameIntoBloomFilter()
	addPidIntoBloomFilter()
}

func addUserNameIntoBloomFilter() {
	var names []string
	database.DB.Table("users").Pluck("username", &names)
	for _, name := range names {
		CacheInstance.Client.Do(context.Background(), "bf.add", BloomFilterUsername, name)
	}
}

func addTagNameIntoBloomFilter() {
	var tags []tag.Tag
	database.DB.Table("tags").Find(&tags)
	for _, tag := range tags {
		CacheInstance.Client.Do(context.Background(), "bf.add", BloomFilterTag, fmt.Sprintf("%d:%s", tag.TagID, tag.Name))
	}
}

func addPictureNameIntoBloomFilter() {
	var names []string
	database.DB.Table("pictures").Pluck("name", &names)
	for _, name := range names {
		CacheInstance.Client.Do(context.Background(), "bf.add", BloomFilterPictureName, name)
	}
}

func addPidIntoBloomFilter() {
	var pids []int
	database.DB.Table("pictures").Pluck("id", &pids)
	for _, pid := range pids {
		CacheInstance.Client.Do(context.Background(), "bf.add", BloomFilterPid, fmt.Sprintf("%d", pid))
	}
}
