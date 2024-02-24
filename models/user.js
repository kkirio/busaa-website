const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const randToken = require("rand-token");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "alumni"], default:"student" },
    graduationYear: { type: Number, required: true },
    major: { type: String, required: true },
    job: { type: String },
    company: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: Number, min: 10000, max: 99999 },
    bio: { type: String },
    interests: [{ type: String }],
	apiToken: { type: String },
});

// Location virtual property
userSchema.virtual("location").get(function () {
    let location = "";
    for (var place of [this.city, this.state, this.country, this.zipCode]) {
        if (Boolean(place)) {
            location += `${place}, `;
        }
    }
    // Remove trailing comma 
    if (location.length > 0) {
        location = location.slice(0,-2);
    }
    return location;
});

userSchema.pre("save", function (next) {
  let user = this;
  if (!user.apiToken) user.apiToken = randToken.generate(16);
  next();
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);