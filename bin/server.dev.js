#!/usr/bin/env node

require('dotenv').config()
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackHotServerMiddleware = require('webpack-hot-server-middleware')
const https = require('https')
// const path = require('path')

const clientConfig = require('../webpack/client.dev')
const serverConfig = require('../webpack/server.dev')

const publicPath = clientConfig.output.publicPath
const compiler = webpack([clientConfig, serverConfig])
const clientCompiler = compiler.compilers[0]
const options = { publicPath, stats: { colors: true } }

// To make it trusted by Chrome browser you should copy the certificate into a file *.crt and then import it in Chrome
// (Settings > Manage certificates > Authorities)
const serverCrt = `
-----BEGIN CERTIFICATE-----
MIIDfDCCAmSgAwIBAgIJANyurTwMO0tcMA0GCSqGSIb3DQEBCwUAMEcxCzAJBgNV
BAYTAkZJMREwDwYDVQQIDAhIZWxzaW5raTERMA8GA1UECgwIRmlubnBsYXkxEjAQ
BgNVBAMMCWxvY2FsaG9zdDAgFw0xOTA1MjMxNTI2MjJaGA8yMTE5MDQyOTE1MjYy
MlowRzELMAkGA1UEBhMCRkkxETAPBgNVBAgMCEhlbHNpbmtpMREwDwYDVQQKDAhG
aW5ucGxheTESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEAvfKWDgdsLqe/8tM4TBtN8s/GZPjTc5If+dyxo4kvepwB8nTz
vF5wDiHEzeV4CU00GxUUJsPFC6+FyItrqHMAt8RWGlOthmKyyG2DaDbfKdc0x7RR
0a5/qPf/LTDShKIzRT9qZ8DlBkL4MIZtS98SVqg6twmxO3cLwdN4mXg51rheoSCG
+EM8mIBDYjX+/W0vgTLFJkd19RfdLSvIJdUf3u3Z4SKuj0P5z1h9Gdu5gUoHy2Zj
OOqeasr8dyVzh5eRK+H2MqQTubLGIKki3U6WsTi6RJRRSvOXZaXnxDS2ltxEBdQd
146fplBfC2K3hM+xclNkR5TLS+9WNSjLW3hguQIDAQABo2kwZzAdBgNVHQ4EFgQU
VcBGzZ5/Y0eASiZtlVf9E0GAWfIwHwYDVR0jBBgwFoAUVcBGzZ5/Y0eASiZtlVf9
E0GAWfIwDwYDVR0TAQH/BAUwAwEB/zAUBgNVHREEDTALgglsb2NhbGhvc3QwDQYJ
KoZIhvcNAQELBQADggEBAI+nWKil7BRmG3zyAE3vLVJeVYGNXvNo4fP5VEUmIy1v
L0880aAjtXtX3YslQtgFBRR9IdFLeAHTV8snOWBa82nYE0blFySgvTRTakehRdOW
X2Q5zYPAHWBdsBH7EbxGesG/RH7GPw6Fp2vfd91j4s6i9RmGhemCLh/YceB8gEAg
Hz5rcOJ4enb021XrsJutrZP28cGNC1wfI9tMW1lI/mVk/71vZ1+RwYOpTlPojXm/
nXyHjW3riH1s+VBnllSpYn1/f0U7ogZDUcybQhVMdQNe/xnuUSaxUZS0CpPDifMZ
N3A6lQH5KCUVDjLuMNOg25QXxGluJdzg/z8lbY1irRs=
-----END CERTIFICATE-----
`

