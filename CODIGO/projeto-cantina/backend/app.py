"""
ARQUIVO PRINCIPAL DO SERVIDOR (app.py)
--------------------------------------
Este é o ponto de partida do Backend da Cantina Serra e Soares.
Ele cria o servidor web usando Flask, conecta o banco de dados SQLite,
libera a comunicação com o site em React (CORS) e ativa todas as rotas da API.
"""

import os
from flask import Flask
from flask_cors import CORS
from models import db
from routes import api_bp
from seed import popular_banco_inicial


def criar_app():
    """
    Função que monta e configura toda a aplicação Flask (padrão Application Factory).
    Retorna o objeto 'app' pronto para rodar.
    """
    app = Flask(__name__)

    # Libera o CORS (Cross-Origin Resource Sharing):
    # Como o Frontend (React) roda em uma porta (ex: 5173) e o Backend (Flask) roda na 5000,
    # o navegador bloquearia as mensagens entre eles sem essa linha.
    CORS(app)

    # Descobre a pasta atual ("backend/") e define onde ficará o arquivo do banco ("cantina.db")
    caminho_base = os.path.abspath(os.path.dirname(__file__))
    caminho_banco = os.path.join(caminho_base, "cantina.db")

    # Configura o SQLAlchemy (nosso gerenciador de banco) para usar o arquivo SQLite local
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{caminho_banco}"
    # Desativa avisos internos desnecessários do SQLAlchemy para economizar memória
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Conecta o banco de dados (db) ao nosso app Flask
    db.init_app(app)

    # Registra o pacote de rotas (routes.py), onde estão todos os endereços "/api/..."
    app.register_blueprint(api_bp)

    # Abre um contexto temporário do Flask para inicializar o banco antes da primeira requisição:
    # 1. db.create_all() lê todas as classes do models.py e cria as tabelas no SQLite se não existirem.
    # 2. popular_banco_inicial() cadastra os salgados, bebidas e usuários de teste na 1ª vez que o projeto roda.
    with app.app_context():
        db.create_all()
        popular_banco_inicial()

    return app


# Cria a instância principal do servidor
app = criar_app()

# Se este arquivo for executado diretamente (ex: "python app.py"),
# liga o servidor local na porta 5000 com recarregamento automático (debug=True).
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
