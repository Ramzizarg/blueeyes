export type Slide = {
  id: string;
  title: string;
  subtitle: string;
  cta?: string;
  image: string;
  imageWebp: string;
  mobileImage: string;
  mobileImageWebp: string;
  imageAlt: string;
};

export const slides: Slide[] = [
  {
    id: "vision",
    title: "blueeyes.",
    subtitle:
      "I design cinematic websites that look premium and feel inevitable — so your brand is remembered, and the right clients reach out.",
    cta: "Discuss your project",
    image: "/slides/hero-01.jpg",
    imageWebp: "/slides/hero-01.webp",
    mobileImage: "/slides/hero-01-mobile.jpg",
    mobileImageWebp: "/slides/hero-01-mobile.webp",
    imageAlt: "White vintage sports car floating in a pink cloud of smoke",
  },
  {
    id: "identity",
    title: "websites that\nfeel premium",
    subtitle:
      "Custom Next.js sites with refined typography, soft motion, and a visual language clients remember.",
    image: "/slides/hero-02.jpg",
    imageWebp: "/slides/hero-02.webp",
    mobileImage: "/slides/hero-02-mobile.jpg",
    mobileImageWebp: "/slides/hero-02-mobile.webp",
    imageAlt: "Two travelers on a pink dune facing a giant pastel planet",
  },
  {
    id: "experience",
    title: "built to connect\nyou with clients",
    subtitle:
      "From first impression to contact — interfaces shaped so the right people reach out with confidence.",
    image: "/slides/hero-03.jpg",
    imageWebp: "/slides/hero-03.webp",
    mobileImage: "/slides/hero-03-mobile.jpg",
    mobileImageWebp: "/slides/hero-03-mobile.webp",
    imageAlt: "Astronaut floating among soft pink clouds and white birds",
  },
  {
    id: "memory",
    title: "let’s craft your\nnext website",
    subtitle:
      "Strategy, design, and development in one place — so your brand looks sharp and your inbox fills with the right leads.",
    cta: "Start a project",
    image: "/slides/hero-04.jpg",
    imageWebp: "/slides/hero-04.webp",
    mobileImage: "/slides/hero-04-mobile.jpg",
    mobileImageWebp: "/slides/hero-04-mobile.webp",
    imageAlt: "Beige boots floating above a sea of lilac clouds",
  },
];
