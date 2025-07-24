import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'On-Rent',
    short_name: 'OnRent',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/img/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/img/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
