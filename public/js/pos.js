//var myapp = angular.module('myApp', ['treeControl']);




var pos = angular.module('POS', [
  'ngRoute',
  'ngAnimate',
  'lr.upload',
  'ui.odometer',
  'treeControl',
]);

//alert( "Привет" );
///////////////////////////////////////////////////
////////////////// Socket.io ////////////////// //
//////////////////////////////////////////////////

var serverAddress;

if (window.location.host === 'pos.dev')
  serverAddress = 'http://pos.dev'
else
  serverAddress = 'http://pos.afaqtariq.com:8080';

var socket = io.connect(serverAddress);


/////////////////////////////////////////////////////
////////////////// Controllers ////////////////// //
////////////////////////////////////////////////////

pos.controller('body', function ($scope, $location, Settings) {
  $scope.onHomePage = function () {
    return ($location.path() === '/' || $location.path() === '#/');
  };

  Settings.get().then(function (settings) {
    $scope.settings = settings;
  });

});

// Inventory Section

pos.controller('inventoryController', function ($scope, $location, Inventory) {
  Inventory.getCategory().then(function (category) {
    var category_list = {};
    var category_filter = category;
    category.forEach(function(num, i, arr) {
        var parent = category.filter(function(number) {
         return number['parent'] === num['_id'];
        });
      category[i]['children'] = parent;
    });
    category = category.filter(function(number) {
     return number['parent'] === "1";
    });
      category.sort(function (a, b) {
          return a.sort_order - b.sort_order;
      });
    $scope.dataForTheTree = angular.copy(category);
    });

  $scope.treeOption = {//Тут определяются настройки внехнего вида дерева категорий
      nodeChildren: "children",
      dirSelectable: true,
      injectClasses: {
          ul: "a4",
          li: "a5",
          liSelected: "a3",
          iExpanded: "a3",
          iCollapsed: "a4",
          iLeaf: "a5",
          label: "a6",
          labelSelected: "a8"
      }
  }

  

  //$scope.selectNodeLabel = function (node) {

  //  console.log(node);
    //$scope.barcode_next=product.barcode;
    //  $scope.updateCartTotals();
  //};

  // get and set inventory
  Inventory.getProducts().then(function (products) {
    console.log("11111");
    $scope.inventory = angular.copy(products);
  });

  // go to edit page
  $scope.editProduct = function (productId) {
    $location.path('/inventory/product/' + productId);
  };
//console.log($scope);
});

pos.controller('newProductController', function ($scope, $location, $route, Inventory) {

  $scope.addMultipleProducts = false;

  $scope.createProduct = function (product) {

    Inventory.createProduct($scope.newProduct).then(function (product) {

      if ($scope.addMultipleProducts) refreshForm();
      else $location.path('/inventory');

    });

  };

  var refreshForm = function () {
    $scope.newProuct = {};
  };

});

pos.controller('editProductController', function ($scope, $location, $routeParams, Inventory, upload) {

  // get and set inventory
  Inventory.getProduct($routeParams.productId).then(function (product) {
    $scope.product = angular.copy(product);
  });

  $scope.saveProduct = function (product) {

    Inventory.updateProduct(product).then(function (updatedProduct) {
      console.log('updated!');
    });

    $location.path('/inventory');
  };

  $scope.deleteProduct = function () {
    Inventory.removeProduct($scope.product._id).then(function () {
      $location.path('/inventory');
    });
  };


  $scope.doUpload = function () {
    console.log('yoyoyo');

    upload({
      url: '/upload',
      method: 'POST',
      data: {
        anint: 123,
        aBlob: Blob([1,2,3]), // Only works in newer browsers
        aFile: $scope.product.image, // a jqLite type="file" element, upload() will extract all the files from the input and put them into the FormData object before sending.
      }
    }).then(
      function (response) {
        console.log(response.data); // will output whatever you choose to return from the server on a successful upload
      },
      function (response) {
          console.error(response); //  Will return if status code is above 200 and lower than 300, same as $http
      }
    );
  }

});

