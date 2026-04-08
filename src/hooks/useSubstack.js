import { useNewsletter } from './useNewsletter';
import { getFeaturedPost } from '../utils/substack';

export const useSubstack = () => useNewsletter(getFeaturedPost);
