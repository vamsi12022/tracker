'use client';

import { useRef, useState } from 'react';

export default function FoodInput({ onResult, onError }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

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

  const analyzeFood = async (payload) => {
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
  };

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
          <div className="loading__text">🤖 AI is analyzing your food...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="food-input" id="food-input">
      <h2 className="food-input__title">➕ Log Food</h2>

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
          disabled={!imageBase64}
          id="analyze-image-btn"
        >
          🤖 Analyze with AI
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
            disabled={!textInput.trim()}
            id="analyze-text-btn"
          >
            Analyze
          </button>
        </form>
      )}
    </section>
  );
}
