const mongoose = require('mongoose')

const { Schema } = mongoose
const MenuSchema = new Schema({
	name: String,
	count: {
        type: Number,
        default: 1,
    },
	order: {
		type: Number,
		default: 100,
	},
	subMenus: [
		{
			name: String,
			count: {
                type: Number,
                default: 1,
            },
		},
	],
})

const Menu = mongoose.model('Menu', MenuSchema)
module.exports = Menu
