@ECHO OFF
title Bot Launcher
cls
:boot
node index.js
echo.
set proceed=""
set /p proceed=Would you like to boot up your bot again? (y/n):
if "%proceed%"=="y" goto boot
if "%proceed%"=="n" exit
if "%proceed%"=="Y" goto boot
if "%proceed%"=="N" exit
