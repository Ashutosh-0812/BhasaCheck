import { parquetRead } from "hyparquet";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Segment from "../models/Segment.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { tmpdir } from "os";
import { join } from "path";

ffmpeg.setFfmpegPath(ffmpegPath.path);

dotenv.config();

// Convert FLAC bytes to WAV bytes
function convertFlacToWav(flacBytes) {
  return new Promise((resolve, reject) => {
    const tempFlacPath = join(tmpdir(), `temp_${Date.now()}.flac`);
    const tempWavPath = join(tmpdir(), `temp_${Date.now()}.wav`);

    try {
      // Write FLAC bytes to temp file
      writeFileSync(tempFlacPath, Buffer.from(flacBytes));

      // Convert FLAC to WAV using ffmpeg
      ffmpeg(tempFlacPath)
        .audioCodec('pcm_s16le')
        .format('wav')
        .on('end', () => {
          try {
            // Read WAV file
            const wavBytes = readFileSync(tempWavPath);
            
            // Cleanup temp files
            unlinkSync(tempFlacPath);
            unlinkSync(tempWavPath);
            
            resolve(wavBytes);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          // Cleanup on error
          try {
            unlinkSync(tempFlacPath);
            if (readFileSync(tempWavPath)) unlinkSync(tempWavPath);
          } catch {}
          reject(err);
        })
        .save(tempWavPath);
    } catch (err) {
      reject(err);
    }
  });
}


async function seedParquet(parquetPath, parquetId, fileId) {
  console.log('✅ Connected to MongoDB | Seeding ' + parquetPath);

  let counter = 0;
  
  return new Promise((resolve, reject) => {
    try {
      const buffer = readFileSync(parquetPath);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      parquetRead({
        file: arrayBuffer,
        onComplete: async (data) => {
          console.log('📊 Read ' + data.length + ' rows from ' + parquetPath);
          
          // Limit to first 10 segments only
          const limitedData = data.slice(0, 10);
          console.log('⚡ Processing only first ' + limitedData.length + ' segments');
          
          try {
            for (const record of limitedData) {
              let audioBase64 = "";
              try {
                // Column 0 contains audio data as bytes object
                if (record['0']?.bytes) {
                  console.log(`🔄 Converting segment ${counter + 1} from FLAC to WAV...`);
                  const wavBytes = await convertFlacToWav(record['0'].bytes);
                  audioBase64 = wavBytes.toString("base64");
                  console.log(`✅ Converted segment ${counter + 1} to WAV`);
                }
              } catch (err) {
                console.warn(`⚠️ Failed to convert audio for segment ${counter + 1}:`, err.message);
              }

              const segment = new Segment({
                parquet_id: parquetId,
                file_id: fileId,
                segment_id: ++counter,
                verbatim: record['1'] || record['6'] || "",  // Column 1 or 6 for verbatim
                normalized: record['5'] || record['6'] || "",  // Column 5 for normalized
                lang: record['3'] || "unknown",  // Column 3 for language
                scenario: record['8'] || "",  // Column 8 for scenario
                speaker_id: record['7'] || "",  // Column 7 for speaker ID
                audio_data: audioBase64,
                metadata: {
                  duration: record['2'] ? parseFloat(record['2']) : 0,  // Column 2
                  samples: record['4'] ? parseInt(record['4']) : 0,  // Column 4
                  state: record['16'] || "",  // Column 16
                  district: record['15'] || "",  // Column 15
                  task_name: record['9'] || "",  // Column 9
                  verification: record['18'],  // Column 18
                },
              });

              await segment.save();
            }
            
            console.log('🎉 Done! ' + counter + ' segments added for Parquet ' + parquetId);
            resolve();
          } catch (err) {
            console.error('❌ Error saving segments:', err && err.message ? err.message : err);
            reject(err);
          }
        }
      });
    } catch (err) {
      console.error('❌ Failed to process Parquet file ' + parquetPath + ':', err && err.message ? err.message : err);
      reject(err);
    }
  });
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🚀 MongoDB connected');
  
  await seedParquet("./data/6.parquet", 6, 1);
  await seedParquet("./data/7.parquet", 7, 1);
  
  await mongoose.disconnect();
  console.log('✅ All done! Disconnected from MongoDB');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
