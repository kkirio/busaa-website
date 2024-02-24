const router = require("express").Router(),
	userRoutes = require("./userRoutes"),
	eventRoutes = require("./eventRoutes"),
	jobRoutes = require("./jobRoutes"),
	apiRoutes = require("./apiRoutes"),
	errorRoutes = require("./errorRoutes"),
	homeRoutes = require("./homeRoutes");

router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/jobs", jobRoutes);
router.use("/api", apiRoutes);
router.use("/", homeRoutes);
router.use("/", errorRoutes);

module.exports = router;
