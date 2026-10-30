export const bannersData = [
  { id: 1, imagem: '/img/banners/banner_1.jpg', alt: 'Promoção Especial 1' },
  { id: 2, imagem: '/img/banners/banner_2.jpg', alt: 'Promoção Especial 2' },
  { id: 3, imagem: '/img/banners/banner_3.jpg', alt: 'Promoção Especial 3' },
];

export const categoriasData = [
  { id: 'todos', nome: 'Todos' },
  { id: 'salgado', nome: 'Salgados', tituloSecao: 'Salgados' },
  { id: 'doce', nome: 'Doces', tituloSecao: 'Doces & Sobremesas' },
  { id: 'bebida', nome: 'Bebidas', tituloSecao: 'Bebidas' },
  { id: 'prato', nome: 'Pratos Feitos', tituloSecao: 'Pratos Feitos' },
];

// Lista unificada de produtos usados nos Destaques (Home) e no Cardápio Completo
export const destaquesData = [
  {
    id: 1,
    nome: 'Coxinha de Frango',
    descricao: 'Massa artesanal de batata com recheio cremoso de frango temperado.',
    descricaoDetalhada:
      'Nossa coxinha tradicional é preparada diariamente na cantina com massa leve à base de batata e caldo natural. O recheio leva peito de frango desfiado, temperado com ervas frescas e um toque suave de requeijão cremoso.',
    ingredientes: [
      'Peito de frango desfiado',
      'Massa de batata artesanal',
      'Requeijão cremoso',
      'Cheiro-verde e especiarias',
      'Farinha de rosca crocante',
    ],
    preco: 'R$ 6,00',
    categoria: 'salgado',
    imagem: '/img/produtos/salgados/coxinha.jpg',
    imagens: [
      '/img/produtos/salgados/coxinha.jpg',
      '/img/produtos/salgados/coxinha_2.jpg',
      '/img/produtos/salgados/coxinha_3.jpg',
    ],
  },
  {
    id: 2,
    nome: 'Coca-Cola Lata',
    descricao: 'Refrigerante gelado 350ml, ideal para acompanhar seu lanche.',
    descricaoDetalhada:
      'Coca-Cola Original em lata de 350ml, armazenada em nossa geladeira especial para ser entregue sempre trincando de gelada durante o seu intervalo.',
    ingredientes: [
      'Água gaseificada',
      'Extrato de noz de cola',
      'Açúcar',
      'Cafeína',
    ],
    preco: 'R$ 6,50',
    categoria: 'bebida',
    imagem: '/img/produtos/bebidas/coca.jpg',
    imagens: [
      '/img/produtos/bebidas/coca.jpg',
      '/img/produtos/bebidas/coca_2.jpg',
      '/img/produtos/bebidas/coca_3.jpg',
    ],
  },
  {
    id: 3,
    nome: 'Brigadeiro Gourmet',
    descricao: 'Receita tradicional preparada com chocolate 50% cacau e granulado.',
    descricaoDetalhada:
      'Docinho artesanal tamanho grande (45g), preparado em fogo baixo com leite condensado integral, manteiga extra e cacau 50%, finalizado em confeitos de chocolate nobre.',
    ingredientes: [
      'Leite condensado integral',
      'Chocolate 50% cacau',
      'Manteiga sem sal',
      'Granulado de chocolate nobre',
    ],
    preco: 'R$ 4,50',
    categoria: 'doce',
    imagem: '/img/produtos/doces/brigadeiro.jpg',
    imagens: [
      '/img/produtos/doces/brigadeiro.jpg',
      '/img/produtos/doces/brigadeiro_2.jpg',
      '/img/produtos/doces/brigadeiro_3.jpg',
    ],
  },
  {
    id: 4,
    nome: 'Pão de Queijo Mineiro',
    descricao: 'Assado na hora, casquinha crocante por fora e macio por dentro.',
    descricaoDetalhada:
      'Receita legítima mineira feita com polvilho artesanal e mix de queijos meia-cura e parmesão. Fornadas fresquinhas saem a cada intervalo para garantir que chegue quentinho.',
    ingredientes: [
      'Polvilho doce e azedo',
      'Queijo Minas meia-cura',
      'Queijo parmesão ralado',
      'Leite integral e ovos caipiras',
    ],
    preco: 'R$ 4,50',
    categoria: 'salgado',
    imagem: '/img/produtos/salgados/pao_de_queijo.jpg',
    imagens: [
      '/img/produtos/salgados/pao_de_queijo.jpg',
      '/img/produtos/salgados/pao_de_queijo_2.jpg',
      '/img/produtos/salgados/pao_de_queijo_3.jpg',
    ],
  },
  {
    id: 5,
    nome: 'Prato Feito Executivo',
    descricao: 'Arroz soltinho, feijão, filé de frango grelhado, salada fresca e farofa.',
    descricaoDetalhada:
      'Refeição completa e balanceada servida no prato para o horário de almoço no campus. Acompanha arroz branco soltinho, feijão carioca temperado na hora, filé de frango grelhado na chapa, salada fresca e farofa crocante da casa.',
    ingredientes: [
      'Arroz branco soltinho',
      'Feijão carioca caseiro',
      'Filé de frango grelhado (180g)',
      'Salada de alface, tomate e cenoura',
      'Farofa temperada da casa',
    ],
    preco: 'R$ 25,00',
    categoria: 'prato',
    imagem: '/img/produtos/pratos/prato_feito.jpg',
    imagens: [
      '/img/produtos/pratos/prato_feito.jpg',
      '/img/produtos/pratos/prato_feito_2.jpg',
      '/img/produtos/pratos/prato_feito_3.jpg',
    ],
  },
  {
    id: 6,
    nome: 'Marmita Tradicional',
    descricao: 'Arroz, feijão, carne de panela suculenta, salada do dia e farofa.',
    descricaoDetalhada:
      'Ideal para quem quer almoçar com praticidade ou levar para comer no campus. Embalagem térmica que conserva a temperatura, com carne de panela cozida lentamente ao molho caseiro.',
    ingredientes: [
      'Arroz branco',
      'Feijão carioca',
      'Carne bovina de panela ao molho',
      'Salada fresca separada',
      'Farofa crocante',
    ],
    preco: 'R$ 22,00',
    categoria: 'prato',
    imagem: '/img/produtos/pratos/marmita.jpg',
    imagens: [
      '/img/produtos/pratos/marmita.jpg',
      '/img/produtos/pratos/marmita_2.jpg',
      '/img/produtos/pratos/marmita_3.jpg',
    ],
  },
];

