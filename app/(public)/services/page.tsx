import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { GetPackagesUseCase } from "@/src/modules/booking/use-cases/get-packages.use-case";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { ServicesSelector } from "@/src/modules/booking/components/services-selector";

export const revalidate = 0; // Dynamic route

export default async function ServicesPage() {
  const repository = new PackageRepository();
  const categoryRepository = new CategoryRepository();

  const getPackagesUseCase = new GetPackagesUseCase(repository);

  let packages = [];
  let categories = [];
  let isDbError = false;
  try {
    const [resPackages, resCategories] = await Promise.all([
      getPackagesUseCase.execute(),
      categoryRepository.findAll(),
    ]);
    packages = resPackages;
    categories = resCategories;
  } catch (error) {
    console.error("Failed to fetch packages and categories:", error);
    isDbError = true;
  }

  if (isDbError || packages.length === 0) {
    return null;
  }

  const serializedPackages = JSON.parse(JSON.stringify(packages));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 md:px-20 w-full max-w-[1440px] mx-auto flex flex-col items-center text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-6 block font-bold">
          Penawaran Terpilih
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-primary max-w-4xl mb-8 font-medium">
          Investasikan pada seni yang abadi.
        </h1>
        <p className="font-sans text-base md:text-lg text-secondary max-w-2xl mx-auto font-light leading-relaxed">
          Kami percaya pada mengabadikan momen dengan penuh kesadaran. Paket kami dirancang untuk memberikan pendekatan editorial yang komprehensif pada hari-hari terpenting Anda, memastikan setiap bingkai menjadi karya seni abadi.
        </p>
      </section>

      {/* Dynamic Services Selector (Packages & Price Info) */}
      <section className="py-8 px-6 md:px-20 w-full max-w-[1440px] mx-auto">
        <ServicesSelector
          initialPackages={serializedPackages}
          categories={serializedCategories}
        />
      </section>
    </div>
  );
}
