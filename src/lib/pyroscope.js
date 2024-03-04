const Pyroscope = require('@pyroscope/nodejs')

Pyroscope.init({
  serverAddress: process.env.PYROSCOPE_SERVER_ADDRESS,
  appName: 'getmentor_dev',
  basicAuthUser: process.env.PYRSOCOPE_USER_ID,
  basicAuthPassword: process.env.PYRSOCOPE_PASSWORD,
})

console.log('pyroscope init')

Pyroscope.start()