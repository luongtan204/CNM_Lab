require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const port = process.env.PORT || 3000;

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session & Flash
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Pass flash messages to views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
const productRoutes = require('./routes/ProductRoutes');
app.use('/', productRoutes);

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
