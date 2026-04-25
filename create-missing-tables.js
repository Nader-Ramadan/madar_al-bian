require('dotenv').config();
const mysql = require('mysql2/promise');

async function createMissingTables() {
  try {
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('  📋 CREATING MISSING DATABASE TABLES\n');
    console.log('═══════════════════════════════════════════════════════\n');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    const tables = [
      {
        name: 'magazines',
        sql: `CREATE TABLE IF NOT EXISTS magazines (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          description LONGTEXT NOT NULL,
          image VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL
        )`
      },
      {
        name: 'blogs',
        sql: `CREATE TABLE IF NOT EXISTS blogs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          summary LONGTEXT NOT NULL,
          date VARCHAR(50) NOT NULL,
          author VARCHAR(255) NOT NULL,
          image VARCHAR(255)
        )`
      },
      {
        name: 'conferences',
        sql: `CREATE TABLE IF NOT EXISTS conferences (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          description LONGTEXT NOT NULL,
          date VARCHAR(50) NOT NULL,
          location VARCHAR(255) NOT NULL,
          image VARCHAR(255),
          attendees VARCHAR(100)
        )`
      },
      {
        name: 'advisory_committee_members',
        sql: `CREATE TABLE IF NOT EXISTS advisory_committee_members (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          image VARCHAR(255) NOT NULL,
          bio LONGTEXT NOT NULL
        )`
      },
      {
        name: 'fields',
        sql: `CREATE TABLE IF NOT EXISTS fields (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          description LONGTEXT NOT NULL
        )`
      }
    ];

    console.log('🔨 Creating tables...\n');
    
    for (const table of tables) {
      try {
        await connection.execute(table.sql);
        console.log(`   ✓ ${table.name.padEnd(30)} - Created`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`   ✓ ${table.name.padEnd(30)} - Already exists`);
        } else {
          console.log(`   ✗ ${table.name.padEnd(30)} - Error: ${err.message}`);
        }
      }
    }

    console.log('\n🔍 Verifying all tables...\n');

    const [allTables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME NOT LIKE '%prisma%'
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME]
    );

    console.log('📊 Tables in Database:\n');
    allTables.forEach((table) => {
      console.log(`   ✓ ${table.TABLE_NAME}`);
    });

    await connection.end();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ DATABASE SETUP COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createMissingTables();
