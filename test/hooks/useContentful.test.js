import { renderHook, waitFor } from '@testing-library/react';
import { useContentful } from '../../src/hooks/useContentful';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useContentful', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const mockFetch = vi.fn().mockResolvedValue({ test: 'data' });
    const { result } = renderHook(() => useContentful(mockFetch));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches data successfully', async () => {
    const mockData = { id: '1', title: 'Test' };
    const mockFetch = vi.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useContentful(mockFetch));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('handles fetch errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useContentful(mockFetch));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('refetches when fetchFunction changes', async () => {
    const mockFetch1 = vi.fn().mockResolvedValue({ version: 1 });
    const mockFetch2 = vi.fn().mockResolvedValue({ version: 2 });
    const { result, rerender } = renderHook(
      ({ fetchFn }) => useContentful(fetchFn),
      { initialProps: { fetchFn: mockFetch1 } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ version: 1 });
    rerender({ fetchFn: mockFetch2 });
    await waitFor(() => expect(result.current.data).toEqual({ version: 2 }));
    expect(mockFetch2).toHaveBeenCalledTimes(1);
  });
});
