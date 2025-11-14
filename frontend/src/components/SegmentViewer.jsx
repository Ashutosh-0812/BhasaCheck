import React, { useState, useEffect } from "react";
import RSMLEditor from "./RSMLEditor";
import RSMLGuide from "./RSMLGuide";

const API_URL = "http://localhost:4000/api";

export default function SegmentViewer({ segments, selectedParquet, selectedFile }) {
  const [audioUrls, setAudioUrls] = useState({});
  const [segmentTexts, setSegmentTexts] = useState({}); // Store modified texts
  const [mergedAudio, setMergedAudio] = useState(null);
  const [mergedTranscript, setMergedTranscript] = useState("");
  const [showMerged, setShowMerged] = useState(false);

  useEffect(() => {
    if (!segments || segments.length === 0) return;

    // Instead of creating blob URLs, use direct API URLs
    const urls = {};
    segments.forEach((seg) => {
      urls[seg.segment_id] = `${API_URL}/audio/${selectedParquet}/${selectedFile}/${seg.segment_id}`;
    });
    setAudioUrls(urls);

    // No cleanup needed for direct URLs
  }, [segments, selectedParquet, selectedFile]);

  // Handle text changes for segments
  const handleTextChange = (segmentId, type, newText) => {
    setSegmentTexts(prev => ({
      ...prev,
      [segmentId]: {
        ...prev[segmentId],
        [type]: newText
      }
    }));
  };

  // Merge all segments with 1s white noise and create timestamped transcript
  const handleMergeSegments = async () => {
    if (!segments || segments.length === 0) return;

    try {
      // Create AudioContext for merging
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const silenceDuration = 1; // 1 second
      const silenceLength = sampleRate * silenceDuration;
      
      let totalLength = 0;
      const audioBuffers = [];
      
  
      for (const seg of segments) {
        try {
          const response = await fetch(`${API_URL}/audio/${selectedParquet}/${selectedFile}/${seg.segment_id}`);
          if (!response.ok) {
            console.error(`Failed to fetch audio for segment ${seg.segment_id}`);
            continue;
          }
          const arrayBuffer = await response.arrayBuffer();
          
        
          try {
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioBuffers.push({ buffer: audioBuffer, segment: seg });
            totalLength += audioBuffer.length + silenceLength;
          } catch (decodeError) {
            console.error(`Failed to decode audio for segment ${seg.segment_id}:`, decodeError);
         
            continue;
          }
        } catch (fetchError) {
          console.error(`Error fetching segment ${seg.segment_id}:`, fetchError);
          continue;
        }
      }
      
      if (audioBuffers.length === 0) {
        alert('No audio segments could be loaded. Please check the audio format.');
        return;
      }
      
      // Remove last silence
      totalLength -= silenceLength;
      
      // Create merged buffer
      const mergedBuffer = audioContext.createBuffer(
        audioBuffers[0].buffer.numberOfChannels,
        totalLength,
        sampleRate
      );
      
      // Build transcript with timestamps
      let transcript = "Verbatim:\n\n";
      let currentTime = 0;
      let offset = 0;
      
      for (let i = 0; i < audioBuffers.length; i++) {
        const { buffer, segment } = audioBuffers[i];
        
        // Copy audio data
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          mergedBuffer.copyToChannel(channelData, channel, offset);
        }
        
        // Calculate timestamps
        const startTime = currentTime;
        const endTime = currentTime + (buffer.duration);
        
        // Format timestamps
        const formatTime = (seconds) => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          const ms = Math.floor((seconds % 1) * 1000);
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
        };
        
        transcript += `${i + 1}\n`;
        transcript += `${formatTime(startTime)} -> ${formatTime(endTime)}\n`;
        transcript += `${segment.verbatim || 'No verbatim text'}\n\n`;
        
        offset += buffer.length;
        currentTime = endTime;
        
        // Add silence (except after last segment)
        if (i < audioBuffers.length - 1) {
          offset += silenceLength;
          currentTime += silenceDuration;
        }
      }
      
      // Convert to WAV and create blob URL
      const wavBlob = bufferToWave(mergedBuffer, mergedBuffer.length);
      const url = URL.createObjectURL(wavBlob);
      
      setMergedAudio(url);
      setMergedTranscript(transcript);
      setShowMerged(true);
      
    } catch (error) {
      console.error('Error merging segments:', error);
      
      // Fallback: Just create transcript without audio merging
      let transcript = "Verbatim:\n\n";
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        transcript += `${i + 1}\n`;
        transcript += `Segment ${seg.segment_id}\n`;
        transcript += `${seg.verbatim || 'No verbatim text'}\n\n`;
      }
      setMergedTranscript(transcript);
      setMergedAudio(null); // No merged audio available
      setShowMerged(true);
      
      alert('Audio merging failed due to format compatibility issues. Showing transcript only. You can still play individual segment audios below.');
    }
  };
  
  // Helper function to convert AudioBuffer to WAV
  const bufferToWave = (abuffer, len) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;
    
    // Write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length
    
    // Write interleaved data
    for (let i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));
    
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    
    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
    
    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  if (!segments || segments.length === 0)
    return <p className="text-center text-muted mt-4">No segments available.</p>;

  return (
    <div className="mt-3">
      {/* Merge Button */}
      <div className="row mb-3">
        <div className="col-12 text-center">
          <button 
            className="btn btn-primary me-2"
            onClick={() => setShowMerged(false)}
            disabled={!showMerged}
          >
            Individual Segments
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleMergeSegments}
          >
            Merge All Segments
          </button>
        </div>
      </div>

      {/* Merged View */}
      {showMerged && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="mb-3 pb-2 border-bottom">
                  <small className="text-muted">Merged View ({segments.length} segments)</small>
                </div>
                
                {/* Merged Audio Player */}
                {mergedAudio && (
                  <div className="mb-4">
                    <div className="fw-semibold mb-2">Merged Audio Player</div>
                    <audio
                      controls
                      className="w-100"
                      src={mergedAudio}
                      preload="auto"
                    />
                  </div>
                )}
                
                {/* Merged Transcript */}
                <div className="mb-3">
                  <div className="fw-semibold mb-2">Merged Verbatim Transcript</div>
                  <pre className="border rounded p-3" style={{
                    backgroundColor: "#f8f9fa",
                    maxHeight: "500px",
                    overflowY: "auto",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap"
                  }}>{mergedTranscript}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Segments View */}
      {!showMerged && (
        <div className="row">
          <div className="col-12">
            {segments.map((seg) => (
              <div key={seg.segment_id} className="card shadow-sm mb-4">
                <div className="card-body">
                  {/* Segment Header */}
                  <div className="mb-3">
                    <h5 className="mb-2">Segment {seg.segment_id}</h5>
                    <div className="text-muted small">
                      Speaker: {seg.speaker_id || "N/A"} | Scenario: {seg.scenario || "N/A"}
                    </div>
                  </div>

                  {/* Audio Player */}
                  <div className="mb-4">
                    <div className="fw-semibold mb-2">Audio Player</div>
                    {audioUrls[seg.segment_id] ? (
                      <audio
                        controls
                        className="w-100"
                        src={audioUrls[seg.segment_id]}
                        preload="metadata"
                        onError={(e) => console.error("Audio error:", e.target.error)}
                      />
                    ) : (
                      <div className="text-muted">Loading audio...</div>
                    )}
                  </div>

                  {/* Single RSML Editor */}
                  <RSMLEditor
                    segmentId={seg.segment_id}
                    initialText={
                      segmentTexts[seg.segment_id]?.verbatim ||
                      seg.verbatim ||
                      ""
                    }
                    placeholder="Type @ for tags, # for entities, ! for languages..."
                    onTextChange={(text) => 
                      handleTextChange(seg.segment_id, "verbatim", text)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
