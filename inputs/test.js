const axios = require('axios');

async function sendPostRequest() {
  try {

    const url = 'https://example.com/api';
    const data = {
      filePath:"/media/sf_automations/server/downloads/instagram/minetomeme/video/2932229522963100120_35921422568.mp4", dragEndX:957, dragEndY:594
    };

    const response = await axios.post(url, data);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error posting data:', error.message);
  }
}

sendPostRequest();
