import React, { useState, useEffect } from "react";
import axios from "axios";
import SegmentViewer from "./components/SegmentViewer";

const API_URL = "http://localhost:4000/api"; // backend URL

export default function App() {
  const [parquets, setParquets] = useState([]);
  const [files, setFiles] = useState([]);
  const [segments, setSegments] = useState([]);
  const [selectedParquet, setSelectedParquet] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all parquet IDs
  useEffect(() => {
    const loadParquets = async () => {
      try {
        const res = await axios.get(`${API_URL}/parquets`);
        setParquets(res.data);
      } catch (err) {
        console.error("Error loading parquets:", err);
      }
    };
    loadParquets();
  }, []);

  // Load files by parquet ID
  const loadFiles = async (pid) => {
    setSelectedParquet(pid);
    setSelectedFile(null);
    setSegments([]);
    try {
      const res = await axios.get(`${API_URL}/parquets/${pid}/files`);
      setFiles(res.data);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  // Load segments by file ID
  const loadSegments = async (pid, fid) => {
    setSelectedFile(fid);
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/parquets/${pid}/files/${fid}`);
      console.log('Loaded segments:', res.data.length, 'segments');
      console.log('First segment:', res.data[0]);
      setSegments(res.data);
    } catch (err) {
      console.error("Error loading segments:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">🎧 Audio Dataset Viewer</h1>

      {/* Step 1: Parquet Selector */}
      <div className="text-center mb-4">
        <h5>Select a Parquet File</h5>
        <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
          {parquets.length === 0 && <p className="text-muted">No parquets found</p>}
          {parquets.map((pid) => (
            <button
              key={pid}
              className={`btn ${
                pid === selectedParquet ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => loadFiles(pid)}
            >
              Parquet {pid}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: File Selector */}
      {files.length > 0 && (
        <div className="text-center mb-4">
          <h5>Available Files</h5>
          <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
            {files.map((fid) => (
              <button
                key={fid}
                className={`btn ${
                  fid === selectedFile ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => loadSegments(selectedParquet, fid)}
              >
                File {fid}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Segment Viewer */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2">Loading segments...</p>
        </div>
      ) : (
        <SegmentViewer
          segments={segments}
          selectedParquet={selectedParquet}
          selectedFile={selectedFile}
        />
      )}
    </div>
  );
}
