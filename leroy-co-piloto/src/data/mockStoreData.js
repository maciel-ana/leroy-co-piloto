/**
 * @license
 */

export const PRODUTOS_CATALOGO = [
  // Corredor A01 - Construção Pesada & Argamassas
  {
    id: 'prod-01',
    sku: 'LM-892110',
    nome: 'Argamassa ACIII Cinza 20kg Quartzolit',
    categoria: 'MATERIAIS_CONSTRUCAO',
    corredor: 'A01',
    ordemCorredor: 10,
    moduloGondola: 'Gôndola 01',
    prateleira: 'Nível 1 (Palete Térreo)',
    preco: 36.90,
    estoqueDisponivel: 0, 
    especificacaoTecnica: 'Para porcelanatos internos e externos até 120x120cm. Alto rendimento.',
    substitutosSugeridosSkus: ['LM-892112'],
    marca: 'Quartzolit'
  },
  {
    id: 'prod-02',
    sku: 'LM-892112',
    nome: 'Argamassa ACIII Branca 20kg Votoran',
    categoria: 'MATERIAIS_CONSTRUCAO',
    corredor: 'A01',
    ordemCorredor: 12,
    moduloGondola: 'Gôndola 01',
    prateleira: 'Nível 1 (Palete Térreo)',
    preco: 39.50,
    estoqueDisponivel: 18,
    especificacaoTecnica: 'Argamassa colante especial para mármores, granitos e porcelanatos.',
    substitutosSugeridosSkus: ['LM-892110'],
    marca: 'Votorantim'
  },
  {
    id: 'prod-03',
    sku: 'LM-892115',
    nome: 'Argamassa ACII Interna e Externa 20kg Fortaleza',
    categoria: 'MATERIAIS_CONSTRUCAO',
    corredor: 'A01',
    ordemCorredor: 14,
    moduloGondola: 'Gôndola 02',
    prateleira: 'Nível 1 (Palete Térreo)',
    preco: 28.90,
    estoqueDisponivel: 45,
    especificacaoTecnica: 'Cerâmicas em pisos e paredes de áreas internas e externas.',
    substitutosSugeridosSkus: [],
    marca: 'Fortaleza'
  },

  // Corredor A03 - Hidráulica Básica & Esgoto
  {
    id: 'prod-04',
    sku: 'LM-781044',
    nome: 'Tubo PVC Esgoto Série Normal 100mm 3m Tigre',
    categoria: 'HIDRAULICA',
    corredor: 'A03',
    ordemCorredor: 20,
    moduloGondola: 'Gôndola 03',
    prateleira: 'Porta-Palete Superior',
    preco: 47.90,
    estoqueDisponivel: 0, 
    especificacaoTecnica: 'Condução de efluentes sanitários, NBR 5688, ponta e bolsa.',
    substitutosSugeridosSkus: ['LM-781045'],
    marca: 'Tigre'
  },
  {
    id: 'prod-05',
    sku: 'LM-781045',
    nome: 'Tubo PVC Esgoto Série Normal 100mm 3m Amanco Wavin',
    categoria: 'HIDRAULICA',
    corredor: 'A03',
    ordemCorredor: 22,
    moduloGondola: 'Gôndola 03',
    prateleira: 'Porta-Palete Superior',
    preco: 44.50,
    estoqueDisponivel: 14,
    especificacaoTecnica: 'Norma ABNT NBR 5688, junta elástica ou soldável.',
    substitutosSugeridosSkus: ['LM-781044'],
    marca: 'Amanco'
  },
  {
    id: 'prod-06',
    sku: 'LM-781090',
    nome: 'Curva 90º PVC Esgoto 100mm Tigre',
    categoria: 'HIDRAULICA',
    corredor: 'A03',
    ordemCorredor: 24,
    moduloGondola: 'Gôndola 04',
    prateleira: 'Nível 2 (Bandeja)',
    preco: 19.90,
    estoqueDisponivel: 32,
    especificacaoTecnica: 'Raio longo para evitar entupimentos no escoamento predial.',
    substitutosSugeridosSkus: [],
    marca: 'Tigre'
  },

  // Corredor B02 - Elétrica (Disjuntores, Fios e Cabos)
  {
    id: 'prod-07',
    sku: 'LM-654201',
    nome: 'Disjuntor Bipolar Din 32A Curva C Schneider Electric',
    categoria: 'ELETRICA',
    corredor: 'B02',
    ordemCorredor: 40,
    moduloGondola: 'Gôndola 02',
    prateleira: 'Nível 3 (Altura dos Olhos)',
    preco: 42.90,
    estoqueDisponivel: 0, // Ruptura para teste
    especificacaoTecnica: 'Proteção contra curto-circuito e sobrecarga para circuitos de chuveiro elétrico.',
    substitutosSugeridosSkus: ['LM-654205'],
    marca: 'Schneider'
  },
  {
    id: 'prod-08',
    sku: 'LM-654205',
    nome: 'Disjuntor Bipolar Din 32A Curva C Siemens 5SL',
    categoria: 'ELETRICA',
    corredor: 'B02',
    ordemCorredor: 42,
    moduloGondola: 'Gôndola 02',
    prateleira: 'Nível 3 (Altura dos Olhos)',
    preco: 45.90,
    estoqueDisponivel: 9,
    especificacaoTecnica: 'Capacidade de ruptura 3kA, norma NBR NM 60898-1.',
    substitutosSugeridosSkus: ['LM-654201'],
    marca: 'Siemens'
  },
  {
    id: 'prod-09',
    sku: 'LM-654310',
    nome: 'Rolo Cabo Flexível 2,5mm² 100m Azul Sil Fios',
    categoria: 'ELETRICA',
    corredor: 'B02',
    ordemCorredor: 45,
    moduloGondola: 'Gôndola 05',
    prateleira: 'Nível 1 (Carretel)',
    preco: 189.90,
    estoqueDisponivel: 12,
    especificacaoTecnica: 'Cobre eletrolítico 750V antichama, indicado para tomadas gerais.',
    substitutosSugeridosSkus: [],
    marca: 'Sil'
  },
  {
    id: 'prod-10',
    sku: 'LM-654390',
    nome: 'Fita Isolante Imperial 20m 3M',
    categoria: 'ELETRICA',
    corredor: 'B02',
    ordemCorredor: 48,
    moduloGondola: 'Gôndola 06',
    prateleira: 'Nível 4 (Gancho)',
    preco: 11.90,
    estoqueDisponivel: 80,
    especificacaoTecnica: 'Tensão suportada até 750V, antichama com alta flexibilidade.',
    substitutosSugeridosSkus: [],
    marca: '3M'
  },

  // Corredor C01 - Tintas & Acabamentos
  {
    id: 'prod-11',
    sku: 'LM-431102',
    nome: 'Tinta Acrílica Fosco Lavável Suvinil Branco Neve 18L',
    categoria: 'TINTAS_ACESSORIOS',
    corredor: 'C01',
    ordemCorredor: 60,
    moduloGondola: 'Gôndola 01',
    prateleira: 'Nível 1 (Palete Central)',
    preco: 389.00,
    estoqueDisponivel: 15,
    especificacaoTecnica: 'Paredes internas e externas, acabamento aveludado, disfarça imperfeições.',
    substitutosSugeridosSkus: ['LM-431108'],
    marca: 'Suvinil'
  },
  {
    id: 'prod-12',
    sku: 'LM-431108',
    nome: 'Tinta Acrílica Rende Muito Coral Branco Neve 18L',
    categoria: 'TINTAS_ACESSORIOS',
    corredor: 'C01',
    ordemCorredor: 62,
    moduloGondola: 'Gôndola 01',
    prateleira: 'Nível 1 (Palete Central)',
    preco: 359.00,
    estoqueDisponivel: 6,
    especificacaoTecnica: 'Fórmula ultra concentrada, alto rendimento até 500m² por demão.',
    substitutosSugeridosSkus: ['LM-431102'],
    marca: 'Coral'
  },
  {
    id: 'prod-13',
    sku: 'LM-431520',
    nome: 'Rolo de Lã Microfibra Anti-Gota 23cm Atlas',
    categoria: 'TINTAS_ACESSORIOS',
    corredor: 'C01',
    ordemCorredor: 65,
    moduloGondola: 'Gôndola 04',
    prateleira: 'Nível 3 (Gancho Superior)',
    preco: 26.50,
    estoqueDisponivel: 24,
    especificacaoTecnica: 'Altura da lã 10mm, ideal para superfícies lisas e pintura sem respingos.',
    substitutosSugeridosSkus: [],
    marca: 'Atlas'
  },

  // Corredor D04 - Ferramentas Manuais & Bricolagem
  {
    id: 'prod-14',
    sku: 'LM-120901',
    nome: 'Trena Laser Digital 40 Metros Bosch GLM 40',
    categoria: 'FERRAMENTAS',
    corredor: 'D04',
    ordemCorredor: 80,
    moduloGondola: 'Gôndola 02 Vitrine',
    prateleira: 'Nível 3 (Vitrine Trancada)',
    preco: 319.00,
    estoqueDisponivel: 5,
    especificacaoTecnica: 'Medição precisa de comprimento, área e volume com visor retroiluminado.',
    substitutosSugeridosSkus: [],
    marca: 'Bosch'
  },
  {
    id: 'prod-15',
    sku: 'LM-120950',
    nome: 'Jogo de Chaves Philips e Fenda 6 Peças Tramontina Pro',
    categoria: 'FERRAMENTAS',
    corredor: 'D04',
    ordemCorredor: 84,
    moduloGondola: 'Gôndola 03',
    prateleira: 'Nível 2 (Ganchos)',
    preco: 59.90,
    estoqueDisponivel: 19,
    especificacaoTecnica: 'Aço cromo vanádio com ponta imantada e cabo ergonômico.',
    substitutosSugeridosSkus: [],
    marca: 'Tramontina'
  }
];

