#!/bin/bash

echo "========================================"
echo "   歌单迁移工具"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js"
    echo "访问 https://nodejs.org/ 下载安装"
    exit 1
fi

# Build client
echo "[1/2] 构建前端..."
cd "$(dirname "$0")/client" || exit 1
npx vite build
if [ $? -ne 0 ]; then
    echo "[错误] 前端构建失败"
    exit 1
fi

# Start server in background
echo "[2/2] 启动服务..."
cd "$(dirname "$0")/server" || exit 1
npx tsx src/index.ts &
SERVER_PID=$!

sleep 2

# Detect local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

echo ""
echo "========================================"
echo "  启动成功！"
echo ""
echo "  电脑浏览器打开: http://localhost:3001"
echo ""
echo "  👉 手机浏览器打开: http://${LOCAL_IP}:3001"
echo "     (手机和电脑需在同一 WiFi 下)"
echo ""
echo "  按 Ctrl+C 停止服务"
echo "========================================"

# Wait and cleanup
trap "kill $SERVER_PID 2>/dev/null; exit 0" INT TERM
wait $SERVER_PID
