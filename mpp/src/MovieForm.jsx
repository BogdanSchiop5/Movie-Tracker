import React, { useState, useEffect } from 'react';

const MovieForm = ({ addMovie, editMovie, editingMovie }) => {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [genre, setGenre] = useState('');
    const [rating, setRating] = useState('');
    const [review, setReview] = useState('');
    const [image, setImage] = useState('');
    const [errors, setErrors] = useState({});

    // Pre-fill form when editing
    useEffect(() => {
        if (editingMovie) {
            setTitle(editingMovie.title);
            setYear(editingMovie.year.toString());
            setGenre(editingMovie.genre);
            setRating(editingMovie.rating.toString());
            setReview(editingMovie.review);
            setImage(editingMovie.image);
        }
    }, [editingMovie]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!year || isNaN(year)) newErrors.year = 'Valid year is required';
        if (!genre) newErrors.genre = 'Genre is required';
        if (!rating || rating < 1 || rating > 10) newErrors.rating = 'Rating must be between 1-10';
        if (image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(image)) {
            newErrors.image = 'Please enter a valid image URL';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const movieData = {
            title: title.trim(),
            year: parseInt(year),
            genre,
            rating: parseInt(rating),
            review: review.trim(),
            image: image.trim() || 'https://via.placeholder.com/150'
        };

        if (editingMovie) {
            editMovie({ ...movieData, id: editingMovie.id });
        } else {
            addMovie(movieData);
        }

        // Reset form
        setTitle('');
        setYear('');
        setGenre('');
        setRating('');
        setReview('');
        setImage('');
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} data-testid="movie-form">
            <div>
                <label>Title:</label>
                <input
                    data-testid="title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                {errors.title && <span className="error">{errors.title}</span>}
            </div>

            <div>
                <label>Year:</label>
                <input
                    data-testid="year-input"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                />
                {errors.year && <span className="error">{errors.year}</span>}
            </div>

            <div>
                <label>Genre:</label>
                <select
                    data-testid="genre-input"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    required
                >
                    <option value="">Select Genre</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Horror">Horror</option>
                    <option value="Romance">Romance</option>
                    <option value="Fantasy">Fantasy</option>
                </select>
                {errors.genre && <span className="error">{errors.genre}</span>}
            </div>

            <div>
                <label>Rating (1-10):</label>
                <input
                    data-testid="rating-input"
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    min="1"
                    max="10"
                    required
                />
                {errors.rating && <span className="error">{errors.rating}</span>}
            </div>

            <div>
                <label>Review:</label>
                <textarea
                    data-testid="review-input"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />
            </div>

            <div>
                <label>Image URL:</label>
                <input
                    data-testid="image-input"
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />
                {errors.image && <span className="error">{errors.image}</span>}
            </div>

            <button type="submit" data-testid="submit-button">
                {editingMovie ? 'Update Movie' : 'Add Movie'}
            </button>
        </form>
    );
};

export default MovieForm;