// No Cardápio Completo usamos os mesmos itens com todas as fotos e ingredientes
export const cardapioCompletoData = destaquesData;

// Promoções em Destaque na barra lateral da Home
export const promocoesData = [
  {
    id: 201,
    nome: 'Combo Hambúrguer + Batata + Bebida',
    descricao: 'Hambúrguer artesanal suculento acompanhado de fritas crocantes e refrigerante.',
    descricaoDetalhada:
      'Nosso combo campeão de vendas! Um hambúrguer artesanal de 150g no pão brioche tostado na manteiga, porção individual de batatas fritas crocantes e uma Coca-Cola lata 350ml super gelada.',
    ingredientes: [
      'Pão brioche amanteigado',
      'Blend bovino artesanal 150g',
      'Queijo cheddar derretido, alface e tomate',
      'Porção de batata frita crocante (150g)',
      'Coca-Cola Lata 350ml',
    ],
    preco: 'R$ 32,00',
    categoria: 'prato',
    imagem: '/img/promocoes/promo_1.jpg',
    imagens: [
      '/img/promocoes/promo_1.jpg',
      '/img/promocoes/promo_1_2.jpg',
      '/img/promocoes/promo_1_3.jpg',
    ],
    alt: 'Combo Hambúrguer + Batata + Bebida',
  },
  {
    id: 202,
    nome: 'Combo Completo + Sobremesa',
    descricao: 'Lanche especial, batata frita, refrigerante gelado e sundae de chocolate.',
    descricaoDetalhada:
      'Para quem quer uma experiência completa no intervalo! Inclui nosso lanche duplo especial com salada fresca, fritas crocantes, refrigerante gelado e uma sobremesa gelada com calda de chocolate.',
    ingredientes: [
      'Lanche especial com gergelim',
      'Batata frita média crocante',
      'Refrigerante 350ml à escolha',
      'Sundae cremoso com calda de chocolate',
    ],
    preco: 'R$ 39,90',
    categoria: 'prato',
    imagem: '/img/promocoes/promo_2.jpg',
    imagens: [
      '/img/promocoes/promo_2.jpg',
      '/img/promocoes/promo_2_2.jpg',
      '/img/promocoes/promo_2_3.jpg',
    ],
    alt: 'Combo Completo + Sobremesa',
  },
];
