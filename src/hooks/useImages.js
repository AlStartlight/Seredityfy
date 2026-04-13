'use client';
import { useState, useEffect } from 'react';

export function useImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/images')
      .then(r => r.json())
      .then(data => { setImages(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  return { images, loading, error };
}
