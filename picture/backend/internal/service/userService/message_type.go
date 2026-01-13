package user_service

import "backend/modal/picture"

type RegisterReply struct {
	Status   string `json:"status"`
	Username string `json:"username"`
	Token    string `json:"token"`
}

type LoginReply struct {
	Status   string `json:"status"`
	Username string `json:"username"`
	Token    string `json:"token"`
}

type ErrorReply struct {
	Error string `json:"error"`
}

type UploadReply struct {
	Message string `json:"message"`
}

type GetListReply struct {
	PictureList []picture.Picture `json:"picture_list"`
}

type GetListRequest struct {
	Page uint `json:"page"`
}

type UploadRequest struct {
	Name string `json:"name"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	LoginByToken bool   `json:"login_by_token"`
	Token        string `json:"token"`
	Username     string `json:"username"`
	Password     string `json:"password"`
}

type PictureListReply struct {
	PictureList []picture.Picture `json:"picture_list"`
}
