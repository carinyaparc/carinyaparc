import type { Access } from 'payload';

export const authenticated: Access = ({ req: { user } }) => Boolean(user);

export const publicRead: Access = () => true;

export const publicReadPublished: Access = ({ req: { user } }) => {
  if (user) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
};
