import { useNewsletter } from './useNewsletter';
import { getFeaturedPost } from '../utils/beehiiv';

export const useBeeHiiv = () => useNewsletter(getFeaturedPost);
