"""
limpa todos os colaboradores do banco, mas deixa o admin
"""
from app_unificado import app, db, Usuario

def limparColaboradores():
    with app.app_context():
        # busca o admin padrao
        admin = Usuario.query.filter_by(email='admin@escalar.com').first()
        
        if not admin:
            print("AVISO: Administrador padrao nao encontrado!")
            print("Criando administrador...")
            from auth import gerarHashSenha
            from datetime import datetime
            admin = Usuario(
                nome='Administrador',
                email='admin@escalar.com',
                foto='default.jpg',
                apelido='Admin',
                cpf='00000000000',
                data_nascimento=datetime(1990, 1, 1).date(),
                escala='12x36',
                turno='diurno',
                local='Campus',
                nivel_acesso='administrador',
                senha=gerarHashSenha('admin123')
            )
            db.session.add(admin)
            db.session.commit()
            print("Administrador criado!")
            return
        
        # conta quantos tem
        total_antes = Usuario.query.count()
        
        # deleta todo mundo menos o admin
        colaboradores_deletados = Usuario.query.filter(
            Usuario.email != 'admin@escalar.com'
        ).delete()
        
        db.session.commit()
        
        total_depois = Usuario.query.count()
        
        print(f"\n{'='*80}")
        print(f"LIMPEZA DE CADASTROS")
        print(f"{'='*80}")
        print(f"Usuarios antes: {total_antes}")
        print(f"Colaboradores removidos: {colaboradores_deletados}")
        print(f"Usuarios restantes: {total_depois}")
        print(f"\nUsuario mantido:")
        print(f"   - {admin.nome} ({admin.email})")
        print(f"{'='*80}\n")

if __name__ == '__main__':
    resposta = input("AVISO: Tem certeza que deseja DELETAR todos os colaboradores? (sim/nao): ")
    
    if resposta.lower() in ['sim', 's', 'yes', 'y']:
        limparColaboradores()
        print("Operacao concluida!")
    else:
        print("Operacao cancelada.")