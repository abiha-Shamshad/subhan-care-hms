import dns from 'dns';
import mongoose from 'mongoose';

// Some routers/ISP DNS forwarders mishandle SRV record queries (used by
// mongodb+srv:// URIs) even though normal A/AAAA lookups work fine through
// them. Falling back to public resolvers avoids spurious connection failures
// that have nothing to do with Atlas or this app.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy backend/.env.example to backend/.env and fill it in.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};