// POS система
pos.controller('posController', function ($scope, $location, Inventory, Transactions) {

  $scope.barcode = '';
  barcode_i = 1;

  function barcodeHandler (e) {

      $scope.barcodeNotFoundError = false;
      console.log(e.which);
      // если нажат Enter
      if (e.which === 13) {
        //alert('Enter-1');
        if ($scope.barcode !== '') $scope.barcode_next = $scope.barcode; //При нажатии Enter Добовляем еше один товар в корзину

        // если набраный штрих-код найден то добавляем товар в корзину
        if ($scope.isValidProduct($scope.barcode)) {
          do {
          $scope.addProductToCart($scope.barcode_next);
          barcode_i--;
        } while (barcode_i>0);
        }
        else if ($scope.isValidProduct($scope.barcode_next)) $scope.addProductToCart($scope.barcode_next);

        $scope.barcode = '';
        $scope.$digest();
        window.location.hash=$scope.barcode;
        //alert('Enter-2');
      }
      else if (e.which === 42) { //Количественный ввод при нажатии * например 2*14 14-зто код товара а 2 это количество
        barcode_i = Number($scope.barcode);
        $scope.barcode = '';
        //alert('Установить количество:'+barcode_i);
      }
      else if (e.which === 47) { //Устанавливаем % скидки или наценки
        $scope.barcode = Number($scope.barcode)/100;
        console.log(typeof($scope.barcode));
      }
      else if (e.which === 43) { //Устанавливаем наценку
        barcode_persent =  Number("+"+$scope.barcode);
        console.log(typeof($scope.barcode));
        addProductTaxPercent(barcode_persent);
        barcode_persent = "";
        $scope.barcode = '';
        $scope.$digest();
        //alert('Установить количество:'+barcode_i);
      }else if (e.which === 45) { //Устанавливаем скидку
        barcode_persent = Number("-"+$scope.barcode);
        console.log(typeof($scope.barcode));
        addProductTaxPercent(barcode_persent);
        barcode_persent = "";
        $scope.barcode = '';
        $scope.$digest();
        //alert('Установить количество:'+barcode_i);
      }
      else {
        $scope.barcode += String.fromCharCode(e.which);
        //alert('Штрих код: ');
      }
  }

  $(document).on('keypress', barcodeHandler);

  var rawCart = {
    products: [],
    total: 0,
    total_tax: 0,
  };

  var startCart = function () {
    var cartJSON = localStorage.getItem('cart');

    if (cartJSON) {
      $scope.cart = JSON.parse(cartJSON);
    }
    else {
      $scope.cart = angular.copy(rawCart);
    }

  };

  var startFreshCart = function () {
      localStorage.removeItem('cart');
      $scope.cart = angular.copy(rawCart);
      $scope.updateCartTotals();
      $('#barcode').focus();
  };

  $scope.refreshInventory = function () {
    Inventory.getProducts_pos().then(function (products) {
      $scope.inventory = angular.copy(products);
      $scope.inventoryLastUpdated = new Date();
    });
  };

  $scope.refreshInventory();

  startCart();

  var addProductAndUpdateCart = function (product) {
    $scope.cart.products = $scope.cart.products.concat([product]);
    $scope.updateCartTotals();
    $scope.barcode = '';
  };

  $scope.cleanProduct = function (product) {
    product.cart_item_id = $scope.cart.products.length + 1;

    if (product.food) product.tax_percent = 0;
    else product.tax_percent = .08 ;

    delete product.quantity_on_hand;
    delete product.food;
    return product;
  };

  var productAlreadyInCart = function (barcode) {
    var product = _.find($scope.cart.products, { barcode: barcode.toString() });
    if (product) {
      product.quantity = product.quantity + 1;
      $scope.updateCartTotals();
    }
    return product;
  };

  $scope.addProductToCart = function (barcode) {

    if (productAlreadyInCart(barcode)) return;
    else {
      var product = angular.copy(_.find($scope.inventory, { barcode: barcode.toString() }));
      product = $scope.cleanProduct(product);
      product.quantity = 1;
      addProductAndUpdateCart(product);
    }
  };

  $scope.addManualItem = function (product) {
    product.quantity = 1;
    product = $scope.cleanProduct(product)
    addProductAndUpdateCart(product);
  };

  $scope.removeProductFromCart = function (productIndex) {
    $scope.cart.products.remove(productIndex);
    //alert(productIndex);
    $scope.updateCartTotals();
  };

  $scope.isValidProduct = function (barcode) {
    return _.find($scope.inventory, { barcode: barcode.toString() });
  };

  var updateCartInLocalStorage = function () {
    var cartJSON = JSON.stringify($scope.cart);
    localStorage.setItem('cart', cartJSON);
    socket.emit('update-live-cart', $scope.cart);
  };

  $scope.updateCartTotals = function () {
    $scope.cart.total = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat( product.price * product.quantity );
      var weightedTax = parseFloat( weightedPrice * product.tax_percent );//Просчет процентов!
      var weightedPricePlusTax = weightedPrice + weightedTax;
      return total + weightedPricePlusTax;
    }, 0);

    $scope.cart.total_tax = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat( product.price * product.quantity );
      var weightedTax = parseFloat( weightedPrice * product.tax_percent );
      return total + weightedTax;
    }, 0);

    updateCartInLocalStorage();
  };

  $scope.printReceipt = function (payment) {
    // print receipt
    var cart = angular.copy($scope.cart);
    cart.payment = angular.copy(payment);
    cart.date = new Date();

    // save to database
    Transactions.add(cart).then(function (res) {

      socket.emit('cart-transaction-complete', {});

      // clear cart and start fresh
      startFreshCart();

    });

    $scope.refreshInventory();
  };



  var addProductTaxPercent = function (percent) {
    var product = _.find($scope.cart.products, { barcode: $scope.barcode_next});

    if (product) {
      if (typeof($scope.barcode)==="string"){
        percent=(percent/(product.price/100))/100;
      }

      product.tax_percent = percent;
      $scope.updateCartTotals();
      console.log($scope.cart.products);
    }

    //return product;
  };

  $scope.addQuantity = function (product) {
    //console.log(product);
    product.quantity = parseInt(product.quantity) + 1;
    $scope.updateCartTotals();
  };

  $scope.removeQuantity = function (product) {
    if (parseInt(product.quantity) > 1) {
      product.quantity = parseInt(product.quantity) - 1;
      $scope.updateCartTotals();
    }
  };

  $scope.activBarcode = function (product) {
    $scope.barcode_next=product.barcode;
      $scope.updateCartTotals();
  };

});

