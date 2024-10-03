const fetch = require('node-fetch');
const iconv = require('iconv-lite');

module.exports = async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  const queryParams = url.searchParams;

  const targetUrl = queryParams.get('url');
  const charset = queryParams.get('charset');
  const callback = queryParams.get('callback');

  if (!targetUrl) {
    res.status(400).send('缺少 URL 参数');
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Vercel-Serverless-Function',
        'Accept': '*/*'
      }
    });

    let contentType = response.headers.get('content-type') || 'text/plain';
    let body = await response.buffer();

    // 处理字符集
    if (charset) {
      body = iconv.decode(body, charset);
      contentType = `${contentType}; charset=utf-8`;
    } else {
      body = body.toString('utf-8');
    }

    // 处理原始内容
    if (pathSegments[0] === 'raw') {
      res.setHeader('content-type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(response.status).send(body);
      return;
    }

    // 处理 JSONP
    if (pathSegments[0] === 'get' && callback) {
      const jsonResponse = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        content: body
      });
      body = `${callback}(${jsonResponse})`;
      contentType = 'application/javascript';
    }

    res.setHeader('content-type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).send(`获取 URL 时出错: ${error.message}`);
  }
};