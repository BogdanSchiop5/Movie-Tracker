import React, { useState, useEffect } from 'react';
import MovieForm from './MovieForm';
import MovieList from './MovieList';
import InfiniteMovieView from './InfiniteMovieView';
import './App.css';

// Use import.meta.env instead of process.env for Vite
const API_HOST = import.meta.env.VITE_API_HOST || 'localhost';
const API_URL = `http://${API_HOST}:3000/movies`;
const OFFLINE_STORAGE_KEY = 'offline_movies';

const checkServerStatus = async () => {
    try {
        const response = await fetch(API_URL);
        return response.ok;
    } catch {
        return false;
    }
};

export const getMovies = async () => {
    try {
        if (isOnline) {
            const response = await fetch(API_URL);
            const data = await response.json();
            localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
            return data;
        }
    } catch (error) {
        console.error('Fetch failed, trying offline data:', error.message);
    }

    // Always try to return offline data as fallback
    const offlineData = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return offlineData ? JSON.parse(offlineData) : [];
};


export const createMovie = async (movie) => {
    const tempId = `offline-${Date.now()}`;
    const offlineMovie = { ...movie, id: tempId, _isOffline: true };

    if (navigator.onLine) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movie)
            });
            const createdMovie = await response.json();

            // Update cache
            const currentMovies = await getMovies();
            localStorage.setItem(OFFLINE_STORAGE_KEY,
                JSON.stringify([createdMovie, ...currentMovies]));

            return createdMovie;
        } catch (error) {
            console.error('Create failed, queuing operation:', error);
        }
    }

    // Offline handling
    const currentMovies = await getMovies();
    localStorage.setItem(OFFLINE_STORAGE_KEY,
        JSON.stringify([offlineMovie, ...currentMovies]));

    // Queue operation
    const pendingOps = JSON.parse(localStorage.getItem(PENDING_OPS_KEY) || []);
    pendingOps.push({
        type: 'CREATE',
        data: movie,
        tempId,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOps));

    return offlineMovie;
};

export const updateMovie = async (id, movie) => {
    if (navigator.onLine) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movie)
            });
            const updatedMovie = await response.json();

            // Update cache
            const currentMovies = await getMovies();
            const updatedMovies = currentMovies.map(m =>
                m.id === id ? updatedMovie : m
            );
            localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedMovies));

            return updatedMovie;
        } catch (error) {
            console.error('Update failed, queuing operation:', error);
        }
    }

    // Offline handling
    const currentMovies = await getMovies();
    const updatedMovies = currentMovies.map(m =>
        m.id === id ? { ...movie, _isOffline: true } : m
    );
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedMovies));

    // Queue operation
    const pendingOps = JSON.parse(localStorage.getItem(PENDING_OPS_KEY)) || [];
    pendingOps.push({
        type: 'UPDATE',
        id,
        data: movie,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOps));

    return { ...movie, _isOffline: true };
};

export const deleteMovie = async (id) => {
    if (navigator.onLine) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

            // Update cache
            const currentMovies = await getMovies();
            const updatedMovies = currentMovies.filter(m => m.id !== id);
            localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedMovies));

            return { id };
        } catch (error) {
            console.error('Delete failed, queuing operation:', error);
        }
    }

    // Offline handling
    const currentMovies = await getMovies();
    const updatedMovies = currentMovies.filter(m => m.id !== id);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedMovies));

    // Queue operation
    const pendingOps = JSON.parse(localStorage.getItem(PENDING_OPS_KEY)) || [];
    pendingOps.push({
        type: 'DELETE',
        id,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOps));

    return { id, _isOffline: true };
};

const PENDING_OPS_KEY = 'pending_operations';

const syncOfflineOperations = async () => {
    const pendingOps = JSON.parse(localStorage.getItem(PENDING_OPS_KEY)) || [];

    for (const op of pendingOps) {
        try {
            if (op.type === 'CREATE') {
                await createMovie(op.data);
            } else if (op.type === 'UPDATE') {
                await updateMovie(op.id, op.data);
            } else if (op.type === 'DELETE') {
                await deleteMovie(op.id);
            }
        } catch (error) {
            console.error(`Failed to sync operation ${op.type}:`, error);
        }
    }

    // Clear the queue
    localStorage.removeItem(PENDING_OPS_KEY);
};


