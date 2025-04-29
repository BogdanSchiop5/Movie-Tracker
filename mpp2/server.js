const express = require('express');
const cors = require('cors');
const os = require('os');
const app = express();

// Configure CORS to accept requests from any origin
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Add CSP headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:; connect-src 'self' *; img-src 'self' * data:;"
    );
    next();
});

app.use(express.json());

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content response for favicon
});

// Add a root route
app.get('/', (req, res) => {
    res.json({ message: 'Movie API is running' });
});

// Validation helper function
const validateMovie = (movie) => {
    const errors = [];
    
    // Required fields
    if (!movie.title) errors.push('Title is required');
    if (!movie.year) errors.push('Year is required');
    if (!movie.genre) errors.push('Genre is required');
    if (!movie.rating) errors.push('Rating is required');
    if (!movie.review) errors.push('Review is required');
    if (!movie.image) errors.push('Image URL is required');

    // Data type and format validation
    if (movie.year && (isNaN(movie.year) || movie.year < 1888 || movie.year > new Date().getFullYear())) {
        errors.push('Invalid year');
    }
    if (movie.rating && (isNaN(movie.rating) || movie.rating < 1 || movie.rating > 10)) {
        errors.push('Rating must be between 1 and 10');
    }
    if (movie.image && !movie.image.startsWith('http')) {
        errors.push('Image must be a valid URL');
    }

    return errors;
};

