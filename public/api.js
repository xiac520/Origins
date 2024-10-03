const API_URL = 'https://origins-core.vercel.app';

async function fetchAPI(url, charset, callback, raw) {
  let proxyUrl = `${API_URL}/${raw ? 'raw' : 'get'}?url=${encodeURIComponent(url)}`;
  if (charset) {
    proxyUrl += `&charset=${encodeURIComponent(charset)}`;
  }
  if (callback) {
    proxyUrl += `&callback=${encodeURIComponent(callback)}`;
  }

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
}