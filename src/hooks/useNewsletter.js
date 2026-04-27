import { useState, useEffect } from 'react';

/**
 * Generic newsletter post hook — fetches via the provided function.
 * @param {() => Promise<any>} fetchFn - The fetch function to call
 * @returns {{ post: any, loading: boolean }}
 */
export const useNewsletter = fetchFn => {
  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setPostLoading(true);
      const post = await fetchFn();
      setPost(post);
      setPostLoading(false);
    };
    fetchPost();
  }, []);

  return { post, loading: postLoading };
};
