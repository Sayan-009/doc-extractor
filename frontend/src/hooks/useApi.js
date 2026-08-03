import { useState, useCallback } from 'react';
import { useToast } from './useToast';

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      toast.error('Error', err.response?.data?.detail || err.message || 'Something went wrong');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [apiFunc, toast]);

  return { data, error, loading, execute, setData };
};
