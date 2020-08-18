const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const isUrl = require('is-url');
const slowDown = require('express-slow-down');
const rateLimit = require('express-rate-limit');
const TinyUrl = require('./models/tinyUrl');

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

const speedLimiter = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1,
    delayMs: 3000
});

const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3
});

app.post('/api/shorturl/new', rateLimiter, speedLimiter, (req, res) => { 
    const urlFromReq = req.body.original_url;
    
    urlValidationPromise(urlFromReq).then(() => {
        let entryId;
        const created = () => {
            return new Promise((resolve, reject) => {
                TinyUrl.create({original_url: urlFromReq}, (error, data) => {
                    if(data._id !== null) {
                        entryId = data._id;
                        resolve();
                    } else {
                        reject();
                    };
                });
            })
        }
        
        created().then(() =>{
        TinyUrl.findOne({_id: entryId})
        .select({_id: 0, __v: 0})
        .exec((error, data) => {
            if(error) return console.log(error);
            res.json(data);
        })});
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

app.get('/api/shorturl/', (req, res) => {
    TinyUrl.find({})
    .select({_id: 0, __v: 0})
    .exec((error, urls) => {
        const urlMap = {};
        urls.forEach((url) => urlMap[url.short_url] = url.original_url);
        res.json(urlMap);
    });
});
