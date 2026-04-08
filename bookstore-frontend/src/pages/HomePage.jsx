import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Bookstore</h1>
      <p>Welcome to the bookstore app. Use the links below to sign in or create an account.</p>
      <nav>
        <Link to="/login" style={{ marginRight: '1rem' }}>
          Login
        </Link>
        <Link to="/signup">Sign Up</Link>
      </nav>
    </main>
  );
}
