import { prisma } from "../src/infrastructure/prisma/client";

async function main() {
  console.log("Clearing database...");
  await prisma.booking.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.gallery.deleteMany({});
  await prisma.package.deleteMany({});

  console.log("Seeding galleries...");
  const items = [
    {
      id: 1,
      title: "The Vows",
      category: "Wedding",
      subCategory: "Wedding • Editorial",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSmJaBAe4CdjuoHLvqU-Km175wwOxFHMg9_TRB3KRblnYoPcN9RkgIosSQ8cvM3Oan55Di3kQ8w1vdkDt5VnJ1pW4jb4H7W715r5alSfzDmw7meD52yJHfbmarV5ZQVmLVXiO_GtbigfR5zbmoz4YpI6jV3qYZRtAjcvWbpM5Tnzn8ky7Y5-zBmKx7QIA2yr_EbvqVe5s7LdtfUrs8oQNRn3m3CWX0PPxQejkd5kp_95AIC8Klp4wFLyEDvbP_NZmzOfNfSHNCPSa8",
      aspect: "portrait",
      description: "Editorial style wedding photography capturing the emotional highlights of the ceremony."
    },
    {
      id: 2,
      title: "Quiet Confidence",
      category: "Portraits",
      subCategory: "Portraits • Studio",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBW-XqRchG1enZOr4Qh03n5_E--qis2aDq25KpXpkU3Zd2qIp_M9tedgLROIybcCpGGm1uxqusuY0U4f13B34_xCC5sccKW-Y_T-Y64wx1h-vIUpNtZkzLM90caCydnJwb_QTjLNNXOmeWRs-GU0fyGOq2UBmoPI0NHayKXs09j-P_owM1oZmtMSvlZmrv4SC4merv04i44DVwhjXEaWz25smWx18r5RWwkvAoXKhLxJlukBgucipeYa2jMolRg_1Im0j4amksUVYHq",
      aspect: "square",
      description: "Studio portraits focused on clean lines, delicate lighting, and authentic expression."
    },
    {
      id: 3,
      title: "Distance & Light",
      category: "Prewedding",
      subCategory: "Prewedding • Architecture",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPpnyNreOiWxPV-QMHlA2IunDlwNY7K9EdQl_DDOIVOjgc7Dcn4YR_fvqmwS8i-iuf_3EQV3tw5teLBC6_KaO8g7ishq9CYsZHhJX7IpJ5KdBpH_PxT1oSqeRID45CH0EzTHJ3vAry0mtGVaIosUgb_mKl6UZuKVd0STNdXvht4KE1FZC2MpgrlLrF9HzttI36khhLn4rJEPQjOp6kH09RUYl77L37VHNSj4XekvjbYjNNXf4hYBVctYDfxOToNHCd7y-sL2pBRwuf",
      aspect: "portrait",
      description: "Prewedding photoshoot matching architecture, framing love in monumental environments."
    },
    {
      id: 4,
      title: "The Culmination",
      category: "Graduation",
      subCategory: "Graduation • Milestone",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAb3PLE5cmDF39Mx3nozwHjRn4tYH9GiTjNUVKNFNnsP4AcLWNkw1dhA8ItQai_Qz-U2O9uI7XE5ySd-17TlCxI4smgOlM9pzLF-uzIZ3ro4J2DuDv1cqDAcKs-7E4iI9_x3P8kHWsm3WNis2izbtewpDIHZxN8nLKoWoJyLZODbgVaO55B2UPeCegCwJ8-W7W8J-HplWm8yrvnTGY7THIOQ1Jzhqf9LSE6g2d3I-45xOoCG436NPA7N_N6qk5kHyZ6o7sr360FHR2l",
      aspect: "wide",
      description: "Capturing the proud milestone of graduation with elegance and dynamic depth."
    },
    {
      id: 5,
      title: "Curated Moments",
      category: "Events",
      subCategory: "Events • Details",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFquGuAOotqRrlO56_aAiB3jr7Mk3dlRq82z6eOF1ljJhJmzQE228XxnV2cTPsTnQYwTVYly75qFugn3BXVK93NBLcIqFo_vV2FH4kt8XaBs80maNxL05eZladF_M7f5QBy9oPLXk0Map1vpj50e0tUiOFtfqa4nbtkJn0wOwDUptPBWTH85wOUTJKS14MggUuf-TTsm6txQCwlS2EBE7IG4RrxqTpVEbyS_mOija3hmLZddIBRj6RRKHx_qa40clUTpr4bB9bQbLT",
      aspect: "portrait",
      description: "Candid event storytelling highlighting details, atmosphere, and natural flow."
    },
    {
      id: 6,
      title: "The Details",
      category: "Wedding",
      subCategory: "Wedding • B&W",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJmiGKVwaTThlLyJlJtnj7cW3IyZxWYaNilqLS951xtRawOZASgqaWYlff5l5ejQNUT2DaTwmOs5CcS9qoFY5xK82y1JtUjKnCsNXP1klI1uO7x_3uQJV0xAy1U8-SgLw7mh-125SGm3GpdO4-tGhXo3OwuZqdqrU5lStsdPjjLW4esKIcatkCy3_iaHPz-G2bVX6x7uS4QZTzdRlaVI-m5w4nVEwMeaJuRFzS6C3JIz3qnB-3_Iu0MF4ETw1fRLKsaVrXo4W4ZyPw",
      aspect: "square",
      description: "Timeless black and white close-up details that build the story of the wedding day."
    },
    {
      id: 7,
      title: "The Main Event",
      category: "Wedding",
      subCategory: "01 • Wedding",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCJtimT1j3d4-PVx7xHWgn2DYhN6L8Bl2myAtaFHOb7r7vn_6oyRX2Dez1gfdnPIcn8GEIOPmOElR3_-u67FhZduHFmBuKSElf1OQ5odoJAGRRdZyYWXvHoFpdlVeFVnLxheHsi5VMHQfzSDFVW781DkEVKgRP729VTSrM7rtO7vLv8M5uOkVLWd2TCSOxNtV6k1jBDj5WqpEcGo0GZjW_HHb0fUM-BNd6KQZk0je79bYXiBo8x1IpOxVj63Xk-XbqAmiAOzi5yTDo",
      aspect: "portrait",
      description: "Hero wedding collection showcasing elegant event design and styling."
    },
    {
      id: 8,
      title: "The Prelude",
      category: "Prewedding",
      subCategory: "02 • Prewedding",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-dGyIedlUDtzm97T6YxpxDWWpxUE_QtuLSe3hDeKC3kjxRQxur1S3yKKV8Nr4uuVUix1OHq84HAk_oBeqkX2M6bWm-i1VGwXHdkfHKa5EH27HhhlLGNiFq1tDE8iXtAU40WoXAZLQjON19uLRLoa3mCjamhQaFXPoF-1_QdHZl0oQQDHBoD38Zq1cfH8q4U7BkjgM2DnU3iUVnnBDN9zwa4nATgrTBMxY0stb_IztypdpQDNppcSTkfo8JPU7j4z98mJOV1eq8slH",
      aspect: "portrait",
      description: "Prewedding stories of romance, closeness, and anticipation."
    },
    {
      id: 9,
      title: "The Individual",
      category: "Portraits",
      subCategory: "03 • Portraits",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-y2iO_u9R60MaruXR8QMXB5m-9Ti8bH4vdhKqR-Okw-QjmIlfkmTsorBjfjLb5_JTqG7IO_4cECBIGlv7WDyKxH-PnA86mkSpgtKb9J8Jo0w1JjTuPmv50xEbhdiVE2RyqGGIdxWPqCzBAt4oVjlhm7J_1v4PRbbUfIxB-N0jqDaqEXeYRUayHLI04KWGB2Kc2B0hNp1mbvjLPomEdL8u2wXa0baYrXHNkuiAuDs4K3S9j7LKM66MVHl19d-mzptdWlDvAe6kdMIE",
      aspect: "portrait",
      description: "Bespoke individual portrait sessions designed for character and editorial profile."
    }
  ];

  for (const item of items) {
    await prisma.gallery.create({
      data: item,
    });
  }

  console.log("Seeding packages...");
  const packages = [
    {
      name: "Signature Wedding",
      category: "Wedding",
      price: 4500,
      priceUnit: "starts at",
      features: [
        "Up to 10 hours of consecutive coverage",
        "Two lead photographers for diverse perspectives",
        "800+ color-graded high-resolution images",
        "Fine Art 10x10 Heirloom Album included",
        "Curated online gallery with print store access"
      ],
      description: "An immersive, all-day documentation of your celebration. Focused on candid emotion, editorial portraiture, and intricate details."
    },
    {
      name: "Artistic Portrait",
      category: "Portraits",
      price: 850,
      priceUnit: "starts at",
      features: [
        "2 hours of on-location or studio shooting",
        "50 hand-retouched editorial images",
        "Creative direction and styling consultation"
      ],
      description: "Editorial sessions for individuals, couples, or personal branding."
    },
    {
      name: "Event Documentation",
      category: "Events",
      price: 400,
      priceUnit: "/ hour",
      features: [
        "Candid, unobtrusive photojournalism style",
        "Rapid 48-hour turnaround for select PR images",
        "Full commercial usage rights included"
      ],
      description: "Discreet, high-end coverage for corporate galas, private dinners, and brand launches."
    },
    {
      name: "Milestone Graduation",
      category: "Graduation",
      price: 600,
      priceUnit: "starts at",
      features: [
        "1.5 hours of outdoor campus session",
        "30 fully edited high-resolution digital files",
        "Individual and family/group portraits included"
      ],
      description: "Premium editorial graduation portraits celebrating your academic milestone."
    }
  ];

  for (const pkg of packages) {
    await prisma.package.create({
      data: pkg
    });
  }

  console.log("Seeding clients and bookings...");
  const client1 = await prisma.client.create({
    data: {
      fullName: "Emma & James",
      email: "emma.james@example.com",
      phoneNumber: "+628123456789",
    }
  });

  const client2 = await prisma.client.create({
    data: {
      fullName: "Marcus Cole",
      email: "marcus.cole@example.com",
      phoneNumber: "+628987654321",
    }
  });

  await prisma.booking.create({
    data: {
      clientId: client1.id,
      packageType: "Wedding",
      bookingDate: new Date("2024-10-15T10:00:00Z"),
      eventDate: new Date("2024-11-20T08:00:00Z"),
      notes: "Outdoor afternoon wedding. Prefers black & white edits.",
      status: "Pending",
    }
  });

  await prisma.booking.create({
    data: {
      clientId: client2.id,
      packageType: "Editorial",
      bookingDate: new Date("2024-09-28T14:00:00Z"),
      eventDate: new Date("2024-10-05T09:00:00Z"),
      notes: "Studio portrait and editorial session.",
      status: "Confirmed",
    }
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
