const router = require("express").Router(),
	eventsController = require("../controllers/eventsController"),
	usersController = require("../controllers/usersController");

// Display all events
router.get("/", eventsController.index, eventsController.indexView);

// Create event
router.get("/new", usersController.isAuthenticated, eventsController.new, eventsController.redirectView);
router.post("/create",
	usersController.isAuthenticated,
	eventsController.validate,
	eventsController.create,
	eventsController.redirectView);

// Display one event
router.get("/:id", eventsController.show, eventsController.showView);

// Edit event
router.get("/:id/edit",
	usersController.isAuthenticated,
	eventsController.show,
	eventsController.editView,
	eventsController.redirectView);
router.put("/:id/update",
	usersController.isAuthenticated,
	eventsController.validate,
	eventsController.update,
	eventsController.redirectView);

// Register as an attendee
router.get("/:id/register",
	usersController.isAuthenticated,
	eventsController.register, 
	eventsController.redirectView);

// Delete event
router.delete("/:id/delete",
	usersController.isAuthenticated,
	eventsController.delete,
	eventsController.redirectView);

module.exports = router;