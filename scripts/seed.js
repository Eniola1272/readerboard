const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://date1272:battleaxe12@cluster0.ygykld3.mongodb.net/readerboard?retryWrites=true&w=majority&appName=Cluster0';

// Add TLS options
const options = {
  tls: true,
  tlsAllowInvalidCertificates: true, // For development only
};

const sampleUsers = [
  // ... your sample users
];

async function seed() {
  const client = new MongoClient(uri, options); // Add options here
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    // ... rest of your code
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

seed();