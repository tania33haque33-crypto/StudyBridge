import { useState } from 'react';

const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const resetPagination = () => {
    setPage(1);
  };

  return {
    page,
    limit,
    handlePageChange,
    handleLimitChange,
    resetPagination,
  };
};

export default usePagination;