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
 * Serve audio stream (FLAC format - direct from DB)
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

    // Send base64 audio data directly as JSON
    res.json({ audio_data: seg.audio_data });
  } catch (err) {
    console.error("🚨 Error serving audio:", err);
    if (!res.headersSent)
      res.status(500).json({ message: err.message });
  }
};
