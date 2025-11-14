import Segment from "../models/Segment.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";

ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * Fetch all unique parquet IDs
 */
export const getParquets = async (req, res) => {
  try {
    const parquets = await Segment.distinct("parquet_id");
    res.json(parquets);
  } catch (err) {
    console.error("Error fetching parquets:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Fetch all unique file IDs for a given parquet
 */
export const getFilesByParquet = async (req, res) => {
  try {
    const files = await Segment.find({ parquet_id: req.params.pid }).distinct("file_id");
    res.json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Fetch all segments (metadata + text, excluding audio)
 */
export const getSegments = async (req, res) => {
  try {
    const segments = await Segment.find({
      parquet_id: req.params.pid,
      file_id: req.params.fid,
    }).select("-audio_data"); // exclude heavy audio_data

    res.json(segments);
  } catch (err) {
    console.error("Error fetching segments:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Serve audio stream (WAV format - pre-converted during seeding)
 */
export const getAudio = async (req, res) => {
  try {
    const { pid, fid, sid } = req.params;

    const seg = await Segment.findOne({
      parquet_id: parseInt(pid),
      file_id: parseInt(fid),
      segment_id: parseInt(sid),
    });

    if (!seg) return res.status(404).send("Segment not found");
    if (!seg.audio_data) return res.status(404).send("Audio data not found");

    // Decode base64 audio data (WAV format)
    const audioBuffer = Buffer.from(seg.audio_data, "base64");
    
    console.log(`🎧 Serving WAV audio for segment ${sid}...`);
    console.log(`📦 Buffer size: ${audioBuffer.length} bytes`);

    if (audioBuffer.length < 100) {
      return res.status(400).send("Invalid or empty audio data");
    }

    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "public, max-age=3600",
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*",
    });

    res.send(audioBuffer);
    console.log(`✅ WAV audio sent for segment ${sid}`);
  } catch (err) {
    console.error("🚨 Error serving audio:", err);
    if (!res.headersSent)
      res.status(500).json({ message: err.message });
  }
};
