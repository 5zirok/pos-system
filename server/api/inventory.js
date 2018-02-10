var app 	= require('express')()
var server 	= require('http').Server(app)
var bodyParser = require('body-parser')
var Datastore = require('nedb')
var fs = require('fs')
var async = require('async')
var str="";

var request = require('request');//Подключаем возможность считывать данные с удаленных сайтов
//Перезаписываем базу товара
request('http://linzcontact.ru/api5zirok.php?products_list=1&group_id='+global.group_id, function (error, response, body) {
  if (!error && response.statusCode == 200) {
  fs.writeFileSync("./server/databases/inventory.db", body)
  }
})
//Перезаписываем базу товара
request('http://linzcontact.ru/api5zirok.php?category_list=1', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  fs.writeFileSync("./server/databases/category_list.db", body)
  }
})

app.use(bodyParser.json())

module.exports = app

// Database stuff
var inventoryDB = new Datastore({
	filename: './server/databases/inventory.db',
  fieldName: 'categoryID',
	autoload: true
})
var categoryDB = new Datastore({
	filename: './server/databases/category_list.db',
	autoload: true
})

// GET inventory
app.get('/', function (req, res) {
	res.send('Inventory API')
})

// GET a product from inventory by _id
app.get('/product/:productId', function (req, res) {

	if (!req.params.productId) {
		res.status(500).send('ID field is required.')
	}
	else {
		inventoryDB.findOne({_id: req.params.productId }, function (err, product) {
			res.send(product)
		});
	}

})
// GET all category_list
app.get('/category_list', function (req, res) {

	categoryDB.find({}, function (err, docs) {
		//console.log(categoryDB);
    //console.log(docs);
		res.send(docs)
	})
})
// GET all inventory items
app.get('/products', function (req, res) {

	inventoryDB.find({categoryID: "41"}, function (err, docs) {
		//console.log(docs);
		res.send(docs)
	})
})
app.get('/products_pos', function (req, res) {
	inventoryDB.find({}, function (err, docs) {
		//console.log('products_pos');
		res.send(docs)
	})
})

// Create inventory product
app.post('/product', function (req, res) {

	var newProduct = req.body

	inventoryDB.insert(newProduct, function (err, product) {
		if (err)
			res.status(500).send(err)
		else
			res.send(product)
	})
})

app.delete('/product/:productId', function (req, res) {

	inventoryDB.remove({ _id: req.params.productId }, function (err, numRemoved) {
		if (err)
			res.status(500).send(err)
		else
			res.sendStatus(200)
	})
})

// Update inventory product
app.put('/product', function (req, res) {

	var productId = req.body._id

	inventoryDB.update({ _id: productId }, req.body, {}, function (err, numReplaced, product) {

		if (err)
			res.status(500).send(err)
		else
			res.sendStatus(200)

	});

})

app.decrementInventory = function (products) {

	async.eachSeries(products, function (transactionProduct, callback) {

		inventoryDB.findOne({_id: transactionProduct._id }, function (err, product) {

			// catch manually added items (don't exist in inventory)
			if (!product || !product.quantity_on_hand) {
				callback();
			}

			else {
				var updatedQuantity = parseInt(product.quantity_on_hand) - parseInt(transactionProduct.quantity)

				inventoryDB.update({ _id: product._id }, { $set: { quantity_on_hand: updatedQuantity } }, {}, callback)
			}

		});

	});
};
