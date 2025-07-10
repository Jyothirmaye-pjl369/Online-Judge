import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Use the correct env variable
  withCredentials: true, // optional: only if using cookies/session
});

export default axiosInstance;
