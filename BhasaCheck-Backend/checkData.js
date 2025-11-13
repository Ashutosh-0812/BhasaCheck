import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(' ok Connected to MongoDB');
  
  const segment = await mongoose.connection.db.collection('segments').findOne({parquet_id: 6, segment_id: 1});
  
  console.log('\n Sample segment from parquet 6:');
  console.log('Fields:', Object.keys(segment || {}));
  console.log('Has audio_data:', !!segment?.audio_data);
  console.log('Audio data length:', segment?.audio_data?.length || 0);
  console.log('Verbatim:', segment?.verbatim);
  console.log('Normalized:', segment?.normalized);
  console.log('Lang:', segment?.lang);
  
  await mongoose.disconnect();
}

checkData().catch(console.error);
