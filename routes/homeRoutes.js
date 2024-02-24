const router = require("express").Router(),
	homeController = require("../controllers/homeController"),
	usersController = require("../controllers/usersController");

router.get("/", homeController.showIndex);
router.get("/about", homeController.showAbout);
router.get("/contact", homeController.showContact);
router.get("/chat", usersController.isAuthenticated, homeController.showChat);

module.exports = router;
