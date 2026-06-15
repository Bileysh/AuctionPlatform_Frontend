import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:5130/api',
    headers: {
        'Content-Type': 'application/json'
    },
});