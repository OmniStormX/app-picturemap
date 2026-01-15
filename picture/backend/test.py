#!/usr/bin/env python3
import os
import hashlib
from PIL import Image, ImageOps
import pymysql
import sys
import traceback
from pathlib import Path
from tqdm import tqdm
import glob

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


def get_all_supported_files(test_dir, supported_formats):
    """获取所有支持格式的文件列表"""
    all_files = []
    for root, dirs, files in os.walk(test_dir):
        for file in files:
            file_ext = os.path.splitext(file)[1].lower()
            if file_ext in supported_formats:
                all_files.append(os.path.join(root, file))
    return all_files


def process_images():
    """处理图片的主要函数"""
    test_dir = "./img-test"
    upload_dir = "./uploads/img"
    
    # 确保上传目录存在
    os.makedirs(upload_dir, exist_ok=True)
    
    # 支持的图片格式（扩展了更多常见格式）
    supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp', '.gif']
    
    # 获取所有待处理的文件
    all_files = get_all_supported_files(test_dir, supported_formats)
    
    if not all_files:
        print("No supported image files found in the directory and its subdirectories.")
        return
    
    print(f"Found {len(all_files)} supported image files to process.")
    
    # 连接数据库
    try:
        conn = connect_to_database()
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        print("Please make sure your MySQL database is running and connection details are correct.")
        return
    
    # 使用tqdm创建进度条
    success_count = 0
    fail_count = 0
    
    for file_path in tqdm(all_files, desc="Processing Images", unit="file"):
        file_ext = os.path.splitext(file_path)[1].lower()
        
        try:
            # 计算文件哈希
            file_hash = calculate_file_hash(file_path)
            
            # 检查数据库中是否已存在相同哈希值的图片
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM pictures WHERE hash = %s", (file_hash,))
            count = cursor.fetchone()[0]
            
            if count > 0:
                # 文件已存在，跳过
                continue
            
            # 打开并处理图片
            with Image.open(file_path) as img:
                # 转换为RGB模式（如果是RGBA或其他模式）
                if img.mode in ('RGBA', 'LA', 'P', 'LA', 'RGBA'):
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
                # 创建一个新的图像副本进行缩放以避免修改原始图像对象
                img_resized = img.copy()
                img_resized.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                img_resized.save(original_dest, 'WEBP', quality=90)
                pic_9x16.save(thumb_9x16_dest, 'WEBP', quality=90)
                pic_90x160.save(thumb_90x160_dest, 'WEBP', quality=90)
                
                # 插入数据库记录
                if insert_picture_record(conn, filename_without_ext, file_hash):
                    success_count += 1
                    
        except Exception as e:
            fail_count += 1
            # 不在进度条中打印错误，避免干扰进度条显示
    
    conn.close()
    
    print(f"\nBatch upload completed! Successfully processed: {success_count} files, Failed: {fail_count} files.")


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
    
    try:
        from tqdm import tqdm
    except ImportError:
        print("tqdm library is not installed. Please install it using:")
        print("pip install tqdm")
        sys.exit(1)
    
    # 检查必要的目录
    if not os.path.exists("./img-test"):
        print("img-test directory does not exist!")
        sys.exit(1)
    
    process_images()