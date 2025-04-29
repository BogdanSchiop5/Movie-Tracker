// src/MovieList.jsx
import React from 'react';

const MovieList = ({ movies, onEdit, onDelete, lastMovieElementRef }) => {
    return (
        <div className="movie-grid" data-testid="movie-list">
            {movies.map((movie, index) => {
                const isLastMovie = index === movies.length - 1;
                return (
                    <div
                        key={movie.id}
                        className="movie-card"
                        ref={isLastMovie ? lastMovieElementRef : null}
                        data-testid={`movie-card-${movie.id}`}
                    >
                        <img
                            src={movie.image}
                            alt={movie.title}
                            className="movie-image"
                            data-testid={`movie-image-${movie.id}`}
                        />
                        <div className="movie-details">
                            <h3 data-testid={`movie-title-${movie.id}`}>{movie.title}</h3>
                            <p data-testid={`movie-year-${movie.id}`}>Year: {movie.year}</p>
                            <p data-testid={`movie-genre-${movie.id}`}>Genre: {movie.genre}</p>
                            <p data-testid={`movie-rating-${movie.id}`}>Rating: {movie.rating}/10</p>
                            <p data-testid={`movie-review-${movie.id}`}>{movie.review}</p>
                        </div>
                        <div className="movie-actions">
                            <button
                                onClick={() => onEdit(movie)}
                                data-testid={`edit-button-${movie.id}`}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(movie.id)}
                                data-testid={`delete-button-${movie.id}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MovieList;