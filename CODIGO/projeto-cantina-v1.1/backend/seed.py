from models import db, Usuario, Categoria, Produto, ImagemProduto, Pedido, ItemPedido


def popular_banco_inicial():
    """
    Popula o banco de dados SQLite com as categorias, produtos, galerias de fotos
    e usuários de teste equivalentes aos dados do protótipo em React.
    Só executa se o banco estiver vazio.
    """
    if Categoria.query.first() is not None:
        return

    print("[SEED] Populando banco de dados inicial da Cantina Serra e Soares...")

    # =====================================================
    # 1. CATEGORIAS
    # =====================================================
    categorias_iniciais = [
        Categoria(slug="salgado", nome="Salgados", titulo_secao="Salgados"),
        Categoria(slug="doce", nome="Doces", titulo_secao="Doces & Sobremesas"),
        Categoria(slug="bebida", nome="Bebidas", titulo_secao="Bebidas"),
        Categoria(slug="prato", nome="Pratos Feitos", titulo_secao="Pratos Feitos"),
    ]
    db.session.add_all(categorias_iniciais)
    db.session.flush()

    mapa_cat = {cat.slug: cat.id for cat in categorias_iniciais}

    # =====================================================
    # 2. PRODUTOS PRINCIPAIS + PROMOÇÕES
    # =====================================================
    dados_produtos = [
        {
            "nome": "Coxinha de Frango",
            "categoria_slug": "salgado",
            "descricao": "Massa artesanal de batata com recheio cremoso de frango temperado.",
            "descricao_detalhada": (
                "Nossa coxinha tradicional é preparada diariamente na cantina com massa leve à base de batata "
                "e caldo natural. O recheio leva peito de frango desfiado, temperado com ervas frescas e um "
                "toque suave de requeijão cremoso."
            ),
            "ingredientes": [
                "Peito de frango desfiado",
                "Massa de batata artesanal",
                "Requeijão cremoso",
                "Cheiro-verde e especiarias",
                "Farinha de rosca crocante",
            ],
            "preco": 6.00,
            "imagem": "/img/produtos/salgados/coxinha.jpg",
            "imagens": [
                "/img/produtos/salgados/coxinha.jpg",
                "/img/produtos/salgados/coxinha_2.jpg",
                "/img/produtos/salgados/coxinha_3.jpg",
            ],
            "destaque_dia": True,
            "em_promocao": False,
        },
        {
            "nome": "Coca-Cola Lata",
            "categoria_slug": "bebida",
            "descricao": "Refrigerante gelado 350ml, ideal para acompanhar seu lanche.",
            "descricao_detalhada": (
                "Coca-Cola Original em lata de 350ml, armazenada em nossa geladeira especial para ser entregue "
                "sempre trincando de gelada durante o seu intervalo."
            ),
            "ingredientes": [
                "Água gaseificada",
                "Extrato de noz de cola",
                "Açúcar",
                "Cafeína",
            ],
            "preco": 6.50,
            "imagem": "/img/produtos/bebidas/coca.jpg",
            "imagens": [
                "/img/produtos/bebidas/coca.jpg",
                "/img/produtos/bebidas/coca_2.jpg",
                "/img/produtos/bebidas/coca_3.jpg",
            ],
            "destaque_dia": True,
            "em_promocao": False,
        },
        {
            "nome": "Brigadeiro Gourmet",
            "categoria_slug": "doce",
            "descricao": "Receita tradicional preparada com chocolate 50% cacau e granulado.",
            "descricao_detalhada": (
                "Docinho artesanal tamanho grande (45g), preparado em fogo baixo com leite condensado integral, "
                "manteiga extra e cacau 50%, finalizado em confeitos de chocolate nobre."
            ),
            "ingredientes": [
                "Leite condensado integral",
                "Chocolate 50% cacau",
                "Manteiga sem sal",
                "Granulado de chocolate nobre",
            ],
            "preco": 4.50,
            "imagem": "/img/produtos/doces/brigadeiro.jpg",
            "imagens": [
                "/img/produtos/doces/brigadeiro.jpg",
                "/img/produtos/doces/brigadeiro_2.jpg",
                "/img/produtos/doces/brigadeiro_3.jpg",
            ],
            "destaque_dia": True,
            "em_promocao": False,
        },
        {
            "nome": "Pão de Queijo Mineiro",
            "categoria_slug": "salgado",
            "descricao": "Assado na hora, casquinha crocante por fora e macio por dentro.",
            "descricao_detalhada": (
                "Receita legítima mineira feita com polvilho artesanal e mix de queijos meia-cura e parmesão. "
                "Fornadas fresquinhas saem a cada intervalo para garantir que chegue quentinho."
            ),
            "ingredientes": [
                "Polvilho doce e azedo",
                "Queijo Minas meia-cura",
                "Queijo parmesão ralado",
                "Leite integral e ovos caipiras",
            ],
            "preco": 4.50,
            "imagem": "/img/produtos/salgados/pao_de_queijo.jpg",
            "imagens": [
                "/img/produtos/salgados/pao_de_queijo.jpg",
                "/img/produtos/salgados/pao_de_queijo_2.jpg",
                "/img/produtos/salgados/pao_de_queijo_3.jpg",
            ],
            "destaque_dia": True,
            "em_promocao": False,
        },
        {
            "nome": "Prato Feito Executivo",
            "categoria_slug": "prato",
            "descricao": "Arroz soltinho, feijão, filé de frango grelhado, salada fresca e farofa.",
            "descricao_detalhada": (
                "Refeição completa e balanceada servida no prato para o horário de almoço no campus. "
                "Acompanha arroz branco soltinho, feijão carioca temperado na hora, filé de frango grelhado "
                "na chapa, salada fresca e farofa crocante da casa."
            ),
            "ingredientes": [
                "Arroz branco soltinho",
                "Feijão carioca caseiro",
                "Filé de frango grelhado (180g)",
                "Salada de alface, tomate e cenoura",
                "Farofa temperada da casa",
            ],
            "preco": 25.00,
            "imagem": "/img/produtos/pratos/prato_feito.jpg",
            "imagens": [
                "/img/produtos/pratos/prato_feito.jpg",
                "/img/produtos/pratos/prato_feito_2.jpg",
                "/img/produtos/pratos/prato_feito_3.jpg",
            ],
            "destaque_dia": True,
            "em_promocao": False,
        },
        {
            "nome": "Marmita Tradicional",
            "categoria_slug": "prato",
            "descricao": "Arroz, feijão, carne de panela suculenta, salada do dia e farofa.",
            "descricao_detalhada": (
                "Ideal para quem quer almoçar com praticidade ou levar para comer no campus. "
                "Embalagem térmica que conserva a temperatura, com carne de panela cozida lentamente ao molho caseiro."
            ),
            "ingredientes": [
                "Arroz branco",
                "Feijão carioca",
                "Carne bovina de panela ao molho",
                "Salada fresca separada",
                "Farofa crocante",
            ],
            "preco": 22.00,
            "imagem": "/img/produtos/pratos/marmita.jpg",
            "imagens": [
                "/img/produtos/pratos/marmita.jpg",
                "/img/produtos/pratos/marmita_2.jpg",
                "/img/produtos/pratos/marmita_3.jpg",
            ],
            "destaque_dia": True,
            "em_promocao": False,
        },
        # Combos em Promoção (Barra Lateral da Home)
        {
            "nome": "Combo Hambúrguer + Batata + Bebida",
            "categoria_slug": "prato",
            "descricao": "Hambúrguer artesanal suculento acompanhado de fritas crocantes e refrigerante.",
            "descricao_detalhada": (
                "Nosso combo campeão de vendas! Um hambúrguer artesanal de 150g no pão brioche tostado na manteiga, "
                "porção individual de batatas fritas crocantes e uma Coca-Cola lata 350ml super gelada."
            ),
            "ingredientes": [
                "Pão brioche amanteigado",
                "Blend bovino artesanal 150g",
                "Queijo cheddar derretido, alface e tomate",
                "Porção de batata frita crocante (150g)",
                "Coca-Cola Lata 350ml",
            ],
            "preco": 32.00,
            "imagem": "/img/promocoes/promo_1.jpg",
            "imagens": [
                "/img/promocoes/promo_1.jpg",
                "/img/promocoes/promo_1_2.jpg",
                "/img/promocoes/promo_1_3.jpg",
            ],
            "destaque_dia": False,
            "em_promocao": True,
        },
        {
            "nome": "Combo Completo + Sobremesa",
            "categoria_slug": "prato",
            "descricao": "Lanche especial, batata frita, refrigerante gelado e sundae de chocolate.",
            "descricao_detalhada": (
                "Para quem quer uma experiência completa no intervalo! Inclui nosso lanche duplo especial com salada "
                "fresca, fritas crocantes, refrigerante gelado e uma sobremesa gelada com calda de chocolate."
            ),
            "ingredientes": [
                "Lanche especial com gergelim",
                "Batata frita média crocante",
                "Refrigerante 350ml à escolha",
                "Sundae cremoso com calda de chocolate",
            ],
            "preco": 39.90,
            "imagem": "/img/promocoes/promo_2.jpg",
            "imagens": [
                "/img/promocoes/promo_2.jpg",
                "/img/promocoes/promo_2_2.jpg",
                "/img/promocoes/promo_2_3.jpg",
            ],
            "destaque_dia": False,
            "em_promocao": True,
        },
    ]

    for item in dados_produtos:
        novo_produto = Produto(
            categoria_id=mapa_cat[item["categoria_slug"]],
            nome=item["nome"],
            descricao=item["descricao"],
            descricao_detalhada=item["descricao_detalhada"],
            ingredientes="; ".join(item["ingredientes"]),
            imagem=item["imagem"],
            preco=item["preco"],
            quantidade_estoque=50,
            destaque_dia=item["destaque_dia"],
            em_promocao=item["em_promocao"],
            ativo=True,
        )
        db.session.add(novo_produto)
        db.session.flush()

        for idx, url_img in enumerate(item["imagens"], start=1):
            db.session.add(
                ImagemProduto(
                    produto_id=novo_produto.id,
                    url_imagem=url_img,
                    ordem=idx,
                )
            )

    # =====================================================
    # 3. USUÁRIOS INICIAIS DE TESTE (Cliente, Vendedor, Admin)
    # =====================================================
    aluno_teste = Usuario(
        nome="Aluno IFSP",
        email="aluno@ifsp.edu.br",
        tipo_usuario="cliente",
    )
    aluno_teste.definir_senha("123456")

    vendedor_teste = Usuario(
        nome="Atendente Balcão",
        email="vendedor@ifsp.edu.br",
        tipo_usuario="vendedor",
    )
    vendedor_teste.definir_senha("123456")

    admin_teste = Usuario(
        nome="Admin Cantina",
        email="admin@ifsp.edu.br",
        tipo_usuario="admin",
    )
    admin_teste.definir_senha("123456")

    db.session.add_all([aluno_teste, vendedor_teste, admin_teste])
    db.session.commit()
    print("[OK] Banco de dados populado com sucesso!")
