import axios from "axios";

const API_URL = "http://localhost:4000/api";

async function testAudio() {
  try {
    console.log('Testing audio endpoint...');
    
    // Test getting segments
    const segments = await axios.get(`${API_URL}/parquets/6/files/1`);
    console.log(`✅ Got ${segments.data.length} segments`);
    
    if (segments.data.length > 0) {
      const firstSegment = segments.data[0];
      console.log('First segment:', {
        id: firstSegment.segment_id,
        verbatim: firstSegment.verbatim,
        hasAudioData: !!firstSegment.audio_data,
        audioLength: firstSegment.audio_data?.length || 0
      });
      
      // Test audio endpoint
      console.log('\nTesting audio endpoint: /audio/6/1/1');
      const audioResponse = await axios.get(`${API_URL}/audio/6/1/1`, {
        responseType: 'arraybuffer'
      });
      
      console.log('✅ Audio response:', {
        status: audioResponse.status,
        contentType: audioResponse.headers['content-type'],
        size: audioResponse.data.byteLength
      });
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.status, err.response.data);
    }
  }
}

testAudio();
