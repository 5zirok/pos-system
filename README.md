# Автоматизированая системма продаж


# 

To start using pos:

## Step 1: Get code

Clone repo via git 
```bash
git clone https://github.com/5zirok/pos-system.git
```

Или [Загрузите от сюда](https://github.com/5zirok/pos-system/archive/master.zip).

## Step 2: Install Dependencies

Go to the Hunts Point POS directory and run:

```bash
$ npm install
$ bower install
$ npm i escpos --save
$ npm install text2png
$ npm install canvas

если вы используете usb в качестве адаптера для термопринтера:
В Linux вам нужно libudevбудет создать libusb.
В Ubuntu / Debian: sudo apt-get install build-essential libudev-dev.
В Windows используйте Zadig для установки драйвера WinUSB для вашего устройства USB.
В противном случае вы получите LIBUSB_ERROR_NOT_SUPPORTED при попытке открыть устройства.

Для работы со сканером штрих кода напрямую установить:
sudo apt-get install libusb-1.0-0-dev
sudo npm install node-hid
npm install node-usb-barcode-scanner


Для формирования дерева категорий используется модуль bower install angular-tree-control
https://github.com/wix/angular-tree-control
```

## Step 3: Run the app!

To start the app, run:

```bash
node server/
```

This will install all dependencies required to run the node app.

# Цели проэкта

## Требуемые функции

- Авторизация по пользователю
- Работа с чековым принтером
- Сканирование и добавление товара на странице Касса-POS
- Сканирование и Поиск на странице номенклатуры + дерево (каталог товаров).
- Работа в онлайн режиме с удаленной базой через JSON
- Автоматическое обновление с GitHab последней стабильной версии!
- Возможность работы в Офлайн режиме (Базовые функции)
- Реализация 4-х видов оплат Нал, VISA, Кредит, Бонус



## Плановые функции

- интеграция esc / pos
- страница инвентаризации инвентаря
- Страница конфигурации
- функция возврата
- учет нескольких регистров
- функции отчетов
- график текущей транзакции (текущее обновление)
- график транзакций с диапазоном дат
- инейный график истории продаж продукта


## Принципы проекта

- Чистый и красивый интерфейс
- Набор функций, предназначенных для работы с одним хранилищем
- Простой процесс установки
- Отзывчивое веб-приложение, доступное с любого устройства в сети
Поддержка Plug & Play для:
- POS-принтеры (ESC / POS)
- Денежные ящики
- Сканеры штрих-кодов (USB, Bluetooth)
- Сенсорная панель (USB)
