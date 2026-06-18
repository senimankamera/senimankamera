import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 py-20 px-6 md:px-20 mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-8 text-center">
        {/* Brand Name */}
        <Link href="/" className="font-serif text-3xl font-semibold tracking-tighter text-primary">
          SENIMAN_KAMERA
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 font-sans text-sm tracking-wide text-secondary items-center">
          <a
            href="https://www.instagram.com/seniman_kamera4888?igsh=ems1ZzhqeGQ2bGtu"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="w-4 h-4"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span>Instagram</span>
          </a>
          <Link href="/terms" className="hover:text-primary transition-colors duration-300">
            Ketentuan Layanan
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors duration-300">
            Kebijakan Privasi
          </Link>
        </div>

        {/* Brand Tagline */}
        <p className="font-sans text-[10px] uppercase tracking-widest text-secondary mt-8">
          © {new Date().getFullYear()} SENIMAN_KAMERA PHOTOSHOOT. SANG SENIMAN DI BALIK LENSA.
        </p>
      </div>
    </footer>
  );
}
