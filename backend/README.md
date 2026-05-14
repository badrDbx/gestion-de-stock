# Inventory Management System - Backend API

This is the Laravel-based REST API that powers the Inventory Management System.

## 🛠 Tech Stack
- **Framework**: Laravel 13
- **Language**: PHP 8.3
- **Database**: SQLite (default) / MySQL
- **Authentication**: Custom Auth (Session-based/API)

## 🚀 Getting Started
1. `composer install`
2. `cp .env.example .env`
3. `php artisan key:generate`
4. `php artisan migrate --seed`
5. `php artisan serve`

## 📡 API Endpoints
- `GET /api/materials`: List all inventory items
- `POST /api/material-requests`: Create a new request
- `GET /api/messages`: Fetch chat history
- `POST /api/login`: Authenticate user

## 🧪 Testing
Run `php artisan test` to execute the test suite.
