import { createDbConnection } from './db-connection.mjs';

export async function getHotelCode() {
  const connection = await createDbConnection();

  const sql = `
    SELECT
        h.code AS code,
        h.name AS name
    FROM hotel h 
    ORDER BY h.name;
    `;

  try {
    const [rows, fields]  = await connection.query(sql);
    await connection.end();
    return {
      resultCode: '1000',
      msg: 'OK',
      data: {
          hotelList: rows
      },
      languageCode: 'en'
    };
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  }
}
