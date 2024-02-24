const router = require("express").Router(),
	jobsController = require("../controllers/jobsController"),
	usersController = require("../controllers/usersController");

// Display all jobs
router.get("/", jobsController.index, jobsController.indexView);

// Create job
router.get("/new", usersController.isAuthenticated, jobsController.new, jobsController.redirectView);
router.post("/create",
	usersController.isAuthenticated,
	jobsController.validate,
	jobsController.create,
	jobsController.redirectView);

// Display one job
router.get("/:id", jobsController.show, jobsController.showView);

// Edit job
router.get("/:id/edit",
	usersController.isAuthenticated,
	jobsController.show,
	jobsController.editView,
	jobsController.redirectView);
router.put("/:id/update",
	usersController.isAuthenticated,
	jobsController.validate,
	jobsController.update,
	jobsController.redirectView);

// Delete job
router.delete("/:id/delete",
	usersController.isAuthenticated,
	jobsController.delete,
	jobsController.redirectView);

module.exports = router;