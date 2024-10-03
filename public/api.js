const API_URL = 'https://origins.dnscron.com';

async function fetchAPI(url, charset, callback, raw) {
  let proxyUrl = `${API_URL}/${raw ? 'raw' : 'get'}?url=${encodeURIComponent(url)}`;
  if (charset) {
    proxyUrl += `&charset=${encodeURIComponent(charset)}`;
  }
  if (callback) {
    proxyUrl += `&callback=${encodeURIComponent(callback)}`;
  }

  try {
    const response = await axios.get(proxyUrl);
    return response.data;
  } catch (error) {
    throw new Error(`HTTP error! status: ${error.response.status}`);
  }
}