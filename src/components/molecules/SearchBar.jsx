import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const SearchBar = ({ onSearch, placeholder = "Search by location, address, or zip code...", className = '' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={`flex gap-2 ${className}`}
    >
      <div className="flex-1">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          icon="Search"
          iconPosition="left"
        />
      </div>
      
      {query && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClear}
          icon="X"
        >
          Clear
        </Button>
      )}
      
      <Button
        type="submit"
        variant="primary"
        icon="Search"
      >
        Search
      </Button>
    </motion.form>
  );
};

export default SearchBar;