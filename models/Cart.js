const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, 'Please provide userId']
        },
        products: [
            {
                productId: {
                    type: mongoose.Types.ObjectId,
                    ref: "Product",
                    required: [true, 'Please provide product ID']
                },
                quantity: {
                    type: Number, 
                    required: true,
                    validate: {
                        validator: function(num){
                            return ((typeof(num) === 'number' && (num > 0)))
                        },
                        message: props => `${props.path} must be greater than 0`
                    }
                }
            }
        ]
    }, {timestamps: true}
)

module.exports = mongoose.model("Cart", cartSchema);