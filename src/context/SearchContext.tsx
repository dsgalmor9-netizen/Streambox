import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product } from '../types';
import { useStore } from './StoreContext';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isSearchModalOpen: boolean;
  openSearchModal: (initialQuery?: string, initialCategory?: string) => void;
  closeSearchModal: () => void;
  searchResults: Product[];
  totalMatchesCount: number;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const openSearchModal = (initialQuery?: string, initialCategory?: string) => {
    if (initialQuery !== undefined) setSearchQuery(initialQuery);
    if (initialCategory !== undefined) setSelectedCategory(initialCategory);
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  // Real-time matching by name, brand, category, subcategory and tags
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    
    return products.filter((product) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'ALL' || product.category === selectedCategory;
      if (!matchesCategory) return false;

      // Text query match
      if (!q) return true;

      const nameMatch = product.name.toLowerCase().includes(q);
      const brandMatch = product.brand.toLowerCase().includes(q);
      const subcatMatch = product.subcategory.toLowerCase().includes(q);
      const descMatch = product.shortDescription?.toLowerCase().includes(q);
      const tagsMatch = product.tags?.some((t) => t.toLowerCase().includes(q));

      return nameMatch || brandMatch || subcatMatch || descMatch || tagsMatch;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isSearchModalOpen,
        openSearchModal,
        closeSearchModal,
        searchResults,
        totalMatchesCount: searchResults.length,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
