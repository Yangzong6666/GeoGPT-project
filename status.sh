#!/bin/bash

echo "🔍 GeoGPT对话界面状态检查"
echo "=========================="

# 检查后端服务
echo "📡 检查后端服务..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 后端服务正常运行 (http://localhost:3001)"
    
    # 显示API响应
    echo "📊 API响应："
    curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
else
    echo "❌ 后端服务未运行"
fi

echo ""

# 检查前端页面
echo "🖥️ 检查前端页面..."
if curl -s http://localhost:3001 | grep -q "GeoGPT"; then
    echo "✅ 前端页面正常加载"
else
    echo "❌ 前端页面加载失败"
fi

echo ""

# 检查进程
echo "🔧 服务进程状态："
if pgrep -f "node app.js" > /dev/null; then
    echo "✅ Node.js进程运行中 (PID: $(pgrep -f 'node app.js'))"
else
    echo "❌ 未找到Node.js进程"
fi

echo ""

# 检查端口
echo "🌐 网络端口状态："
if command -v lsof &> /dev/null; then
    if lsof -i :3001 &> /dev/null; then
        echo "✅ 端口3001正在使用"
    else
        echo "❌ 端口3001未被占用"
    fi
else
    echo "ℹ️ lsof命令不可用，无法检查端口"
fi

echo ""

# 检查数据库
echo "🗄️ 数据库状态："
if [ -f "backend/database.sqlite" ]; then
    echo "✅ SQLite数据库文件存在"
    echo "📁 数据库大小：$(du -h backend/database.sqlite | cut -f1)"
else
    echo "❌ 数据库文件不存在"
fi

echo ""

# 显示访问地址
echo "🚀 应用访问地址："
echo "   主页: http://localhost:3001"
echo "   登录: http://localhost:3001/login"
echo "   对话: http://localhost:3001/chat"
echo "   API健康检查: http://localhost:3001/api/health"

echo ""
echo "📝 日志文件："
if [ -f "server.log" ]; then
    echo "   最新日志：server.log (最后10行)"
    echo "   --------"
    tail -n 5 server.log
else
    echo "   未找到日志文件"
fi
