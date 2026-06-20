import { readDir } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ImageItem } from "../types";

const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif"];

function isImage(name: string) {
  return imageExts.some((ext) => name.toLowerCase().endsWith(ext));
}

export async function scanImages(folder: string): Promise<ImageItem[]> {
  const results: ImageItem[] = [];

  async function walk(dir: string) {
    const entries = await readDir(dir);

    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`;

      if (entry.isDirectory) {
        await walk(fullPath);
      } else if (entry.name && isImage(entry.name)) {
        results.push({
          name: entry.name,
          path: fullPath,
          src: convertFileSrc(fullPath),
          favorite: false,
        });
      }
    }
  }

  await walk(folder);
  return results;
}