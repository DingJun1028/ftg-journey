#!/usr/bin/env bash
# FTG Journey 後端部署腳本 (Oracle Always Free ARM)
# 用法: bash deploy-oracle.sh
set -e
APP_DIR="/home/ubuntu/ftg-journey-server"
PORT=8787
echo "== 1. 安裝 Node 24 (若未裝) =="
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - || true
sudo apt-get install -y nodejs 2>/dev/null || true
echo "== 2. 拉取程式 =="
mkdir -p "$APP_DIR"
git clone https://github.com/DingJun1028/ftg-journey.git /tmp/ftg-journey 2>/dev/null || (cd /tmp/ftg-journey && git pull)
cp -r /tmp/ftg-journey/server/* "$APP_DIR/"
cd "$APP_DIR"
npm install --omit=dev
echo "== 3. 寫入環境變數 =="
cat > "$APP_DIR/.env" <<EOF
PORT=$PORT
GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
ADMIN_EMAILS=dingjunhong1028@gmail.com
STAFF_DOMAINS=@esggo.co,@ftg.com.tw
EOF
echo "== 4. pm2 啟動 =="
npm i -g pm2 2>/dev/null || true
pm2 start server.js --name ftg-journey -- --env "$APP_DIR/.env"
pm2 save
echo "== 5. nginx 反向代理 =="
sudo tee /etc/nginx/sites-available/ftg-journey <<EOF
server {
  listen 80;
  server_name journey-api.ftgtours.esggo.co;
  location / { proxy_pass http://localhost:$PORT; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/ftg-journey /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "DONE. 後端運行於 :$PORT，nginx 代理 journey-api.ftgtours.esggo.co"
