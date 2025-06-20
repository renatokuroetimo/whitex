export interface City {
  id: string;
  name: string;
  stateId: string;
}

export interface State {
  id: string;
  name: string;
  abbreviation: string;
}

export const brazilStates: State[] = [
  { id: "AC", name: "Acre", abbreviation: "AC" },
  { id: "AL", name: "Alagoas", abbreviation: "AL" },
  { id: "AP", name: "Amapá", abbreviation: "AP" },
  { id: "AM", name: "Amazonas", abbreviation: "AM" },
  { id: "BA", name: "Bahia", abbreviation: "BA" },
  { id: "CE", name: "Ceará", abbreviation: "CE" },
  { id: "DF", name: "Distrito Federal", abbreviation: "DF" },
  { id: "ES", name: "Espírito Santo", abbreviation: "ES" },
  { id: "GO", name: "Goiás", abbreviation: "GO" },
  { id: "MA", name: "Maranhão", abbreviation: "MA" },
  { id: "MT", name: "Mato Grosso", abbreviation: "MT" },
  { id: "MS", name: "Mato Grosso do Sul", abbreviation: "MS" },
  { id: "MG", name: "Minas Gerais", abbreviation: "MG" },
  { id: "PA", name: "Pará", abbreviation: "PA" },
  { id: "PB", name: "Paraíba", abbreviation: "PB" },
  { id: "PR", name: "Paraná", abbreviation: "PR" },
  { id: "PE", name: "Pernambuco", abbreviation: "PE" },
  { id: "PI", name: "Piauí", abbreviation: "PI" },
  { id: "RJ", name: "Rio de Janeiro", abbreviation: "RJ" },
  { id: "RN", name: "Rio Grande do Norte", abbreviation: "RN" },
  { id: "RS", name: "Rio Grande do Sul", abbreviation: "RS" },
  { id: "RO", name: "Rondônia", abbreviation: "RO" },
  { id: "RR", name: "Roraima", abbreviation: "RR" },
  { id: "SC", name: "Santa Catarina", abbreviation: "SC" },
  { id: "SP", name: "São Paulo", abbreviation: "SP" },
  { id: "SE", name: "Sergipe", abbreviation: "SE" },
  { id: "TO", name: "Tocantins", abbreviation: "TO" },
];

