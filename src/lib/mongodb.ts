import mongoose, { Connection } from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: Connection | null; promise: Promise<Connection> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!cached) {
    throw new Error('Cached mongoose connection is undefined');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => mongooseInstance.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;