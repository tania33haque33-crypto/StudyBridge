import { useState } from 'react';
import { Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const FALLBACKS = [
  'https://usao.edu/images/explore-usao-box.png',
  'https://managingtheuniversitycampus.nl/wp-content/uploads/2012/03/20120308-133035.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYDgpGgrfmGWnGv5XZhHEu09fPbAQzGrSV0Q&s',
  'https://www.campusfrance.org/sites/default/files/styles/mobile_menu_image_1_2_et_3/public/menu/2017-10/pyramide%20louvre.jpg?h=c71d0c67&itok=JBq1oN8J',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2Ec6qnEQ1_tIAQ7YH6YlpngioQJSLfJOtuA&s',
];

function getSeededFallback(seed) {
  const idx = Math.abs(
    String(seed || '')
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0)
  ) % FALLBACKS.length;
  return FALLBACKS[idx];
}

const SafeImage = ({
  src,
  alt = '',
  seed,
  height,
  width,
  sx = {},
  imgSx = {},
  objectFit = 'cover',
  fallbackIcon = false,
  component = 'img',
  ...rest
}) => {
  const fallback = getSeededFallback(seed || alt);
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [failed, setFailed] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleError = () => {
    if (!usedFallback) {
      setImgSrc(fallback);
      setUsedFallback(true);
    } else {
      setFailed(true);
    }
  };

  if (failed && fallbackIcon) {
    return (
      <Box
        sx={{
          height,
          width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          ...sx,
        }}
      >
        <SchoolIcon sx={{ fontSize: 64, color: 'grey.400' }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imgSrc}
      alt={alt}
      onError={handleError}
      sx={{
        height,
        width,
        objectFit,
        display: 'block',
        ...sx,
        ...imgSx,
      }}
      {...rest}
    />
  );
};

export default SafeImage;