export const CLIENTE_DEMO = {
  id: 'cli-8819',
  nome: 'Mariana Duarte',
  telefone: '(11) 98451-2290',
  perfilProjeto: 'REFORMA_BANHEIRO',
  ultimaLocalizacao: 'Entrada Loja Tietê'
};

export const VENDEDORES_DISPONIVEIS = [
  {
    id: 'vend-01',
    matricula: 'LM-4890',
    nome: 'Carlos Silva',
    setorResponsavel: 'HIDRAULICA',
    corredorAtual: 'A03',
    disponivel: true,
    chamadosAtendidosHoje: 7,
    tempoMedioAtendimentoMin: 4.2
  },
  {
    id: 'vend-02',
    matricula: 'LM-5112',
    nome: 'Mariana Costa',
    setorResponsavel: 'ELETRICA',
    corredorAtual: 'B02',
    disponivel: true,
    chamadosAtendidosHoje: 9,
    tempoMedioAtendimentoMin: 3.8
  },
  {
    id: 'vend-03',
    matricula: 'LM-3904',
    nome: 'Ricardo Santos',
    setorResponsavel: 'MATERIAIS_CONSTRUCAO',
    corredorAtual: 'A01',
    disponivel: true,
    chamadosAtendidosHoje: 5,
    tempoMedioAtendimentoMin: 5.1
  }
];

