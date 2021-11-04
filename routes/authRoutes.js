const express = require("express");
const router = express.Router();

const AuthCrl = require("../controllers/authController");

router.post('/register', AuthCrl.CreateUser);
router.post("/login", AuthCrl.LoginUser);

module.exports = router;