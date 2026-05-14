<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'name', 'description', 'type', 'category', 'quantity', 'min_quantity', 'unit', 'location', 'image'
    ];
    //
}
