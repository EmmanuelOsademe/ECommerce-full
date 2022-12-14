const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            min: [1, 'Minimum allowable rating is 1'],
            max: [5, 'Maximum allowable rating is 5'],
            required: [true, 'Please provide raging']
        },
        comment: {
            type: String, 
            required: [true, 'Please provide review comment'],
            maxLength: [500, 'Maximum allowable characters is 500']
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true
        }
    }, {timestamps: true}
)

ReviewSchema.index({product: 1, user: 1});

ReviewSchema.statics.calculateAverageRating = async function(productId){
    const result = await this.aggregate(
        [
            {$match: {product: productId}},
            {$group: {
                _id: null,
                averageRating: {$avg: "$rating"},
                numOfReviews: {$sum: 1}
            }}
        ]
    );

    try {
        console.log(result);
        await this.model('Product').findOneAndUpdate(
            {_id: productId},
            {
                averageRating: Math.ceil(result[0] ?.averageRating || 0),
                numOfReviews: result[0] ?.numOfReviews || 0
            }
        )
    } catch (err) {
        console.log(err);
    }
}

ReviewSchema.post('save', async function(){
    await this.constructor.calculateAverageRating(this.product)
});

ReviewSchema.post('remove', async function(){
    await this.constructor.calculateAverageRating(this.product);
})

module.exports = mongoose.model('Review', ReviewSchema);