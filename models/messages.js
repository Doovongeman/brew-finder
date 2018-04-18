const mongoose = require('mongoose');

const messagesScheme = new mongoose.Schema({
	id: {
		type: Number,
		unique: true
	},
	data: {
		type: String,
		required: true,
		trim: true
	},
	timestamp: {
		type: Date,
		default: Date.now
	}
});


const Message = mongoose.model('Message', messagesScheme);

module.exports = Message;