package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
)

// 生成文件指纹
func HashFile(reader io.Reader) (string, error) {
	h := sha256.New()
	if _, err := io.Copy(h, reader); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
