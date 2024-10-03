async function fetchAPI(url, charset, callback, raw) {
  let proxyUrl = `https://origins.dnscron.com/api/${raw ? 'raw' : 'get'}?url=${encodeURIComponent(url)}`;
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