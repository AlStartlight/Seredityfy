import { useState, useCallback } from 'react';

export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);

  const generate = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentImage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text().catch(() => '');
        const preview = text.slice(0, 120);
        if (response.status === 504 || text.toLowerCase().includes('timeout')) {
          throw new Error('Generation timed out — image took too long. Try a smaller size or simpler prompt.');
        }
        throw new Error(`Server error (${response.status}): ${preview || 'No details available'}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.status === 'COMPLETED') {
        // Direct generation succeeded — no polling needed
        setProgress(100);
        setCurrentImage(data);
        setHistory((prev) => [data, ...prev.slice(0, 9)]);
      } else if (data.status === 'FAILED') {
        throw new Error(data.error || 'Generation failed');
      } else {
        // PENDING — worker-based flow, poll for result
        setProgress(10);
        setCurrentImage({ id: data.id, status: 'PENDING' });
        pollImageStatus(data.id);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const pollImageStatus = useCallback(async (imageId) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/generate/${imageId}`);
        const data = await response.json();

        if (data.status === 'COMPLETED') {
          setProgress(100);
          setCurrentImage(data);
          setHistory((prev) => [data, ...prev.slice(0, 9)]);
          return;
        }

        if (data.status === 'FAILED') {
          let errorMsg = data.error || 'Image generation failed. Please try again.';
          
          if (data.error?.includes('safety system') || data.error?.includes('content_policy')) {
            errorMsg = 'Prompt blocked by safety system. Avoid copyrighted characters, brands, or explicit content. Try a different prompt.';
          } else if (data.error?.includes('rate limit') || data.error?.includes('Rate limit')) {
            errorMsg = 'Rate limit reached. Please wait a moment and try again.';
          } else if (data.error?.includes('daily generation limit')) {
            errorMsg = 'Daily generation limit reached. Upgrade to PRO for more generations.';
          }
          
          setError(errorMsg);
          console.error('Generation failed:', data);
          return;
        }

        setProgress((prev) => Math.min(prev + 5, 90));

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError('Generation timed out. Please try again.');
        }
      } catch (err) {
        setError('Failed to check generation status');
      }
    };

    poll();
  }, []);

  const updateVisibility = useCallback(async (imageId, visibility) => {
    try {
      const response = await fetch(`/api/generate/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visibility }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update visibility');
      }

      setHistory((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, visibility: data.image.visibility } : img
        )
      );

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteImage = useCallback(async (imageId) => {
    try {
      const response = await fetch(`/api/generate/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setHistory((prev) => prev.filter((img) => img.id !== imageId));
      if (currentImage?.id === imageId) {
        setCurrentImage(null);
      }

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentImage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentImage = useCallback(() => {
    setCurrentImage(null);
    setProgress(0);
  }, []);

  return {
    generate,
    isGenerating,
    currentImage,
    error,
    progress,
    history,
    updateVisibility,
    deleteImage,
    clearError,
    clearCurrentImage,
  };
}

export default useGenerate;
