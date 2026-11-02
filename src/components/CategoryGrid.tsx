import { CATEGORY_SECTIONS, type Category } from "../lib/categories";

interface Props {
  onSelect: (category: Category) => void;
  /** Kategorien, die schon Favorit sind, bekommen ein ★ */
  favoriteIds: Set<string>;
}

/** Kategorie-Kacheln in Entdecken */
export function CategoryGrid({ onSelect, favoriteIds }: Props) {
  return (
    <div className="categories">
      {CATEGORY_SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="cat-title">{section.title}</h2>
          <div className="cat-grid">
            {section.categories.map((c) => (
              <button key={c.id} className="cat-tile" onClick={() => onSelect(c)}>
                <span className="cat-emoji" aria-hidden>
                  {c.emoji}
                </span>
                {c.label}
                {favoriteIds.has(c.id) && (
                  <span className="cat-star" aria-label="Favorit">
                    ★
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
