#!/bin/bash

echo "🚀 开始部署GeoGPT对话界面..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装npm"
    exit 1
fi

echo "📦 安装依赖..."

# 安装后端依赖
echo "安装后端依赖..."
cd backend
npm install
cd ..

# 安装前端依赖
echo "安装前端依赖..."
cd frontend
npm install
cd ..

echo "🏗️ 构建前端..."
cd frontend
npm run build
cd ..

echo "🔧 配置环境..."

# 检查.env文件是否存在
if [ ! -f "backend/.env" ]; then
    echo "⚠️ 未找到.env文件，创建默认配置..."
    cat > backend/.env << 'ENVEOF'
PORT=3001
JWT_SECRET=your-secret-key-$(date +%s)
DB_PATH=./database.sqlite
GEOGPT_API_URL=https://geogpt.zero2x.org.cn/api
GEOGPT_API_KEY=your-geogpt-api-key-here
ENVEOF
    echo "✅ 已创建默认.env文件，请根据需要修改配置"
fi

echo "🚀 启动服务..."

# 停止现有服务
pkill -f "node app.js" 2>/dev/null || true

# 启动后端服务
cd backend
nohup node app.js > ../server.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 后端服务启动成功 (PID: $BACKEND_PID)"
    echo "📍 后端地址: http://localhost:3001"
else
    echo "❌ 后端服务启动失败，请检查日志: server.log"
    exit 1
fi

echo ""
echo "🎉 部署完成！"
echo "📍 应用地址: http://localhost:3001"
echo "📊 健康检查: http://localhost:3001/api/health"
echo "📝 服务日志: server.log"
echo ""
echo "�� 提示："
echo "   - 如需配置GeoGPT API，请编辑 backend/.env 文件"
echo "   - 如需停止服务，运行: pkill -f 'node app.js'"
echo "   - 如需查看日志，运行: tail -f server.log"
