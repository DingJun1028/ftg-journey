#!/usr/bin/env bash
# FTG Journey 後端初始化 (Oracle Always Free E2.Micro Ubuntu 22.04)
set -e
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx
# Node 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs
# 後端程式
mkdir -p /home/ubuntu/ftg-journey-server
git clone https://github.com/DingJun1028/ftg-journey.git /tmp/ftg 2>/dev/null || (cd /tmp/ftg && git pull)
cp -r /tmp/ftg/server/* /home/ubuntu/ftg-journey-server/
cd /home/ubuntu/ftg-journey-server && npm install --omit=dev
# 環境
cat > /home/ubuntu/ftg-journey-server/.env <<'EOF'
PORT=8787
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
ADMIN_EMAILS=dingjunhong1028@gmail.com
STAFF_DOMAINS=@esggo.co,@ftg.com.tw
EOF
# systemd service
cat > /etc/systemd/system/ftg-journey.service <<'EOF'
[Unit]
Description=FTG Journey Server
After=network.target
[Service]
WorkingDirectory=/home/ubuntu/ftg-journey-server
ExecStart=/usr/bin/node server.js
EnvironmentFile=/home/ubuntu/ftg-journey-server/.env
Restart=always
User=ubuntu
[Install]
WantedBy=multi-user.target
EOF
systemctl enable ftg-journey && systemctl start ftg-journey
# nginx
cat > /etc/nginx/sites-available/ftg-journey <<'EOF'
server {
  listen 80;
  server_name journey-api.ftgtours.esggo.co;
  location / { proxy_pass http://localhost:8787; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
}
EOF
ln -sf /etc/nginx/sites-available/ftg-journey /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "FTG_JOURNEY_INIT_DONE"
