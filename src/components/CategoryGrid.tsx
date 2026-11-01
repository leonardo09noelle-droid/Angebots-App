import { CATEGORY_SECTIONS, type Category } from "../lib/categories";

/** Kategorie-Kacheln im Suchtab */
export function CategoryGrid({ onSelect }: { onSelect: (category: Category) => void }) {
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
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
