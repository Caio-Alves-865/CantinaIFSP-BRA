import os
from flask import Flask
from flask_cors import CORS
from models import db
from routes import api_bp
from seed import popular_banco_inicial


def criar_app():
    app = Flask(__name__)

    # Permite que o Frontend (React + Vite) faça requisições para a API
    CORS(app)

    # Caminho do arquivo SQLite gerado automaticamente pelo ORM (backend/cantina.db)
    caminho_base = os.path.abspath(os.path.dirname(__file__))
    caminho_banco = os.path.join(caminho_base, "cantina.db")

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{caminho_banco}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Inicializa o ORM e registra as rotas da API (/api/...)
    db.init_app(app)
    app.register_blueprint(api_bp)

    # Cria as tabelas automaticamente a partir das classes de models.py e popula dados iniciais
    with app.app_context():
        db.create_all()
        popular_banco_inicial()

    return app


app = criar_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
