import { useContext } from 'react';
import { BooksContext } from '../context/BooksContext';

export const useBooks = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within BooksProvider');
  }
  return context;
};
