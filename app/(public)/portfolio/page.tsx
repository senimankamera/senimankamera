import { GalleryRepository } from "@/src/modules/gallery/repositories/gallery.repository";
import { GetGalleriesUseCase } from "@/src/modules/gallery/use-cases/get-galleries.use-case";
import { PortfolioGrid } from "@/src/modules/gallery/components/portfolio-grid";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";

export const revalidate = 0; // Disable static cache to reflect database changes dynamically

export default async function PortfolioPage() {
  const repository = new GalleryRepository();
  const getGalleriesUseCase = new GetGalleriesUseCase(repository);
  const categoryRepository = new CategoryRepository();
  
  let items = [];
  let categories = [];
  let isDbError = false;
  try {
    const [resItems, resCategories] = await Promise.all([
      getGalleriesUseCase.execute(),
      categoryRepository.findAll(),
    ]);
    items = resItems;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories = resCategories.map((c: any) => ({
      id: c.id,
      name: c.name,
      label: c.label,
    }));
  } catch (error) {
    console.error("Failed to fetch portfolio galleries and categories:", error);
    isDbError = true;
  }

  if (isDbError || items.length === 0) {
    return null;
  }

  return <PortfolioGrid initialItems={items} categories={categories} />;
}
