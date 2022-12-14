const Order = require('../models/Order');
const {StatusCodes} = require('http-status-codes');
const Product = require('../models/Product');
const {NotFoundError, BadRequestError} = require('../errors');
const Cart = require('../models/Cart');
const {checkPermission} = require('../utils');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createOrder(req, res){
    const {cartId, tax, shippingFee} = req.body;
    if(!(cartId || tax || shippingFee)){
        throw new BadRequestError(`Missing required field(s)`);
    }

    const cart = await Cart.findOne({_id: cartId});
    if(!cart){
        throw new NotFoundError(`Cart not found`);
    };

    const products = cart.products;
    let orderItems = [];
    let subtotal = 0;

    for(let item of products){
        const product = await Product.findOne({_id: item.productId});
        if(!product){
            throw new NotFoundError('Product not found');
        }
        const {name, image, price, _id} = product;
        const singleOrderItem = {
            quantity: item.quantity,
            productName: name,
            price, 
            image,
            product: _id
        };
        orderItems = [...orderItems, singleOrderItem];
        subtotal += item.quantity * price;
    }

    const total = subtotal + tax + shippingFee;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: 'usd'
    })

    const order = await Order.create({
        orderItems, 
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId
    })

    res.status(StatusCodes.CREATED).json({order})
}

const getCurrentUserOrder = async (req, res) =>{
    const orders = await Order.find({user: req.user.userId});
    res.status(StatusCodes.OK).json({orders, count: orders.length});
};

const getAllOrders = async (req, res) =>{
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({orders, count: orders.length});
};

const getSingleOrder = async (req, res)=>{
    const {id: orderId} = req.params;
    if(!orderId){
        throw new BadRequestError(`Please provide Order ID`);
    };
    const order = await Order.findOne({_id: orderId});

    if(!order){
        throw new NotFoundError(`Order not found`);
    };
    checkPermission(req.user, order.user);
    res.status(StatusCodes.OK).json({order});
};

const updateOrder = async (req, res) =>{
    const {id: orderId} = req.params;
    const {paymentIntent} = req.body;
    if(!orderId){
        throw new BadRequestError(`Please provide order Id`);
    }

    const order = await Order.findOne({_id: orderId});
    if(!order){
        throw new NotFoundError(`Order not found`);
    };

    checkPermission(req.user, order.user);
    order.paymentIntent = paymentIntent;
    order.status = "paid";
    await order.save();
    res.status(StatusCodes.OK).json({order});
}

const getMonthlyIncome = async (req, res) =>{
    const date = new Date();
    console.log(date.setMonth(date.getMonth()));
    const previousMonth = new Date(date.setMonth(date.getMonth() - 11));
    console.log(previousMonth)
    const income = await Order.aggregate(
        [
            {
                $match: {
                    createdAt: {$gte: previousMonth},
                    status: "paid"
                }
            },
            {
                $project: {
                    month: {$month: "$createdAt"},
                    sales: "$total"
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: {$sum: "$sales"}
                }
            }
        ]
    )
    res.status(StatusCodes.OK).json({income});
}

module.exports = {createOrder, getCurrentUserOrder, getAllOrders, getSingleOrder, updateOrder, getMonthlyIncome};