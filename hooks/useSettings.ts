import { useContext } from 'react';
import { AdminContext } from '../contexts/AdminContext.tsx';

export const useSettings = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within an AdminProvider');
  }
  return {
    settings: context.settings,
    updateSettings: context.updateSettings,
    applySettings: context.applySettings,
    loading: !context.settings
  };
};
