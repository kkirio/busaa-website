const mongoose = require("mongoose"),

eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isOnline: { type: Boolean, default: false },
    registrationLink: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

eventSchema.virtual("date").get(function () {
	if (this.startDate == this.endDate) {
		return this.startDate.toDateString().substring(4);
	} else {
		return `${this.startDate.toDateString().substring(4)} - 
			${this.endDate.toDateString().substring(4)}`
	}
});

module.exports = mongoose.model("Event", eventSchema);