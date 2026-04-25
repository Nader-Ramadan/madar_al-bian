require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('  🗄️  TESTING WITH URL-ENCODED PASSWORD\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const rawPassword = process.env.DB_PASSWORD;
    const encodedPassword = encodeURIComponent(rawPassword);
    
    console.log('📋 Password Encoding Check:');
    console.log(`   Original: ${rawPassword}`);
    console.log(`   Encoded:  ${encodedPassword}\n`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectTimeout: 10000,
    });

    console.log('✅ Successfully connected!\n');
    
    const [result] = await connection.execute('SELECT 1 as result, NOW() as current_time, DATABASE() as current_db');
    console.log('✅ Query Results:');
    console.log(`   Database: ${result[0].current_db}`);
    console.log(`   Time: ${result[0].current_time}\n`);

    const [tables] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    console.log('📋 Tables Found:');
    tables.forEach((table) => {
      console.log(`   ✓ ${table.TABLE_NAME} (${table.TABLE_ROWS} rows)`);
    });

    await connection.end();
    console.log('\n✅ Connection successful!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error: ' + error.message);
    console.error('Code:', error.code);
    console.log('\n💡 Suggestions:');
    console.log('   1. Verify credentials in your hosting panel');
    console.log('   2. Check if remote MySQL access is enabled');
    console.log('   3. Check if your IP is whitelisted in the database firewall');
    console.log('   4. Contact your hosting provider (Hostinger) for support\n');
    process.exit(1);
  }
}

testConnection();
