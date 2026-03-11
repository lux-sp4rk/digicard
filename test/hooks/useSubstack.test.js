import { renderHook, waitFor } from '@testing-library/react';
import { useSubstack } from '../../src/hooks/useSubstack';
import * as substackUtils from '../../src/utils/substack';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/substack');

describe('useSubstack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    substackUtils.getFeaturedPost.mockResolvedValue(null);
    const { result } = renderHook(() => useSubstack());
    expect(result.current.loading).toBe(true);
    expect(result.current.post).toBeNull();
  });

  it('fetches featured post successfully', async () => {
    const mockPost = {
      title: 'Test Post',
      description: 'Test description',
      link: 'https://test.substack.com/p/test',
    };
    substackUtils.getFeaturedPost.mockResolvedValue(mockPost);
    const { result } = renderHook(() => useSubstack());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post).toEqual(mockPost);
    expect(substackUtils.getFeaturedPost).toHaveBeenCalledTimes(1);
  });

  it('handles null response gracefully', async () => {
    substackUtils.getFeaturedPost.mockResolvedValue(null);
    const { result } = renderHook(() => useSubstack());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post).toBeNull();
  });
});
