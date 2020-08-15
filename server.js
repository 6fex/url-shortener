const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const dns = require('dns');
const TinyUrl = require('./models/tinyUrl');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static('public'));

app.post('/api/shorturl/new', async (req, res) => { 
    await TinyUrl.create({original_url: req.body.fullUrl});
    await TinyUrl.findOne({original_url: req.body.fullUrl}, (error, data) => {
        if(error) console.log(error);
        res.json(data);
    });
});

app.get('/api/shorturl/:slug', async (req, res) => {
    const { slug } = req.params;
    
    await TinyUrl.findOne({short_url: slug}, (error, data) => {
        if(error) return console.log(error);
        console.log(data);
        res.redirect(data.original_url);
    });
});

app.listen(process.env.PORT || 2137);
