Сервер REG. SSH подключение
95.163.229.14
Логин: root
Пароль: P61kwfZ5L8mAbSAn

Перезалить бота

1) Запускаем Typescript Watch и выполняем bot.js сборку

2) Переходим в папку бота
cd Bot...

3) Копируем bot.js на SSH
ssp bot.js root@95.163.229.14:/root/

4) Логинемся на сервер
ssh root@95.163.229.14 
// вводим Пароль

5) Перезапускаем pm2 

v1)
pm2 kill
pm2 start bot.js

v2)
pm2 restart bot.js