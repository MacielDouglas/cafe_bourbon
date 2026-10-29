import type { ProductType } from "@/modules/catalog/domain/value-objects";

export type AssistantTopic = ProductType | "GENERAL";

export const TOPIC_KEYWORDS: Record<ProductType, readonly string[]> = {
  COFFEE: [
    "cafe",
    "cafes",
    "cafezinho",
    "espresso",
    "expresso",
    "coado",
    "coador",
    "moka",
    "aeropress",
    "prensa",
    "grao",
    "graos",
    "arabica",
    "conilon",
    "robusta",
    "torra",
    "torrado",
    "cappuccino",
    "latte",
    "macchiato",
    "cafeteira",
    "moagem",
    "moido",
    "mantiqueira",
    "cerrado",
    "mogiana",
    "caparao",
  ],
  CHEESE: [
    "queijo",
    "queijos",
    "queijista",
    "frescal",
    "curado",
    "curada",
    "maturado",
    "maturada",
    "gorgonzola",
    "brie",
    "camembert",
    "parmesao",
    "mussarela",
    "mozarela",
    "muzzarella",
    "canastra",
    "coalho",
    "provolone",
    "pecorino",
    "gruyere",
    "emmental",
    "burrata",
    "ricota",
    "requeijao",
  ],
  WINE: [
    "vinho",
    "vinhos",
    "vinicola",
    "tinto",
    "tintos",
    "espumante",
    "espumantes",
    "champagne",
    "champanhe",
    "prosecco",
    "cabernet",
    "merlot",
    "chardonnay",
    "sauvignon",
    "tannat",
    "syrah",
    "pinot",
    "malbec",
    "bordeaux",
    "borgonha",
    "uva",
    "uvas",
    "safra",
    "sommelier",
  ],
};

const TASTE_KEYWORDS = [
  "frutado",
  "frutada",
  "frutas",
  "floral",
  "citrico",
  "citrica",
  "amadeirado",
  "amadeirada",
  "achocolatado",
  "chocolate",
  "caramelo",
  "nozes",
  "especiarias",
  "melado",
  "framboesa",
  "amendoa",
  "manteiga",
  "doce",
  "doces",
  "seco",
  "seca",
  "suave",
  "leve",
  "encorpado",
  "encorpada",
  "acido",
  "acida",
  "acidez",
  "intensidade",
  "corpo",
  "notas",
  "aroma",
  "aromas",
  "sabor",
  "sabores",
  "paladar",
  "harmoniza",
  "harmonizam",
  "harmonizacao",
  "harmonizacoes",
  "harmonizar",
  "combina",
  "combinam",
  "combinacao",
  "acompanha",
  "acompanhamento",
  "par",
  "pares",
  "trio",
  "mesa",
  "degustacao",
  "provar",
  "experimentar",
  "preparo",
  "preparar",
  "metodo",
] as const;

const COMMERCE_KEYWORDS = [
  "catalogo",
  "produto",
  "produtos",
  "preco",
  "precos",
  "custa",
  "custo",
  "comprar",
  "compra",
  "carrinho",
  "assinatura",
  "assinar",
  "kit",
  "presente",
  "estoque",
  "disponivel",
  "recomenda",
  "recomendacao",
  "recomendar",
  "recomende",
  "sugere",
  "sugestao",
  "sugerir",
  "sugira",
  "escolher",
  "escolha",
  "selecao",
  "selecione",
  "experiencia",
  "monte",
  "montar",
  "opcao",
  "opcoes",
  "favorito",
  "favorita",
  "ajude",
  "ajuda",
] as const;

const OFF_TOPIC_KEYWORDS = [
  "filme",
  "filmes",
  "serie",
  "series",
  "musica",
  "musicas",
  "novela",
  "politica",
  "presidente",
  "eleicao",
  "futebol",
  "esporte",
  "esportes",
  "jogo",
  "jogos",
  "aposta",
  "carro",
  "carros",
  "viagem",
  "viagens",
  "receita",
  "bolo",
  "programacao",
  "python",
  "javascript",
  "codigo",
  "computador",
  "celular",
  "internet",
  "saude",
  "medico",
  "remedio",
  "doenca",
  "investimento",
  "bolsa",
  "clima",
  "previsao",
  "noticia",
  "noticias",
  "piada",
  "namoro",
  "relacionamento",
  "horario",
  "funcionamento",
  "endereco",
  "telefone",
  "whatsapp",
  "traducao",
  "matematica",
  "fisica",
  "quimica",
  "humano",
  "humana",
  "celebridade",
  "meme",
] as const;

const STOPWORDS = new Set([
  "a",
  "o",
  "as",
  "os",
  "e",
  "ou",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "por",
  "para",
  "com",
  "sem",
  "que",
  "uma",
  "um",
  "uns",
  "umas",
  "pelo",
  "pela",
  "the",
  "and",
  "quero",
  "voce",
  "meu",
  "minha",
  "sobre",
  "como",
  "qual",
  "quais",
  "preciso",
  "gosto",
  "algo",
  "aqui",
  "tem",
  "ter",
  "ser",
  "sou",
  "me",
  "mim",
  "se",
  "ja",
  "mais",
  "muito",
  "pouco",
  "bom",
  "boa",
]);

export function normalizeAssistantText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function tokenizeAssistantMessage(message: string): string[] {
  return normalizeAssistantText(message)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

export function detectAssistantTopic(message: string): AssistantTopic {
  const tokens = tokenizeAssistantMessage(message);
  let topic: AssistantTopic = "GENERAL";
  let firstMatch = Number.POSITIVE_INFINITY;

  for (const type of Object.keys(TOPIC_KEYWORDS) as ProductType[]) {
    const keywords = TOPIC_KEYWORDS[type];
    const match = tokens.findIndex((token) => keywords.includes(token));
    if (match !== -1 && match < firstMatch) {
      topic = type;
      firstMatch = match;
    }
  }

  return topic;
}

export function isAssistantMessageInScope(message: string): boolean {
  const tokens = tokenizeAssistantMessage(message);
  if (tokens.length === 0) return false;

  const hasTopic = (Object.keys(TOPIC_KEYWORDS) as ProductType[]).some((type) =>
    TOPIC_KEYWORDS[type].some((keyword) => tokens.includes(keyword)),
  );
  if (hasTopic) return true;

  if (OFF_TOPIC_KEYWORDS.some((keyword) => tokens.includes(keyword))) {
    return false;
  }

  if (TASTE_KEYWORDS.some((keyword) => tokens.includes(keyword))) {
    return true;
  }

  return COMMERCE_KEYWORDS.some((keyword) => tokens.includes(keyword));
}
