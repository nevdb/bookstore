<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBook extends Model
{
    use HasFactory;
    protected $table = 'user_books';

    protected $fillable = [
        'user_id',
        'book_id',
        'personal_rating',
        'status',
        'notes',
    ];

    protected $casts = [
        'personal_rating' => 'integer',
        'status' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
