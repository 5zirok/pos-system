//$sql = "SELECT *  FROM `SS_products` WHERE `enabled` = 1"; //Выборка номеров товара

<?php
//Подключение библиотек
	include("./cfg/".$_SERVER["SERVER_NAME"].".connect.inc.php");
   include("./cfg/".$_SERVER["SERVER_NAME"].".cfg.php");
  require_once('./error_log.php');
  require_once("./core_functions/product_functions.php");
  require_once("./core_functions/functions.php");
  require_once("./core_functions/datetime_functions.php");
//authorized login check
   include("./checklogin.php");
   
//Авторизация на сервере
//$sql = "SELECT * FROM `users`"; // выборка пользователей
//$sql = "SELECT *  FROM `SS_customers` WHERE `Login` LIKE \'andrey_r\'"; //Определение пароля по Login
$responce = db_fetch_row(db_query("SELECT * FROM `users`"));

print json_encode($responce);
?>