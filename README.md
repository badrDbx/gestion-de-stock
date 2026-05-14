# Inventory Management System (Gestion de Stock)

A modern, high-fidelity inventory management system built with **React** (Frontend) and **Laravel** (Backend). Features include stock tracking, material requests, user management, and real-time chat with administrators.

## 🚀 Project Structure

- `/app`: React Frontend (Vite, TypeScript, Tailwind CSS, Framer Motion)
- `/backend`: Laravel Backend API (PHP, SQLite/MySQL, REST)

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **PHP** (v8.2+)
- **Composer**
- **Laragon** or **XAMPP** (optional, for local development)

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure your database in .env (SQLite by default)
php artisan migrate --seed
php artisan serve
```
*Note: The default admin credentials are `admin@gmail.com` / `password`.*

### 3. Frontend Setup
```bash
cd app
npm install
cp .env.example .env
# Ensure VITE_API_URL matches your backend URL
npm run dev
```

---

## ✨ Key Features

- **Dashboard**: Real-time analytics and stock alerts.
- **Material Management**: CRUD operations for inventory items with low-stock tracking.
- **Request Workflow**: Users can request items; admins can approve, deliver, or reject.
- **Borrowing System**: Specific tracking for returnable items (projectors, laptops, etc.).
- **User Management**: Admin control over user roles and departments.
- **Messaging**: Built-in chat system between users and administrators.
- **Glassmorphism UI**: Premium, modern interface with smooth animations.

## 🚀 Performance Optimization

This project is optimized for speed using several techniques:

### Frontend
- **Code Splitting**: Routes are lazy-loaded to reduce the initial bundle size. Only the code needed for the current page is downloaded.
- **Asset Optimization**: High-resolution images should be converted to `.webp` for faster loading.
- **Vite Build**: The production build uses Rollup to minify and bundle assets efficiently.

### Backend
- **Eager Loading**: Database queries use `with()` to prevent N+1 issues.
- **Production Recommendations**:
    - Enable **OPcache** in PHP.
    - Run `php artisan config:cache` and `php artisan route:cache`.
    - Use a fast database like **MySQL** or **PostgreSQL** in production.

---

## 📄 License
This project is for academic/professional use. MIT License.
