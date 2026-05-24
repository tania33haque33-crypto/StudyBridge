import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import universityService from '@/services/universityService';

const UniversityFilters = ({ filters, onChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch filter options
  const { data: filterOptions } = useQuery('filterOptions', universityService.getFilterOptions);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onChange({});
  };

  return (
    <Box>
      {/* Country */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Country/Region</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Select Country</InputLabel>
            <Select
              multiple
              value={localFilters.country || []}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {filterOptions?.data?.countries?.map((country) => (
                <MenuItem key={country} value={country}>
                  <Checkbox checked={localFilters.country?.includes(country)} />
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Course Level */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Course Level</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {filterOptions?.data?.courseLevels?.map((level) => (
              <FormControlLabel
                key={level}
                control={
                  <Checkbox
                    checked={localFilters.courseLevel?.includes(level)}
                    onChange={(e) => {
                      const current = localFilters.courseLevel || [];
                      const newValue = e.target.checked
                        ? [...current, level]
                        : current.filter((l) => l !== level);
                      handleFilterChange('courseLevel', newValue);
                    }}
                  />
                }
                label={level}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Tuition Range */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Tuition Range (USD)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Slider
              value={[
                localFilters.minTuition || 0,
                localFilters.maxTuition || 100000,
              ]}
              onChange={(e, newValue) => {
                handleFilterChange('minTuition', newValue[0]);
                handleFilterChange('maxTuition', newValue[1]);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={100000}
              step={5000}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">
                ${localFilters.minTuition || 0}
              </Typography>
              <Typography variant="body2">
                ${localFilters.maxTuition || 100000}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* QS Ranking */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>QS World Ranking</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              label="Min Rank"
              type="number"
              value={localFilters.qsRankingMin || ''}
              onChange={(e) => handleFilterChange('qsRankingMin', e.target.value)}
              fullWidth
            />
            <TextField
              label="Max Rank"
              type="number"
              value={localFilters.qsRankingMax || ''}
              onChange={(e) => handleFilterChange('qsRankingMax', e.target.value)}
              fullWidth
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* University Type */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>University Type</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {filterOptions?.data?.universityTypes?.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={localFilters.universityType?.includes(type)}
                    onChange={(e) => {
                      const current = localFilters.universityType || [];
                      const newValue = e.target.checked
                        ? [...current, type]
                        : current.filter((t) => t !== type);
                      handleFilterChange('universityType', newValue);
                    }}
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Language of Instruction */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Language</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {filterOptions?.data?.languages?.map((lang) => (
              <FormControlLabel
                key={lang}
                control={
                  <Checkbox
                    checked={localFilters.languageOfInstruction?.includes(lang)}
                    onChange={(e) => {
                      const current = localFilters.languageOfInstruction || [];
                      const newValue = e.target.checked
                        ? [...current, lang]
                        : current.filter((l) => l !== lang);
                      handleFilterChange('languageOfInstruction', newValue);
                    }}
                  />
                }
                label={lang}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Intake Period */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Intake Period</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {filterOptions?.data?.intakes?.map((intake) => (
              <FormControlLabel
                key={intake}
                control={
                  <Checkbox
                    checked={localFilters.intakePeriod?.includes(intake)}
                    onChange={(e) => {
                      const current = localFilters.intakePeriod || [];
                      const newValue = e.target.checked
                        ? [...current, intake]
                        : current.filter((i) => i !== intake);
                      handleFilterChange('intakePeriod', newValue);
                    }}
                  />
                }
                label={intake}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined" fullWidth onClick={handleReset}>
          Reset
        </Button>
        <Button variant="contained" fullWidth onClick={handleApply}>
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
};

export default UniversityFilters;