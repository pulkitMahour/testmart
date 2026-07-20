import axios from 'axios';

// Same-origin in dev via the Vite proxy (/api -> :5000). withCredentials makes the
// browser send/receive the httpOnly auth cookie.
const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default client;
