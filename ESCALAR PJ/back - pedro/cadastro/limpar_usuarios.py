"""
Script para limpar todos os usuários do banco, mantendo apenas o administrador
"""
from app import app, db, Usuario

def limparUsuarios():
    with app.app_context():
        # Buscar todos os usuarios
        usuarios = Usuario.query.all()
        
        if not usuarios:
            print("Nenhum usuario encontrado no banco.")
            return
        
        print(f"\n{'='*80}")
        print(f"TOTAL DE USUARIOS NO BANCO: {len(usuarios)}")
        print(f"{'='*80}\n")
        
        # Contar quantos serao deletados
        usuarios_para_deletar = [u for u in usuarios if u.nivel_acesso != 'administrador']
        admins = [u for u in usuarios if u.nivel_acesso == 'administrador']
        
        print(f"Administradores (serao mantidos): {len(admins)}")
        for admin in admins:
            print(f"   - {admin.nome} ({admin.email})")
        
        print(f"\nUsuarios comuns (serao deletados): {len(usuarios_para_deletar)}")
        for u in usuarios_para_deletar:
            print(f"   - {u.nome} ({u.email})")
        
        if not usuarios_para_deletar:
            print("\nNao ha usuarios comuns para deletar.")
            return
        
        # Confirmacao
        print(f"\n{'='*80}")
        confirmacao = input("AVISO: Deseja realmente deletar esses usuarios? (sim/nao): ").strip().lower()
        
        if confirmacao != 'sim':
            print("\nOperacao cancelada.")
            return
        
        # Deletar usuarios comuns
        deletados = 0
        for usuario in usuarios_para_deletar:
            try:
                db.session.delete(usuario)
                deletados += 1
            except Exception as e:
                print(f"Erro ao deletar {usuario.nome}: {e}")
        
        # Commit das mudancas
        try:
            db.session.commit()
            print(f"\n{deletados} usuario(s) deletado(s) com sucesso!")
            print(f"{len(admins)} administrador(es) mantido(s).")
        except Exception as e:
            db.session.rollback()
            print(f"\nErro ao confirmar delecao: {e}")

if __name__ == '__main__':
    limparUsuarios()
