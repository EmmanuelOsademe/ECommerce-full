require('dotenv').config();
require('express-async-errors');

// App initialisation
const express = require('express');
const app = express();

// DB
const connectDB = require('./db/connect');

// Additional Packages
const cookieParser = require('cookie-parser');

// Import routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/product');
const reviewRouter = require('./routes/review');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');

// Custom middlewares
const errorHandler = require('./middlewares/errorHandler');

// Middlewares
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// Routes
app.get('/', (req, res) =>{
    console.log('Home tab');
    res.status(200).send('You are in the home tab');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/order', orderRouter);


// Error handler middleware must be the last to catch all errors
app.use(errorHandler);

const port = process.env.PORT || 4000;

const start = async () =>{
    try {
        await connectDB(process.env.MONGO_URI);
        console.log(`Database connection successful`);
        app.listen(port, ()=>{
            console.log(`Backend server is listening on Port: ${port}`);
        })
    } catch (err) {
        console.log(`Error: ${err} occurred`);
    }
};

start()