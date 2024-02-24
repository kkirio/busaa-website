module.exports = {
    showIndex: (req, res) => {
        res.render("index");
    },
    
    showAbout: (req, res) => {
        res.render("about");
    },
    
    showContact: (req, res) => {
        res.render("contact");
    },

	showChat: (req, res) => {
		res.render("chat");
	},
};