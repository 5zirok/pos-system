var express = require('express'),
app 		= require('express')(),
server 		= app.listen(3034),
io 			= require('socket.io')(server),
path 		= require('path'),
bodyParser 	= require('body-parser'),
publicPath 	= '/../public/',
liveCart
var usbScanner =  require ('node-usb-barcode-scanner'). usbScanner ;
var getDevices =  require ('node-usb-barcode-scanner'). getDevices ;
//get array of attached HID devices
var connectedHidDevices = getDevices()

//print devices
console.log(connectedHidDevices)

//initialize new usbScanner - takes optional parmeters vendorId and hidMap - check source for details
var scanner = new usbScanner();

//scanner emits a data event once a barcode has been read and parsed
scanner.on("data", function(code){
	console.log("recieved code : " + code);
});


global.group_id=3;
global.usr="od_1";

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
	var str=''; 
	for (va in res) {str += (va +  res[va]);}
	arr = str.match(/(.{1,30})/gim) || '';//Разбиваем строку чека по 30 символов

device.open(function(err){
	for (va in arr) {//Печатаем на чековый принтер построчно из масива
		
		printer
		  .model('')
		  .font('b')
		  .align('ct')
		  .style('bu')
		  .size(1, 1)
		  .encode('CP866')
		  .text(arr[va]);
	}
	printer.cut();
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