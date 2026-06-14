'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export default function FoodInput({ onResult, onError }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const fileInputRef = useRef(null);
  const cooldownRef = useRef(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeFood = useCallback(async (payload) => {
    if (cooldown > 0) {
      onError(`Rate limited — please wait ${cooldown}s before trying again`);
      return;
    }

    setIsLoading(true);
    onError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Start cooldown on rate limit
        if (res.status === 429) {
          setCooldown(data.retryAfter || 30);
        }
        throw new Error(data.error || 'Failed to analyze food');
      }

      onResult(data);
      clearImage();
      setTextInput('');
    } catch (err) {
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [cooldown, onResult, onError]);

  const handleImageAnalyze = () => {
    if (!imageBase64) return;
    analyzeFood({ image: imageBase64, mimeType: imageMimeType });
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    analyzeFood({ text: textInput.trim() });
  };

  if (isLoading) {
    return (
      <div className="food-input">
        <div className="loading">
          <div className="loading__spinner" />
          <div className="loading__text">🤖 AI is analyzing your food...<br /><span style={{fontSize: '0.75rem', opacity: 0.6}}>This may take a few seconds if retrying</span></div>
        </div>
      </div>
    );
  }

  const isDisabled = cooldown > 0;

  return (
    <section className="food-input" id="food-input">
      <h2 className="food-input__title">➕ Log Food</h2>

      {/* Cooldown banner */}
      {cooldown > 0 && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.12)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: '#fbbf24',
        }}>
          <span>⏳</span>
          <span>Rate limit cooldown — retry in <strong>{cooldown}s</strong></span>
        </div>
      )}

      {/* Image preview if selected */}
      {imagePreview && (
        <div className="food-input__preview">
          <img src={imagePreview} alt="Food preview" />
          <button className="food-input__preview-remove" onClick={clearImage} aria-label="Remove image">
            ✕
          </button>
        </div>
      )}

      {/* Camera & Gallery Buttons */}
      {!imagePreview && (
        <div className="food-input__actions">
          <button
            className="food-input__btn"
            onClick={() => {
              fileInputRef.current.setAttribute('capture', 'environment');
              fileInputRef.current.click();
            }}
            disabled={isDisabled}
            id="camera-btn"
          >
            <span className="food-input__btn-icon">📸</span>
            <span className="food-input__btn-label">Take Photo</span>
          </button>
          <button
            className="food-input__btn"
            onClick={() => {
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
            }}
            disabled={isDisabled}
            id="gallery-btn"
          >
            <span className="food-input__btn-icon">🖼️</span>
            <span className="food-input__btn-label">Gallery</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="food-input__file-input"
        id="file-input"
      />

      {/* Analyze button for image */}
      {imagePreview && (
        <button
          className="food-input__analyze-btn"
          onClick={handleImageAnalyze}
          disabled={!imageBase64 || isDisabled}
          id="analyze-image-btn"
        >
          {isDisabled ? `⏳ Wait ${cooldown}s` : '🤖 Analyze with AI'}
        </button>
      )}

      {/* Text input */}
      {!imagePreview && (
        <form className="food-input__text-form" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="food-input__text-input"
            placeholder='Or type: "2 eggs with toast"'
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            id="food-text-input"
          />
          <button
            type="submit"
            className="food-input__submit-btn"
            disabled={!textInput.trim() || isDisabled}
            id="analyze-text-btn"
          >
            {isDisabled ? `${cooldown}s` : 'Analyze'}
          </button>
        </form>
      )}
    </section>
  );
}
