/**
 * Standalone migration + admin seed script.
 * Run with: npx ts-node -r tsconfig-paths/register src/migrate.ts
 *
 * 1. Creates nigam_beej_db if missing
 * 2. Creates admin_users table
 * 3. Seeds the default admin user
 */

import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST ?? 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT ?? '3306', 10);
const DB_USER = process.env.DB_USER ?? 'root';
const DB_PASS = process.env.DB_PASS ?? '';
const DB_NAME = process.env.DB_NAME ?? 'nigam_beej_db';

const ADMIN_EMAIL = 'admin@nigambeej.com';
const ADMIN_PASS  = 'Admin@123';
const ADMIN_NAME  = 'Admin';

async function run() {
  // ── Step 1: connect without a database to create it if needed ──
  const root = await mysql.createConnection({
    host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS,
  });

  await root.execute(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`✓ Database '${DB_NAME}' ready`);
  await root.end();

  // ── Step 2: connect to the database ──
  const conn = await mysql.createConnection({
    host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS,
    database: DB_NAME, charset: 'utf8mb4',
  });

  // ── Step 3: create admin_users table ──
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`admin_users\` (
      \`id\`         INT          NOT NULL AUTO_INCREMENT,
      \`email\`      VARCHAR(255) NOT NULL,
      \`password\`   VARCHAR(255) NOT NULL,
      \`name\`       VARCHAR(255) NOT NULL,
      \`role\`       VARCHAR(50)  NOT NULL DEFAULT 'admin',
      \`is_active\`  TINYINT(1)   NOT NULL DEFAULT 1,
      \`last_login\` DATETIME     NULL,
      \`created_at\` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updated_at\` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`UQ_admin_users_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Table admin_users ready');

  // ── Step 4: seed admin user ──
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    'SELECT id FROM admin_users WHERE email = ? LIMIT 1',
    [ADMIN_EMAIL],
  );

  if (rows.length === 0) {
    const hashed = await bcrypt.hash(ADMIN_PASS, 10);
    await conn.execute(
      'INSERT INTO admin_users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [ADMIN_EMAIL, hashed, ADMIN_NAME, 'admin'],
    );
    console.log(`✓ Admin user created  →  ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
  } else {
    console.log(`ℹ Admin user already exists  →  ${ADMIN_EMAIL}`);
  }

  await conn.end();
  console.log('✅ Migration complete!');
}

run().catch((err) => {
  console.error('✗ Migration failed:', err.message ?? err);
  process.exit(1);
});
