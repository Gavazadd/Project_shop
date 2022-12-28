const express = require('express')
const mysql = require('mysql2')

const config = require('config');

// File config is in .gitignore
const PORT = config.get('port') || 5000

const app = express()
app.use(express.static('public'));
app.use(express.json())
app.set('view engine', 'pug');

const con = mysql.createConnection({
  host: config.get('host'),
  user: config.get('user'),
  password: config.get('password'),
  database : config.get('database')
})


app.get('/', function (req, res) {
  con.query(
    'SELECT * FROM goods',
    function (error, result) {
      if (error) throw error;
      let goods = {};
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i];
      }
      res.render('main', {
        goods: JSON.parse(JSON.stringify(goods))
      });
    }
  );
});

app.get('/cat', function (req, res) {
  let catId = req.query.id;

  let cat = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM category WHERE id=' + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });
  let goods = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM goods WHERE category=' + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });

  Promise.all([cat, goods]).then(function (value) {
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1]))
    });
  })
});

app.get('/goods', function (req, res) {
  con.query('SELECT * FROM goods WHERE id=' + req.query.id, function (error, result) {
    if (error) throw error;
    res.render('goods', { goods: JSON.parse(JSON.stringify(result)) });
  });
});

app.post('/get-category-list', function (req, res) {
  con.query('SELECT id, category FROM category', function (error, result) {
    if (error) throw error;
    res.json(result);
  });
});

app.post('/get-goods-info', function (req, res) {
  console.log(req.body.key);
  if (req.body.key.length !=0){
    con.query('SELECT id,name,cost FROM goods WHERE id IN ('+req.body.key.join(',')+')', function (error, result) {
      if (error) throw error;
      console.log(result);
      let goods = {};
      for (let i = 0; i < result.length; i++){
        goods[result[i]['id']] = result[i];
      }
      res.json(goods);
    });
  }
  else{
    res.send('0');
  }
});


app.listen(PORT, ()=>{
  console.log(`Server has been started on ${PORT}`)
})