// Planta da loja: alimenta o mapa, o cálculo de rota e as placas QR
export const SETORES_MAPA = [
  {
    codigo: 'SETOR_A',
    nome: 'Construção & Hidráulica',
    corFundo: '#E8F5E9',
    corredores: [
      { codigo: 'A01', x: 40, y: 50, largura: 70, altura: 90 },
      { codigo: 'A02', x: 120, y: 50, largura: 70, altura: 90 },
      { codigo: 'A03', x: 200, y: 50, largura: 70, altura: 90 }
    ]
  },
  {
    codigo: 'SETOR_B',
    nome: 'Elétrica & Iluminação',
    corFundo: '#FFF9C4',
    corredores: [
      { codigo: 'B01', x: 300, y: 50, largura: 70, altura: 90 },
      { codigo: 'B02', x: 380, y: 50, largura: 70, altura: 90 },
      { codigo: 'B03', x: 460, y: 50, largura: 70, altura: 90 }
    ]
  },
  {
    codigo: 'SETOR_C',
    nome: 'Tintas & Acabamento',
    corFundo: '#E1F5FE',
    corredores: [
      { codigo: 'C01', x: 40, y: 170, largura: 110, altura: 80 },
      { codigo: 'C02', x: 160, y: 170, largura: 110, altura: 80 }
    ]
  },
  {
    codigo: 'SETOR_D',
    nome: 'Ferramentas & Bricolagem',
    corFundo: '#F3E5F5',
    corredores: [
      { codigo: 'D01', x: 300, y: 170, largura: 110, altura: 80 },
      { codigo: 'D04', x: 420, y: 170, largura: 110, altura: 80 }
    ]
  }
];

export const CORREDORES_LOJA = SETORES_MAPA.flatMap(setor =>
  setor.corredores.map(corredor => ({ ...corredor, setor: setor.nome }))
);

export const LISTAS_PREDEFINIDAS = [
  {
    nome: 'Reforma Completa do Banheiro (Recomendado)',
    perfil: 'REFORMA_BANHEIRO',
    produtosSkus: ['LM-892110', 'LM-781044', 'LM-781090', 'LM-654201', 'LM-654390']
  },
  {
    nome: 'Pintura & Iluminação da Sala',
    perfil: 'PINTURA_COMPLETA',
    produtosSkus: ['LM-431102', 'LM-431520', 'LM-654310', 'LM-120950']
  },
  {
    nome: 'Quadro Geral de Energia',
    perfil: 'INSTALACAO_ELETRICA',
    produtosSkus: ['LM-654201', 'LM-654310', 'LM-654390', 'LM-120950']
  }
];
