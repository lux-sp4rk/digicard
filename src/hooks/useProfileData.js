import profileImg from '../assets/avatar.jpg';
import { PROFILE_DATA, BIO_TEXT } from '../constants/profileData';
import { useContentful } from './useContentful';
import { getProfile } from '../utils/contentful';

const normalizeContentfulUrl = url => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https:${url}`;
};

export const useProfileData = () => {
  const { data, loading, error } = useContentful(getProfile);

  const profile = {
    id: data?.id || null,
    name: data?.name || PROFILE_DATA.name,
    title: data?.title || '',
    location: data?.location || '',
    bio: data?.bio || BIO_TEXT.default,
    profileImage: normalizeContentfulUrl(data?.profileImage) || profileImg,
  };

  return { profile, loading, error };
};
