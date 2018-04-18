const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		trim: true
	},
	beerid: {
		type: Number,
		required: true
	},
	rating: {
		type: Number,
		min: 1, 
		max: 5, 
		required: true
	}
});


const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;