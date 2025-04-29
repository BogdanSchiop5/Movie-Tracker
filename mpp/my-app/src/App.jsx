import { useState, useEffect } from 'react'
import './App.css'

const API_URL = window.location.hostname === 'localhost' 
  ? import.meta.env.VITE_API_URL 
  : import.meta.env.VITE_API_URL_PROD;

console.log('Current API_URL:', API_URL);
console.log('Environment:', import.meta.env.MODE);

function App() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const url = `${API_URL}/movies`;
        console.log('Attempting to fetch from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }).catch(err => {
          if (err.message.includes('Failed to fetch') || err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
            throw new Error('Request blocked by browser extension. Please disable ad blocker for this site.');
          }
          throw err;
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully received data:', data);
        setMovies(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchMovies();
  }, [])

  if (loading) {
    return <div className="app">Loading movies...</div>
  }

  if (error) {
    return (
      <div className="app">
        <h2>Error Loading Movies</h2>
        <p>{error}</p>
        <p>If you're using an ad blocker or privacy extension, please try:</p>
        <ol>
          <li>Disabling it for this site</li>
          <li>Refreshing the page</li>
        </ol>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Movie Collection</h1>
      <div className="movie-grid">
        {movies.map(movie => (
          <div key={movie.id} className="movie-card">
            <img src={movie.image} alt={movie.title} />
            <h3>{movie.title}</h3>
            <p>{movie.year} • {movie.genre}</p>
            <p>Rating: {movie.rating}/10</p>
            <p>{movie.review}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
