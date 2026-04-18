require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const options = {
  tls: true,
};

const sampleUsers = [
  // Add sample users here
];

async function seed() {
  const client = new MongoClient(uri, options);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected');

    const db = client.db('readerboard');

    if (sampleUsers.length > 0) {
      const result = await db.collection('users').insertMany(sampleUsers);
      console.log(`✅ Inserted ${result.insertedCount} users`);
    } else {
      console.log('⚠️  No sample users defined. Add data to the sampleUsers array.');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

seed();