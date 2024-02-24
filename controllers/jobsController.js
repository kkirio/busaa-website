const Job = require("../models/job");

const getParams = (body) => {
    let params = 
    {       
        title: body.title,
        company: body.company,
        location: body.location,
        description: body.description,
        requirements: body.requirements,
        salary: body.salary,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        postDate: body.postDate,
        deadlineDate: body.deadlineDate,
        isActive: body.isActive
    };
	if (!params["postDate"]) {
		params["postDate"] = new Date();
	}
	// Convert to boolean
    if (params["isActive"] == "yes") {
        params["isActive"] = true;
    } else {
        params["isActive"] = false;
    }
    return params;
};

module.exports = {

    // Displays the next view according to the redirect path
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },

    // Makes all jobs available in view
    index: (req, res, next) => {
        Job.find()
            .then((jobs) => {
                res.locals.jobs = jobs;
                next();
            })
            .catch((error) => {
                console.log(`Error fetching jobs: ${error.message}`);
                next(error);
            });
    },

    // Displays a table containing all jobs and their information
    indexView: (req, res) => {
        res.render("jobs/index");
    },

    // Displays a form to create a new job
    new: (req, res, next) => {
		res.render("jobs/new");
    },

    // Adds a new job to the database
    create: (req, res, next) => {
        // Skip if validation failed
		if (req.skip) {
			res.locals.redirect = "/jobs/new";
			return next();
		}
        let newJob = getParams(req.body);
        Job.create(newJob)
            .then(job => {
                req.flash("success",
                    `${job.title} was created.`);
                res.locals.redirect = "/jobs";
                next();
            })
            .catch(error => {
                req.flash("error",
                    `Failed to create job because: ${error.message}.`);
                res.locals.redirect = "/jobs/new";
                next();
            });
    },
    
    // Makes one job available in view
    show: (req, res, next) => {
      let jobId = req.params.id;
      Job.findById(jobId)
        .then((job) => {
          res.locals.job = job;
          next();
        })
        .catch((error) => {
          console.log(`Error fetching job by ID: ${error.message}`);
          next(error);
        });
    },

    // Displays a job's information
    showView: (req, res) => {
      res.render("jobs/show");
    },

     // Displays a form to edit a job's information
    editView: (req, res, next) => {
		res.render("jobs/edit");
    },

    // Updates a job's information in the database
    update: (req, res, next) => {
		let jobId = req.params.id;
		// Skip if validation failed
		if (req.skip) {
			res.locals.redirect = `/jobs/${jobId}/edit`;
			return next();
		}
        let jobParams = getParams(req.body);
        Job.findByIdAndUpdate(jobId, { $set: jobParams })
            .then((job) => {
				req.flash("success", `${job.title} was updated.`);
                res.locals.redirect = `/jobs/${jobId}`;
                res.locals.job = job;
                next();
            })
            .catch((error) => {
                console.log(`Error updating job by ID: ${error.message}`);
                next(error);
            });
    },

    // Removes a job from the database
    delete: (req, res, next) => {
		let jobId = req.params.id;
		Job.findByIdAndRemove(jobId)
			.then(() => {
				req.flash("success", "The job was deleted.");
				res.locals.redirect = "/jobs";
				next();
			})
			.catch((error) => {
				req.flash("error", `Error deleting job by ID: ${error.message}`);
				next();
			});
    },

    // Data validation
    validate: (req, res, next) => {
        req.check("title", "Title is required").notEmpty();
        req.check("company", "Company is required").notEmpty();
        req.check("location", "Location is required").notEmpty();
        req.check("description", "Description is required").notEmpty();
        req.check("requirements", "Requirements is required").notEmpty();
        req.check("salary", "Salary is invalid").notEmpty().isFloat();
        req.sanitizeBody("contactEmail").normalizeEmail({ all_lowercase: true }).trim();
        req.check("contactEmail").notEmpty().withMessage("Contact email is required")
						.isEmail().withMessage("Contact email is invalid");
        req.check("contactPhone").notEmpty().withMessage("Contact phone is required")
						.isInt().isLength({min:10, max:10}).withMessage("Contact phone is invalid");
        req.check("deadlineDate", "Deadline date is required").notEmpty();
        req.check("isActive", "Is Active is invalid").isIn(["yes", "no"]);
    
        req.getValidationResult().then((error) => {
            if (!error.isEmpty()) {
                let messages = error.array({onlyFirstError: true}).map((e) => e.msg);
                req.skip = true;
                req.flash("error", messages.join(" and "));
            }
			next();
        });
    },
};
  