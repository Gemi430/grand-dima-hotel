import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic fetch function
async function fetchData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

// Generic mutation function
async function mutateData<T, D = any>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete',
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient[method]<T>(url, data, config);
  return response.data;
}

/**
 * Custom hook for GET requests with React Query
 */
export function useApiQuery<T = any>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, AxiosError>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => fetchData<T>(url),
    ...options,
  });
}

/**
 * Custom hook for POST/PUT/PATCH/DELETE requests with React Query
 */
export function useApiMutation<T = any, D = any>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: Omit<UseMutationOptions<T, AxiosError, D>, 'mutationFn'> & {
    invalidateKeys?: string[];
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const queryClient = useQueryClient();
  const { invalidateKeys, successMessage, errorMessage, ...mutationOptions } = options || {};

  return useMutation<T, AxiosError, D>({
    mutationFn: (data: D) => mutateData<T, D>(url, method, data),
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch queries
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      // Show success message
      if (successMessage) {
        toast.success(successMessage);
      }

      // Call user's onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Show error message
      const message = errorMessage || (error.response?.data as any)?.message || 'An error occurred';
      toast.error(message);

      // Call user's onError if provided
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

/**
 * Prefetch data for better performance
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  return (key: string | string[], url: string) => {
    queryClient.prefetchQuery({
      queryKey: Array.isArray(key) ? key : [key],
      queryFn: () => fetchData(url),
    });
  };
}

/**
 * Export axios instance for direct use if needed
 */
export { apiClient };

