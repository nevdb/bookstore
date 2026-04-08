<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    protected $fillable = [
        'title',
        'isbn',
        'publication_year',
        'description',
        'genre_id',
        'author_id',
        'pages',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function userBooks(): HasMany
    {
        return $this->hasMany(UserBook::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_books')
            ->withPivot(['personal_rating', 'status', 'notes'])
            ->withTimestamps();
    }
}
