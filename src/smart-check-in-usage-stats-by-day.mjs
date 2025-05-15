import { createDbConnection } from './db-connection.mjs';

export async function smartCheckInUsageStatsByDay(hotelCode, year, month) {
  const connection = await createDbConnection();

  const sql = `
    SELECT
        wdate,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p0) AS p0_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p1) AS p1_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p2) AS p2_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p3) AS p3_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p4) AS p4_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p5) AS p5_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p6) AS p6_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p7) AS p7_count,
        COUNT(DISTINCT hotel, wdate, rsvn_no, p8) AS p8_count
    FROM (
        SELECT
            hotel,
            SUBSTRING(date,1,8) AS wdate,
            IFNULL(rsvn_no,ROW_NUMBER() OVER(ORDER BY hotel)) rsvn_no,
            CASE WHEN progress='0' THEN 1 ELSE NULL END p0,
            CASE WHEN progress='1' THEN 1 ELSE NULL END p1,
            CASE WHEN progress='2' THEN 1 ELSE NULL END p2,
            CASE WHEN progress='3' THEN 1 ELSE NULL END p3,
            CASE WHEN progress='4' THEN 1 ELSE NULL END p4,
            CASE WHEN progress='5' THEN 1 ELSE NULL END p5,
            CASE WHEN progress='6' THEN 1 ELSE NULL END p6,
            CASE WHEN progress='7' THEN 1 ELSE NULL END p7,
            CASE WHEN progress='8' THEN 1 ELSE NULL END p8
        FROM smart_checkin_statistics
        WHERE type = '1'
            AND hotel = ?
            AND SUBSTRING(date,1,4) = ?
            AND SUBSTRING(date,5,2) = LPAD(?, 2, '0')
            AND SUBSTRING(date,7,2) BETWEEN '01' AND '31'
    ) al
    GROUP BY hotel, wdate
    ORDER BY wdate;
  `;
  const params = [hotelCode, year, month];

  try {
    const [rows, fields]  = await connection.query(sql, params);
    await connection.end();
    return {
      resultCode: '1000',
      msg: 'OK',
      data: {
          usageStat: rows
      },
      languageCode: 'en'
    };
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  }
}
