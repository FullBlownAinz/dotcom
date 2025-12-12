import { useState, useEffect } from 'react';

// Simple global store for edit mode state
export const editMode = {
  on: false,
  listeners: new Set<() => void>(),
  set(v: boolean) {
    if (this.on !== v) {
      this.on = v;
      this.listeners.forEach(fn => fn());
    }
  },
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
};
