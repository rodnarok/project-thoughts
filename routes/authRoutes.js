const express = require("express");
const router = express.Router();
// controller
const AuthController = require("../controllers/AuthController");

router.get("/login", AuthController.login);
router.get("/register", AuthController.register);
router.post("/register", AuthController.registerPost);
router.get("/logout", AuthController.logout);
router.post("/login", AuthController.loginPost);

module.exports = router;
