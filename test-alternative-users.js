require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAlternativeCredentials() {
  const host = process.env.DB_HOST;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT || 3306;

  const usernamesToTry = [
    'u554314341_root',      // Original from .env
    'root',                  // Just root
    'u554314341',            // Without _root
  ];

  console.log('═══════════════════════════════════════════════════════\n');
  console.log('  🔐 TESTING ALTERNATIVE CREDENTIALS\n');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Host: ${host}:${port}`);
  console.log(`Database: ${database}`);
  console.log(`Password: ${password.substring(0, 3)}${'*'.repeat(password.length - 3)}\n`);

  for (const user of usernamesToTry) {
    console.log(`🔍 Trying: ${user}`);
    try {
      const connection = await mysql.createConnection({
        host: host,
        user: user,
        password: password,
        port: port,
        connectTimeout: 5000,
      });
      
      console.log(`✅ SUCCESS with user: ${user}\n`);
      
      const [result] = await connection.execute('SELECT VERSION() as version');
      console.log(`   MySQL Version: ${result[0].version}`);
      
      await connection.end();
      process.exit(0);
      
    } catch (error) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log(`   ❌ Access denied\n`);
      } else {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ❌ NONE OF THE CREDENTIALS WORKED');
  console.log('═══════════════════════════════════════════════════════\n');
  process.exit(1);
}

testAlternativeCredentials();
