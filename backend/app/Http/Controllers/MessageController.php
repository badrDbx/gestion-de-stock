<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Get messages for the current user or a specific user (if admin).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $targetUserId = $request->query('user_id');

        // Fallback for missing auth
        if (!$user && $targetUserId) {
            $messages = Message::where('user_id', $targetUserId)
                ->orderBy('created_at', 'asc')
                ->get();
            return response()->json($messages);
        }

        if ($user && $user->role === 'admin') {
            if (!$targetUserId) {
                return response()->json(['message' => 'User ID is required for admin'], 400);
            }
            $messages = Message::where('user_id', $targetUserId)
                ->orderBy('created_at', 'asc')
                ->get();
        } else {
            $userId = $user ? $user->id : $targetUserId;
            if (!$userId) {
                return response()->json(['message' => 'User ID is required'], 400);
            }
            $messages = Message::where('user_id', $userId)
                ->orderBy('created_at', 'asc')
                ->get();
        }

        return response()->json($messages);
    }

    /**
     * Store a new message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'user_id' => 'nullable|exists:users,id',
            'sender_role' => 'nullable|string', // Fallback
        ]);

        $user = Auth::user();
        
        $messageData = [
            'content' => $request->content,
            'sender_role' => $request->sender_role ?? ($user && $user->role === 'admin' ? 'admin' : 'user'),
        ];

        if ($user && $user->role === 'admin') {
            $messageData['user_id'] = $request->user_id;
        } else {
            $messageData['user_id'] = $user ? $user->id : $request->user_id;
        }

        if (!$messageData['user_id']) {
            return response()->json(['message' => 'User ID is required'], 400);
        }

        $message = Message::create($messageData);

        return response()->json($message, 201);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Request $request)
    {
        $user = Auth::user();
        $targetUserId = $request->user_id;

        if (!$user && $targetUserId) {
            Message::where('user_id', $targetUserId)
                ->where('sender_role', 'admin')
                ->update(['is_read' => true]);
            return response()->json(['message' => 'Messages marked as read']);
        }

        if ($user && $user->role === 'admin') {
            Message::where('user_id', $targetUserId)
                ->where('sender_role', 'user')
                ->update(['is_read' => true]);
        } else if ($user) {
            Message::where('user_id', $user->id)
                ->where('sender_role', 'admin')
                ->update(['is_read' => true]);
        }

        return response()->json(['message' => 'Messages marked as read']);
    }

    /**
     * List all users who have conversations (for admin).
     */
    public function conversations()
    {
        $user = Auth::user();
        if ($user && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::whereHas('messages')
            ->with(['messages' => function($query) {
                $query->latest()->first();
            }])
            ->get()
            ->map(function($user) {
                $latestMessage = $user->messages->first();
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'last_message' => $latestMessage ? $latestMessage->content : '',
                    'last_message_time' => $latestMessage ? $latestMessage->created_at : null,
                    'unread_count' => Message::where('user_id', $user->id)
                        ->where('sender_role', 'user')
                        ->where('is_read', false)
                        ->count()
                ];
            })
            ->sortByDesc('last_message_time')
            ->values();

        return response()->json($users);
    }

    /**
     * Get total unread messages count.
     */
    public function totalUnread(Request $request)
    {
        $user = Auth::user();
        $targetUserId = $request->query('user_id');

        if (!$user && $targetUserId) {
            $count = Message::where('user_id', $targetUserId)
                ->where('sender_role', 'admin')
                ->where('is_read', false)
                ->count();
            return response()->json(['count' => $count]);
        }

        if ($user && $user->role === 'admin') {
            $count = Message::where('sender_role', 'user')
                ->where('is_read', false)
                ->count();
        } else if ($user) {
            $count = Message::where('user_id', $user->id)
                ->where('sender_role', 'admin')
                ->where('is_read', false)
                ->count();
        } else {
            $count = 0;
        }

        return response()->json(['count' => $count]);
    }

    /**
     * Clear all messages in a conversation.
     */
    public function clearChat(Request $request)
    {
        $user = Auth::user();
        $targetUserId = $request->user_id;

        $userId = ($user && $user->role === 'admin') ? $targetUserId : ($user ? $user->id : $targetUserId);

        if (!$userId) {
            return response()->json(['message' => 'User ID is required'], 400);
        }

        Message::where('user_id', $userId)->delete();

        return response()->json(['message' => 'Chat cleared successfully']);
    }
}
