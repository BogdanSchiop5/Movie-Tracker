const request = require('supertest');
const app = require('../server');

describe('Movies API', () => {
    let testMovieId;

    test('GET /movies should return all movies', async () => {
        const response = await request(app).get('/movies');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /movies/:id should return a specific movie', async () => {
        const response = await request(app).get('/movies/1');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('year');
    });

    test('GET /movies/:id should return 404 for non-existent movie', async () => {
        const response = await request(app).get('/movies/999');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Movie not found');
    });

    test('POST /movies should create a new movie', async () => {
        const newMovie = {
            title: 'Test Movie',
            year: 2024,
            genre: 'Test',
            rating: 8,
            review: 'Test review',
            image: 'https://test.com/image.jpg'
        };

        const response = await request(app)
            .post('/movies')
            .send(newMovie);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newMovie.title);
        testMovieId = response.body.id;
    });

    test('PUT /movies/:id should update an existing movie', async () => {
        const updatedMovie = {
            title: 'Updated Test Movie',
            rating: 9
        };

        const response = await request(app)
            .put(`/movies/${testMovieId}`)
            .send(updatedMovie);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updatedMovie.title);
        expect(response.body.rating).toBe(updatedMovie.rating);
    });

    test('DELETE /movies/:id should delete a movie', async () => {
        const response = await request(app).delete(`/movies/${testMovieId}`);
        expect(response.status).toBe(204);

        // Verify the movie is deleted
        const getResponse = await request(app).get(`/movies/${testMovieId}`);
        expect(getResponse.status).toBe(404);
    });
}); 