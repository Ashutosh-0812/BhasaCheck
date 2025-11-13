import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:4000/api";

export default function SegmentViewer({ segments, selectedParquet, selectedFile }) {
  const [audioUrls, setAudioUrls] = useState({});

  useEffect(() => {
    if (!segments || segments.length === 0) return;

    const urls = {};
    const fetchAudioBlobs = async () => {
      for (const seg of segments) {
        try {
          const response = await fetch(`${API_URL}/audio/${selectedParquet}/${selectedFile}/${seg.segment_id}`);
          if (response.ok) {
            const blob = await response.blob();
            urls[seg.segment_id] = URL.createObjectURL(blob);
          } else {
            console.error(`Failed to fetch audio for segment ${seg.segment_id}`);
          }
        } catch (err) {
          console.error(`Error fetching audio for segment ${seg.segment_id}:`, err);
        }
      }
      setAudioUrls(urls);
    };

    fetchAudioBlobs();

    // cleanup object URLs on unmount
    return () => {
      Object.values(audioUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [segments, selectedParquet, selectedFile]);

  if (!segments || segments.length === 0)
    return <p className="text-center text-muted mt-4">No segments available.</p>;

  return (
    <div className="mt-4">
      <h5 className="mb-3">Segments for File {selectedFile}</h5>
      {segments.map((seg) => (
        <div key={seg.segment_id} className="card mb-3 shadow-sm">
          <div className="card-body">
            <h6 className="card-title">
              Segment #{seg.segment_id} ({seg.lang?.toUpperCase() || "Unknown"})
            </h6>
            <p className="mb-1"><strong>Verbatim:</strong> {seg.verbatim || "—"}</p>
            <p className="mb-1"><strong>Normalized:</strong> {seg.normalized || "—"}</p>
            <p className="text-muted small mb-2">
              Speaker: {seg.speaker_id || "N/A"} | Scenario: {seg.scenario || "N/A"}
            </p>
            {audioUrls[seg.segment_id] ? (
              <audio
                controls
                className="w-100"
                src={audioUrls[seg.segment_id]}
                preload="auto"
                onError={(e) => console.error("Audio error:", e.target.error)}
              />
            ) : (
              <div className="text-muted small">Loading audio...</div>
            )}
            <div className="mt-2 d-flex gap-2">
              <a
                href={`${API_URL}/audio/${selectedParquet}/${selectedFile}/${seg.segment_id}`}
                download={`segment_${seg.segment_id}.mp3`}
                className="btn btn-sm btn-outline-primary"
              >
                📥 Download MP3
              </a>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  window.open(`${API_URL}/audio/${selectedParquet}/${selectedFile}/${seg.segment_id}`, "_blank")
                }
              >
                🔗 Open
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
