import mongoose, { ConnectOptions } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; // Removed '!' for cleaner check

if (!MONGODB_URI) {
  // Use a standard Error for deployment environments
  throw new Error('Please define MONGODB_URI in .env.local or environment variables');
}

// 1. Define Cache Interface
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 2. Safely Access and Initialize Global Cache
const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached: MongooseCache = globalWithMongoose.mongoose;

// 3. Connection Function
async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      // Add 'useNewUrlParser' and 'useUnifiedTopology' if Mongoose version is < 6.0.0
    };

    // Cast MONGODB_URI as string since we checked it above
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Clear the failed promise
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;