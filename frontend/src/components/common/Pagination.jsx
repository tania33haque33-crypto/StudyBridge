import { Box, Pagination as MuiPagination, Select, MenuItem, FormControl, Typography } from '@mui/material';

const Pagination = ({ page, totalPages, onPageChange, limit, onLimitChange, totalItems }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mt: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Show
        </Typography>
        <FormControl size="small">
          <Select value={limit} onChange={onLimitChange} sx={{ minWidth: 80 }}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          of {totalItems} results
        </Typography>
      </Box>

      <MuiPagination
        count={totalPages}
        page={page}
        onChange={onPageChange}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default Pagination;