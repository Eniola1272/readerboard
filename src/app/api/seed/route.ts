import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://date1272:battleaxe12@cluster0.ygykld3.mongodb.net/readerboard?retryWrites=true&w=majority&appName=Cluster0';

// Add TLS options
const options = {
  tls: true,
  tlsAllowInvalidCertificates: true, // For development only
};

// const sampleUsers = [
//   {
//     _id: 'user_alice',
//     username: 'alice',
//     email: 'alice@example.com',
//     bio: 'Avid reader of science fiction and fantasy. Likes long-form discussions and book swaps.',
//     avatarUrl: 'https://example.com/avatars/alice.png',
//     joinedAt: new Date('2023-01-15T10:00:00Z'),
//     favorites: ['Dune', 'The Left Hand of Darkness'],
//     readingList: [
//       { title: 'Project Hail Mary', status: 'reading', addedAt: new Date('2024-07-01T08:30:00Z') }
//     ],
//     role: 'user'
//   },
//   {
//     _id: 'user_bob',
//     username: 'bob',
//     email: 'bob@example.com',
//     bio: 'Nonfiction enthusiast and occasional reviewer.',
//     avatarUrl: 'https://example.com/avatars/bob.png',
//     joinedAt: new Date('2022-11-03T14:20:00Z'),
//     favorites: ['Sapiens', 'Thinking, Fast and Slow'],
//     readingList: [
//       { title: 'The Premonition', status: 'to-read', addedAt: new Date('2024-06-10T12:00:00Z') }
//     ],
//     role: 'user'
//   },
//   {
//     _id: 'user_carol',
//     username: 'carol',
//     email: 'carol@example.com',
//     bio: 'Illustrator and comic reader. Loves short serialized fiction.',
//     avatarUrl: 'https://example.com/avatars/carol.png',
//     joinedAt: new Date('2024-02-20T09:45:00Z'),
//     favorites: ['Sandman', 'Watchmen'],
//     readingList: [
//       { title: 'Something Wicked This Way Comes', status: 'completed', addedAt: new Date('2024-03-05T16:00:00Z') }
//     ],
//     role: 'user'
//   },
//   {
//     _id: 'user_dave',
//     username: 'dave',
//     email: 'dave@example.com',
//     bio: 'Book club organizer and moderator.',
//     avatarUrl: 'https://example.com/avatars/dave.png',
//     joinedAt: new Date('2021-08-12T11:10:00Z'),
//     favorites: ['Pride and Prejudice', 'The Great Gatsby'],
//     readingList: [],
//     role: 'moderator'
//   },
//   {
//     _id: 'user_admin',
//     username: 'admin',
//     email: 'admin@example.com',
//     bio: 'Site administrator.',
//     avatarUrl: 'https://example.com/avatars/admin.png',
//     joinedAt: new Date('2020-05-01T07:00:00Z'),
//     favorites: [],
//     readingList: [],
//     role: 'admin'
//   }
// ];

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