require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDatabase() {
  try {
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('  📊 DATABASE VERIFICATION AFTER MIGRATION\n');
    console.log('═══════════════════════════════════════════════════════\n');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Connected to database\n');

    // List all tables
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS, ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024, 2) as size_kb
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME]
    );

    console.log('📋 Database Tables:\n');
    if (tables.length === 0) {
      console.log('   (No tables found)\n');
    } else {
      tables.forEach((table) => {
        console.log(`   ✓ ${table.TABLE_NAME.padEnd(25)} | Rows: ${String(table.TABLE_ROWS).padEnd(5)} | Size: ${table.size_kb} KB`);
      });
      console.log('');
    }

    // Check for _prisma_migrations table
    const [migrations] = await connection.execute(
      `SELECT COUNT(*) as count FROM _prisma_migrations`
    );
    console.log(`🔄 Migration Status: ${migrations[0].count} migration(s) recorded\n`);

    // Get table column details
    console.log('🔍 Table Structures:\n');
    const modelTables = ['magazines', 'blogs', 'conferences', 'pdfs', 'advisory_members', 'research_publications'];
    
    for (const tableName of modelTables) {
      try {
        const [columns] = await connection.execute(
          `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           ORDER BY ORDINAL_POSITION`,
          [process.env.DB_NAME, tableName]
        );
        
        if (columns.length > 0) {
          console.log(`   ${tableName}:`);
          columns.forEach((col) => {
            console.log(`      - ${col.COLUMN_NAME.padEnd(20)} | ${col.COLUMN_TYPE.padEnd(20)} | Key: ${col.COLUMN_KEY || 'N/A'}`);
          });
          console.log('');
        }
      } catch (err) {
        // Table doesn't exist, skip
      }
    }

    await connection.end();

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ DATABASE VERIFICATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
