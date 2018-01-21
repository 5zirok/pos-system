var express = require('express'),
app 		= require('express')(),
server 		= app.listen(3034),
io 			= require('socket.io')(server),
path 		= require('path'),
bodyParser 	= require('body-parser'),
publicPath 	= '/../public/',
liveCart

const escpos = require('escpos');

const device  = new escpos.USB(1046,20497); //Подключаем чековый принтер
const printer = new escpos.Printer(device);
//console.log(escpos.USB.findPrinter.interfaces());


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

app.post('/', function (req, res, next) { //Принимаем POST запрос для печати данных на чековый принтер.
	res = req.body
	//res2 = JSON.parse(res1)
	//keys = Object.keys(res2);
	for (va in res) {
			console.log("obj." + va + " = " + res[va]);
	}

		escpos.Image.load(__dirname + '/tux.png', function(image){
		
		  device.open(function(){
		
		    printer
		    .align('ct')
		
		    .image(image, 's8')
		    //.image(image, 'd8')
		    //.image(image, 's24')
		    //.image(image, 'd24')
		    
		    //.raster(image)
		    //.raster(image, 'dw')
		    //.raster(image, 'dh')
		    //.raster(image, 'dwdh')
		
		    .cut();
		  
		  });
		
		});

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