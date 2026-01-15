package user_service

import (
	"backend/database"
	"backend/modal/picture"
	modal_user "backend/modal/user"
	"backend/utils"
	"image"
	"io"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func GetPictureList(c *gin.Context) {
	// 从请求中获取分页参数
	var req GetListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("bind json error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "bind json error",
			},
		})
		return
	}
	// 从数据库中获取图片列表
	pictureList, err := database.GetPictureList(uint(req.Page), uint(req.PageSize))
	if err != nil {
		log.Println("get picture list error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "get picture list error",
			},
		})
		return
	}

	successMsg := baseReply[PictureListReply]{
		Status: "success",
		Msg: PictureListReply{
			PictureList: pictureList,
		},
	}
	c.JSON(200, successMsg)
}

func Upload(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	// 从文件名中去掉后缀
	fileName := fileHeader.Filename[:len(fileHeader.Filename)-4]
	log.Println("file name:", fileName)
	if err != nil {
		log.Println("get form file error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "get form file error",
			},
		})
		return
	}
	file, err := fileHeader.Open()
	if err != nil {
		log.Println("Failed to open file.")
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "open file error",
			},
		})
		return
	}
	defer file.Close()

	picture := picture.Picture{
		Name: fileName,
	}
	picture.Hash, err = utils.HashFile(file)

	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		panic(err)
	}

	image, _, err := image.Decode(file)
	image = utils.ResizeImage(image, utils.Maxwidth, utils.MaxHeight)
	if err != nil {
		log.Println("decode image error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "decode image error",
			},
		})
		return
	}

	log.Println("picture hash:", picture.Hash)

	// 检查图片是否已经存在
	if database.DB.Where("hash = ?", picture.Hash).First(&picture).Error == nil {
		log.Println("picture already exists")
		c.JSON(400, baseReply[UploadReply]{
			Status: "success",
			Msg: UploadReply{
				Message: "picture already exists",
			},
		})
		return
	}

	pic_90x160 := utils.ResizeImage90x160(image)
	pic_9x16 := utils.ResizeImage9x16(image)
	// 把图片保存到 /upload/img 文件夹
	// 图片名字加上随机哈希串

	err = utils.SaveImage(image, "./uploads/img/"+fileName+".webp")
	if err != nil {
		log.Println("save image error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "save image error",
			},
		})
		return
	}
	err = utils.SaveImage(pic_90x160, "./uploads/img/"+fileName+"_90x160.webp")
	if err != nil {
		log.Println("save image error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "save image error",
			},
		})
		return
	}
	log.Println("save 9x16 image success. file name:", fileName+"_9x16.webp")
	err = utils.SaveImage(pic_9x16, "./uploads/img/"+fileName+"_9x16.webp")
	if err != nil {
		log.Println("save image error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "save image error",
			},
		})
		return
	}

	log.Println("picture upload success.")
	// 把图片保存到数据库

	database.DB.Create(&picture)

	successMsg := baseReply[UploadReply]{
		Status: "success",
		Msg: UploadReply{
			Message: "upload success",
		},
	}
	c.JSON(200, successMsg)
}

func Register(c *gin.Context) {

	var user modal_user.User

	// 从请求中获取用户名和密码
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("bind json error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "bind json error",
			},
		})
		return
	}

	quiryContext := database.DB.Where("username = ?", req.Username).First(&user)
	if quiryContext.Error == nil {
		log.Println("query user error:", quiryContext.Error)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "user already exists",
			},
		})
		return
	}
	user.Username = req.Username
	user.HashKey, _ = utils.HashPassword(req.Password)

	err := database.DB.Create(&user).Error
	if err != nil {
		log.Println("create user error:", err)
		errMsg := baseReply[string]{
			Status: "error",
			Msg:    "create user error",
		}

		c.JSON(400, errMsg)
		return
	}

	token, err := utils.GeneratedJwtToken(user.ID)
	if err != nil {
		log.Println("generate jwt token error:", err)
		errMsg := baseReply[string]{
			Status: "error",
			Msg:    "generate jwt token error",
		}
		c.JSON(400, errMsg)
		return
	}

	c.JSON(200, gin.H{
		"status": "success",
		"token":  token,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("bind json error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "bind json error",
			},
		})
		return
	}
	log.Println("login request:", req)
	if req.LoginByToken {
		// 验证token
		_, err := utils.ParseJwtToken(req.Token)
		if err != nil {
			log.Println("verify jwt token error:", err)
			c.JSON(400, baseReply[ErrorReply]{
				Status: "error",
				Msg: ErrorReply{
					Error: "verify jwt token error, " + err.Error(),
				},
			})
			return
		}
		c.JSON(200, baseReply[LoginReply]{
			Status: "success",
			Msg: LoginReply{
				Status:   "success",
				Username: req.Username,
				Token:    req.Token,
			},
		})
		return
	}

	user, err := database.FindByUsername(req.Username)

	// 查询用户
	if err != nil {
		log.Println("query user error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "user not found",
			},
		})
		return
	}

	// 验证密码
	if err := utils.CheckPasswordHash(req.Password, user.HashKey); err != nil {
		log.Println("check password error")
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "password not match",
			},
		})
		return
	}
	// 生成token
	token, err := utils.GeneratedJwtToken(user.ID)
	if err != nil {
		log.Println("generate jwt token error:", err)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "generate jwt token error",
			},
		})
		return
	}
	c.JSON(200, baseReply[LoginReply]{
		Status: "success",
		Msg: LoginReply{
			Status:   "success",
			Username: req.Username,
			Token:    token,
		},
	})
}

func Download(c *gin.Context) {
	filename := c.Query("filename")
	if filename == "" {
		log.Println("filename is empty")
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "filename is empty",
			},
		})
		return
	}
	file := "./upload/img/" + filename
	// 检查文件是否存在
	if _, err := os.Stat(file); os.IsNotExist(err) {
		log.Println("file not found:", file)
		c.JSON(400, baseReply[ErrorReply]{
			Status: "error",
			Msg: ErrorReply{
				Error: "file not found",
			},
		})
		return
	}
	c.File(file)
}
