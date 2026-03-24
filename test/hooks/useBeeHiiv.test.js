import { renderHook, waitFor } from '@testing-library/react';
import { useBeeHiiv } from '../../src/hooks/useBeeHiiv';
import * as beehiivUtils from '../../src/utils/beehiiv';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/beehiiv');

describe('useBeeHiiv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    beehiivUtils.getFeaturedPost.mockResolvedValue(null);
    const { result } = renderHook(() => useBeeHiiv());
    expect(result.current.loading).toBe(true);
    expect(result.current.post).toBeNull();
  });

  it('fetches featured post successfully', async () => {
    const mockPost = {
      id: 'post123',
      title: 'Test Beehiiv Post',
      description: 'Test description',
      web_url: 'https://test.beehiiv.com/p/test',
    };
    beehiivUtils.getFeaturedPost.mockResolvedValue(mockPost);
    const { result } = renderHook(() => useBeeHiiv());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post).toEqual(mockPost);
    expect(beehiivUtils.getFeaturedPost).toHaveBeenCalledTimes(1);
  });

  it('handles null response gracefully', async () => {
    beehiivUtils.getFeaturedPost.mockResolvedValue(null);
    const { result } = renderHook(() => useBeeHiiv());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post).toBeNull();
  });
});
