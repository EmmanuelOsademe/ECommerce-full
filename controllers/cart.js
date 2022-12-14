const {StatusCodes} = require('http-status-codes');
const Cart = require('../models/Cart');
const {BadRequestError, NotFoundError, UnauthenticatedError} = require('../errors');
const {checkPermission} = require('../utils');

const createCart = async (req, res) =>{
    const {products} = req.body;
    if(!products){
        throw new BadRequestError(`No item in Cart`);
    }

    req.body.user = req.user.userId;

    const cart = await Cart.create({...req.body});
    res.status(StatusCodes.CREATED).json({cart});
}

const getCart = async (req, res) =>{
    const {id: cartId} = req.params;
    if(!cartId){
        throw new BadRequestError('Please provide cart ID');
    }

    const cart = await Cart.findOne({_id: cartId});
    if(!cart){
        throw new NotFoundError('Cart not found');
    }
    checkPermission(req.user, cart.user);
    res.status(StatusCodes.OK).json({cart});
}

const getAllCarts = async (req, res) =>{
    const carts = await Cart.find({});
    res.status(StatusCodes.OK).json({carts, count: carts.length});
}

const updateCart = async(req, res) =>{
    const {id: cartId} = req.params;
    if(!cartId){
        throw new BadRequestError('Please provide Cart Id');
    }

    const {products} = req.body;
    if(!products){
        throw new BadRequestError('No field(s) for update');
    }

    const cart = await Cart.findOne({_id: cartId});
    if(!cart){
        throw new NotFoundError('Cart does not exist');
    }

    if(req.user.userId !== cart.user.toString()){
        throw new UnauthenticatedError('Authentication failed');
    }

    cart.products = products;
    await cart.save();
    res.status(StatusCodes.OK).json({cart});
}

const deleteCart = async (req, res)=>{
    const {id: cartId} = req.params;
    if(!cartId){
        throw new BadRequestError('Please provide cart Id');
    }
    
    const cart = await Cart.findOne({_id: cartId});
    if(!cart){
        throw new NotFoundError('Cart does not exist');
    }
    if(req.user.userId !== cart.user.toString()){
        throw new UnauthenticatedError('Authentication failed');
    }

    await cart.remove();
    res.status(StatusCodes.OK).json({msg: 'Cart deleted'});
}

module.exports = {createCart, getCart, getAllCarts, updateCart, deleteCart};