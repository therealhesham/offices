/** S3-compatible API endpoint for DigitalOcean Spaces (path-style uploads). */
export function getSpacesEndpointUrl(region: string): string {
  const r = region.trim() || 'sgp1';
  return `https://${r}.digitaloceanspaces.com`;
}

/**
 * Public URL for an object after upload (virtual-hosted style).
 * Example: https://bucket.sgp1.digitaloceanspaces.com/key
 */
export function getSpacesPublicObjectUrl(
  bucket: string,
  region: string,
  key: string
): string {
  const b = bucket.trim();
  const r = region.trim() || 'sgp1';
  const cleanKey = key.replace(/^\/+/, '');
  return `https://${b}.${r}.digitaloceanspaces.com/${cleanKey}`;
}
