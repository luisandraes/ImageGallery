import { useMemo, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { scanImages } from "./lib/scanImages";
import type { ImageItem } from "./types";
import "./App.css";

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesSearch = img.name.toLowerCase().includes(query.toLowerCase());
      const matchesFavorite = showFavoritesOnly ? img.favorite : true;
      return matchesSearch && matchesFavorite;
    });
  }, [images, query, showFavoritesOnly]);

  const selected =
    selectedIndex !== null ? filteredImages[selectedIndex] : null;

  async function chooseFolder() {
    const folder = await open({
      directory: true,
      multiple: false,
    });

    if (!folder || Array.isArray(folder)) return;

    const found = await scanImages(folder);
    setImages(found);
    setSelectedIndex(null);
  }

  function toggleFavorite(path: string) {
    setImages((prev) =>
      prev.map((img) =>
        img.path === path ? { ...img, favorite: !img.favorite } : img
      )
    );
  }

  function nextImage() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filteredImages.length);
  }

  function previousImage() {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex === 0 ? filteredImages.length - 1 : selectedIndex - 1
    );
  }

  return (
    <main>
      <header>
        <h1>Image Gallery</h1>

        <div className="toolbar">
          <button onClick={chooseFolder}>Open Folder</button>

          <input
            placeholder="Search images..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button onClick={() => setShowFavoritesOnly((v) => !v)}>
            {showFavoritesOnly ? "Show All" : "Favorites"}
          </button>
        </div>
      </header>

      <p>{filteredImages.length} images</p>

      <section className="grid">
        {filteredImages.map((img, index) => (
          <div className="card" key={img.path}>
            <img
              src={img.src}
              alt={img.name}
              onClick={() => setSelectedIndex(index)}
            />

            <button
              className="favorite"
              onClick={() => toggleFavorite(img.path)}
            >
              {img.favorite ? "★" : "☆"}
            </button>

            <span>{img.name}</span>
          </div>
        ))}
      </section>

      {selected && (
        <div className="viewer">
          <button className="close" onClick={() => setSelectedIndex(null)}>
            ×
          </button>

          <button onClick={previousImage}>←</button>

          <div className="viewer-content">
            <img src={selected.src} alt={selected.name} />
            <h3>{selected.name}</h3>

            <div className="viewer-actions">
              <button onClick={() => toggleFavorite(selected.path)}>
                {selected.favorite ? "Unfavorite" : "Favorite"}
              </button>

              <button onClick={() => revealItemInDir(selected.path)}>
                Reveal in Finder
              </button>
            </div>
          </div>

          <button onClick={nextImage}>→</button>
        </div>
      )}
    </main>
  );
}