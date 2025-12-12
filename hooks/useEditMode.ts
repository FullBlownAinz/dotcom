import { useState, useEffect } from 'react';
import { editMode } from '../contexts/EditModeContext.tsx';
import { useAdmin } from './useAdmin.ts';

// A hook to easily subscribe to the edit mode state, with an authentication guard.
export function useEditMode() {
  const { session } = useAdmin();
  const [isOn, setIsOn] = useState(editMode.on);

  // Effect to automatically exit edit mode if the session is lost.
  useEffect(() => {
    if (isOn && !session) {
      editMode.set(false);
    }
  }, [session, isOn]);

  // Effect to subscribe to the raw editMode state changes.
  useEffect(() => {
    const unsub = editMode.subscribe(() => setIsOn(editMode.on));
    return () => unsub();
  }, []);

  // Wrapper for setEditMode to enforce authentication.
  const setMode = (v: boolean) => {
    // Only allow turning edit mode ON if there is an active session.
    // Turning it OFF is always allowed.
    if (v && !session) {
      console.error("Attempted to enter edit mode without an active session.");
      return;
    }
    editMode.set(v);
  };

  return { isEditMode: isOn, setEditMode: setMode };
}
