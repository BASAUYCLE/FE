import bikeTarmac from "../assets/bike-tarmac-sl7.png";
import canyonGrizl from "../assets/CanyonGrizlCFSL.jpg";
import santaCruz from "../assets/SantaCruzNomaCC.png";
import specializedTurboLevo from "../assets/SpecializedTurboLevo.png";

export const productsById = {
  1: {
    id: 1,
    name: "Elite Performance Road SL7",
    brand: "SPECIALIZED",
    year: "2023",
    price: "$8,500",
    originalPrice: "$11,200",
    image: bikeTarmac,
    images: [bikeTarmac, bikeTarmac, bikeTarmac, bikeTarmac, bikeTarmac, bikeTarmac],
    category: "ROAD / CARBON",
    badge: "VERIFIED LISTING",
    specs: {
      frame: "High-Modulus Carbon",
      groupset: "Electronic Di2 12-Speed",
      wheelset: "Aero Carbon 50mm",
      weight: "6.8 kg (Size 54)",
    },
    seller: {
      name: "Alex Rodriguez",
      rating: "4.9",
      reviews: 42,
      location: "Austin, TX",
      shippingEst: "$150",
    },
    description: "Garage kept and meticulously cleaned. Verified mileage: 1,240 miles.",
    history: [
      {
        date: "September 2023",
        title: "Major Performance Service",
        detail: "Drivetrain degrease, new ceramic brake pads, software optimization.",
      },
      {
        date: "January 2022",
        title: "First Purchase",
        detail: "Acquired brand new from flagship concept store in Austin, TX.",
      },
    ],
  },
  2: {
    id: 2,
    name: "Santa Cruz Nomad CC",
    brand: "Santa Cruz",
    year: "2023",
    price: "$5,800",
    image: santaCruz,
    images: [santaCruz, santaCruz, santaCruz, santaCruz, santaCruz, santaCruz],
    category: "MTB / FULL SUSPENSION",
    badge: "INSPECTED",
    specs: {
      frame: "Carbon CC",
      groupset: "FOX Factory",
      weight: "13.5kg",
    },
    seller: {
      name: "Jordan Lee",
      rating: "4.8",
      reviews: 28,
      location: "Portland, OR",
      shippingEst: "$120",
    },
    description: "Trail-ready with top-tier suspension. Low miles.",
    history: [],
  },
  3: {
    id: 3,
    name: "Canyon Grizl CF SLX",
    brand: "CANYON",
    year: "2024",
    price: "$4,800",
    image: canyonGrizl,
    images: [canyonGrizl, canyonGrizl, canyonGrizl, canyonGrizl, canyonGrizl, canyonGrizl],
    category: "GRAVEL / ADVENTURE",
    badge: "AVAILABLE",
    specs: {
      frame: "CF SLX Carbon",
      groupset: "GRX 800",
      size: "L (58cm)",
      weight: "9.8kg",
    },
    seller: {
      name: "Sam Taylor",
      rating: "4.9",
      reviews: 15,
      location: "Denver, CO",
      shippingEst: "$100",
    },
    description: "Adventure-ready gravel bike. Carbon frame, Shimano GRX.",
    history: [],
  },
  4: {
    id: 4,
    name: "TREK MADONE SLR 9",
    brand: "TREK",
    year: "2022",
    price: "$8,200",
    image: santaCruz,
    images: [santaCruz, santaCruz, santaCruz, santaCruz, santaCruz, santaCruz],
    category: "ROAD",
    status: "sold",
    specs: {
      frame: "800 OCLV",
      size: "54cm",
    },
    seller: {
      name: "Chris M.",
      rating: "4.9",
      reviews: 42,
      location: "Austin, TX",
      shippingEst: "$150",
    },
  },
  5: {
    id: 5,
    name: "Specialized Turbo Levo",
    brand: "Specialized",
    year: "2024",
    price: "$8,100",
    image: specializedTurboLevo,
    images: [specializedTurboLevo, specializedTurboLevo, specializedTurboLevo, specializedTurboLevo, specializedTurboLevo, specializedTurboLevo],
    category: "E-MTB / ELECTRIC",
    badge: "TOP RATED",
    specs: {
      frame: "Aluminum",
      groupset: "Brose 2.2",
      motorPower: "700Wh",
      weight: "22.5kg",
    },
    seller: {
      name: "Mike R.",
      rating: "4.7",
      reviews: 33,
      location: "Seattle, WA",
      shippingEst: "$180",
    },
  },
};

export function getProductById(id) {
  return productsById[id] || null;
}