pos.controller('transactionsController', function ($scope, $location, Transactions) {

  Transactions.getAll().then(function (transactions) {
    $scope.transactions = _.sortBy(transactions, 'date').reverse();
  });

  // get yesterday's date
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  Transactions.getTotalForDay().then(function (dayTotal) {
    $scope.todayTotal = dayTotal.total;
  });

  Transactions.getTotalForDay(yesterday).then(function (dayTotal) {
    $scope.yesterdayTotal = dayTotal.total;
  });

  $scope.getNumberOfProducts = function (products) {
    return _.reduce(products, function (s, product) {
      return s + product.quantity;
    }, 0);
  };

});

pos.controller('viewTransactionController', function ($scope, $routeParams, Transactions) {

  var transactionId = $routeParams.transactionId;

  Transactions.getOne(transactionId).then(function (transaction) {
    $scope.transaction = angular.copy(transaction);
  });

});

pos.controller('liveCartController', function ($scope, Transactions, Settings) {

  $scope.recentTransactions = [];

  var getTransactionsData = function () {
    Transactions.get(10).then(function (transactions) {
      $scope.recentTransactions = _.sortBy(transactions, 'date').reverse();
    });

    Transactions.getTotalForDay().then(function (dayTotal) {
      $scope.dayTotal = dayTotal.total;
    });
  };

  // tell the server the page was loaded.
  // the server will them emit update-live-cart-display
  socket.emit('live-cart-page-loaded', { forreal: true });

  // update the live cart and recent transactions
  socket.on('update-live-cart-display', function (liveCart) {
    $scope.liveCart = liveCart;
    getTransactionsData();
    $scope.$digest();
  });

});
