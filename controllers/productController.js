const {StatusCodes} = require('http-status-codes');
const {BadRequestError, NotFoundError, UnauthorisedError, UnauthenticatedError} = require('../errors');
const {cloudinary} = require('../utils');
const Product = require('../models/Product');

async function createProduct(req, res){
    const {name, description, price, category, company} = req.body;
    if(!(name && description && price && category && company)){
        throw new BadRequestError(`Missing required field(s)`);
    }

    req.body.user = req.user.userId;

    const product = await Product.create({...req.body});

    res.status(StatusCodes.CREATED).json({product});
};

const getAllProducts = async (req, res) =>{
    const {name, description, category, company, featured, freeShipping, sort, fields, numericFilters} = req.query;

    const queryObject = {};
    if(featured){
        queryObject.featured = featured === 'true' ? true : false;
    }
    if(freeShipping){
        queryObject.freeShipping = freeShipping === 'true' ? true : false;
    }
    if(company){
        queryObject.company = company;
    }
    if(category){
        queryObject.category = category;
    }
    if(name){
        queryObject.name = {$regex: name, $options: 'i'};
    }
    if(description){
        queryObject.description = {$regex: description, $options: 'i'}
    }

    if(numericFilters){
        const operatorsMap = {
            '<': '$lt',
            '<=': 'lte',
            '=': '$eq',
            '>': '$gt',
            '>=': 'gte'
        }
        const regEx = /\b(>|>=|=|<|<=)\b/g;
        
        let filters = numericFilters.replace(
            regEx, (match) =>`-${operatorsMap[match]}-`
        );
        const options = ['price', 'averageRating', 'numofReviews']
        filters = filters.split(',').forEach((item) =>{
            const [field, operator, value] = item.split('-');
            if(options.includes(field)){
                queryObject[field] = {[operator]: Number(value)};
            }
        })
    }

    if(sort){
        sortCriteria = sort.split(',').join(' ');
    }else{
        sortCriteria = 'createdAt';
    }

    // Filter by fields
    let filterOptions;
    if(fields){
        filterOptions = fields.split(',').join(' ');
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skips = (page - 1) * limit;
    
    const products = await Product.find(queryObject).select(filterOptions).sort(sortCriteria).skip(skips).limit(limit);
    res.status(StatusCodes.OK).json({products, count: products.length})
};

const getSingleProduct = async (req, res) =>{
    const {id: productId} = req.params;
    if(!productId){
        throw new BadRequestError('Please provide product ID');
    }

    const product = await Product.findOne({_id: productId});

    if(!product){
        throw new NotFoundError(`Product not found`);
    }

    res.status(StatusCodes.OK).json({product});
}

async function updateProduct(req, res){
    const {id: productId} = req.params;
    if(!productId){
        throw new BadRequestError('Please provide product ID');
    }

    if(Object.keys(req.body).length === 0){
        throw new BadRequestError('No field(s) for update');
    }

    const product = await Product.findOneAndUpdate({_id: productId}, req.body, {new: true, runValidators: true});

    if(!product){
        throw new NotFoundError('Product not found');
    }

    res.status(StatusCodes.OK).json({product});
}

const deleteProduct = async (req, res) =>{
    const {id: productId} = req.params;
    if(!productId){
        throw new BadRequestError('Please provide product ID');
    }

    const product = await Product.findOne({_id: productId});
    
    if(!product){
        throw new NotFoundError('Product does not exist');
    }

    if(product.cloudinaryId){
        await cloudinary.uploader.destroy(product.cloudinaryId);
    }
    

    await product.remove();
    res.status(StatusCodes.OK).json({msg: 'Product has been removed'});
}

const uploadImage = async (req, res) =>{
    const {id: productId} = req.query;
    if(!productId){
        throw new BadRequestError('Please provide Product ID');
    }

    const product = await Product.find({_id: productId});
    if(!product){
        throw new NotFoundError('Product not found');
    }

    if(product.cloudinaryId){
        throw new BadRequestError('Image already exists for this product');
    }

    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {use_filename: true})
    product.image = uploadedImage.secure_url;
    product.cloudinaryId = uploadedImage.public_id;

    await product.save();
    res.status(StatusCodes.OK).json({product});
}

const updateImage = async (req, res) =>{
    const {id, productId} = req.params;
    if(!productId){
        throw new BadRequestError('Please provide Product Id');
    }

    const product = await Product.find({_id: productId});
    if(!product){
        throw new NotFoundError('Product does not exist');
    }

    if(!product.cloudinaryId){
        throw new BadRequestError('No product image for update');
    }

    await cloudinary.uploader.destroy(product.cloudinaryId);
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {use_filename: true});
    product.image = uploadedImage.secure_url;
    product.cloudinaryId = public_id;

    await product.save();
    res.status(StatusCodes.OK).json({product});
}

module.exports = {createProduct, getAllProducts, getSingleProduct, updateProduct, uploadImage, updateImage, deleteProduct};