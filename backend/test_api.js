import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/blogs/published');
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
