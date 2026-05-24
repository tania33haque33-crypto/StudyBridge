import { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TuneOutlined as FilterIcon,
} from '@mui/icons-material';

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  onFilterClick,
  suggestions = [],
  showFilters = true,
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    }
    setShowSuggestions(false);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          boxShadow: 2,
        }}
      >
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 2);
          }}
          onFocus={() => setShowSuggestions(query.length > 2)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {query && (
          <IconButton onClick={handleClear} sx={{ p: '10px' }}>
            <ClearIcon />
          </IconButton>
        )}
        {showFilters && (
          <IconButton onClick={onFilterClick} sx={{ p: '10px' }} color="primary">
            <FilterIcon />
          </IconButton>
        )}
      </Paper>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            boxShadow: 3,
          }}
        >
          <Box sx={{ p: 2 }}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{ m: 0.5, cursor: 'pointer' }}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;