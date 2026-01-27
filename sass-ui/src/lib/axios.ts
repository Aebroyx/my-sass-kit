import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This enables sending cookies with requests
});

// Helper function to handle API errors
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    // If we have a response with data, throw the entire error response
    if (error.response?.data) {
      throw new Error(JSON.stringify(error.response.data));
    }
    // Fallback to error message if no response data
    throw new Error(error.message || 'Something went wrong');
  }
  throw error;
};

// Helper function to extract user-friendly error message from API error
export const getErrorMessage = (error: Error, fallback: string): string => {
  try {
    const errorResponse = JSON.parse(error.message);

    // Check if it's a structured API error response
    if (errorResponse.status === 'error' && errorResponse.message) {
      return errorResponse.message;
    }

    // Fallback to original message if not a structured error
    return error.message || fallback;
  } catch {
    // If JSON parsing fails, return the original message or fallback
    return error.message || fallback;
  }
};

export default axiosInstance;
