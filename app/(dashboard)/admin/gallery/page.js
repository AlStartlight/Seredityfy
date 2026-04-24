'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const CATEGORY_ICONS = {
  manhwa: 'auto_stories',
  anime: 'anime',
  realistic: 'person',
  portrait: 'face',
  fantasy: 'auto_awesome',
  'sci-fi': 'rocket_launch',
  illustration: 'brush',
  landscape: 'landscape',
  nature: 'park',
  architecture: 'architecture',
  abstract: 'bubble_chart',
};

const SORT_OPTIONS = [
  { id: 'createdAt', name: 'Latest' },
  { id: 'popular', name: 'Top Rated' },
  { id: 'featured', name: 'Featured' },
];

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/community?limit=100&page=1');
      const data = await response.json();
      
      if (data.images) {
        const categories = new Set();
        data.images.forEach(img => {
          if (img.metadata?.category) {
            categories.add(img.metadata.category.toLowerCase());
          }
        });
        
        const cats = Array.from(categories).map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: CATEGORY_ICONS[cat] || 'image',
        }));
        
        cats.sort((a, b) => a.name.localeCompare(b.name));
        setAvailableCategories(cats);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchImages = useCallback(async (page = 1, category = selectedCategory) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        type: 'community',
      });

      if (category !== 'all') {
        params.append('category', category);
      }

      if (selectedSort) {
        params.append('sortBy', selectedSort);
      }

      const response = await fetch(`/api/community?${params}`);
      const data = await response.json();

      if (response.ok) {
        setImages(page === 1 ? data.images : [...images, ...data.images]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSort, images]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchImages(1);
  }, [selectedCategory, selectedSort]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setImages([]);
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchImages(pagination.page + 1);
    }
  };

  const filteredImages = searchQuery
    ? images.filter(img => 
        img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.metadata?.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : images;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* Hero Title Section */}
      <section className="mb-6 lg:mb-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline text-on-surface tracking-tighter mb-4">
          Community{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Masterpieces</span>
        </h2>
        <p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">
          Explore the latest creations from our global community of digital alchemists. Remix, like, and get inspired by the electric frontiers of AI art.
        </p>
      </section>

      {/* Search & Filter Bar (Glassmorphic) */}
      <section className="mb-6 lg:mb-10 glass-panel bg-[#1f0438]/70 backdrop-blur-2xl p-3 lg:p-4 rounded-2xl flex flex-wrap items-center gap-3 lg:gap-4 border border-outline-variant/10">
        {/* Sort Options */}
        <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedSort(option.id)}
              className={`px-6 py-2 rounded-lg font-label text-xs font-medium transition-all ${
                selectedSort === option.id
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-outline-variant/20 hidden md:block"></div>

        {/* Category Filter Dropdown */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1f0438]/70 backdrop-blur-2xl border border-outline-variant/20 rounded-xl text-on-surface-variant font-label text-xs hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-sm">category</span>
            <span className="hidden sm:inline">Category:</span>
            <span className="text-primary font-bold">
              {selectedCategory === 'all' 
                ? 'All' 
                : availableCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}
            </span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full sm:min-w-[200px] sm:w-auto">
          <input
            type="text"
            placeholder="Search community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-purple-200 placeholder:text-purple-300/30 text-sm focus:outline-none focus:border-primary/50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-purple-300/40 text-sm">
            search
          </span>
        </div>

        {/* Results Count */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-label text-outline uppercase tracking-widest">
            Showing {filteredImages.length} Results
          </span>
          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </section>

      {/* Category Pills - Only show categories with images */}
      {availableCategories.length > 0 && (
        <section className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-purple-200/60 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            <span className="text-xs font-label">All</span>
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-purple-200/60 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span className="text-xs font-label">{cat.name}</span>
            </button>
          ))}
        </section>
      )}

      {/* Masonry Gallery Grid */}
      <section className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 lg:gap-4">
        {loading && images.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-6 h-64 bg-surface-container-low rounded-2xl animate-pulse"></div>
          ))
        ) : filteredImages.length > 0 ? (
          filteredImages.map((img) => (
            <GalleryCard key={img.id} image={img} />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <span className="material-symbols-outlined text-6xl text-purple-300/20 mb-4">image_not_supported</span>
            <p className="text-purple-300/40">No images found in this category yet.</p>
          </div>
        )}
      </section>

      {/* Load More */}
      {pagination.page < pagination.totalPages && (
        <div className="mt-16 flex flex-col items-center gap-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-4 bg-[#1f0438]/70 backdrop-blur-2xl border border-primary/30 rounded-full text-primary font-label font-bold text-sm hover:bg-primary hover:text-on-primary transition-all group disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Loading...
              </>
            ) : (
              <>
                Load More Masterpieces
                <span className="material-symbols-outlined ml-2 align-middle group-hover:rotate-180 transition-transform">refresh</span>
              </>
            )}
          </button>
          <div className="flex items-center gap-4 text-outline font-label text-xs">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-1">
              <div className={`w-8 h-1 ${pagination.page === 1 ? 'bg-primary' : 'bg-outline-variant/30'} rounded-full`}></div>
              <div className={`w-4 h-1 ${pagination.page >= 2 ? 'bg-primary' : 'bg-outline-variant/30'} rounded-full`}></div>
              <div className={`w-4 h-1 ${pagination.page >= 3 ? 'bg-primary' : 'bg-outline-variant/30'} rounded-full`}></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function GalleryCard({ image }) {
  const [isLiked, setIsLiked] = useState(false);

  const handleRemix = (e) => {
    e.preventDefault();
    window.location.href = `/admin/generate?prompt=${encodeURIComponent(image.prompt)}`;
  };

  const categoryName = image.metadata?.category 
    ? image.metadata.category.charAt(0).toUpperCase() + image.metadata.category.slice(1)
    : image.model;

  return (
    <Link
      href={`/admin/gallery/${image.id}`}
      className="mb-6 block group relative rounded-2xl overflow-hidden border border-outline-variant/5 bg-surface-container-low transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(31,0,72,0.6)]"
    >
      <img 
        className="w-full h-auto object-cover" 
        alt={image.prompt} 
        src={image.thumbnailUrl || image.imageUrl || '/assets/placeholder.png'}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1f0438] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <div className="mb-4">
          <p className="text-xs font-label text-secondary font-bold mb-1 uppercase tracking-tighter line-clamp-1">
            {categoryName}
          </p>
          <p className="text-[10px] font-body text-white/70 line-clamp-2 italic">{image.prompt}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              className="w-6 h-6 rounded-full" 
              alt="avatar" 
              src={image.user?.image || '/assets/zenai.jpg'} 
            />
            <span className="text-xs font-label text-on-primary-container font-medium">
              {image.user?.name || '@anonymous'}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-full transition-all ${isLiked ? 'bg-secondary/20 text-secondary' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <span 
                className="material-symbols-outlined text-lg" 
                style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
            <button 
              onClick={handleRemix}
              className="flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-full font-label text-[10px] font-bold hover:bg-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Remix
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
