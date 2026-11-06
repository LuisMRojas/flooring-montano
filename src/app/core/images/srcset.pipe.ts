import { Pipe, PipeTransform } from '@angular/core';
import manifest from './image-manifest.json';

const WIDTHS: Record<string, number[]> = manifest;

/**
 * WebP srcset for a photo, from the manifest written by `npm run images`.
 *   <img [src]="img.src" [attr.srcset]="img.src | srcset" sizes="(min-width: 1024px) 33vw, 100vw">
 * Returns null for images without WebP versions (the JPG/PNG src is used).
 */
export function srcsetFor(src: string): string | null {
  const widths = WIDTHS[src.replace(/^\//, '')];
  if (!widths?.length) return null;
  const base = src.replace(/\.(jpe?g|png)$/i, '');
  return widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ');
}

@Pipe({ name: 'srcset' })
export class SrcsetPipe implements PipeTransform {
  transform(src: string): string | null {
    return srcsetFor(src);
  }
}
