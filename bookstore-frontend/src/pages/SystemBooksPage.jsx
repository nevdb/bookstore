import React from 'react';
import { BooksProvider } from '../context/BooksContext';
import BookBrowser from '../components/Books/BookBrowser';

const SystemBooksPage = () => {
  return (
    <BooksProvider>
      <BookBrowser />
    </BooksProvider>
  );
};

export default SystemBooksPage;
