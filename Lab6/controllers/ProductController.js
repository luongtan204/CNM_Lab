const { ScanCommand, GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const Fuse = require('fuse.js');
const { docClient } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const TABLE_NAME = 'Products';

exports.getAllProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let command = new ScanCommand({ TableName: TABLE_NAME });
        let data = await docClient.send(command);
        let products = data.Items || [];

        // Fuzzy search filter with Fuse.js
        if (search && search.trim() !== '') {
            const options = {
                keys: ['name'],
                threshold: 0.4,
                ignoreLocation: true
            };
            const fuse = new Fuse(products, options);
            const result = fuse.search(search);
            products = result.map(res => res.item);
        }

        res.render('index', { products, search });
    } catch (err) {
        console.error("Error fetching products:", err);
        req.flash('error_msg', 'Could not load products.');
        res.render('index', { products: [], search: null });
    }
};

exports.getAddForm = (req, res) => {
    res.render('add');
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, unit_in_stock } = req.body;
        
        // Validation
        if (Number(price) <= 0 || Number(unit_in_stock) <= 0) {
            req.flash('error_msg', 'Price and Unit in stock must be positive numbers.');
            return res.redirect('/add');
        }

        const id = uuidv4();
        const url_image = req.file ? `/uploads/${req.file.filename}` : null;

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                id,
                name,
                price: Number(price),
                unit_in_stock: Number(unit_in_stock),
                url_image
            }
        });

        await docClient.send(command);
        req.flash('success_msg', 'Product added successfully!');
        res.redirect('/');
    } catch (err) {
        console.error("Error adding product:", err);
        req.flash('error_msg', 'Failed to add product.');
        res.redirect('/add');
    }
};

exports.getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const data = await docClient.send(command);
        if (!data.Item) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/');
        }
        res.render('detail', { product: data.Item });
    } catch (err) {
        console.error("Error getting detail:", err);
        req.flash('error_msg', 'Failed to load details.');
        res.redirect('/');
    }
};

exports.getEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const data = await docClient.send(command);
        if (!data.Item) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/');
        }
        res.render('edit', { product: data.Item });
    } catch (err) {
        console.error("Error getting edit form:", err);
        req.flash('error_msg', 'Failed to load edit form.');
        res.redirect('/');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, unit_in_stock } = req.body;

        // Validation
        if (Number(price) <= 0 || Number(unit_in_stock) <= 0) {
            req.flash('error_msg', 'Price and Unit in stock must be positive numbers.');
            return res.redirect(`/edit/${id}`);
        }

        // Fetch old product for image swap logic
        const getCommand = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const data = await docClient.send(getCommand);
        if (!data.Item) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/');
        }
        const oldProduct = data.Item;
        
        let url_image = oldProduct.url_image;
        if (req.file) {
            url_image = `/uploads/${req.file.filename}`;
            // Delete old image
            if (oldProduct.url_image) {
                const oldImagePath = path.join(__dirname, '..', 'public', oldProduct.url_image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const putCommand = new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                id,
                name,
                price: Number(price),
                unit_in_stock: Number(unit_in_stock),
                url_image
            }
        });

        await docClient.send(putCommand);
        req.flash('success_msg', 'Product updated successfully!');
        res.redirect('/');
    } catch (err) {
        console.error("Error updating product:", err);
        req.flash('error_msg', 'Failed to update product.');
        res.redirect('/');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const getCommand = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const data = await docClient.send(getCommand);
        
        if (data.Item && data.Item.url_image) {
            const oldImagePath = path.join(__dirname, '..', 'public', data.Item.url_image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        const deleteCommand = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });

        await docClient.send(deleteCommand);
        req.flash('success_msg', 'Product deleted successfully!');
        res.redirect('/');
    } catch (err) {
        console.error("Error deleting product:", err);
        req.flash('error_msg', 'Failed to delete product.');
        res.redirect('/');
    }
};
