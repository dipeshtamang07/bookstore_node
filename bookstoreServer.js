var Joi = require("joi");
var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");

var app = express();
var cors = require("cors");

var con_obj = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bookstore"
};

app.use(bodyParser.json());

app.use(cors());

var con = mysql.createConnection(con_obj);

con.connect(function(error) {
  if (error) throw error;
  console.log("Connected to the database successfully...");
});

app.post("/books", function(req, res) {
  const result = validate(req.body);

  if (result.error) {
    console.log(result.error.details[0].message);
    return res.status(400).send(result.error.details[0].message);
  } else {
    console.log("running queries....");
    var sql =
      "INSERT INTO books (book_name, author, ISBN, price) VALUES ('" +
      req.body.book_name +
      "','" +
      req.body.author +
      "','" +
      req.body.ISBN +
      "','" +
      req.body.price +
      "')";
    con.query(sql, function(error) {
      if (error) throw error;
      console.log("inserted data successfully...");
      console.log(req.body);
    });
    const sql_query =
      'SELECT * from books WHERE book_name="' +
      req.body.book_name +
      '" AND author="' +
      req.body.author +
      '" AND ISBN="' +
      req.body.ISBN +
      '"';
    con.query(sql_query, function(error, result, fields) {
      if (error) throw error;
      const my_result = JSON.parse(JSON.stringify(result));
      res.send(my_result);
      res.end();
    });
  }
});

app.get("/books", function(req, res) {
  var sql = "select * from books";
  con.query(sql, function(error, result, fields) {
    if (error) throw error;
    console.log("selected data successfully");
    var my_result = JSON.parse(JSON.stringify(result));
    //console.log(my_result);
    res.send(my_result);
    res.end();
  });
});

app.put("/books", function(req, res) {
  const result = validate(req.body);

  if (result.error) {
    console.log(result.error.details[0].message);
    return res.status(400).send(result.error.details[0].message);
  } else {
    console.log(req.body);
    console.log("running queries..");
    var sql =
      'UPDATE books SET book_name="' +
      req.body.book_name +
      '", author="' +
      req.body.author +
      '", ISBN="' +
      req.body.ISBN +
      '" , price="' +
      req.body.price +
      '" WHERE book_id="' +
      req.body.book_id +
      '"';
    con.query(sql, function(error) {
      if (error) throw error;
      console.log(req.body);
      console.log("updated data succesfully...");
      res.send(req.body);
      res.end();
    });
  }
});

app.delete("/book", function(req, res) {
  sql_query = 'DELETE FROM books WHERE book_id="' + req.body.book_id + '"';
  console.log("running delete queries...");
  con.query(sql_query, function(error) {
    if (error) throw error;
    console.log(req.body);
    console.log("deleted data successfully...");
    res.send(req.body);
    res.end();
  });
});

function validate(data) {
  const schema = {
    book_id: Joi.any(),
    book_name: Joi.string()
      .min(1)
      .required()
      .label("Book Name"),
    author: Joi.string()
      .min(1)
      .required()
      .label("Author"),
    ISBN: Joi.string()
      .regex(/^isbn_\d{4,7}$/)
      .required()
      .label("ISBN"),
    price: Joi.number()
      .required()
      .label("Price")
  };

  const result = Joi.validate(data, schema);

  return result;
}

const port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log(`Listening on ${port}`);
});
