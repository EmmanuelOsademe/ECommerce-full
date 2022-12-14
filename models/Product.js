const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String, 
        trim: true,
        required: [true, 'Please provide product name'],
        minLength: [5, 'Minimum allowable length is 5 characters'],
        maxLength: [50, 'Maximum allowable length is 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        minLength: [10, 'Min allowable character is 10'],
        maxLength: [500, 'Max allowable characters is 500']
    },
    price: {
        type: Number, 
        required: [true, 'Please provide product price']
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: {
            values: ['Fashion', 'Electronics', 'Kitchen', 'Bedroom', 'Office'],
            message: `{VALUE} not supported`
        }
    },
    colors: {
        type: [String],
        default: ['#222']
    },
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        enum: {
            values: ['ikea', 'liddy', 'marcos', 'asda'],
            message: `{VALUE} not supported`
        }
    },
    image: {
        type: String,
        default: '/upload/example.jpeg'
    },
    cloudinaryId: {
        type: String
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        default: 0
    },
    bin: {
        type: String
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, {timestamps: true, toJSON: {virtual: true}, toObject: {virtuals: true}});

ProductSchema.virtual('reviews', {
    ref: "Review",
    localField: '_id',
    foreignField: 'product',
    justOne: false
})

module.exports = mongoose.model('Product', ProductSchema);