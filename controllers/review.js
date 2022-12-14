const {StatusCodes} = require('http-status-codes');
const Review = require('../models/Review');
const  {BadRequestError, NotFoundError, UnauthenticatedError} = require('../errors');
const {checkPermission} = require('../utils')

const createReview = async (req, res) =>{
    const {rating, comment, product} = req.body;

    if(!(rating && comment && product)){
        throw new BadRequestError("Missing required field(s)");
    }

    const oldReview = await Review.findOne({product: product, user: req.user.userId});
    if(oldReview){
        throw new BadRequestError('You already have a reviw for this product.  You may update your review');
    }

    req.body.user = req.user.userId;
    const review = await Review.create({...req.body});
    res.status(StatusCodes.CREATED).json({review});
};

const updateReview = async (req, res) =>{
    const {id: reviewId} = req.params;
    if(!reviewId){
        throw new BadRequestError('Please provide product Id');
    };

    const review = await Review.findOne({_id: reviewId});
    if(!review){
        throw new NotFoundError('Review not found');
    }

    if(req.user.userId !== review.user.toString()){
        throw new UnauthenticatedError('You are not authorised to update this review');
    };

    const {rating, comment} = req.body;
    if(!rating && !comment){
        throw new BadRequestError(`Please provide "Rating" or "Comment" for update`);
    }

    if(rating) review.rating = rating;
    if(comment) review.comment = comment;
    await review.save();
    res.status(StatusCodes.OK).json({review});
}

const getAllReviews = async (req, res) =>{
    const reviews = await Review.find({});
    res.status(StatusCodes.OK).json({reviews, count: reviews.length});
}

const getSingleReview = async (req, res) =>{
    const {id: reviewId} = req.params;
    if(!reviewId){
        throw new BadRequestError(`Please provide review Id`);
    }
    const review = await Review.findOne({_id: reviewId});
    if(!review){
        throw new NotFoundError(`Review not found`);
    }
    checkPermission(req.user, review.user);
    res.status(StatusCodes.OK).json({review});
}

const getProductReview = async (req, res) =>{
    const {id: productId} = req.params;
    if(!productId){
        throw new BadRequestError(`Please provide product Id`);
    }
    const reviews = await Review.find({product: productId});
    res.status(StatusCodes.OK).json({reviews, count: reviews.length});
}

const deleteReview = async (req, res) =>{
    const {id: reviewId} = req.params;
    if(!reviewId){
        throw new BadRequestError(`Please provide review Id`);
    }
    const review = await Review.findOne({_id: reviewId});
    if(!review){
        throw new NotFoundError(`Review not found`);
    }
    checkPermission(req.user, review.user);
    review.remove();
    res.status(StatusCodes.OK).json({msg: `Review successfully deleted`});
}

module.exports = {createReview, updateReview, getAllReviews, getSingleReview, getProductReview, deleteReview};