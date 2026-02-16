# Custom nginx configuration for PocketBase admin dashboard
# Map root path (/) to PocketBase admin dashboard (/_/)
# API endpoints are NOT exposed externally

# Proxy root path to PocketBase admin dashboard
location / {
    # Rewrite / to /_/ and preserve the rest of the path
    rewrite ^(.*)$ /_/$1 break;
    
    # Proxy to PocketBase container
    proxy_pass http://pocketbase:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support (needed for PocketBase realtime features)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

