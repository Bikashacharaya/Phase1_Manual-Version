const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/v1',
    createProxyMiddleware({
      target: 'http://localhost:18080',
      changeOrigin: true,
      onProxyReq: function(proxyReq, req, res) {
        // Forward Authorization header manually
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
    })
  );
};
