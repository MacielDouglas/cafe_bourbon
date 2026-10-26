import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashPassword } from "better-auth/crypto";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL ausente. Copie env.example para .env e preencha as credenciais do Neon.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: DATABASE_URL }),
});

interface SeedBase {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  stock?: number;
  available: boolean;
  isDemoData: boolean;
}

interface SeedCoffee extends SeedBase {
  type: "COFFEE";
  profile: {
    origin: string;
    variety: string | null;
    process: string | null;
    roastLevel: number;
    intensity: number;
    acidity: number;
    body: number;
    notes: string[];
    brewMethods: string[];
  };
}

interface SeedCheese extends SeedBase {
  type: "CHEESE";
  profile: {
    milkType: string;
    style: string;
    agingDays: number | null;
    texture: string;
    intensity: number;
    acidity: number;
    notes: string[];
    origin: string | null;
  };
}

interface SeedWine extends SeedBase {
  type: "WINE";
  profile: {
    grapes: string[];
    region: string | null;
    style: string;
    vintage: number | null;
    body: number;
    acidity: number;
    tannins: number | null;
    notes: string[];
    alcoholPct: number | null;
  };
}

type SeedProduct = SeedCoffee | SeedCheese | SeedWine;

const ALL_METHODS = ["EXPRESSO", "COADO", "MOKA", "FRENCH_PRESS", "AEROPRESS"];

const coffees: SeedCoffee[] = [
  {
    type: "COFFEE",
    slug: "cafe-do-brasil",
    name: "Café do Brasil",
    description:
      "Nosso carro-chefe e mais vendido. Doçura alta, corpo aveludado e acidez cítrica. Aromas de pitanga, chá preto e curau de milho.",
    priceCents: 2000,
    imageUrl: "/images/cafes/cafe-do-brasil.jpg",
    available: true,
    isDemoData: false,
    profile: {
      origin: "Brasil",
      variety: null,
      process: null,
      roastLevel: 3,
      intensity: 3,
      acidity: 4,
      body: 4,
      notes: ["pitanga", "chá preto", "curau de milho"],
      brewMethods: ALL_METHODS,
    },
  },
  {
    type: "COFFEE",
    slug: "cafe-cubano",
    name: "Café Cubano",
    description:
      "Excusividade caribenha, difícil de conseguir. Cultivado nas regiões Sierra Maestra e Sierra del Escambray. Corpo macio e acidez cítrica elegante, com aromas de caramelo, frutas negras, rapadura e chá preto.",
    priceCents: 2600,
    imageUrl: "/images/cafes/cafe-cubano.jpg",
    available: true,
    isDemoData: false,
    profile: {
      origin: "Cuba",
      variety: null,
      process: null,
      roastLevel: 3,
      intensity: 4,
      acidity: 4,
      body: 3,
      notes: ["caramelo", "frutas negras", "rapadura", "chá preto"],
      brewMethods: ["EXPRESSO", "MOKA", "COADO"],
    },
  },
  {
    type: "COFFEE",
    slug: "cafe-papua-nova-guine",
    name: "Café Papua Nova Guiné",
    description:
      "Aroma rico e vibrante que combina o sabor frutado às notas profundas da torra. Adocicado, de corpo leve, com framboesa, pêssego e frutas frescas.",
    priceCents: 2800,
    imageUrl: "/images/cafes/cafe-papua.jpg",
    available: true,
    isDemoData: false,
    profile: {
      origin: "Papua Nova Guiné",
      variety: null,
      process: null,
      roastLevel: 2,
      intensity: 2,
      acidity: 3,
      body: 2,
      notes: ["framboesa", "pêssego", "frutas frescas", "amêndoa"],
      brewMethods: ["COADO", "AEROPRESS", "FRENCH_PRESS"],
    },
  },
  {
    type: "COFFEE",
    slug: "cafe-colombiano-medellin",
    name: "Café Colombiano (Medellín)",
    description:
      "Saboroso e requintado: acidez cítrica e málica, doçura de melado e corpo macio. Aromas de frutas amarelas, tangerina, nozes e especiarias.",
    priceCents: 2600,
    imageUrl: "/images/cafes/cafe-colombiano.jpg",
    available: true,
    isDemoData: false,
    profile: {
      origin: "Colômbia (Medellín)",
      variety: null,
      process: null,
      roastLevel: 3,
      intensity: 3,
      acidity: 4,
      body: 3,
      notes: ["frutas amarelas", "tangerina", "nozes", "especiarias", "melado"],
      brewMethods: ["EXPRESSO", "COADO", "MOKA"],
    },
  },
];

