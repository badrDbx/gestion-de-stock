<?php

use App\Http\Controllers\MaterialController;
use App\Http\Controllers\MaterialRequestController;
use App\Http\Controllers\BorrowedItemController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\MessageController;

Route::get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('materials', MaterialController::class);
Route::apiResource('material-requests', MaterialRequestController::class);
Route::apiResource('borrowed-items', BorrowedItemController::class);
Route::apiResource('users', UserController::class);

// Messaging routes
Route::get('/messages', [MessageController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);
Route::post('/messages/read', [MessageController::class, 'markAsRead']);
Route::get('/messages/total-unread', [MessageController::class, 'totalUnread']);
Route::get('/conversations', [MessageController::class, 'conversations']);
Route::delete('/messages/clear', [MessageController::class, 'clearChat']);

use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);
