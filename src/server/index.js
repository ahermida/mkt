import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import fs from 'fs';
import config from './config.js';

const app = express();

//mount the 2 important folders to static
app.use('/static', express.static('static'));
app.use('/static', express.static('dist'));

//because who wants to have to decode JSON
app.use(bodyParser.json());

//handle '/' route
app.get('*', (req, res) => res.sendFile(path.resolve(`index.html`)));

//start up the actual app
app.listen(config.port,() => console.log(`App listening on Port:${config.port}`));
