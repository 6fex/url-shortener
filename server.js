const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const dns = require('dns');
const TinyUrl = require('./models/tinyUrl');
const isUrl = require('is-url');
const { normalize } = require('path');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const port = process.env.PORT || 9999;
app.listen(port, () => {
    console.log(`listening ta port ${port}`);
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static('public'));

const urlValidationPromise = (url) => {
    return new Promise((resolve, reject) => {
    const validUrl = isUrl(url);
        if(!validUrl) {
            reject();
        } else {
            resolve();
        };
    });
};

app.post('/api/shorturl/new', (req, res) => { 
    urlValidationPromise(req.body.original_url).then(() => {
        TinyUrl.create({original_url: req.body.original_url})
        .then(()=>{
            TinyUrl.findOne({original_url: req.body.original_url})
            .select({_id: 0, __v: 0})
            .exec((error, data) => {
                if(error) return console.log(error);
                res.json(data);
            });
        });
    }).catch(() => res.json({error: "invalid url"}));
});

app.get('/api/shorturl/:slug', async (req, res) => {
    const { slug } = req.params;
    
    const matchingSlug = await TinyUrl.findOne({short_url: slug}, (error, data) => {
        if(error) return console.log(error);
        return(data);
    });
    if(matchingSlug === null) {
        res.json({error: "invalid_url"});
    } else {
        res.redirect(matchingSlug.original_url);
    };
});

