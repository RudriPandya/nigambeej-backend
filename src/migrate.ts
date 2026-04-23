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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@nigambeej.com';
const ADMIN_PASS  = process.env.ADMIN_PASS  ?? 'Admin@123';
const ADMIN_NAME  = process.env.ADMIN_NAME  ?? 'Admin';

if (ADMIN_PASS === 'Admin@123') {
  console.warn('⚠  Using default admin password. Set ADMIN_PASS env var before deploying to production.');
}

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

  // ── Step 3.1: ensure product practice columns exist ──
  const ensureColumn = async (
    tableName: string,
    columnName: string,
    columnDefinition: string,
  ) => {
    const [columnRows] = await conn.execute<mysql.RowDataPacket[]>(
      `
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
        LIMIT 1
      `,
      [DB_NAME, tableName, columnName],
    );
    if (columnRows.length > 0) return;
    await conn.execute(`ALTER TABLE \`${tableName}\` ADD COLUMN ${columnDefinition}`);
    console.log(`✓ Column ${tableName}.${columnName} added`);
  };

  await ensureColumn('products', 'is_practisys', '`is_practisys` TINYINT(1) NOT NULL DEFAULT 0');
  await ensureColumn(
    'products',
    'practice_image_data',
    '`practice_image_data` LONGBLOB NULL',
  );
  await ensureColumn(
    'products',
    'practice_image_mimetype',
    '`practice_image_mimetype` VARCHAR(255) NULL',
  );
  await ensureColumn(
    'products',
    'practice_image_original_name',
    '`practice_image_original_name` VARCHAR(255) NULL',
  );
  await ensureColumn(
    'product_translations',
    'practice_description',
    '`practice_description` TEXT NULL',
  );

  // Backfill from older column name if it exists.
  const [legacyPracticeCol] = await conn.execute<mysql.RowDataPacket[]>(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'products'
        AND COLUMN_NAME = 'is_practice'
      LIMIT 1
    `,
    [DB_NAME],
  );
  if (legacyPracticeCol.length > 0) {
    await conn.execute('UPDATE `products` SET `is_practisys` = `is_practice` WHERE `is_practisys` = 0');
    console.log('✓ Backfilled products.is_practisys from legacy is_practice');
  }

  await conn.execute(`
    UPDATE \`products\`
    SET
      \`practice_image_data\` = \`image_data\`,
      \`practice_image_mimetype\` = \`image_mimetype\`,
      \`practice_image_original_name\` = \`image_original_name\`
    WHERE \`is_practisys\` = 1
      AND \`practice_image_data\` IS NULL
      AND \`image_data\` IS NOT NULL
  `);
  console.log('✓ Backfilled products.practice_image_* from product image for existing practices');

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
