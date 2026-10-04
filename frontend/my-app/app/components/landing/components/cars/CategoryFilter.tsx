import { categories, type Category } from "./carData";

type Props = { active: Category; onChange: (category: Category) => void };

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter cars by type">
      {categories.map((category) => {
        const selected = category === active;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(category)}
            className={`min-h-9 cursor-pointer rounded-full px-4 text-[11px] font-bold uppercase tracking-[.08em] transition-colors motion-reduce:transition-none ${
              selected ? "bg-primary text-white" : "bg-neutral-100 text-secondary hover:bg-neutral-200"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
