const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
var hsts = require('hsts');
const path = require('path');
var xssFilter = require('x-xss-protection');
var nosniff = require('dont-sniff-mimetype');
const request = require('request');
const { json } = require('stream/consumers');

const app = express();

app.use(cors());
app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.use(xssFilter());
app.use(nosniff());
app.set('etag', false);
app.use(
  helmet({
    noCache: true
  })
);
app.use(
  hsts({
    maxAge: 15552000 // 180 days in seconds
  })
);

app.use(
  express.static(path.join(__dirname, 'dist/softrams-racing'), {
    etag: false
  })
);

app.get('/api/members', (req, res) => {
  const { pageIndex, pageSize, sortOrder, sortField } = req.query;
  console.log(req.query);
  request(`http://localhost:3000/members?_start=${pageIndex * pageSize || 0}&_end=${((+pageIndex || 0) * +pageSize) + +pageSize || 20}&_sort=${sortField}&_order=${sortOrder ?? 'asc'}`, (err, response, body) => {
    if (response.statusCode <= 500) {
      const totalCount = response.headers['x-total-count'];
      res.send({ items: JSON.parse(body), totalCount });
    }
  });
});

// TODO: Dropdown!
app.get('/api/teams', (req, res) => {

});

// Submit Form!
app.post('/api/addMember', (req, res) => {

});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/softrams-racing/index.html'));
});

app.listen('8000', () => {
  console.log('Vrrrum Vrrrum! Server starting!');
});