const cheeses: SeedCheese[] = [
  {
    type: "CHEESE",
    slug: "queijo-frescal",
    name: "Queijo Frescal",
    description:
      "Queijo jovem e suave, de textura macia e laticínios frescos. Base clássica para harmonizações leves com cafés de corpo delicado.",
    priceCents: 1800,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      milkType: "Vaca",
      style: "Frescal",
      agingDays: 7,
      texture: "Fresca",
      intensity: 1,
      acidity: 4,
      notes: ["lacticidade", "creme fresco"],
      origin: null,
    },
  },
  {
    type: "CHEESE",
    slug: "queijo-meia-cura",
    name: "Queijo Meia-Cura",
    description:
      "Maturação curta com textura semidura e notas de manteiga e nozes. O intermediário ideal entre fresco e curado.",
    priceCents: 2400,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      milkType: "Vaca",
      style: "Meia-cura",
      agingDays: 21,
      texture: "Semidura",
      intensity: 2,
      acidity: 3,
      notes: ["manteiga", "nozes"],
      origin: null,
    },
  },
  {
    type: "CHEESE",
    slug: "queijo-curado",
    name: "Queijo Curado",
    description:
      "Cura longa, textura firme e intensidade alta. Acompanha cafés de torra mais escura e vinhos encorpados.",
    priceCents: 3200,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      milkType: "Vaca",
      style: "Curado",
      agingDays: 120,
      texture: "Dura",
      intensity: 4,
      acidity: 2,
      notes: ["aminoácidos", "castanhas secas"],
      origin: null,
    },
  },
  {
    type: "CHEESE",
    slug: "queijo-cremoso-branco",
    name: "Queijo Cremoso Branco",
    description:
      "Massa mole, cremosa e delicada. Perfil amanteigado que valoriza cafés de torra média.",
    priceCents: 2200,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      milkType: "Vaca",
      style: "Massa mole",
      agingDays: 14,
      texture: "Cremosa",
      intensity: 2,
      acidity: 4,
      notes: ["creme", "lacticidade"],
      origin: null,
    },
  },
  {
    type: "CHEESE",
    slug: "queijo-cabra-fresco",
    name: "Queijo de Cabra Fresco",
    description:
      "Acidez vibrante e final erbáceo. Excelente contraste com cafés frutados e doces.",
    priceCents: 2600,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      milkType: "Cabra",
      style: "Fresco",
      agingDays: 5,
      texture: "Fresca",
      intensity: 2,
      acidity: 5,
      notes: ["lacticidade", "erbáceo"],
      origin: null,
    },
  },
  {
    type: "CHEESE",
    slug: "queijo-azul",
    name: "Queijo Azul",
    description:
      "Maturação com mofo azul, intensidade marcante e toques picantes e minerais. Para paladares experientes.",
    priceCents: 3400,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      milkType: "Vaca",
      style: "Mofado",
      agingDays: 60,
      texture: "Cremosa",
      intensity: 5,
      acidity: 3,
      notes: ["picante", "mineral", "salgado"],
      origin: null,
    },
  },
];