export const brazilCities: Record<string, string[]> = {
  SP: [
    "São Paulo",
    "Guarulhos",
    "Campinas",
    "São Bernardo do Campo",
    "Santo André",
    "Osasco",
    "Ribeirão Preto",
    "Sorocaba",
    "Santos",
    "São José dos Campos",
    "Mauá",
    "São Vicente",
    "Piracicaba",
    "Carapicuíba",
    "Bauru",
    "Jundiaí",
    "Franca",
    "São Carlos",
    "Praia Grande",
    "Limeira",
    "Suzano",
    "Taboão da Serra",
    "Diadema",
    "Embu das Artes",
    "Indaiatuba",
    "Cotia",
    "Americana",
    "Araraquara",
    "Jacareí",
    "Presidente Prudente",
    "Hortolândia",
    "Rio Claro",
    "Marília",
    "Taubaté",
    "Araçatuba",
    "Volta Redonda",
    "Guarujá",
    "Itaquaquecetuba",
    "Francisco Morato",
    "Itu",
    "Bragança Paulista",
    "Pindamonhangaba",
    "São Caetano do Sul",
    "Ferraz de Vasconcelos",
    "Salto",
    "Ourinhos",
    "Botucatu",
    "Catanduva",
    "Assis",
    "Barretos",
    "Guaratinguetá",
    "Leme",
    "Valinhos",
    "Vinhedo",
    "Jales",
    "São João da Boa Vista",
    "Avaré",
    "Atibaia",
    "Caraguatatuba",
    "Mococa",
    "Jaú",
    "Lins",
    "Monte Alto",
    "Tupã",
    "São Sebastião",
    "Adamantina",
    "Bebedouro",
    "Cataguases",
    "Registro",
    "Cruzeiro",
    "Votuporanga",
    "São José do Rio Preto",
    "Fernandópolis",
    "Orlândia",
    "Santa Bárbara d'Oeste",
    "Nova Odessa",
    "Sumaré",
    "Paulínia",
    "Monte Mor",
    "Holambra",
    "Cosmópolis",
    "Artur Nogueira",
    "Engenheiro Coelho",
    "Jaguariúna",
    "Pedreira",
    "Conchal",
    "Mogi Mirim",
    "Itapira",
    "Águas de Lindóia",
    "Lindóia",
    "Serra Negra",
    "Socorro",
  ],
  RJ: [
    "Rio de Janeiro",
    "São Gonçalo",
    "Duque de Caxias",
    "Nova Iguaçu",
    "Niterói",
    "Campos dos Goytacazes",
    "Belford Roxo",
    "São João de Meriti",
    "Petrópolis",
    "Volta Redonda",
    "Magé",
    "Macaé",
    "Itaboraí",
    "Cabo Frio",
    "Angra dos Reis",
    "Nova Friburgo",
    "Barra Mansa",
    "Teresópolis",
    "Mesquita",
    "Nilópolis",
  ],
  MG: [
    "Belo Horizonte",
    "Uberlândia",
    "Contagem",
    "Juiz de Fora",
    "Betim",
    "Montes Claros",
    "Ribeirão das Neves",
    "Uberaba",
    "Governador Valadares",
    "Ipatinga",
    "Sete Lagoas",
    "Divinópolis",
    "Santa Luzia",
    "Ibirité",
    "Poços de Caldas",
    "Patos de Minas",
    "Pouso Alegre",
    "Teófilo Otoni",
    "Barbacena",
    "Sabará",
  ],
  // Adicionando algumas cidades principais para outros estados
  BA: [
    "Salvador",
    "Feira de Santana",
    "Vitória da Conquista",
    "Camaçari",
    "Juazeiro",
    "Ilhéus",
    "Itabuna",
    "Lauro de Freitas",
  ],
  PR: [
    "Curitiba",
    "Londrina",
    "Maringá",
    "Ponta Grossa",
    "Cascavel",
    "São José dos Pinhais",
    "Foz do Iguaçu",
    "Colombo",
  ],
  RS: [
    "Porto Alegre",
    "Caxias do Sul",
    "Pelotas",
    "Canoas",
    "Santa Maria",
    "Gravataí",
    "Viamão",
    "Novo Hamburgo",
  ],
  PE: [
    "Recife",
    "Jaboatão dos Guararapes",
    "Olinda",
    "Caruaru",
    "Petrolina",
    "Paulista",
    "Cabo de Santo Agostinho",
  ],
  CE: [
    "Fortaleza",
    "Caucaia",
    "Juazeiro do Norte",
    "Maracanaú",
    "Sobral",
    "Crato",
    "Itapipoca",
    "Maranguape",
  ],
  SC: [
    "Florianópolis",
    "Joinville",
    "Blumenau",
    "São José",
    "Criciúma",
    "Chapecó",
    "Itajaí",
    "Lages",
  ],
  GO: [
    "Goiânia",
    "Aparecida de Goiânia",
    "Anápolis",
    "Rio Verde",
    "Luziânia",
    "Águas Lindas de Goiás",
  ],
  MA: [
    "São Luís",
    "Imperatriz",
    "São José de Ribamar",
    "Timon",
    "Caxias",
    "Codó",
    "Paço do Lumiar",
  ],
  PB: [
    "João Pessoa",
    "Campina Grande",
    "Santa Rita",
    "Patos",
    "Bayeux",
    "Sousa",
    "Cajazeiras",
  ],
  PA: [
    "Belém",
    "Ananindeua",
    "Santarém",
    "Marabá",
    "Parauapebas",
    "Castanhal",
    "Abaetetuba",
  ],
  ES: [
    "Vila Velha",
    "Serra",
    "Cariacica",
    "Vitória",
    "Cachoeiro de Itapemirim",
    "Linhares",
    "São Mateus",
  ],
  RN: [
    "Natal",
    "Mossoró",
    "Parnamirim",
    "São Gonçalo do Amarante",
    "Macaíba",
    "Ceará-Mirim",
  ],
  MT: [
    "Cuiabá",
    "Várzea Grande",
    "Rondonópolis",
    "Sinop",
    "Tangará da Serra",
    "Cáceres",
  ],
  MS: [
    "Campo Grande",
    "Dourados",
    "Três Lagoas",
    "Corumbá",
    "Ponta Porã",
    "Naviraí",
  ],
  AL: [
    "Maceió",
    "Arapiraca",
    "Rio Largo",
    "Palmeira dos Índios",
    "União dos Palmares",
  ],
  DF: [
    "Brasília",
    "Gama",
    "Taguatinga",
    "Ceilândia",
    "Sobradinho",
    "Planaltina",
  ],
  SE: [
    "Aracaju",
    "Nossa Senhora do Socorro",
    "Lagarto",
    "Itabaiana",
    "Estância",
  ],
  TO: [
    "Palmas",
    "Araguaína",
    "Gurupi",
    "Porto Nacional",
    "Paraíso do Tocantins",
  ],
  RO: [
    "Porto Velho",
    "Ji-Paraná",
    "Ariquemes",
    "Vilhena",
    "Cacoal",
    "Rolim de Moura",
  ],
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre", "Mucajaí"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tefé"],
  PI: ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior"],
};

export const getCitiesByState = (stateId: string): string[] => {
  if (!stateId || stateId.trim() === "") {
    return [];
  }

  const cities = brazilCities[stateId.toUpperCase()];
  console.log(
    `Getting cities for state: ${stateId}, found: ${cities?.length || 0} cities`,
  );

  return cities ? [...cities].sort() : [];
};
