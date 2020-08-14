const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static('public'));

app.listen(process.env.PORT || 2137);
