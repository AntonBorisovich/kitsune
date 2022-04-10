# Kitsune
###### Powered by Discord.js

#### Описание:
Модульный бот для Discord, написанный на Node.js®. Подробнее в разделе wiki

#### Перед запуском:
- Установите [Node.js®](https://nodejs.org/) (v16.9.0 и выше) 
- Установите canvas [по инструкции](https://github.com/Automattic/node-canvas/wiki) для вашей ОС
- Установите [python 3](https://www.python.org/downloads/)
- Установите шрифт [Lobster](https://fonts.google.com/specimen/Lobster)
- Установить все модули прописав `npm i` в директории с package.json
- Далее введите токен вашего бота в src/values/discordtoken.json, который вы можете найти на [Портале Разработчиков Discord](https://discord.com/developers/)
- Откройте start.bat на Windows или пропишите `node index` на других системах в директории с index.js для запуска.

#### Известные ошибки:
- Permission denied и похожие ошибки записи/чтения файлов 
  - Разрешите юзеру, из под которого запускаете index.js, читать и записывать папки и вложеные файлы в директории бота. На Linux с помощью chmod, а на Windows зачастую достаточно убрать галочку "Только для чтения".

#### При возникновении ошибок пишите о них в Issues.
