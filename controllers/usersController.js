const User = require("../models/user");
const passport = require("passport");

const getParams = (body) => {
    let params = {        
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        graduationYear: body.graduationYear,
        major: body.major,
        job: body.job,
        company: body.company,
        city: body.city,
        state: body.state,
        country: body.country,
        zipCode: body.zipCode,
        bio: body.bio,
        interests: body.interests
    }

    // Remove unfilled interests so they are not listed
    for (var i = 0; i < params["interests"].length; i++) {
        if (!Boolean(params["interests"][i])) {
            params["interests"].length = i;
            break;
        }
    }
    return params;
};

module.exports = {
    // Display the next view according to the redirect path
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },

    // Return a promise of all users
    index: (req, res, next) => {
        User.find({})
		.then((users) => {
			res.locals.users = users;
			next();
		})
		.catch((error) => {
			console.log(`Error fetching users: ${error.message}`);
			next(error);
		});
    },

    // Display a table containing all users and their information
    indexView: (req, res) => {
        res.render("users/index");
    },

    // Display a form to create a new user
    new: (req, res) => {
        res.render("users/new");
    },

// Add a new user to the database
create: (req, res, next) => {
	// Skip if validation failed
	if (req.skip) {
		res.locals.redirect = "/users/new";
		return next();
	}
	let newUser = getParams(req.body);
	User.register(newUser, req.body.password, (error, user) => {
		if (user) {
			req.flash("success", 
			`${user.name}'s account was created.`);
			res.locals.redirect = "/users/login";
			next();
		} else {
			req.flash("error",
				`Failed to create user account because: ${error.message}.`);
			res.locals.redirect = "/users/new";
			next();
		}
	});
},

    // Return a promise of one user
    show: (req, res, next) => {
		let userId = req.params.id;
		User.findById(userId)
		.then((user) => {
			res.locals.user = user;
			next();
		})
		.catch((error) => {
			console.log(`Error fetching user by ID: ${error.message}`);
			next(error);
		});
    },

	// Display a user's information
    showView: (req, res) => {
      res.render("users/show");
    },

     // Display a form to edit a user's information
    editView: (req, res) => {
        res.render("users/edit");
    },

    // Update a user's information in the database
    update: (req, res, next) => {
		let userId = req.params.id;
        // Skip if validation failed
        if (req.skip) {
			res.locals.redirect = `/users/${userId}/edit`;
			return next();
		}
        let userParams = getParams(req.body);
        User.findByIdAndUpdate(userId, { $set: userParams })
		.then((user) => {
			req.flash("success",
					`${user.name}'s account was updated.`);
			res.locals.redirect = `/users/${userId}`;
			res.locals.user = user;
			next();
		})
		.catch((error) => {
			console.log(`Error updating user by ID: ${error.message}`);
			next(error);
		});
    },

	// Remove a user from the database
	delete: (req, res, next) => {
		let userId = req.params.id;
		User.findByIdAndRemove(userId)
			.then(() => {
				req.flash("success", "Your account was deleted.");
				res.locals.redirect = "/";
				next();
			})
			.catch((error) => {
				req.flash("error",
					`Failed to delete user account because: ${error.message}`);
				next(error);
			});
	},

	// Display user login page
	login: (req, res) => {
	res.render("users/login");
	},

    // Perform login
    authenticate: passport.authenticate("local", {
		failureRedirect: "/users/login",
		failureFlash: "Failed to login.",
		successRedirect: "/",
	}),

	// Check if user is logged in
	isAuthenticated: (req, res, next) => {
		if (req.isAuthenticated()) {
			next();
		} else {
			req.flash("error", "You must be logged in to access this feature.");
			res.redirect("/users/login");
		}
	},

	// Perform logout
	logout: (req, res, next) => {
		req.logout(function (err) {
			if (err) return next(err);
			req.flash("success", "You have been logged out!");
			res.locals.redirect = "/";
			next();
		});
	},

	// Data validation/sanitization
	validate: (req, res, next) => {
		req.check("name", "Name is required").notEmpty();
		req.sanitizeBody("email").normalizeEmail({ all_lowercase: true }).trim();
		req.check("email").notEmpty().withMessage("Email is required")
						.isEmail().withMessage("Email is invalid");
		req.check("password", "Password is required").notEmpty();
		req.check("role", "Role is invalid").isIn(["student", "alumni"]);
		req.check("graduationYear").notEmpty().withMessage("Graduation year is required")
								.isInt().withMessage("Graduation year is invalid");
		req.check("major", "Major is required").notEmpty();
		req.check("zipCode", "Zip code is invalid")
			.optional({checkFalsy: true}).isPostalCode("US");
		
		req.getValidationResult().then((error) => {
			if (!error.isEmpty()) {
				let messages = error.array({onlyFirstError: true}).map((e) => e.msg);
				req.skip = true;
				req.flash("error", messages.join(" | "));
			}
			next();
		});
	},

	verifyToken: (req, res, next) => {
		let token = req.query.apiToken;
		if (token) {
			User.findOne({ apiToken: token })
			.then((user) => {
				if (user) next();
				else next(new Error("Invalid API token."));
				})
				.catch((error) => {
				next(new Error(error.message));
			});
		} else {
			next(new Error("Invalid API token."));
		}
	},
};