import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema({
  parquet_id: Number,
  file_id: Number,
  segment_id: Number,
  verbatim: String,
  normalized: String,
  lang: String,
  scenario: String,
  speaker_id: String,
  audio_data: String, 
  metadata: {
    duration: Number,
    samples: Number,
    state: String,
    district: String,
    task_name: String,
    verification: Object,
  },
});

export default mongoose.model("Segment", segmentSchema);
