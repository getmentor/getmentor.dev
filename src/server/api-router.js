var express = require('express')
var router = express.Router()

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log('api')
  res.send({ success: true, method: 'get' })
})

router.post('/', function (req, res, next) {
  console.log('api')
  res.send({ success: true, method: 'post' })
})

module.exports = router
