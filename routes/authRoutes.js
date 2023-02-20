const express = require("express")
const router = express.Router()
const authController = require("../controllers/authControllers")
const loginLimiter = require("../middleware/loginLimiter")

router.route('/')
  .post(loginLimiter,)

router.route('/refresh')
  .get()

router.route('/logout')
  .post()

module.exports = router