const wines: SeedWine[] = [
  {
    type: "WINE",
    slug: "tinto-encorpado",
    name: "Tinto Encorpado",
    description:
      "Tinto de corpo alto e taninos firmes, com notas de cassis, cedro e especiarias. Feito para queijos intensos.",
    priceCents: 6800,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      grapes: ["Cabernet Sauvignon"],
      region: null,
      style: "Tinto encorpado",
      vintage: null,
      body: 5,
      acidity: 3,
      tannins: 5,
      notes: ["cassis", "cedro", "especiarias"],
      alcoholPct: 13.5,
    },
  },
  {
    type: "WINE",
    slug: "tinto-frutado",
    name: "Tinto Frutado",
    description:
      "Corpo médio e taninos macios, com frutas vermelhas de ameixa e cereja. Versátil na mesa.",
    priceCents: 5400,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      grapes: ["Merlot"],
      region: null,
      style: "Tinto frutado",
      vintage: null,
      body: 3,
      acidity: 3,
      tannins: 3,
      notes: ["ameixa", "cereja"],
      alcoholPct: 13,
    },
  },
  {
    type: "WINE",
    slug: "tinto-elegante",
    name: "Tinto Elegante",
    description:
      "Leve e aromático, de taninos sutis e acidez viva. Notas de framboesa e terra.",
    priceCents: 7200,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      grapes: ["Pinot Noir"],
      region: null,
      style: "Tinto leve",
      vintage: null,
      body: 2,
      acidity: 4,
      tannins: 2,
      notes: ["framboesa", "terroso"],
      alcoholPct: 12.5,
    },
  },
  {
    type: "WINE",
    slug: "branco-seco",
    name: "Branco Seco",
    description:
      "Branco de corpo médio e perfil frutado, com toques de pera e manteiga. Equilíbrio entre frescor e estrutura.",
    priceCents: 5800,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      grapes: ["Chardonnay"],
      region: null,
      style: "Branco seco",
      vintage: null,
      body: 3,
      acidity: 3,
      tannins: null,
      notes: ["pera", "manteiga"],
      alcoholPct: 13,
    },
  },
  {
    type: "WINE",
    slug: "branco-citrico",
    name: "Branco Cítrico",
    description:
      "Branco leve e refrescante, de acidez alta e notas de limão e capim. Perfeito com queijos frescos.",
    priceCents: 6200,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      grapes: ["Sauvignon Blanc"],
      region: null,
      style: "Branco cítrico",
      vintage: null,
      body: 2,
      acidity: 5,
      tannins: null,
      notes: ["limão", "capim"],
      alcoholPct: 12,
    },
  },
  {
    type: "WINE",
    slug: "espumante-brut",
    name: "Espumante Brut",
    description:
      "Espumante seco, leve e efervescente, com notas de maçã e tostado. Abre bem qualquer degustação.",
    priceCents: 7900,
    imageUrl: null,
    available: true,
    isDemoData: true,
    profile: {
      grapes: ["Chardonnay", "Pinot Noir"],
      region: null,
      style: "Espumante brut",
      vintage: null,
      body: 2,
      acidity: 5,
      tannins: null,
      notes: ["maçã", "tostado"],
      alcoholPct: 12,
    },
  },
];

const products: SeedProduct[] = [...coffees, ...cheeses, ...wines];

interface SeedPairing {
  id: string;
  slugs: string[];
  origin: "EDITORIAL";
  score: number;
  detail: string;
}

const pairings: SeedPairing[] = [
  {
    id: "pair-editorial-brasil-meia-cura",
    slugs: ["cafe-do-brasil", "queijo-meia-cura"],
    origin: "EDITORIAL",
    score: 84,
    detail: "Torra média e corpo aveludado encontram perfil amanteigado de nozes.",
  },
  {
    id: "pair-editorial-cubano-curado",
    slugs: ["cafe-cubano", "queijo-curado"],
    origin: "EDITORIAL",
    score: 82,
    detail: "Doçura de rapadura e caramelo equilibra a intensidade do queijo curado.",
  },
  {
    id: "pair-editorial-tinto-curado",
    slugs: ["tinto-encorpado", "queijo-curado"],
    origin: "EDITORIAL",
    score: 86,
    detail: "Taninos firmes e corpo alto dialogam com intensidade e maturação longas.",
  },
  {
    id: "pair-editorial-colombiano-cremoso",
    slugs: ["cafe-colombiano-medellin", "queijo-cremoso-branco"],
    origin: "EDITORIAL",
    score: 80,
    detail: "Doçura de melado e acidez cítrica valorizam a textura amanteigada.",
  },
  {
    id: "pair-editorial-papua-cabra",
    slugs: ["cafe-papua-nova-guine", "queijo-cabra-fresco"],
    origin: "EDITORIAL",
    score: 76,
    detail: "Notas frutadas do café encontram a acidez vibrante do queijo de cabra.",
  },
  {
    id: "pair-editorial-branco-frescal",
    slugs: ["branco-citrico", "queijo-frescal"],
    origin: "EDITORIAL",
    score: 78,
    detail: "Acidez cítrica do vinho refresca o perfil lático do queijo frescal.",
  },
  {
    id: "pair-editorial-trio-brasil-meia-cura-frutado",
    slugs: ["cafe-do-brasil", "queijo-meia-cura", "tinto-frutado"],
    origin: "EDITORIAL",
    score: 82,
    detail: "Degustação equilibrada: café médio, queijo amanteigado e tinto frutado.",
  },
  {
    id: "pair-editorial-trio-cubano-curado-encorpado",
    slugs: ["cafe-cubano", "queijo-curado", "tinto-encorpado"],
    origin: "EDITORIAL",
    score: 85,
    detail: "Trio de intensidade alta para paladares que buscam contraste e potência.",
  },
];

