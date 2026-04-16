<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $books = [
            [
                'title' => 'The Great Gatsby',
                'isbn' => '978-0-7432-7356-5',
                'publication_year' => 1925,
                'description' => 'A novel set in the Jazz Age that has been acclaimed by generations of readers.',
                'author_id' => 1, // F. Scott Fitzgerald
                'genre_id' => 1, // Fiction
                'pages' => 180,
            ],
            [
                'title' => '1984',
                'isbn' => '978-0-452-29438-8',
                'publication_year' => 1949,
                'description' => 'A dystopian social science fiction novel and cautionary tale.',
                'author_id' => 2, // George Orwell
                'genre_id' => 3, // Science Fiction
                'pages' => 328,
            ],
            [
                'title' => 'Pride and Prejudice',
                'isbn' => '978-0-14-143951-8',
                'publication_year' => 1813,
                'description' => 'A novel of manners and marriage, one of the most famous works of fiction in the English language.',
                'author_id' => 3, // Jane Austen
                'genre_id' => 4, // Romance
                'pages' => 279,
            ],
            [
                'title' => 'To Kill a Mockingbird',
                'isbn' => '978-0-06-112008-4',
                'publication_year' => 1960,
                'description' => 'A gripping tale of racial injustice and childhood innocence in the American South.',
                'author_id' => 4, // Harper Lee
                'genre_id' => 1, // Fiction
                'pages' => 281,
            ],
            [
                'title' => 'The Shining',
                'isbn' => '978-0-385-33312-0',
                'publication_year' => 1977,
                'description' => 'A psychological horror novel about a family isolated in a haunted hotel.',
                'author_id' => 5, // Stephen King
                'genre_id' => 5, // Horror
                'pages' => 447,
            ],
            [
                'title' => 'Murder on the Orient Express',
                'isbn' => '978-0-062-07353-9',
                'publication_year' => 1934,
                'description' => 'A detective novel featuring Hercule Poirot solving a murder on a train.',
                'author_id' => 6, // Agatha Christie
                'genre_id' => 2, // Mystery
                'pages' => 256,
            ],
            [
                'title' => 'Sense and Sensibility',
                'isbn' => '978-0-14-143951-5',
                'publication_year' => 1811,
                'description' => 'A novel of manners and marriage centered on two different sisters.',
                'author_id' => 3, // Jane Austen
                'genre_id' => 4, // Romance
                'pages' => 409,
            ],
            [
                'title' => 'The Nightingale',
                'isbn' => '978-0-062-00322-9',
                'publication_year' => 2015,
                'description' => 'A historical fiction novel set in Nazi-occupied France during World War II.',
                'author_id' => 4, // Harper Lee (reused for diversity)
                'genre_id' => 8, // Historical Fiction
                'pages' => 440,
            ],
            [
                'title' => 'It',
                'isbn' => '978-1-501-18203-6',
                'publication_year' => 1986,
                'description' => 'An epic horror novel about a group of friends battling an ancient evil.',
                'author_id' => 5, // Stephen King
                'genre_id' => 5, // Horror
                'pages' => 1138,
            ],
            [
                'title' => 'Death on the Nile',
                'isbn' => '978-0-062-07354-6',
                'publication_year' => 1937,
                'description' => 'A mystery novel featuring Hercule Poirot solving a death on a cruise ship.',
                'author_id' => 6, // Agatha Christie
                'genre_id' => 2, // Mystery
                'pages' => 312,
            ],
            [
                'title' => 'Jane Eyre',
                'isbn' => '978-0-14-144075-7',
                'publication_year' => 1847,
                'description' => 'A gothic romance novel about an orphan girl\'s journey through life.',
                'author_id' => 3, // Jane Austen
                'genre_id' => 4, // Romance
                'pages' => 432,
            ],
            [
                'title' => 'The Stand',
                'isbn' => '978-0-385-33312-7',
                'publication_year' => 1978,
                'description' => 'A post-apocalyptic fantasy-horror novel about survivors of a devastating plague.',
                'author_id' => 5, // Stephen King
                'genre_id' => 3, // Science Fiction
                'pages' => 1152,
            ],
        ];

        foreach ($books as $book) {
            Book::create($book);
        }
    }
}
