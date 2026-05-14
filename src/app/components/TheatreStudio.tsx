'use client';

import { useEffect } from 'react';
import studio from '@theatre/studio';
import extension from '@theatre/r3f/dist/extension';

export default function TheatreStudio() {
  useEffect(() => {
    // Check if we are in development mode before initializing
    if (process.env.NODE_ENV === 'development') {
      studio.initialize();
      studio.extend(extension);
    }
  }, []);

  return null; // This component doesn't render anything visible
}