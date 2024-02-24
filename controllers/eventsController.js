const Event = require("../models/event"),
	httpStatus = require("http-status-codes"),
getParams = (body) => {
    let params = {        
        title: body.title,
        description: body.description,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
    };
    if (body.isOnline == "yes") {
        params["isOnline"] = true;
    } else {
        params["isOnline"] = false;
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

    // Makes all events available in view
    index: (req, res, next) => {
        Event.find({})
            .populate("organizer").populate("attendees")  // Allow access to names in view
            .then((events) => {
                res.locals.events = events;
                next();
            })
            .catch((error) => {
                console.log(`Error fetching events: ${error.message}`);
                next(error);
            });
    },

    // Displays a table containing all events and their information
    indexView: (req, res) => {
		res.render("events/index");
    },

    // Displays a form to create a new event
    new: (req, res, next) => {
		res.render("events/new");
    },

    // Adds a new event to the database
    create: (req, res, next) => {
		// Skip if validation failed
		if (req.skip) {
			res.locals.redirect = "/events";
			return next();
		}        
		let newEvent = getParams(req.body);
        newEvent["organizer"] = res.locals.currentUser;
        newEvent = new Event(newEvent);
        newEvent["registrationLink"] = `/events/${newEvent._id}/register`
        newEvent.save()
            .then(event => {
                req.flash("success",
                    `${event.title} was created.`);
                res.locals.redirect = "/events";
                next();
            })
            .catch(error => {
                req.flash("error",
                    `Failed to create event because: ${error.message}`);
                res.locals.redirect = "/events/new";
                next();
            });
    },
    
    // Makes one event available in view
    show: (req, res, next) => {
      let eventId = req.params.id;
      Event.findById(eventId)
        .populate("organizer").populate("attendees")  // Allow access to names in view
        .then((event) => {
          res.locals.event = event;
          next();
        })
        .catch((error) => {
          console.log(`Error fetching event by ID: ${error.message}`);
          next(error);
        });
    },

    // Displays an event's information
    showView: (req, res) => {
        res.render("events/show");
    },

     // Displays a form to edit a event's information
    editView: (req, res, next) => {
		res.render("events/edit");
    },

    // Updates an event's information in the database
    update: (req, res, next) => {
		let eventId = req.params.id;
		// Skip if validation failed
		if (req.skip) {
			res.locals.redirect = `/events/${eventId}/edit`;
			return next();
		}
    	let eventParams = getParams(req.body);
        Event.findById(eventId)
            .then((event) => {
                eventParams["registrationLink"] = event.registrationLink;
				eventParams["organizer"] = event.organizer;
                eventParams["attendees"] = event.attendees;
            })
        Event.findByIdAndUpdate(eventId, { $set: eventParams })
            .then((event) => {
				req.flash("success", `${event.title} was updated.`);
                res.locals.redirect = `/events/${eventId}`;
                res.locals.event = event;
                next();
            })
            .catch((error) => {
                console.log(`Error updating event by ID: ${error.message}`);
                next(error);
            });
    },

    // Registers the current user as an attendee
    register: (req, res, next) => {
        let user = res.locals.currentUser,
            eventId = req.params.id;
		Event.findById(eventId)
			.then((event) => {
				// User is already an attendee
				if (event.attendees.includes(user._id)) {
					req.flash("error", 
					`You are already registered for ${event.title}`);
				// Add user as an attendee
				} else {
					event.attendees.push(user._id);
					event.save();
					res.locals.success = true;
					req.flash("success", 
					`You are now registered for ${event.title}`);
				}
				res.locals.redirect = "/events";
				next();
			})
			.catch((error) => {
				req.flash("error",`Error registering for event: ${error.message}`);
				next(error);
			});
    },

    // Removes an event from the database
    delete: (req, res, next) => {
		let eventId = req.params.id;
		Event.findByIdAndRemove(eventId)
			.then(() => {
				req.flash("success", "The event was deleted.");
				res.locals.redirect = "/events";
				next();
			})
			.catch((error) => {
				console.log(`Error deleting event by ID: ${error.message}`);
				next(error);
			});
    },

    // Data validation/sanitization
    validate: (req, res, next) => {
        req.check("title", "Title cannot be empty").notEmpty();
        req.check("description", "Description cannot be empty").notEmpty();
        req.check("location", "Location cannot be empty").notEmpty();
        req.check("startDate", "Start date is invalid").notEmpty();
        req.check("endDate", "End date is invalid").notEmpty();
        req.check("isOnline", "Is Online is invalid")
			.optional({checkFalsy:true}).isIn(["yes", "no"]);

        req.getValidationResult().then((error) => {
            if (!error.isEmpty()) {
                let messages = error.array({onlyFirstError: true}).map((e) => e.msg);
                req.skip = true;
                req.flash("error", messages.join(" and "));
			}
            next();
        });
    },

	// API functionality: respond with JSON object
	respondJSON: (req, res) => {
		res.json({ status: httpStatus.OK, data: res.locals})
	},

	errorJSON: (error, req, res) => {
		let errorObject;
		if (error) {
			errorObject = {
				status: httpStatus.INTERNAL_SERVER_ERROR,
				message: error.message
			};
		} else {
			errorObject = {
				status: httpStatus.INTERNAL_SERVER_ERROR,
				message: "Unknown error."
			}
		}
		res.json(errorObject);
	}
};
