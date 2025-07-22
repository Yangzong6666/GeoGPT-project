#!/bin/bash

echo "启动GeoGPT对话界面..."

# 启动后端服务
echo "启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!

# 等待后端服务启动
sleep 3

# 启动前端开发服务器
echo "启动前端服务..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "服务启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait $BACKEND_PID $FRONTEND_PID
