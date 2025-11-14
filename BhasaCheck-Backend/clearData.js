import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function clearSegments() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
  
  const result = await mongoose.connection.db.collection('segments').deleteMany({});
  console.log(`🗑️  Deleted ${result.deletedCount} segments`);
  
  await mongoose.disconnect();
  console.log('✅ Disconnected');
}

clearSegments().catch(console.error);
