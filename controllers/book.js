const Book = require('../models/Book');
const Category = require('../models/Category');
const fs = require("fs");
const uploadCloudinary = require('../helper/cloudUploader');

exports.book_create_post = async (req, res) => {
    try {
        let book = new Book(req.body);
        let images = req.files ? req.files.map(file => `./public/uploads/${file.filename}`) : [];
        let pathDb = [];

        if (images.length > 0) {
            const imagesPath = await uploadCloudinary.uploadMultiple(images);
            imagesPath.forEach(pathImg => pathDb.push(pathImg));
        }

        book.image = pathDb;
        const newBook = await book.save();

        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (category) {
                category.book.push(newBook._id);
                await category.save();
            }
        }

        res.json(newBook);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


exports.book_index_get = (req, res) => {
    Book.find().populate('category')
        .then(books => {
            res.json({ books });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error retrieving books');
        });
};

exports.get_mybook_get = (req, res) => {
    Book.find({ user: req.query.user })
        .then(myBooks => {
            res.json(myBooks);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error retrieving user books');
        });
};

exports.book_edit_post = async (req, res) => {
    console.log(req.body)
    if(req.files && req.files.length != 0){
        let images;
        let pathDb = [];
        images = req.files.map(file => `public/images/${file.filename}`);
        await uploadCloudinary.upload_multiple(images)
        .then((imagesPath) =>{
            imagesPath.forEach(pathImg =>{
                console.log(pathImg.url)
                pathDb.push(pathImg.url);
            })
            images.forEach(remove =>{
                // To remove the image from public/images and store it in cloudinary only
                fs.unlink(remove, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('File is deleted.');
                    }
                    });    
            })
            Category.findById(req.body.category)
            .then((category) => {
                category.book.push(book);
                category.save();
            })
            .catch((err) => {
                console.log(err);
            });
            const body = req.body;
            // console.log(pathDb);
            body.image = pathDb;
            console.log(body.image)
            Book.findByIdAndUpdate(req.body._id, body, {new: true})
            .then((newBook) => {
                console.log(newBook)
                res.json(newBook);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Internal Server Error');
            });
        })
        .catch((err) =>{
            console.log(err);
        })    
    
    }
    else{
        console.log('not image')
        Book.findByIdAndUpdate(req.body._id, req.body, {new: true})
        .then((newBook) => {
            console.log(newBook)
            res.json(newBook);
        })
        .catch((err)=>{
            console.log(err)
        })
        } 
    
}

exports.book_delete_get = (req, res) => {
    Book.findByIdAndDelete(req.query.id)
        .then(book => {
            res.json({ book });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error deleting book');
        });
};

exports.book_detail_get = (req, res) => {
    Book.findById(req.query.id).populate('category')
        .then(book => {
            res.json({ book });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error retrieving book details');
        });
};


// Get all books by category
exports.book_getByCategory_get = (req, res) => {
    const categoryId = req.query.id;
    Product.find({ category: categoryId })
        .then((books) => {
            res.json({ books });
        })
        .catch((err) => {
            console.log('Error getting books by category');
            console.log(err);
            res.json({ err });
        });
};

