const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
var hsts = require('hsts');
const path = require('path');
var xssFilter = require('x-xss-protection');
var nosniff = require('dont-sniff-mimetype');
const request = require('request');
const { method } = require('lodash');

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
  const filter = JSON.parse(req.query.filter);
  request(`http://localhost:3000/members?_start=${pageIndex * pageSize || 0}&_end=${((+pageIndex || 0) * +pageSize) + +pageSize || 20}&_sort=${sortField}&_order=${sortOrder ?? 'asc'}&q=${filter.firstName ?? ''}${filter.status ? '&status=' + filter.status : ''}`,

    (err, response, body) => {
      if (response.statusCode <= 500) {
        const totalCount = response.headers['x-total-count'];
        res.send({ items: JSON.parse(body), totalCount });
      }
    });
});

app.put('/api/members/updateStatus', async (req, res, next) => {
  try {
    if (req.body.membersForUpdate && req.body.membersForUpdate.length > 0 && req.body.newStatus !== undefined) {
      req.body.membersForUpdate.forEach(member => {
        const json = { ...member, status: req.body.newStatus };
        console.log(json);
        request({
          url: 'http://localhost:3000/members/' + member.id, method: 'PUT', json: json, headers: {
            "Content-Type": "application/json"
          }
        });
      });
      res.status(200).json({ "error": false, "message": "Updated" });
    } else {
      res.status(404).json({ "error": true, "message": "No member to update" });
    }

  } catch (err) {
    next(err);
  }
});

// TODO: Dropdown!
app.get('/api/teams', (req, res) => {
  request(`http://localhost:3000/teams?_sort=teamName&_order=asc`, (err, response, body) => {
    if (response.statusCode <= 500) {
      res.send(body);
    }
  });
});

// Submit Form!
app.post('/api/addMember', (req, res, next) => {
  console.log(req);
  try {
    const member = req.body;
    if(member.id) {
      request({
        url: 'http://localhost:3000/members/' + member.id, method: 'PUT', json: member, headers: {
          "Content-Type": "application/json"
        }
      });
      res.status(200).json({ "error": false, "message": "Updated" });
    } else {
      request({
        url: 'http://localhost:3000/members/', method: 'POST', json: member, headers: {
          "Content-Type": "application/json"
        }
      });
      res.status(200).json({ "error": false, "message": "Added" });
    }
    
  } catch {
    next();
  }
});

app.delete('/api/members/:id', (req, res) => {
  try {
    const id = req.params.id;
    request({
      url: 'http://localhost:3000/members/' + id, method: 'DELETE', callback: (err, response, body) => {
        if (response.statusCode <= 500) {
          res.send(body);
        } else {
          next();
        }
      }
    });
  } catch {
    next();
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/softrams-racing/index.html'));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({ message: err.message, error: req.app.get('env') === 'development' ? err : true });
});

app.listen('8000', () => {
  console.log('Vrrrum Vrrrum! Server starting!');
});