const App = () => {
    // State management
    const [movies, setMovies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterGenre, setFilterGenre] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [moviesPerPage, setMoviesPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showInfiniteView, setShowInfiniteView] = useState(false);


    // Fetch movies on component mount
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true); // Start loading

            try {
                const res = await fetch('http://localhost:3000/movies');
                if (!res.ok) throw new Error('Server not responding');

                const data = await res.json();
                setMovies(data);
                localStorage.setItem('movies', JSON.stringify(data));
                setIsOffline(false);
            } catch (err) {
                console.warn('Server unreachable, loading from localStorage:', err.message);

                const storedMovies = localStorage.getItem('movies');
                if (storedMovies) {
                    setMovies(JSON.parse(storedMovies));
                } else {
                    setMovies([]);
                }
                setIsOffline(true);
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchMovies();
    }, []);

    // Check server status periodically
    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkServerStatus();
            setIsOnline(status);
        };

        // Check immediately
        checkStatus();

        // Then check every 5 seconds
        const interval = setInterval(checkStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    // Filter and sort logic
    const filteredBySearch = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredByGenre = filterGenre === 'all'
        ? filteredBySearch
        : filteredBySearch.filter(movie => movie.genre === filterGenre);

    const sortedMovies = [...filteredByGenre].sort((a, b) => {
        if (sortBy === 'title') {
            return sortOrder === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        } else if (sortBy === 'year') {
            return sortOrder === 'asc'
                ? a.year - b.year
                : b.year - a.year;
        } else if (sortBy === 'rating') {
            return sortOrder === 'asc'
                ? a.rating - b.rating
                : b.rating - a.rating;
        }
        return 0;
    });

    // Pagination logic
    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = sortedMovies.slice(indexOfFirstMovie, indexOfLastMovie);
    const totalPages = Math.ceil(sortedMovies.length / moviesPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Add movie
    const addMovie = async (movie) => {
        try {
            const newMovie = await createMovie(movie);
            setMovies(prev => [newMovie, ...prev]);
            setShowForm(false);
            setCurrentPage(1);

            if (newMovie.isOffline) {
                setError('Movie added locally - will sync when online');
            } else {
                setError(null);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Edit movie
    const editMovie = async (updatedMovie) => {
        try {
            const updated = await updateMovie(updatedMovie.id, updatedMovie);
            setMovies(prevMovies =>
                prevMovies.map(movie =>
                    movie.id === updated.id ? updated : movie
                )
            );
            setEditingMovie(null);
            setShowForm(false);
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete movie
    const deleteMovie = async (id) => {
        try {
            await deleteMovieAPI(id);
            setMovies(prevMovies => {
                const newMovies = prevMovies.filter(movie => movie.id !== id);
                if (currentMovies.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                return newMovies;
            });
        } catch (err) {
            setError(err.message);
        }
    };

    // Get unique genres
    const genres = ['all', ...new Set(movies.map(movie => movie.genre))];

    const toggleInfiniteView = () => {
        setShowInfiniteView(!showInfiniteView);
    };

    if (loading) return <div>Loading movies...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="App" data-testid="app-container">
            <h1 data-testid="app-title">Movie Tracker</h1>

            <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                {navigator.onLine
                    ? isOnline
                        ? '🟢 Online'
                        : '🟡 Server Offline'
                    : '🛜 No Network'}
            </div>

            {/* Search and filter controls */}
            <div className="controls" data-testid="controls-container">
                <input
                    data-testid="search-input"
                    type="text"
                    placeholder="Search movies by title..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="search-bar"
                />

                <select
                    data-testid="genre-filter"
                    value={filterGenre}
                    onChange={(e) => {
                        setFilterGenre(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="filter-dropdown"
                >
                    {genres.map(genre => (
                        <option
                            key={genre}
                            value={genre}
                            data-testid={`genre-option-${genre}`}
                        >
                            {genre === 'all' ? 'All Genres' : genre}
                        </option>
                    ))}
                </select>

                <div className="sort-container" data-testid="sort-container">
                    <select
                        data-testid="sort-by"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="sort-dropdown"
                    >
                        <option value="title" data-testid="sort-option-title">Sort by Title</option>
                        <option value="year" data-testid="sort-option-year">Sort by Year</option>
                        <option value="rating" data-testid="sort-option-rating">Sort by Rating</option>
                    </select>

                    <select
                        data-testid="sort-order"
                        value={sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="sort-order-dropdown"
                    >
                        <option value="asc" data-testid="order-option-asc">Ascending</option>
                        <option value="desc" data-testid="order-option-desc">Descending</option>
                    </select>
                </div>
            </div>

            {/* Buttons container */}
            <div className="button-container">
                <button
                    data-testid="add-movie-button"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingMovie(null);
                    }}
                    className="action-button add-movie-button"
                >
                    {showForm ? 'Close Form' : 'Add Movie'}
                </button>

                {/* New button for infinite scroll view */}
                <button
                    data-testid="infinite-scroll-button"
                    onClick={toggleInfiniteView}
                    className="action-button infinite-scroll-button"
                >
                    View as Infinite Scroll
                </button>
            </div>

            {/* Movie Form */}
            {showForm && (
                <div data-testid="movie-form-container">
                    <MovieForm
                        addMovie={addMovie}
                        editMovie={editMovie}
                        editingMovie={editingMovie}
                    />
                </div>
            )}

            {/* Movie List */}
            <div data-testid="movie-list-container">
                <MovieList
                    movies={currentMovies}
                    onEdit={(movie) => {
                        setEditingMovie(movie);
                        setShowForm(true);
                    }}
                    onDelete={deleteMovie}
                />
            </div>

            {/* Pagination controls */}
            {sortedMovies.length > 0 && (
                <div className="pagination" data-testid="pagination-container">
                    <button
                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                        data-testid="prev-page"
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={currentPage === number ? 'active' : ''}
                            data-testid={`page-button-${number}`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                        data-testid="next-page"
                    >
                        Next
                    </button>

                    <select
                        value={moviesPerPage}
                        onChange={(e) => {
                            setMoviesPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="movies-per-page"
                        data-testid="movies-per-page"
                    >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="15">15 per page</option>
                        <option value="20">20 per page</option>
                    </select>
                </div>
            )}

            {/* Page info */}
            <div className="page-info" data-testid="page-info">
                {sortedMovies.length > 0 ? (
                    `Showing ${indexOfFirstMovie + 1}-${Math.min(indexOfLastMovie, sortedMovies.length)} of ${sortedMovies.length} movies`
                ) : (
                    'No movies found'
                )}
            </div>

            {/* Infinite Scroll Modal */}
            {showInfiniteView && (
                <>
                    <div className="infinite-overlay" onClick={toggleInfiniteView}></div>
                    <InfiniteMovieView
                        movies={movies}
                        searchTerm={searchTerm}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        filterGenre={filterGenre}
                        onClose={toggleInfiniteView}
                        onEdit={(movie) => {
                            setEditingMovie(movie);
                            setShowForm(true);
                            setShowInfiniteView(false);
                        }}
                        onDelete={(id) => {
                            deleteMovie(id);
                            // Keep the infinite view open after delete
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default App;