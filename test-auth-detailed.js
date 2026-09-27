require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAuthenticationSteps() {
  try {
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('  🗄️  DETAILED MYSQL AUTHENTICATION TEST\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;
    const port = process.env.DB_PORT || 3306;

    console.log('📋 Environment Variables:');
    console.log(`   DB_HOST:     ${host}`);
    console.log(`   DB_PORT:     ${port}`);
    console.log(`   DB_USER:     ${user}`);
    console.log(`   DB_PASSWORD: ${password.substring(0, 3)}${'*'.repeat(password.length - 3)}`);
    console.log(`   DB_NAME:     ${database}\n`);

    // Step 1: Test connection without database
    console.log('🔍 Step 1: Testing authentication (no database)...\n');
    try {
      const conn1 = await mysql.createConnection({
        host: host,
        user: user,
        password: password,
        port: port,
        connectTimeout: 10000,
      });
      console.log('✅ Authentication successful!\n');
      
      // Get server info
      const [serverInfo] = await conn1.execute('SELECT VERSION() as version');
      console.log(`   MySQL Version: ${serverInfo[0].version}\n`);
      
      await conn1.end();
    } catch (authErr) {
      console.error('❌ Authentication failed!');
      console.error(`   Error: ${authErr.message}\n`);
      throw authErr;
    }

    // Step 2: Test database access
    console.log('🔍 Step 2: Testing database access...\n');
    try {
      const conn2 = await mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database,
        port: port,
        connectTimeout: 10000,
      });
      console.log('✅ Database access successful!\n');
      
      const [dbInfo] = await conn2.execute('SELECT DATABASE() as current_db, NOW() as time');
      console.log(`   Current Database: ${dbInfo[0].current_db}`);
      console.log(`   Server Time: ${dbInfo[0].time}\n`);
      
      await conn2.end();
    } catch (dbErr) {
      console.error('❌ Database access failed!');
      console.error(`   Error: ${dbErr.message}\n`);
      throw dbErr;
    }

    // Step 3: List tables
    console.log('🔍 Step 3: Fetching database tables...\n');
    const conn3 = await mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: database,
      port: port,
    });

    const [tables] = await conn3.execute(
      `SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
      [database]
    );

    if (tables.length === 0) {
      console.log('⚠️  No tables found in database.\n');
    } else {
      console.log('📊 Database Tables:\n');
      tables.forEach((table) => {
        console.log(`   ✓ ${table.TABLE_NAME.padEnd(25)} | ${table.TABLE_ROWS} rows`);
      });
      console.log('');
    }

    await conn3.end();

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ ALL TESTS PASSED - BACKEND CONNECTION OK!');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);

  } catch (error) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ❌ CONNECTION FAILED');
    console.log('═══════════════════════════════════════════════════════\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code || 'N/A');
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Check your Hostinger control panel for correct credentials');
    console.log('   2. Verify remote MySQL access is enabled');
    console.log('   3. Check if your IP (196.132.74.81) is whitelisted');
    console.log('   4. Reset the database password if unsure\n');
    
    process.exit(1);
  }
}

testAuthenticationSteps();
