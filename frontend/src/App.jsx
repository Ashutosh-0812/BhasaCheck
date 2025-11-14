import React, { useState, useEffect } from "react";
import axios from "axios";
import SegmentViewer from "./components/SegmentViewer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"; // backend URL

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
    <div className="container-fluid py-3">
      {/* File Selectors */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex gap-3 align-items-center justify-content-center">
            {/* Parquet Selector */}
            <div style={{ minWidth: '200px' }}>
              <select
                className="form-select"
                value={selectedParquet || ''}
                onChange={(e) => {
                  const pid = e.target.value;
                  if (pid) loadFiles(pid);
                }}
              >
                <option value="">Select Parquet</option>
                {parquets.map((pid) => (
                  <option key={pid} value={pid}>
                    Parquet {pid}
                  </option>
                ))}
              </select>
            </div>

            {/* File Selector */}
            <div style={{ minWidth: '200px' }}>
              <select
                className="form-select"
                value={selectedFile || ''}
                onChange={(e) => setSelectedFile(e.target.value)}
                disabled={!selectedParquet || files.length === 0}
              >
                <option value="">Select File</option>
                {files.map((fid) => (
                  <option key={fid} value={fid}>
                    Audio File {fid}
                  </option>
                ))}
              </select>
            </div>

            {/* Load Button */}
            <button
              className="btn btn-primary"
              onClick={() => {
                if (selectedParquet && selectedFile) {
                  loadSegments(selectedParquet, selectedFile);
                }
              }}
              disabled={!selectedParquet || !selectedFile}
            >
              Load
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        <div className="col-12">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-muted">Loading segments...</h5>
              <p className="text-muted">Please wait while we fetch the audio segments.</p>
            </div>
          ) : (
            <SegmentViewer
              segments={segments}
              selectedParquet={selectedParquet}
              selectedFile={selectedFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
