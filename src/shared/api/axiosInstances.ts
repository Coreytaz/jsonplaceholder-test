import axios from 'axios'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://jsonplaceholder.typicode.com',
    timeout: 15000,
    headers: { Accept: 'application/json' },
})
