"""
CARGA INICIAL DO BANCO DE DADOS (seed.py)
-----------------------------------------
Em programação, "Seed" (semente) é o código que preenche o banco de dados vazio
com dados de exemplo logo na primeira vez que o sistema é aberto.
Assim, quem baixar o projeto já encontra o cardápio completo, fotos, usuários de teste
e histórico de pedidos prontos para testar, sem precisar cadastrar tudo na mão!
"""

from models import (
    db,
    Usuario,
    Categoria,
    Produto,
    ImagemProduto,
    Pedido,
    ItemPedido,
    MensagemContato,
)


def popular_banco_inicial():
    """
    Verifica se o banco de dados ainda está vazio e, se estiver, insere:
    1. As 4 categorias do cardápio (Salgados, Doces, Bebidas e Pratos Feitos);
    2. Os produtos principais e os combos em promoção (com suas galerias de 3 fotos cada);
    3. Três contas de usuário para teste (Aluno, Vendedor e Admin);
    4. Dois pedidos de exemplo no histórico do aluno;
    5. Uma mensagem inicial de Fale Conosco.
    """
    # Trava de segurança: procura a primeira categoria no banco.
    # Se já existir alguma (não for None), significa que o banco já foi populado antes, então sai da função.
    if Categoria.query.first() is not None:
        return

    print("[SEED] Populando banco de dados inicial da Cantina Serra e Soares...")

    # =====================================================================
    # PASSO 1: CRIAR AS CATEGORIAS DO CARDÁPIO
    # =====================================================================
    categorias_iniciais = [
        Categoria(slug="salgado", nome="Salgados", titulo_secao="Salgados"),
        Categoria(slug="doce", nome="Doces", titulo_secao="Doces & Sobremesas"),
        Categoria(slug="bebida", nome="Bebidas", titulo_secao="Bebidas"),
        Categoria(slug="prato", nome="Pratos Feitos", titulo_secao="Pratos Feitos"),
    ]
    db.session.add_all(categorias_iniciais)
    # O flush() envia as categorias para o banco gerar os IDs delas (1, 2, 3, 4) imediatamente
    db.session.flush()

    # Cria um dicionário rápido ligando o código da categoria ao seu ID no banco (ex: {'salgado': 1, 'doce': 2...})
    mapa_cat = {cat.slug: cat.id for cat in categorias_iniciais}

    # =====================================================================
    # PASSO 2: CADASTRAR OS PRODUTOS E OS COMBOS PROMOCIONAIS
    # =====================================================================
    dados_produtos = [
        {
            "id": 1,
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
            "preco_antigo": None,
            "preco": 6.00,
            "desconto": None,
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
            "id": 2,
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
            "preco_antigo": None,
            "preco": 6.50,
            "desconto": None,
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
            "id": 3,
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
            "preco_antigo": None,
            "preco": 4.50,
            "desconto": None,
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
            "id": 4,
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
            "preco_antigo": None,
            "preco": 4.50,
            "desconto": None,
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
            "id": 5,
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
            "preco_antigo": None,
            "preco": 25.00,
            "desconto": None,
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
            "id": 6,
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
            "preco_antigo": None,
            "preco": 22.00,
            "desconto": None,
            "imagem": "/img/produtos/pratos/marmita.jpg",
            "imagens": [
                "/img/produtos/pratos/marmita.jpg",
                "/img/produtos/pratos/marmita_2.jpg",
                "/img/produtos/pratos/marmita_3.jpg",
            ],
            "destaque_dia": True,
            "em_promocao": False,
        },
        # Combos promocionais (exibidos no carrossel lateral da Home e na aba Promoções)
        {
            "id": 201,
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
            "preco_antigo": 40.00,
            "preco": 32.00,
            "desconto": "-20%",
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
            "id": 202,
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
            "preco_antigo": 49.90,
            "preco": 39.90,
            "desconto": "-20%",
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

    # Percorre a lista acima criando cada Produto e suas 3 fotos na tabela ImagemProduto
    mapa_produtos = {}
    for item in dados_produtos:
        novo_produto = Produto(
            id=item["id"],
            categoria_id=mapa_cat[item["categoria_slug"]],
            nome=item["nome"],
            descricao=item["descricao"],
            descricao_detalhada=item["descricao_detalhada"],
            ingredientes="; ".join(item["ingredientes"]),
            imagem=item["imagem"],
            preco_antigo=item["preco_antigo"],
            preco=item["preco"],
            desconto=item["desconto"],
            quantidade_estoque=50,
            destaque_dia=item["destaque_dia"],
            em_promocao=item["em_promocao"],
            ativo=True,
        )
        db.session.add(novo_produto)
        db.session.flush()
        mapa_produtos[novo_produto.nome] = novo_produto

        for idx, url_img in enumerate(item["imagens"], start=1):
            db.session.add(
                ImagemProduto(
                    produto_id=novo_produto.id,
                    url_imagem=url_img,
                    ordem=idx,
                )
            )

    # =====================================================================
    # PASSO 3: CRIAR CONTAS DE USUÁRIO PARA TESTE
    # Usa definir_senha() para salvar as senhas já criptografadas (hash)
    # =====================================================================
    aluno_teste = Usuario(
        nome="Fabricio",
        email="fabricio@aluno.ifsp.edu.br",
        tipo_usuario="cliente",
    )
    aluno_teste.definir_senha("Cantina123")

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
    db.session.flush()

    # =====================================================================
    # PASSO 4: CRIAR PEDIDOS DE EXEMPLO NO HISTÓRICO DO ALUNO
    # =====================================================================
    marmita = mapa_produtos["Marmita Tradicional"]
    coca = mapa_produtos["Coca-Cola Lata"]
    coxinha = mapa_produtos["Coxinha de Frango"]

    # Pedido #1: Pronto para retirada (1x Marmita + 1x Coca-Cola)
    pedido_1 = Pedido(
        usuario_id=aluno_teste.id,
        nome_retirada="Fabricio",
        metodo_pagamento="pix",
        observacao="Coca-Cola bem gelada e enviar talher descartável, por favor.",
        status="pronto",
        valor_total=28.50,
    )
    db.session.add(pedido_1)
    db.session.flush()

    db.session.add_all([
        ItemPedido(
            pedido_id=pedido_1.id,
            produto_id=marmita.id,
            quantidade=1,
            preco_unitario=marmita.preco,
        ),
        ItemPedido(
            pedido_id=pedido_1.id,
            produto_id=coca.id,
            quantidade=1,
            preco_unitario=coca.preco,
        ),
    ])

    # Pedido #2: Já finalizado/entregue (2x Coxinhas + 1x Coca-Cola)
    pedido_2 = Pedido(
        usuario_id=aluno_teste.id,
        nome_retirada="Fabricio",
        metodo_pagamento="cartao",
        observacao="Coxinhas bem quentinhas e guardanapo extra.",
        status="finalizado",
        valor_total=18.50,
    )
    db.session.add(pedido_2)
    db.session.flush()

    db.session.add_all([
        ItemPedido(
            pedido_id=pedido_2.id,
            produto_id=coxinha.id,
            quantidade=2,
            preco_unitario=coxinha.preco,
        ),
        ItemPedido(
            pedido_id=pedido_2.id,
            produto_id=coca.id,
            quantidade=1,
            preco_unitario=coca.preco,
        ),
    ])

    # =====================================================================
    # PASSO 5: REGISTRAR UMA MENSAGEM DE CONTATO DE EXEMPLO
    # =====================================================================
    mensagem_exemplo = MensagemContato(
        nome="Fabricio",
        email="fabricio@aluno.ifsp.edu.br",
        assunto="sugestao",
        mensagem="Parabéns pelo novo sistema digital da cantina! Ficou muito rápido pedir no intervalo.",
        lida=False,
    )
    db.session.add(mensagem_exemplo)

    # Salva definitivamente todas as etapas acima no arquivo SQLite (cantina.db)
    db.session.commit()
    print("[OK] Banco de dados populado com sucesso!")
