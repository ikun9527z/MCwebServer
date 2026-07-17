@echo off
chcp 65001 >nul
echo 正在启动 MC 服务器网页服务...
start "" node "%~dp0mc-proxy.js"
timeout /t 2 /nobreak >nul
echo 正在打开页面...
start "" "http://localhost:3456"
echo 启动完成！
