DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASS="123456"
DB_NAME="picturemap"

mysql -h"$DB_HOST" -P3306 -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DELETE FROM pictures WHERE pid > 0;"
echo "== clear pictures done =="
