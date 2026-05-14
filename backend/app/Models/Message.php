<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'user_id',
        'sender_role',
        'content',
        'is_read'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
