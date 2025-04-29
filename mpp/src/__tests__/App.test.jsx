import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import '@testing-library/jest-dom';

describe('Movie Tracker App', () => {
    beforeEach(() => {
        render(<App />);
    });

    // Basic UI Tests
    describe('Basic UI Elements', () => {
        test('renders app title', () => {
            expect(screen.getByTestId('app-title')).toBeInTheDocument();
        });

        test('renders initial movie list', () => {
            expect(screen.getByTestId('movie-list')).toBeInTheDocument();
        });

        test('renders all required controls', () => {
            expect(screen.getByTestId('search-input')).toBeInTheDocument();
            expect(screen.getByTestId('genre-filter')).toBeInTheDocument();
            expect(screen.getByTestId('sort-by')).toBeInTheDocument();
            expect(screen.getByTestId('sort-order')).toBeInTheDocument();
            expect(screen.getByTestId('add-movie-button')).toBeInTheDocument();
        });
    });

    // Movie Form Tests
    describe('Movie Form', () => {
        test('opens form correctly', () => {
            const addButton = screen.getByTestId('add-movie-button');
            fireEvent.click(addButton);
            expect(screen.getByTestId('movie-form')).toBeInTheDocument();
        });

        test('validates required fields', async () => {
            fireEvent.click(screen.getByTestId('add-movie-button'));
            fireEvent.click(screen.getByTestId('submit-button'));
            await waitFor(() => {
                expect(screen.getByTestId('title-input')).toBeInTheDocument();
            });
        });

        test('adds a new movie successfully', async () => {
            fireEvent.click(screen.getByTestId('add-movie-button'));
            await waitFor(() => {
                expect(screen.getByTestId('movie-form')).toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test Movie' } });
            fireEvent.change(screen.getByTestId('year-input'), { target: { value: '2024' } });
            fireEvent.change(screen.getByTestId('genre-input'), { target: { value: 'Action' } });
            fireEvent.change(screen.getByTestId('rating-input'), { target: { value: '8' } });
            fireEvent.change(screen.getByTestId('review-input'), { target: { value: 'Great movie!' } });

            fireEvent.click(screen.getByTestId('submit-button'));
        });

        test('edits a movie successfully', async () => {
            const editButtons = screen.getAllByTestId(/^edit-button-/);
            fireEvent.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('movie-form')).toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('title-input'), {
                target: { value: 'Updated Movie Title' }
            });

            fireEvent.click(screen.getByTestId('submit-button'));
        });

        test('deletes a movie successfully', async () => {
            const deleteButtons = screen.getAllByTestId(/^delete-button-/);
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('movie-list')).toBeInTheDocument();
            });
        });
    });

    // Filtering and Sorting
    describe('Filtering and Sorting', () => {
        test('filters movies by genre', async () => {
            fireEvent.change(screen.getByTestId('genre-filter'), {
                target: { value: 'Action' }
            });

            await waitFor(() => {
                expect(screen.getByTestId('movie-list')).toBeInTheDocument();
            });
        });

        test('searches movies by title', async () => {
            fireEvent.change(screen.getByTestId('search-input'), {
                target: { value: 'Dark Knight' }
            });

            await waitFor(() => {
                expect(screen.getByTestId('movie-list')).toBeInTheDocument();
            });
        });

        test('sorts movies by title', async () => {
            fireEvent.change(screen.getByTestId('sort-by'), { target: { value: 'title' } });
            fireEvent.change(screen.getByTestId('sort-order'), { target: { value: 'asc' } });

            await waitFor(() => {
                expect(screen.getByTestId('movie-list')).toBeInTheDocument();
            });
        });
    });
});