"""
script pra ver todos os usuarios cadastrados no banco
"""
from app import app, db, Usuario

def listarCadastros():
    with app.app_context():
        usuarios = Usuario.query.all()
        
        if not usuarios:
            print("Nenhum usuario cadastrado ainda.")
            return
        
        print(f"\n{'='*80}")
        print(f"TOTAL DE CADASTROS: {len(usuarios)}")
        print(f"{'='*80}\n")
        
        for u in usuarios:
            print(f"ID: {u.id}")
            print(f"Nome: {u.nome} ({u.apelido})")
            print(f"Email: {u.email}")
            print(f"CPF: {u.cpf}")
            print(f"Nascimento: {u.data_nascimento}")
            print(f"Local: {u.local}")
            print(f"Escala: {u.escala} - Turno: {u.turno}")
            print(f"Nivel de Acesso: {u.nivel_acesso}")
            print(f"Foto: {u.foto}")
            print(f"Cadastrado em: {u.criado_em}")
            print(f"{'-'*80}\n")

if __name__ == '__main__':
    listarCadastros()