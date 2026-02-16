# Custom nginx configuration for PocketBase
# Redirect /admin to /_/ (PocketBase admin dashboard)

# Proxy API endpoints (needed for PocketBase functionality)
location /api/ {
    proxy_pass http://pocketbase:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support (needed for PocketBase realtime features)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Proxy admin dashboard from /admin to /_/
location /admin {
    # Rewrite /admin to /_/ and preserve the rest of the path
    rewrite ^/admin(.*)$ /_/$1 break;
    
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

# Also proxy /admin/ (with trailing slash)
location /admin/ {
    rewrite ^/admin/(.*)$ /_/$1 break;
    
    proxy_pass http://pocketbase:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
