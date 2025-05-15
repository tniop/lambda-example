## AWS Lambda example code

- hospitality smart check in statistics example

```bash
# .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password
DB_NAME=db_name
```

```sql
CREATE TABLE hotel_info (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  hotel VARCHAR(20) DEFAULT NULL,
  code VARCHAR(20) DEFAULT NULL
)

CREATE TABLE smart_checkin_statistics (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  hotel VARCHAR(20) DEFAULT NULL COMMENT 'hotel_info.code',
  rsvn_no VARCHAR(20) DEFAULT NULL,
  progress TINYINT(1) DEFAULT NULL COMMENT '0 ~ 8 각 step 별 수집 데이터',
  type VARCHAR(20) DEFAULT NULL COMMENT '성공 여부',
  date VARCHAR(20) DEFAULT NULL,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
)
```