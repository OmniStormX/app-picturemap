package routes

import (
	"backend/configs"
	"log"
	"os"
	fp "path/filepath"

	"github.com/gin-gonic/gin"
)

// staticSourceUpload 处理静态资源上传文件的路由处理函数
// 该函数根据请求参数中的文件路径，从上传目录中查找并返回对应的文件
// 如果文件不存在，则返回404状态码
func staticSourceUpload(c *gin.Context) {
	filepath := c.Param("filepath")
	name := fp.Base(filepath)
	baseDir := configs.EnvMap["UPLOAD_IMAGE_DIR"]
	uploadPath := fp.Join(baseDir, name)
	if _, err := os.Stat(uploadPath); os.IsNotExist(err) {
		c.AbortWithStatus(404)
		return
	}
	log.Println("Upload Path:", uploadPath)
	c.File(uploadPath)
}