async function upsertProduct(seed: SeedProduct): Promise<string> {
  const base = {
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    type: seed.type,
    priceCents: seed.priceCents,
    imageUrl: seed.imageUrl,
    stock: seed.stock ?? 50,
    available: seed.available,
    isDemoData: seed.isDemoData,
  };
  const product = await prisma.product.upsert({
    where: { slug: seed.slug },
    update: {
      name: base.name,
      description: base.description,
      type: base.type,
      priceCents: base.priceCents,
      imageUrl: base.imageUrl,
      available: base.available,
      isDemoData: base.isDemoData,
    },
    create: base,
  });
  if (seed.type === "COFFEE") {
    await prisma.coffeeProfile.upsert({
      where: { productId: product.id },
      update: seed.profile,
      create: { ...seed.profile, productId: product.id },
    });
  } else if (seed.type === "CHEESE") {
    await prisma.cheeseProfile.upsert({
      where: { productId: product.id },
      update: seed.profile,
      create: { ...seed.profile, productId: product.id },
    });
  } else {
    await prisma.wineProfile.upsert({
      where: { productId: product.id },
      update: seed.profile,
      create: { ...seed.profile, productId: product.id },
    });
  }
  return product.id;
}

async function seedOwner(): Promise<void> {
  const email = "coffeemen@coffee.com";
  const name = "CoffeMen";
  const password = "teste1234";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "OWNER" },
    create: { name, email, role: "OWNER", emailVerified: true },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: await hashPassword(password),
      },
    });
    console.log(`Usuário owner criado: ${email} (senha inicial: ${password}).`);
    return;
  }

  console.log(`Usuário owner já existe: ${email} (senha preservada).`);
}

async function main() {
  const idBySlug = new Map<string, string>();
  for (const seed of products) {
    idBySlug.set(seed.slug, await upsertProduct(seed));
  }

  for (const pairing of pairings) {
    const productIds = pairing.slugs.map((slug) => {
      const id = idBySlug.get(slug);
      if (!id) throw new Error(`Slug desconhecido no seed: ${slug}`);
      return id;
    });
    const score = pairing.score;
    const criteria = [
      {
        rule: "editorial-curation",
        points: score,
        max: 100,
        detail: `Curadoria editorial: ${pairing.detail}`,
      },
    ];
    const explanation =
      productIds.length === 3
        ? `Harmonização editorial (heurística revisada por curadoria, ${score}/100): ${pairing.detail}.`
        : `Harmonização editorial (heurística revisada por curadoria, ${score}/100): ${pairing.detail}.`;
    await prisma.pairing.upsert({
      where: { id: pairing.id },
      update: { productIds, score, criteria, explanation, published: true },
      create: {
        id: pairing.id,
        productIds,
        origin: pairing.origin,
        score,
        criteria,
        explanation,
        published: true,
      },
    });
  }

  console.log(
    `Seed concluído: ${products.length} produtos e ${pairings.length} harmonizações editoriais.`,
  );

  await seedOwner();
}

main()
  .catch((error) => {
    console.error("Falha no seed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
