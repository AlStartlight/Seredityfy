'use client';
import { useState, useEffect } from 'react';

export function useUser(id) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); });
  }, [id]);

  return { user, loading };
}
