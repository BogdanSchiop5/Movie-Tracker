const getApiBaseUrl = () => {
    return `http://${window.location.hostname}:3000`;
};

const API_URL = getApiBaseUrl();

const OFFLINE_STORAGE_KEY = 'offline_movie_operations';
const HEALTH_CHECK_URL = 'http://localhost:3000/health';

// Status tracking
let isNetworkOnline = navigator.onLine;
let isServerOnline = true;

// Check server status
const checkServerStatus = async () => {
    try {
        const response = await fetch(HEALTH_CHECK_URL, {
            method: 'HEAD',
            cache: 'no-store',
            timeout: 5000
        });
        isServerOnline = response.ok;
        return response.ok;
    } catch (error) {
        isServerOnline = false;
        return false;
    }
};

// Monitor connection status
const monitorConnection = async () => {
    isNetworkOnline = navigator.onLine;
    if (isNetworkOnline) {
        isServerOnline = await checkServerStatus();
    } else {
        isServerOnline = false;
    }

    // Sync pending operations when back online
    if (isNetworkOnline && isServerOnline) {
        await syncPendingOperations();
    }

    return { isNetworkOnline, isServerOnline };
};

// Initialize connection monitoring
window.addEventListener('online', monitorConnection);
window.addEventListener('offline', monitorConnection);
setInterval(monitorConnection, 30000); // Check every 30 seconds

// Local storage operations
const getPendingOperations = () => {
    const operations = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return operations ? JSON.parse(operations) : [];
};

const addPendingOperation = (operation) => {
    const operations = getPendingOperations();
    operations.push({
        ...operation,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID()
    });
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(operations));
};

const clearPendingOperations = () => {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
};

// Sync pending operations with server
const syncPendingOperations = async () => {
    const operations = getPendingOperations();
    if (operations.length === 0) return;

    const successfulOps = [];

    for (const op of operations) {
        try {
            let response;
            switch (op.type) {
                case 'CREATE':
                    response = await originalCreateMovie(op.data);
                    break;
                case 'UPDATE':
                    response = await originalUpdateMovie(op.id, op.data);
                    break;
                case 'DELETE':
                    response = await originalDeleteMovie(op.id);
                    break;
            }
            successfulOps.push(op.id);
        } catch (error) {
            console.error('Failed to sync operation:', op, error);
        }
    }

    // Remove successful operations
    const remainingOps = operations.filter(op => !successfulOps.includes(op.id));
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(remainingOps));
};

// Original API methods (for reference)
const originalGetMovies = getMovies;
const originalGetMovie = getMovie;
const originalCreateMovie = createMovie;
const originalUpdateMovie = updateMovie;
const originalDeleteMovie = deleteMovie;

// Enhanced API methods with offline support
export const getMovies = async () => {
    if (isNetworkOnline && isServerOnline) {
        try {
            return await originalGetMovies();
        } catch (error) {
            // Fall through to offline version
        }
    }

    // Offline fallback
    const localMovies = localStorage.getItem('movies_cache');
    return localMovies ? JSON.parse(localMovies) : [];
};

export const getMovie = async (id) => {
    if (isNetworkOnline && isServerOnline) {
        try {
            return await originalGetMovie(id);
        } catch (error) {
            // Fall through to offline version
        }
    }

    // Offline fallback
    const movies = await getMovies();
    return movies.find(movie => movie.id === id);
};

export const createMovie = async (movie) => {
    if (isNetworkOnline && isServerOnline) {
        try {
            const result = await originalCreateMovie(movie);
            // Cache the updated list
            const movies = await getMovies();
            localStorage.setItem('movies_cache', JSON.stringify([...movies, result]));
            return result;
        } catch (error) {
            // Fall through to offline version
        }
    }

    // Offline handling
    const offlineId = crypto.randomUUID();
    const offlineMovie = { ...movie, id: offlineId, isOffline: true };

    // Add to local cache
    const movies = await getMovies();
    localStorage.setItem('movies_cache', JSON.stringify([...movies, offlineMovie]));

    // Queue for sync
    addPendingOperation({
        type: 'CREATE',
        data: movie,
        offlineId
    });

    return offlineMovie;
};

export const updateMovie = async (id, movie) => {
    if (isNetworkOnline && isServerOnline) {
        try {
            const result = await originalUpdateMovie(id, movie);
            // Update cache
            const movies = await getMovies();
            const updatedMovies = movies.map(m =>
                m.id === id ? { ...result, isOffline: false } : m
            );
            localStorage.setItem('movies_cache', JSON.stringify(updatedMovies));
            return result;
        } catch (error) {
            // Fall through to offline version
        }
    }

    // Offline handling
    const movies = await getMovies();
    const updatedMovies = movies.map(m =>
        m.id === id ? { ...movie, isOffline: true } : m
    );
    localStorage.setItem('movies_cache', JSON.stringify(updatedMovies));

    // Queue for sync
    addPendingOperation({
        type: 'UPDATE',
        id,
        data: movie
    });

    return { ...movie, isOffline: true };
};

export const deleteMovie = async (id) => {
    if (isNetworkOnline && isServerOnline) {
        try {
            await originalDeleteMovie(id);
            // Update cache
            const movies = await getMovies();
            const updatedMovies = movies.filter(m => m.id !== id);
            localStorage.setItem('movies_cache', JSON.stringify(updatedMovies));
            return { id };
        } catch (error) {
            // Fall through to offline version
        }
    }

    // Offline handling
    const movies = await getMovies();
    const updatedMovies = movies.filter(m => m.id !== id);
    localStorage.setItem('movies_cache', JSON.stringify(updatedMovies));

    // Queue for sync
    addPendingOperation({
        type: 'DELETE',
        id
    });

    return { id, isOffline: true };
};

// Export status information
export const getConnectionStatus = () => ({
    isOnline: isNetworkOnline && isServerOnline,
    isNetworkOnline,
    isServerOnline
});

// Initialize
monitorConnection();