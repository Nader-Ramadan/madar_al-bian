require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Get a connection from the pool
    const connection = await pool.getConnection();
    console.log('✅ Connected to database successfully!\n');

    // Test with a simple query
    console.log('🔍 Running test query...\n');
    const [rows] = await connection.execute('SELECT 1 as result');
    console.log('✅ Query executed successfully!');
    console.log('   Result:', rows[0]);

    // Get table information
    console.log('\n🔍 Fetching table information...\n');
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );
    console.log('✅ Tables in database:');
    tables.forEach((table) => {
      console.log(`   - ${table.TABLE_NAME}`);
    });

    // Test each model table
    const modelTables = ['magazines', 'blogs', 'conferences', 'pdfs'];
    console.log('\n🔍 Testing model tables...\n');
    
    for (const tableName of modelTables) {
      try {
        const [data] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName}: ${data[0].count} records`);
      } catch (err) {
        console.log(`⚠️  ${tableName}: Table not found or error - ${err.message}`);
      }
    }

    // Close connection
    connection.release();
    await pool.end();

    console.log('\n✅ All tests passed! Backend connection is working correctly.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test failed:\n');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    console.error('\nPlease check:');
    console.error('  1. Database server is running');
    console.error('  2. Environment variables are correct (.env file)');
    console.error('  3. Network connectivity to the database host');
    console.error('  4. Database credentials are valid');
    process.exit(1);
  }
}

testConnection();
