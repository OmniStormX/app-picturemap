#!/usr/bin/env python3
import os
import hashlib
from PIL import Image, ImageOps
import pymysql
import sys
import traceback
from pathlib import Path

Image.MAX_IMAGE_PIXELS = 200000000
max_width = 1400
max_height = 2800
def calculate_file_hash(filepath):
    """计算文件的SHA256哈希值"""
    hash_sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        # 分块读取文件以避免大文件占用过多内存
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()


def resize_image_9x16(image):
    """调整图片为9x16尺寸，类似CSS object-fit: cover的效果"""
    target_size = (9, 16)
    # 使用ImageOps.fit来实现类似CSS object-fit: cover的效果，使用Resampling.LANCZOS插值方法
    return ImageOps.fit(image, target_size, method=Image.Resampling.LANCZOS, bleed=0.1)  # bleed 控制裁剪的范围，0.1保留更多图片内容


def resize_image_90x160(image):
    """调整图片为90x160尺寸，类似CSS object-fit: cover的效果"""
    target_size = (90, 160)
    # 使用ImageOps.fit来实现类似CSS object-fit: cover的效果，使用Resampling.LANCZOS插值方法
    return ImageOps.fit(image, target_size, method=Image.Resampling.LANCZOS, bleed=0.1)  # bleed 控制裁剪的范围，0.1保留更多图片内容


def connect_to_database():
    """连接到MySQL数据库 - 使用你的配置信息"""
    try:
        conn = pymysql.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='123456',
            database='picturemap',
            charset='utf8mb4'
        )
        return conn
    except Exception as e:
        print(f"Failed to connect to MySQL database: {e}")
        raise


def insert_picture_record(conn, name, hash_value):
    """插入图片记录到数据库"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO pictures (name, hash) VALUES (%s, %s)
        """, (name, hash_value))
        conn.commit()
        return True
    except pymysql.IntegrityError:
        # 如果哈希值已存在，跳过
        print(f"Picture with hash {hash_value} already exists in database")
        return False
    except Exception as e:
        print(f"Failed to insert picture record: {e}")
        return False


def process_images():
    """处理图片的主要函数"""
    test_dir = "./img-test"
    upload_dir = "./uploads/img"
    
    # 确保上传目录存在
    os.makedirs(upload_dir, exist_ok=True)
    
    # 支持的图片格式
    supported_formats = ['.jpg', '.jpeg', '.png']
    
    # 连接数据库
    try:
        conn = connect_to_database()
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        print("Please make sure your MySQL database is running and connection details are correct.")
        return
    
    # 遍历 img-test 目录
    for root, dirs, files in os.walk(test_dir):
        for file in files:
            file_path = os.path.join(root, file)
            file_ext = os.path.splitext(file)[1].lower()
            
            if file_ext not in supported_formats:
                continue
            
            print(f"Processing file: {file_path}")
            
            try:
                # 计算文件哈希
                file_hash = calculate_file_hash(file_path)
                print(f"Hash: {file_hash}")
                
                # 检查数据库中是否已存在相同哈希值的图片
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM pictures WHERE hash = %s", (file_hash,))
                count = cursor.fetchone()[0]
                
                if count > 0:
                    print(f"Picture with hash {file_hash} already exists in database")
                    continue
                
                # 打开并处理图片
                with Image.open(file_path) as img:
                    # 转换为RGB模式（如果是RGBA或其他模式）
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    
                    # 获取文件名（不含扩展名）
                    filename_without_ext = os.path.splitext(os.path.basename(file_path))[0]
                    
                    # 生成缩略图（类似CSS object-fit: cover效果）
                    pic_9x16 = resize_image_9x16(img)
                    pic_90x160 = resize_image_90x160(img)
                    
                    # 定义保存路径 - 改为WebP格式
                    original_dest = os.path.join(upload_dir, f"{filename_without_ext}.webp")
                    thumb_9x16_dest = os.path.join(upload_dir, f"{filename_without_ext}_9x16.webp")
                    thumb_90x160_dest = os.path.join(upload_dir, f"{filename_without_ext}_90x160.webp")
                    
                    # 保存原图和缩略图 - 改为WebP格式
                    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                    img.save(original_dest, 'WEBP', quality=90)
                    pic_9x16.save(thumb_9x16_dest, 'WEBP', quality=90)
                    pic_90x160.save(thumb_90x160_dest, 'WEBP', quality=90)
                    
                    # 插入数据库记录
                    if insert_picture_record(conn, filename_without_ext, file_hash):
                        print(f"Successfully processed and saved {file_path} with hash {file_hash}")
                    
            except Exception as e:
                print(f"Failed to process {file_path}: {e}")
                traceback.print_exc()
    
    conn.close()
    print("Batch upload completed!")


if __name__ == "__main__":
    # 检查是否安装了必要的库
    try:
        from PIL import Image, ImageOps
    except ImportError:
        print("Pillow library is not installed. Please install it using:")
        print("pip install Pillow")
        sys.exit(1)
    
    try:
        import pymysql
    except ImportError:
        print("PyMySQL library is not installed. Please install it using:")
        print("pip install PyMySQL")
        sys.exit(1)
    
    # 检查必要的目录
    if not os.path.exists("./img-test"):
        print("img-test directory does not exist!")
        sys.exit(1)
    
    process_images()