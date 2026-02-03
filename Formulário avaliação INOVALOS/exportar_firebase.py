"""
INOVA LOS - Exportador de Dados do Firebase para Excel
Execute este script para baixar todos os dados do Firebase Firestore
"""

import os
import json
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Configurações
CREDENTIALS_FILE = 'firebase_credentials.json'
COLLECTION_NAME = 'avaliacoes_inova'
OUTPUT_FILE = f'Relatorio_INOVA_Firebase_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

def main():
    print("=" * 60)
    print(" INOVA LOS - Exportador de Dados Firebase → Excel")
    print("=" * 60)
    
    # Verifica credenciais
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"\n❌ ERRO: Arquivo '{CREDENTIALS_FILE}' não encontrado!")
        print("   Coloque o arquivo de credenciais do Firebase na mesma pasta.")
        return
    
    print(f"\n✓ Credenciais encontradas: {CREDENTIALS_FILE}")
    
    # Inicializa Firebase
    try:
        cred = credentials.Certificate(CREDENTIALS_FILE)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✓ Conectado ao Firebase com sucesso!")
    except Exception as e:
        print(f"\n❌ ERRO ao conectar ao Firebase: {e}")
        return
    
    # Busca dados
    print(f"\n⏳ Buscando dados da coleção '{COLLECTION_NAME}'...")
    
    try:
        docs = db.collection(COLLECTION_NAME).order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
        
        data_list = []
        for doc in docs:
            d = doc.to_dict()
            
            # Converte timestamp para string se existir
            if 'timestamp' in d and d['timestamp']:
                d['timestamp'] = d['timestamp'].strftime('%d/%m/%Y %H:%M:%S')
            
            # Remove o campo 'avaliacoes' aninhado (já temos os campos diretos)
            if 'avaliacoes' in d:
                del d['avaliacoes']
            
            data_list.append(d)
        
        if not data_list:
            print("\n⚠️  Nenhum registro encontrado na coleção.")
            return
        
        print(f"✓ {len(data_list)} registro(s) encontrado(s)!")
        
        # Cria DataFrame
        df = pd.DataFrame(data_list)
        
        # Reordena colunas para ficarem mais legíveis
        priority_cols = ['dataHora', 'avaliador', 'funcao', 'area', 'ideiaId', 'ideiaTitulo', 'setorIdealizador', 'mediaGeral']
        other_cols = [c for c in df.columns if c not in priority_cols and c != 'timestamp']
        ordered_cols = priority_cols + other_cols
        df = df[[c for c in ordered_cols if c in df.columns]]
        
        # Exporta para Excel
        df.to_excel(OUTPUT_FILE, index=False, engine='openpyxl')
        print(f"\n🎉 Arquivo gerado com sucesso: {OUTPUT_FILE}")
        print(f"   Local: {os.path.abspath(OUTPUT_FILE)}")
        
    except Exception as e:
        print(f"\n❌ ERRO ao buscar/exportar dados: {e}")
        return
    
    print("\n" + "=" * 60)
    print(" Exportação concluída!")
    print("=" * 60)

if __name__ == '__main__':
    main()
