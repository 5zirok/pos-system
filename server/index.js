var express = require('express'),
app 		= require('express')(),
server 		= app.listen(3034),
io 			= require('socket.io')(server),
path 		= require('path'),
bodyParser 	= require('body-parser'),
publicPath 	= '/../public/',
liveCart

console.log('Оптика 5 звезд!')
console.log('Server started')
//console.log(__dirname + publicPath)

app.use(express.static(path.resolve(__dirname + publicPath)))
app.use(express.static(path.resolve(__dirname + '/../bower_components')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
	console.log('Поступил GET запрос')
	res.sendFile(path.resolve(__dirname, publicPath, 'index.html'))
	//console.log('Поступил GET запрос')
})

app.post('/', function (req, res, next) {
	res = req.body
	//res2 = JSON.parse(res1)
	//keys = Object.keys(res2);
for (va in res) {
		console.log("obj." + va + " = " + res[va]);
}
	//console.log(keys)
	
	
	//console.log(typeof req.body);
	
	
   //console.log(JSON.stringify(req.body));
   //var obj = JSON.parse(req.body);
   
	//console.log(bodyParser.json)
	//console.log(post)
})

app.use('/api', require('./api'))

// Логика Websocket для Live Cart
io.on('connection', function (socket) {

	socket.on('cart-transaction-complete', function () {
		socket.broadcast.emit('update-live-cart-display', {})
	})

	// при загрузке страницы, укажите текущую корзину пользователя
	socket.on('live-cart-page-loaded', function () {
		socket.emit('update-live-cart-display', liveCart)
	})

	// после подключения, сделайте клиенту обновление живого тележка
	socket.emit('update-live-cart-display', liveCart)

	// когда данные корзины обновляются с помощью POSS
	socket.on('update-live-cart', function (cartData) {
		
		// отслеживать это
		liveCart = cartData
		
		// трансляция обновленной живой телеграммы всем клиентам websocket
		socket.broadcast.emit('update-live-cart-display', liveCart)
	})

})