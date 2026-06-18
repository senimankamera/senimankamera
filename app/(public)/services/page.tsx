import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { GetPackagesUseCase } from "@/src/modules/booking/use-cases/get-packages.use-case";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { ServicesSelector } from "@/src/modules/booking/components/services-selector";

export const revalidate = 0; // Dynamic route

export default async function ServicesPage() {
  const repository = new PackageRepository();
  const categoryRepository = new CategoryRepository();

  const getPackagesUseCase = new GetPackagesUseCase(repository);

  const [packages, categories] = await Promise.all([
    getPackagesUseCase.execute(),
    categoryRepository.findAll(),
  ]);

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

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Large Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative w-full aspect-[3/4] overflow-hidden border border-border/40 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7QcuFR6RlyniK0n75FPkuJGk_votVRrsxgSvvGJc5xDjRZKIcKyHllIZiiISw24E-H7qhF4UvDWsMY2thBAzg9Gy_4r9WQbJWBHB_9PonlyKMQHBp155CChj7Sn3AFoS32ezeuAOQS3g-DK67z1qWnmHJDaGvOSrEGSNqx-TI31NBtp7kdnx4MFGBrYPMGz0PXJVZrNnSpoQTSqvPtXi5R2m0aXDZoWLwYBmj5-bBk3cSA0uHyF_1q60yi9x1-plUwnOzR11CrThp"
                  alt="Couple walking in desert landscape"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Quote details */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-8 block font-bold">
                Pengalaman Klien
              </span>
              
              <div className="mb-16 relative">
                <span className="text-8xl font-serif text-border/25 leading-none absolute -left-8 -top-8 select-none">
                  “
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-primary relative z-10 mb-6 font-medium leading-relaxed">
                  Mereka tidak sekadar mengambil foto; mereka mengabadikan rasa yang sesungguhnya dari hari bahagia itu. Setiap foto tampak seperti cuplikan dari film klasik.
                </h3>
                <div className="font-sans text-sm text-secondary font-semibold">
                  Eleanor & James <span className="mx-2 text-border">•</span> Pernikahan Destinasi di Tuscany
                </div>
              </div>

              <div className="border-t border-border/40 pt-8">
                <p className="font-sans text-base text-secondary italic mb-4">
                  "Tingkat profesionalisme dan visi artistik mereka tiada banding. Kami merasa sangat nyaman, dan galeri akhir melampaui ekspektasi terbesar kami."
                </p>
                <div className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                  Sarah Jenkins, Klien Sesi Potret Editorial
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
