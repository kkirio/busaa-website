const router = require("express").Router();
const usersController = require("../controllers/usersController");

// Login and logout
router.get("/login", usersController.login);
router.post("/login", usersController.authenticate);
router.get("/logout",
    usersController.logout,
    usersController.redirectView);

// Display all users
router.get("/", usersController.index, usersController.indexView);

// Create user
router.get("/new", usersController.new);
router.post("/create",
	usersController.validate,
	usersController.create,
	usersController.redirectView);

// Display one user
router.get("/:id", usersController.show, usersController.showView);

// Update user
router.get("/:id/edit", usersController.isAuthenticated, usersController.show, usersController.editView);
router.put("/:id/update",
	usersController.isAuthenticated,
	usersController.validate,
	usersController.update,
	usersController.redirectView);

// Delete user
router.delete("/:id/delete",
	usersController.isAuthenticated,
	usersController.delete,
	usersController.redirectView);

module.exports = router;
