addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(segment => segment)

  if (pathSegments.length < 2 || pathSegments[0] !== 'api') {
    return new Response('无效的路径', { status: 400 })
  }

  const params = pathSegments.slice(1, -1)
  const targetUrl = decodeURIComponent(pathSegments[pathSegments.length - 1])

  let charset = null
  let callback = null

  for (const param of params) {
    const [key, value] = param.split('=')
    if (key === 'charset') {
      charset = value
    } else if (key === 'callback') {
      callback = value
    }
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Vercel-Worker',
        'Accept': '*/*'
      }
    })

    let contentType = response.headers.get('content-type') || 'text/plain'
    let body = await response.text()

    // 处理字符集
    if (charset) {
      contentType = `${contentType}; charset=${charset}`
    }

    // 处理原始内容
    if (url.pathname.startsWith('/api/raw')) {
      return new Response(body, {
        headers: {
          'content-type': contentType,
          'Access-Control-Allow-Origin': '*', // 添加 CORS 头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 添加 CORS 头
          'Access-Control-Allow-Headers': 'Content-Type' // 添加 CORS 头
        },
        status: response.status,
        statusText: response.statusText
      })
    }

    // 处理 JSONP
    if (callback) {
      const jsonResponse = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        content: body
      })
      body = `${callback}(${jsonResponse})`
      contentType = 'application/javascript'
    }

    return new Response(body, {
      headers: {
        'content-type': contentType,
        'Access-Control-Allow-Origin': '*', // 添加 CORS 头
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 添加 CORS 头
        'Access-Control-Allow-Headers': 'Content-Type' // 添加 CORS 头
      },
      status: response.status,
      statusText: response.statusText
    })
  } catch (error) {
    return new Response(`获取 URL 时出错: ${error.message}`, { status: 500 })
  }
}