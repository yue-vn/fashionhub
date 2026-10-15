# fashionhub

Dự án Hệ thống Bán lẻ Thời trang FashionHub (E-Commerce Web Application)

## Cấu trúc dự án
- `backend/`: RESTful API ASP.NET Core 8.0, Entity Framework Core, SQL Server, SignalR, JWT Authentication.
- `frontend/`: React 18, Vite, TypeScript, Tailwind CSS, Shadcn UI, Redux / Context API, Nginx Reverse Proxy.
- `docker-compose.yml`: Cấu hình Docker Compose đa dịch vụ (SQL Server 2022, Backend, Frontend).
- `.env`: File biến môi trường cho hệ thống.

## Khởi chạy dự án bằng Docker
```bash
# Build và chạy tất cả các service trong nền
docker compose up -d --build

# Xem trạng thái các container
docker ps

# Dừng các service
docker compose down
```

## Các cổng dịch vụ mặc định
- Frontend Web: http://localhost:5173
- Backend Swagger: http://localhost:8080/swagger/index.html
- SQL Server: localhost:1433
