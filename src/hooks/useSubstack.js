import { useState, useEffect } from 'react';
import { getFeaturedPost } from '../utils/substack';

export const useSubstack = () => {
  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);

  useEffect(() => {
    const fetchSubstackPost = async () => {
      setPostLoading(true);
      const post = await getFeaturedPost();
      setPost(post);
      setPostLoading(false);
    };
    fetchSubstackPost();
  }, []);

  const loading = postLoading;

  return { post, loading };
};
