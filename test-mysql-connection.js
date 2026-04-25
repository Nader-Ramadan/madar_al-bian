require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('  🗄️  REMOTE MYSQL DATABASE CONNECTION TEST\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📋 Connection Details:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Database: ${process.env.DB_NAME}\n`);
    
    console.log('🔍 Attempting to connect...\n');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectTimeout: 10000,
    });

    console.log('✅ Successfully connected to remote MySQL database!\n');

    // Test basic query
    console.log('🔍 Running test query...\n');
    const [result] = await connection.execute('SELECT 1 as result, NOW() as server_time, DATABASE() as db_name');
    console.log('✅ Query Results:');
    console.log(`   Result: ${result[0].result}`);
    console.log(`   Server Time: ${result[0].server_time}`);
    console.log(`   Current DB: ${result[0].db_name}\n`);

    // Get database info
    console.log('🔍 Database Information:\n');
    const [dbInfo] = await connection.execute(`
      SELECT 
        table_schema as 'Database',
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)'
      FROM information_schema.TABLES
      WHERE table_schema = ?
      GROUP BY table_schema
    `, [process.env.DB_NAME]);
    
    if (dbInfo.length > 0) {
      console.log(`   Database Size: ${dbInfo[0]['Size (MB)']} MB\n`);
    }

    // List tables
    console.log('🔍 Tables in Database:\n');
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS, ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024, 2) as size_kb
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME]
    );

    if (tables.length > 0) {
      tables.forEach((table) => {
        console.log(`   ✓ ${table.TABLE_NAME.padEnd(20)} | Rows: ${String(table.TABLE_ROWS).padEnd(6)} | Size: ${table.size_kb} KB`);
      });
    } else {
      console.log('   (No tables found)');
    }

    // Test row counts for specific models
    console.log('\n🔍 Model Table Row Counts:\n');
    const modelTables = ['magazines', 'blogs', 'conferences', 'pdfs'];
    
    for (const tableName of modelTables) {
      try {
        const [data] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ✓ ${tableName.padEnd(15)} | ${data[0].count} records`);
      } catch (err) {
        console.log(`   ✗ ${tableName.padEnd(15)} | Table not found`);
      }
    }

    await connection.end();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ ALL TESTS PASSED - BACKEND CONNECTION OK');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ❌ CONNECTION TEST FAILED');
    console.log('═══════════════════════════════════════════════════════\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}\n`);
    
    console.error('Troubleshooting:');
    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('   → Invalid username or password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   → Database does not exist');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   → Connection refused - MySQL not running on port 3306');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   → Host not found - check hostname');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Connection timeout - network unreachable');
    }
    console.log('\n');
    process.exit(1);
  }
}

testConnection();
