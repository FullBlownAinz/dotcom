import { useContext } from 'react';
import { AdminContext } from '../contexts/AdminContext.tsx';

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
