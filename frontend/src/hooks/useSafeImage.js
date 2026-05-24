import { useState, useEffect } from 'react';

const FALLBACKS = [
  'https://usao.edu/images/explore-usao-box.png',
  'https://managingtheuniversitycampus.nl/wp-content/uploads/2012/03/20120308-133035.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYDgpGgrfmGWnGv5XZhHEu09fPbAQzGrSV0Q&s',
  'https://www.campusfrance.org/sites/default/files/styles/mobile_menu_image_1_2_et_3/public/menu/2017-10/pyramide%20louvre.jpg?h=c71d0c67&itok=JBq1oN8J',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2Ec6qnEQ1_tIAQ7YH6YlpngioQJSLfJOtuA&s',
];

function seedFallback(seed) {
  const idx =
    Math.abs(
      String(seed || '')
        .split('')
        .reduce((a, c) => a + c.charCodeAt(0), 0)
    ) % FALLBACKS.length;
  return FALLBACKS[idx];
}

const useSafeImage = (src, seed) => {
  const fallback = seedFallback(seed || src);
  const [resolvedSrc, setResolvedSrc] = useState(src || fallback);

  useEffect(() => {
    if (!src) {
      setResolvedSrc(fallback);
      return;
    }
    setResolvedSrc(src);
    const img = new Image();
    img.onload = () => setResolvedSrc(src);
    img.onerror = () => setResolvedSrc(fallback);
    img.src = src;
  }, [src, fallback]);

  return resolvedSrc;
};

export default useSafeImage;
