package user_service

type baseReply[T any] struct {
	Status string `json:"status"`
	Msg    T      `json:"msg"`
}
