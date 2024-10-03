const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathSegments = url.pathname.split('/').filter(segment => segment);

  if (pathSegments.length < 2 || pathSegments[0] !== 'api') {
    return res.status(400).send('无效的路径');
  }

  const params = pathSegments.slice(1, -1);
  const targetUrl = decodeURIComponent(pathSegments[pathSegments.length - 1]);

  let charset = null;
  let callback = null;

  for (const param of params) {
    const [key, value] = param.split('=');
    if (key === 'charset') {
      charset = value;
    } else if (key === 'callback') {
      callback = value;
    }
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Vercel-Worker',
        'Accept': '*/*'
      }
    });

    let contentType = response.headers.get('content-type') || 'text/plain';
    let body = await response.text();

    // 处理字符集
    if (charset) {
      contentType = `${contentType}; charset=${charset}`;
    }

    // 处理原始内容
    if (url.pathname.startsWith('/api/raw')) {
      return res.status(response.status).set({
        'content-type': contentType,
        'Access-Control-Allow-Origin': '*', // 添加 CORS 头
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 添加 CORS 头
        'Access-Control-Allow-Headers': 'Content-Type' // 添加 CORS 头
      }).send(body);
    }

    // 处理 JSONP
    if (callback) {
      const jsonResponse = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        content: body
      });
      body = `${callback}(${jsonResponse})`;
      contentType = 'application/javascript';
    }

    return res.status(response.status).set({
      'content-type': contentType,
      'Access-Control-Allow-Origin': '*', // 添加 CORS 头
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 添加 CORS 头
      'Access-Control-Allow-Headers': 'Content-Type' // 添加 CORS 头
    }).send(body);
  } catch (error) {
    return res.status(500).send(`获取 URL 时出错: ${error.message}`);
  }
};