const serverKey = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC98pYOB2wup7/y
0zhMG03yz8Zk+NNzkh/53LGjiS96nAHydPO8XnAOIcTN5XgJTTQbFRQmw8ULr4XI
i2uocwC3xFYaU62GYrLIbYNoNt8p1zTHtFHRrn+o9/8tMNKEojNFP2pnwOUGQvgw
hm1L3xJWqDq3CbE7dwvB03iZeDnWuF6hIIb4QzyYgENiNf79bS+BMsUmR3X1F90t
K8gl1R/e7dnhIq6PQ/nPWH0Z27mBSgfLZmM46p5qyvx3JXOHl5Er4fYypBO5ssYg
qSLdTpaxOLpElFFK85dlpefENLaW3EQF1B3Xjp+mUF8LYreEz7FyU2RHlMtL71Y1
KMtbeGC5AgMBAAECggEBAJotLIUomzPnb1MfBOQpiYScB5HvslptckzySLHP6Vzh
AmeVbD0qflPKLx9csakDJFcTLe8lGmyYxMN5/yGUbzG6SJVH9GJO/ITY9z+AwnUI
vEuY3oyO0goJefNpXIbRzUHY7npWxM7nTuK8Sjy6TP1PwZDOajA1ObLS/mG7h17z
k5FU4aO2KCTCeBPyd4+G5gAx0svSjvd6Le5g+s7KsfW1WmgN3utFT4RTKWVnIM2y
0yWyoBoj7QfjQXsE25Ucz7kNgPAX9vwJIjt5iKCvQbwUi2qlDj+RrFSi8d3ria6X
hD/+LPwWNbBY4aF8AiNojEBAAs28vL1PQeU2Ouj9B40CgYEA5FdYBWfSaln+n4WR
sA53rnxDd7obd82hy4jDsfrsNgyVdINVJZ0Do3LjcQ/tyaUBV0nvPr8IfcZFq6LD
uTNblSGMqNl8stav7XzNwaJUq+/rnmLAIQcFr+qnyvy7XfLMubrBLLYYmyX9xzgH
fLUq10t5vc7YpcxmEk6F1fItJfMCgYEA1PSxCmPOUGYjmaNe5AFCN5v2AF8g2Ry/
d4jCYd56+TDXeUw58iRELvy4H++JBx/2szBGbTt6zrh9vnJvvSivLA4emn/FB7sP
5/IVwTWgFJQopawXJSZ7a6nUyQOG61u/VNG+lEcERVUUaT0wfLEmFVikyO9dZp2c
AkVWAuKcraMCgYAyYYMuTiYDCTBBCjuG2OpXOVu5gvqkiF52hgqHrpGHq2ceegvD
bM1stuCwBY+1ug59r/Z1pbi9541fvV3p8wb19J0QdEwrOWs/vxW275Y3CYy3OZqi
ruX2VpQHGZRNulCpeic9MkBjmxJPbnFYdrCpKCIIWyc6DctHpsOo3PJROQKBgF52
mF3ife8+D4akaIA9arEeNpZdnEWSsgAFIyyksun812gP/xhBLBmnssk/yQnnDNjZ
jjQAEW7HecfUHWrMNEAXl02zZaQTP3AE+89zySm3uvwahT3Ofyr379KnBN88GHg4
fhBqHCPhJKe2I977+ce4RYh4XXcabMy5Evk+qn9/AoGAfeITTLCDCQ6+hwYI/qVn
1n2rC/tW3vL7QY1kpuK2dECjnNt+QqsYMyKy9fV7EYAhmrGgtxMfPNcC629/qkdo
gzCGalYDpgAhGyN2SNA6ashQ+xzthXDsu7xPGl4FQWlsg0+zAUnqsuGxt5XFBlcW
rpLlgdytPG1YDUGdwnZiSmI=
-----END PRIVATE KEY-----
`

const DEBUG_MODE = process.env.DEBUG_MODE === 'true'

const webpackDevMiddlewareCreated = webpackDevMiddleware(compiler, options)
const webpackHotMiddlewareCreated = webpackHotMiddleware(clientCompiler)
const webpackHotServerMiddlewareCreated = webpackHotServerMiddleware(compiler)

let isBuilt = false

compiler.plugin('done', () => {
  if (!isBuilt) {
    isBuilt = true

    const app = require('../_build_dev/server/app.js').app

    app.use(webpackDevMiddlewareCreated)
    app.use(webpackHotMiddlewareCreated)
    app.use(webpackHotServerMiddlewareCreated)

    // Error handler
    app.use((err, req, res, next) => {
      // eslint-disable-next-line no-console
      console.error(DEBUG_MODE ? err : '' + err)
    })

    if (process.env.HTTPS === 'true') {
      const options = {
        key: serverKey,
        cert: serverCrt
      }

      https.createServer(options, app).listen(process.env.HTTPS_PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Listening @ https://localhost:${process.env.HTTPS_PORT}/`)
      })
    } else {
      app.listen(process.env.APP_PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Listening @ http://localhost:${process.env.APP_PORT}/`)
      })
    }
  }
})
