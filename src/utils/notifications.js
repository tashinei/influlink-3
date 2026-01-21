/**
 * @param {import("mysql2/promise").Pool} pool
 */
export async function createNotification(
  pool,
  {
    userId,
    type,
    title,
    message = null,
    entityType = null,
    entityId = null,
  }
) {
  await pool.query(
    `INSERT INTO notifications
     (user_id, type, title, message, entity_type, entity_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, title, message, entityType, entityId]
  );
}
