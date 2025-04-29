// InfiniteMovieView.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './InfiniteMovieView.css';

const InfiniteMovieView = ({
                               movies,
                               searchTerm = '',
                               sortBy = 'title',
                               sortOrder = 'asc',
                               filterGenre = 'all',
                               onClose,
                               onEdit,
                               onDelete
                           }) => {
    // Infinite scrolling state
    const [displayedMovies, setDisplayedMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageSize] = useState(10);
    const observer = useRef();
    const processedMoviesRef = useRef([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Process movies (filter and sort) when props change
    useEffect(() => {
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

        // Store processed movies and reset displayed ones
        processedMoviesRef.current = sortedMovies;
        setCurrentIndex(0);
        setDisplayedMovies(sortedMovies.slice(0, pageSize));
    }, [movies, searchTerm, filterGenre, sortBy, sortOrder, pageSize]);

    // Load more function for infinite scrolling
    const loadMoreMovies = useCallback(() => {
        if (loading || !processedMoviesRef.current.length) return;

        setLoading(true);

        // Simulate network delay
        setTimeout(() => {
            const allMovies = processedMoviesRef.current;
            const nextIndex = (currentIndex + pageSize) % allMovies.length;
            let nextMovies;

            if (nextIndex < currentIndex) {
                // We're wrapping around to the start
                nextMovies = allMovies.slice(0, nextIndex + pageSize);
            } else {
                nextMovies = allMovies.slice(nextIndex, nextIndex + pageSize);
            }

            setCurrentIndex(nextIndex);
            setDisplayedMovies(prev => [...prev, ...nextMovies]);
            setLoading(false);
        }, 300);
    }, [currentIndex, loading, pageSize]);

    // Set up intersection observer for infinite scrolling
    const lastMovieRef = useCallback(node => {
        if (loading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMoreMovies();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, loadMoreMovies]);

    return (
        <div className="infinite-scroll-window">
            <div className="infinite-header">
                <h2>Movie Library - Infinite Scroll</h2>
                <button className="close-button" onClick={onClose}>×</button>
            </div>

            <div className="infinite-scroll-stats">
                Showing {displayedMovies.length} movies out of {processedMoviesRef.current.length} (scrolling infinitely)
            </div>

            <div className="infinite-movie-list">
                {displayedMovies.map((movie, index) => {
                    // Apply ref to the last element for infinite scrolling
                    const isLastElement = index === displayedMovies.length - 1;

                    return (
                        <div
                            className={`infinite-movie-card ${movie._isOffline ? 'offline' : ''}`}
                            key={`${movie.id}-${Math.floor(index / processedMoviesRef.current.length)}-${index % processedMoviesRef.current.length}`}
                            ref={isLastElement ? lastMovieRef : null}
                        >
                            <div className="infinite-movie-content">
                                <h3 className="infinite-movie-title">
                                    {movie.title}
                                    {movie._isOffline && <span className="infinite-offline-badge">Offline</span>}
                                </h3>
                                <div className="infinite-movie-details">
                                    <p className="infinite-movie-year">Year: {movie.year}</p>
                                    <p className="infinite-movie-genre">Genre: {movie.genre}</p>
                                    <p className="infinite-movie-rating">Rating: {movie.rating} / 10</p>
                                </div>
                            </div>
                            <div className="infinite-movie-actions">
                                <button
                                    onClick={() => onEdit(movie)}
                                    className="infinite-edit-button"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(movie.id)}
                                    className="infinite-delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}

                {loading && <div className="infinite-loading">Loading more movies...</div>}
            </div>
        </div>
    );
};

export default InfiniteMovieView;