let movies = [
    {
        id: 1,
        title: 'Inception',
        year: 2010,
        genre: 'Sci-Fi',
        rating: 9,
        review: 'A mind-bending thriller about dreams within dreams.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg'
    },
    {
        id: 2,
        title: 'The Dark Knight',
        year: 2008,
        genre: 'Action',
        rating: 10,
        review: 'A gripping tale of chaos and heroism.',
        image: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'
    },
    {
        id: 3,
        title: 'Interstellar',
        year: 2014,
        genre: 'Sci-Fi',
        rating: 8,
        review: 'A visually stunning journey through space and time.',
        image: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        id: 4,
        title: 'The Matrix',
        year: 1999,
        genre: 'Sci-Fi',
        rating: 9,
        review: 'A revolutionary sci-fi action movie.',
        image: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    },
    {
        id: 5,
        title: 'Gladiator',
        year: 2000,
        genre: 'Drama',
        rating: 9,
        review: 'An epic tale of revenge and honor.',
        image: 'https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    },
    {
        id: 6,
        title: 'Titanic',
        year: 1997,
        genre: 'Romance',
        rating: 8,
        review: 'A timeless love story on the ill-fated ship.',
        image: 'https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg'
    },
    {
        id: 7,
        title: 'The Godfather',
        year: 1972,
        genre: 'Crime',
        rating: 10,
        review: 'A masterpiece of mafia drama.',
        image: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
    },
    {
        id: 8,
        title: 'Pulp Fiction',
        year: 1994,
        genre: 'Crime',
        rating: 9,
        review: 'A nonlinear masterpiece by Tarantino.',
        image: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
    },
    {
        id: 9,
        title: 'Forrest Gump',
        year: 1994,
        genre: 'Drama',
        rating: 9,
        review: 'A heartfelt journey through history.',
        image: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg'
    },
    {
        id: 10,
        title: 'Fight Club',
        year: 1999,
        genre: 'Drama',
        rating: 9,
        review: 'A psychological thriller about identity.',
        image: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg'
    },
    {
        id: 11,
        title: 'The Shawshank Redemption',
        year: 1994,
        genre: 'Drama',
        rating: 9,
        review: 'A story of hope and friendship.',
        image: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg'
    },
    {
        id: 12,
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        year: 2001,
        genre: 'Fantasy',
        rating: 9,
        review: 'An epic journey through Middle-earth.',
        image: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg'
    },
    {
        id: 13,
        title: 'The Silence of the Lambs',
        year: 1991,
        genre: 'Thriller',
        rating: 9,
        review: 'A chilling psychological horror film.',
        image: 'https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    },
    {
        id: 14,
        title: "Schindler's List",
        year: 1993,
        genre: 'Biography',
        rating: 9,
        review: 'The story of a man who saved thousands of lives.',
        image: 'https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    },
    {
        id: 15,
        title: 'The Green Mile',
        year: 1999,
        genre: 'Drama',
        rating: 9,
        review: 'A supernatural tale set on death row.',
        image: 'https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_.jpg'
    },
    {
        id: 16,
        title: 'Parasite',
        year: 2019,
        genre: 'Thriller',
        rating: 10,
        review: 'A darkly comedic masterpiece about class struggle.',
        image: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg'
    },
    {
        id: 17,
        title: 'The Social Network',
        year: 2010,
        genre: 'Biography',
        rating: 8,
        review: 'The gripping story of Facebook\'s creation.',
        image: 'https://m.media-amazon.com/images/M/MV5BOGUyZDUxZjEtMmIzMC00MzlmLTg4MGItZWJmMzBhZjE0Mjc1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        id: 18,
        title: 'Avengers: Endgame',
        year: 2019,
        genre: 'Action',
        rating: 9,
        review: 'The epic conclusion to the Infinity Saga.',
        image: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg'
    },
    {
        id: 19,
        title: 'Joker',
        year: 2019,
        genre: 'Crime',
        rating: 9,
        review: 'A chilling origin story of Batman\'s greatest foe.',
        image: 'https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg'
    },
    {
        id: 20,
        title: 'The Grand Budapest Hotel',
        year: 2014,
        genre: 'Comedy',
        rating: 8,
        review: 'A whimsical tale with Wes Anderson\'s signature style.',
        image: 'https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_.jpg'
    },
    {
        id: 21,
        title: 'La La Land',
        year: 2016,
        genre: 'Musical',
        rating: 8,
        review: 'A modern musical about dreams and love in Los Angeles.',
        image: 'https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_.jpg'
    },
    {
        id: 22,
        title: 'Black Panther',
        year: 2018,
        genre: 'Action',
        rating: 8,
        review: 'A groundbreaking superhero film with cultural significance.',
        image: 'https://m.media-amazon.com/images/M/MV5BMTg1MTY2MjYzNV5BMl5BanBnXkFtZTgwMTc4NTMwNDI@._V1_.jpg'
    },
    {
        id: 23,
        title: 'Whiplash',
        year: 2014,
        genre: 'Drama',
        rating: 9,
        review: 'An intense story about ambition and perfection in music.',
        image: 'https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        id: 24,
        title: 'Mad Max: Fury Road',
        year: 2015,
        genre: 'Action',
        rating: 9,
        review: 'A high-octane masterpiece of practical effects and stunts.',
        image: 'https://m.media-amazon.com/images/M/MV5BN2EwM2I5OWMtMGQyMi00Zjg1LWJkNTctZTdjYTA4OGUwZjMyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        id: 25,
        title: 'The Revenant',
        year: 2015,
        genre: 'Adventure',
        rating: 8,
        review: 'A brutal survival story with breathtaking cinematography.',
        image: 'https://m.media-amazon.com/images/M/MV5BMDE5OWMzM2QtOTU2ZS00NzAyLWI2MDEtOTRlYjIxZGM0OWRjXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg'
    },
    {
        id: 26,
        title: 'Birdman',
        year: 2014,
        genre: 'Comedy',
        rating: 8,
        review: 'A technical marvel presented as one continuous shot.',
        image: 'https://m.media-amazon.com/images/M/MV5BODAzNDMxMzAxOV5BMl5BanBnXkFtZTgwMDMxMjA4MjE@._V1_.jpg'
    },
    {
        id: 27,
        title: 'Gravity',
        year: 2013,
        genre: 'Sci-Fi',
        rating: 8,
        review: 'A tense survival story set in space with stunning visuals.',
        image: 'https://m.media-amazon.com/images/M/MV5BNjE5MzYwMzYxMF5BMl5BanBnXkFtZTcwOTk4MTk0OQ@@._V1_.jpg'
    },
    {
        id: 28,
        title: 'Django Unchained',
        year: 2012,
        genre: 'Western',
        rating: 9,
        review: 'Tarantino\'s take on the spaghetti western genre.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjIyNTQ5NjQ1OV5BMl5BanBnXkFtZTcwODg1MDU4OA@@._V1_.jpg'
    },
    {
        id: 29,
        title: 'The Wolf of Wall Street',
        year: 2013,
        genre: 'Biography',
        rating: 9,
        review: 'A wild ride through excess and corruption in finance.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg'
    },
    {
        id: 30,
        title: 'Her',
        year: 2013,
        genre: 'Romance',
        rating: 8,
        review: 'A poignant love story between a man and an AI system.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjA1Nzk0OTM2OF5BMl5BanBnXkFtZTgwNjU2NjEwMDE@._V1_.jpg'
    },
    {
        id: 31,
        title: '12 Years a Slave',
        year: 2013,
        genre: 'Biography',
        rating: 9,
        review: 'A harrowing true story of slavery in America.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjExMTEzODkyN15BMl5BanBnXkFtZTcwNTU4NTc4OQ@@._V1_.jpg'
    },
    {
        id: 32,
        title: 'The Artist',
        year: 2011,
        genre: 'Comedy',
        rating: 8,
        review: 'A charming silent film about the transition to talkies.',
        image: 'https://m.media-amazon.com/images/M/MV5BMzk0NzQxMTM0OV5BMl5BanBnXkFtZTcwMzU4MDYyNQ@@._V1_.jpg'
    },
    {
        id: 33,
        title: 'Drive',
        year: 2011,
        genre: 'Crime',
        rating: 8,
        review: 'A stylish neo-noir with an incredible soundtrack.',
        image: 'https://m.media-amazon.com/images/M/MV5BZjY5ZjQyMjMtMmEwOC00Nzc2LTllYTItMmU2MzJjNTg1NjY0XkEyXkFqcGdeQXVyNjQ1MTMzMDQ@._V1_.jpg'
    },
    {
        id: 34,
        title: 'The King\'s Speech',
        year: 2010,
        genre: 'Biography',
        rating: 8,
        review: 'The inspiring story of King George VI overcoming his stammer.',
        image: 'https://m.media-amazon.com/images/M/MV5BMzU5MjEwMTg2Nl5BMl5BanBnXkFtZTcwNzM3MTYxNA@@._V1_.jpg'
    },
    {
        id: 35,
        title: 'Inglourious Basterds',
        year: 2009,
        genre: 'War',
        rating: 9,
        review: 'Tarantino\'s alternate history WWII revenge fantasy.',
        image: 'https://m.media-amazon.com/images/M/MV5BOTJiNDEzOWYtMTVjOC00ZjlmLWE0NGMtZmE1OWVmZDQ2OWJhXkEyXkFqcGdeQXVyNTIzOTk5ODM@._V1_.jpg'
    },
    {
        id: 36,
        title: 'Slumdog Millionaire',
        year: 2008,
        genre: 'Drama',
        rating: 8,
        review: 'A rags-to-riches story set in Mumbai.',
        image: 'https://m.media-amazon.com/images/M/MV5BZjUxOWY3YzctMjFhYS00Yzg0LTljMjUtYzRhYzA0YzVlYjllXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg'
    },
    {
        id: 37,
        title: 'No Country for Old Men',
        year: 2007,
        genre: 'Crime',
        rating: 9,
        review: 'A tense cat-and-mouse thriller with an unforgettable villain.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjA5Njk3MjM4OV5BMl5BanBnXkFtZTcwMTc5MTE1MQ@@._V1_.jpg'
    },
    {
        id: 38,
        title: 'There Will Be Blood',
        year: 2007,
        genre: 'Drama',
        rating: 9,
        review: 'A powerful story of greed and oil in early 20th century America.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjAxODQ4MDU5NV5BMl5BanBnXkFtZTcwMDU4MjU1MQ@@._V1_.jpg'
    },
    {
        id: 39,
        title: 'The Departed',
        year: 2006,
        genre: 'Crime',
        rating: 9,
        review: 'A gripping tale of moles in the Boston police and Irish mob.',
        image: 'https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3._V1_.jpg'
    },
    {
        id: 40,
        title: 'Pan\'s Labyrinth',
        year: 2006,
        genre: 'Fantasy',
        rating: 9,
        review: 'A dark fairy tale set in post-Civil War Spain.',
        image: 'https://m.media-amazon.com/images/M/MV5BMTU3ODg2NjQ5NF5BMl5BanBnXkFtZTcwMDEwODgzMQ@@._V1_.jpg'
    },
    {
        id: 41,
        title: 'Eternal Sunshine of the Spotless Mind',
        year: 2004,
        genre: 'Romance',
        rating: 9,
        review: 'A creative and emotional exploration of love and memory.',
        image: 'https://m.media-amazon.com/images/M/MV5BMTY4NzcwODg3Nl5BMl5BanBnXkFtZTcwNTEwOTMyMw@@._V1_.jpg'
    },
    {
        id: 42,
        title: 'The Lord of the Rings: The Return of the King',
        year: 2003,
        genre: 'Fantasy',
        rating: 10,
        review: 'The epic conclusion to the Lord of the Rings trilogy.',
        image: 'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
    },
    {
        id: 43,
        title: 'City of God',
        year: 2002,
        genre: 'Crime',
        rating: 9,
        review: 'A brutal and beautiful look at life in Rio\'s favelas.',
        image: 'https://m.media-amazon.com/images/M/MV5BMGU5OWEwZDItNmNkMC00NzZmLTk1YTctNzVhZTJjM2NlZTVmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        id: 44,
        title: 'Spirited Away',
        year: 2001,
        genre: 'Animation',
        rating: 9,
        review: 'Miyazaki\'s masterpiece of fantasy and coming-of-age.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        id: 45,
        title: 'Memento',
        year: 2000,
        genre: 'Mystery',
        rating: 9,
        review: 'A brilliant reverse-chronological narrative about memory.',
        image: 'https://m.media-amazon.com/images/M/MV5BZTcyNjk1MjgtOWI3Mi00YzQwLWI5MTktMzY4ZmI2NDAyNzYzXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    },
    {
        id: 46,
        title: 'American Beauty',
        year: 1999,
        genre: 'Drama',
        rating: 9,
        review: 'A satirical look at suburban life and midlife crisis.',
        image: 'https://m.media-amazon.com/images/M/MV5BNTBmZWJkNjctNDhiNC00MGE2LWEwOTctZTk5OGVhMWMyNmVhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        id: 47,
        title: 'The Truman Show',
        year: 1998,
        genre: 'Comedy',
        rating: 9,
        review: 'A prescient satire of reality TV and media manipulation.',
        image: 'https://m.media-amazon.com/images/M/MV5BMDIzODcyY2EtMmY2MC00ZWVlLTgwMzAtMjQwOWUyNmJjNTYyXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg'
    },
    {
        id: 48,
        title: 'Good Will Hunting',
        year: 1997,
        genre: 'Drama',
        rating: 9,
        review: 'A moving story about a genius janitor and his therapist.',
        image: 'https://m.media-amazon.com/images/M/MV5BOTI0MzExMTkyNV5BMl5BanBnXkFtZTcwNTMwOTIzMQ@@._V1_.jpg'
    },
    {
        id: 49,
        title: 'Fargo',
        year: 1996,
        genre: 'Crime',
        rating: 9,
        review: 'A darkly comic crime story from the Coen brothers.',
        image: 'https://m.media-amazon.com/images/M/MV5BNDJiZDgyZjctYmRjMS00ZjdkLTkwMTEtNGU1NDg3NDQ0Yzk1XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
    },
    {
        id: 50,
        title: 'The Usual Suspects',
        year: 1995,
        genre: 'Crime',
        rating: 9,
        review: 'A twisty crime thriller with an unforgettable ending.',
        image: 'https://m.media-amazon.com/images/M/MV5BYTViNjMyNmUtNDFkNC00ZDRlLThmMDUtZDU2YWE4NGI2ZjVmXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    },
    {
        id: 51,
        title: 'Jurassic Park',
        year: 1993,
        genre: 'Adventure',
        rating: 9,
        review: 'The groundbreaking dinosaur adventure that still holds up.',
        image: 'https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_.jpg'
    },
    {
        id: 52,
        title: 'Goodfellas',
        year: 1990,
        genre: 'Biography',
        rating: 9,
        review: 'Scorsese\'s epic tale of life in the mob.',
        image: 'https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
    }
];

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movie = movies.find(m => m.id === id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
});

app.post('/movies', (req, res) => {
    const errors = validateMovie(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const newMovie = {
        id: movies.length + 1,
        ...req.body
    };
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

app.put('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie not found' });
    }

    // Create merged movie object for validation
    const mergedMovie = { ...movies[movieIndex], ...req.body };
    const errors = validateMovie(mergedMovie);
    
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    movies[movieIndex] = mergedMovie;
    res.json(movies[movieIndex]);
});

app.delete('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    movies = movies.filter(m => m.id !== id);
    res.status(204).end();
});

// Update the listen configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Use your specific IP address

app.listen(PORT, HOST, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    
    console.log(`\nServer is running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${HOST}:${PORT}`);
    
    console.log('\nTo access from other devices on your network, you may need to:');
    console.log('1. Allow Node.js through Windows Firewall');
    console.log('2. Configure your antivirus to allow incoming connections to Node.js');
    console.log('3. Make sure your network profile is set to "Private" in Windows');
});

module.exports = app;