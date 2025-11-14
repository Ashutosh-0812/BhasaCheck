import express from "express";
import {
  getParquets,
  getFilesByParquet,
  getSegments,
  getAudio,
} from "../controller/segmentController.js";

const router = express.Router();

router.get("/parquets", getParquets);
router.get("/parquets/:pid/files", getFilesByParquet);
router.get("/parquets/:pid/files/:fid", getSegments);
router.get("/audio/:pid/:fid/:sid", getAudio);

export default router;
