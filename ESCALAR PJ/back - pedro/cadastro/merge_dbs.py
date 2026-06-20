"""
Script para mesclar múltiplos arquivos `escalar.db` no workspace
- Localiza todos os arquivos `escalar.db` sob /workspaces/Escalar
- Usa o banco alvo (o que está no diretório deste backend) como destino
- Copia registros da tabela `usuarios` de fontes que não sejam o destino
- Evita duplicação por `email` ou `cpf`

Uso:
    python merge_dbs.py

Observação: faça backup antes de executar.
"""
import sqlite3
import os
from pathlib import Path

WORKSPACE_ROOT = Path('/workspaces/Escalar')
TARGET_DB = Path(__file__).resolve().parent / 'instance' / 'escalar.db'

def find_dbs(root):
    return [Path(p) for p in root.rglob('escalar.db')]

def get_users(conn):
    cur = conn.cursor()
    try:
        cur.execute('SELECT id, nome, email, foto, apelido, cpf, data_nascimento, escala, turno, local, nivel_acesso, senha, criado_em FROM usuarios')
    except sqlite3.OperationalError:
        return []
    rows = cur.fetchall()
    return rows

def user_exists(conn, email, cpf):
    cur = conn.cursor()
    cur.execute('SELECT 1 FROM usuarios WHERE email = ? OR cpf = ? LIMIT 1', (email, cpf))
    return cur.fetchone() is not None

def insert_user(conn, user):
    cur = conn.cursor()
    cur.execute(
        '''INSERT INTO usuarios (nome, email, foto, apelido, cpf, data_nascimento, escala, turno, local, nivel_acesso, senha, criado_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (user[1], user[2], user[3], user[4], user[5], user[6], user[7], user[8], user[9], user[10], user[11], user[12])
    )

def merge():
    dbs = find_dbs(WORKSPACE_ROOT)
    print(f'Encontrados {len(dbs)} arquivos escalar.db:')
    for d in dbs:
        print(' -', d)
    
    if not TARGET_DB.exists():
        print('ERRO: banco alvo não encontrado:', TARGET_DB)
        return

    # fontes = todos exceto target
    sources = [d for d in dbs if d.resolve() != TARGET_DB.resolve()]
    if not sources:
        print('Nenhum banco fonte encontrado. Nada a mesclar.')
        return

    target_conn = sqlite3.connect(str(TARGET_DB))
    target_conn.row_factory = sqlite3.Row

    total_copied = 0

    for src in sources:
        print('\nProcessando fonte:', src)
        src_conn = sqlite3.connect(str(src))
        src_conn.row_factory = sqlite3.Row
        users = get_users(src_conn)
        print(f'  {len(users)} usuários encontrados na fonte')
        copied = 0
        for u in users:
            email = u['email'] if 'email' in u.keys() else u[2]
            cpf = u['cpf'] if 'cpf' in u.keys() else u[5]
            if user_exists(target_conn, email, cpf):
                # já existe
                continue
            insert_user(target_conn, u)
            copied += 1
        target_conn.commit()
        src_conn.close()
        print(f'  Copiados: {copied}')
        total_copied += copied

    target_conn.close()
    print('\nMesclagem concluída. Total copiado:', total_copied)

if __name__ == '__main__':
    print('TARGET DB:', TARGET_DB)
    merge()
