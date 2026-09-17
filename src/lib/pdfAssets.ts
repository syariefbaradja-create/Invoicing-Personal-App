import path from "path";

// react-pdf's Image component only supports raster formats (PNG/JPG/WEBP), not SVG.
export function resolveRasterImagePath(url: string | null): string | null {
  if (!url || url.endsWith(".svg")) return null;
  return path.join(process.cwd(), "public", url);
}
