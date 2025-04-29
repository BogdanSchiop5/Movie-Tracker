import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_URL}/movies`)
        if (!response.ok) {
          throw new Error('Failed to fetch movies')
        }
        const data = await response.json()
        setMovies(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
        console.error('Error fetching movies:', err)
      }
    }

    fetchMovies()
  }, [])

  if (loading) {
    return <div className="app">Loading movies...</div>
  }

  if (error) {
    return <div className="app">Error: {error}</div>
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
