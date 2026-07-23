-- press 테이블에서 newsroom 테이블로 이전
SELECT 
  press_name AS `tag`,
  press_date AS `published_at`,
  subject AS `title`,
  link AS `link`,
  'news' AS `category`,
  CASE 
    WHEN thumbnail IS NOT NULL AND thumbnail_realname IS NOT NULL 
    THEN CONCAT('{"filePath":"', thumbnail, '","originalName":"', thumbnail_realname, '"}')
    ELSE NULL
  END AS `thumbnail`,
  regidate AS `created_at`
FROM press
WHERE lang = 'kr'