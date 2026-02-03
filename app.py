import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_file
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

# Configura o Flask
app = Flask(__name__, static_folder='.', static_url_path='')

# Configurações Firebase
COLLECTION_NAME = "avaliacoes_inova"
CREDENTIALS_FILE = 'firebase_credentials.json'

# Inicialização do Firebase
firebase_enabled = False
db = None

try:
    if os.path.exists(CREDENTIALS_FILE):
        cred = credentials.Certificate(CREDENTIALS_FILE)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        firebase_enabled = True
        print(">>> Firebase inicializado com sucesso!")
    else:
        print(f"!!! Aviso: Arquivo '{CREDENTIALS_FILE}' não encontrado. O sistema usará salvamento local apenas.")
except Exception as e:
    print(f"!!! Erro ao inicializar Firebase: {e}")

# Nome do arquivo Excel local (Backup/Legado)
EXCEL_FILE = 'Avaliacoes_INOVA.xlsx'

def init_excel_file():
    if not os.path.exists(EXCEL_FILE):
        headers = [
            'Data/Hora', 'Avaliador', 'Função', 'Área/Setor', 
            'ID Ideia', 'Ideia', 'Setor Idealizador', 'Média Geral',
            'Clareza', 'Grau de inovação', 'Viabilidade de implementação',
            'Alinhamento com os valores do Grupo LOS',
            'Impacto para empresa', 'Impacto na experiência do colaborador',
            'Impacto na experiência dos clientes',
            'Escalabilidade da ideia', 'Sustentabilidade e impacto ambiental',
            'Nível de maturidade da ideia', 'Engajamento e protagonismo e dedicação do colaborador proponente'
        ]
        df = pd.DataFrame(columns=headers)
        df.to_excel(EXCEL_FILE, index=False)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/salvar', methods=['POST'])
def salvar_avaliacao():
    try:
        data = request.json
        print(f"Recebendo avaliação de: {data['avaliador']['nome']}")

        # Prepara a linha para o Excel (formato legado)
        timestamp = datetime.now()
        row = {
            'Data/Hora': timestamp.strftime('%d/%m/%Y %H:%M:%S'),
            'Avaliador': data['avaliador']['nome'],
            'Função': data['avaliador']['funcao'],
            'Área/Setor': data['avaliador']['area'],
            'ID Ideia': data['ideia']['id'],
            'Ideia': data['ideia']['titulo'],
            'Setor Idealizador': data['ideia']['setorIdealizador'],
            'Média Geral': str(data['mediaGeral']).replace('.', ',')
        }

        # Adiciona os critérios
        for key, value in data['avaliacoes'].items():
            row[value['label']] = value['valor']

        # 1. Salvar no Firebase (Prioridade)
        if firebase_enabled:
            firebase_data = row.copy()
            firebase_data['timestamp'] = timestamp # Usa timestamp real no firebase
            db.collection(COLLECTION_NAME).add(firebase_data)
            print("Avaliação salva no Firebase Firestore!")

        # 2. Salvar no Excel local (Persistência garantida)
        try:
            df_existing = pd.read_excel(EXCEL_FILE)
        except:
            init_excel_file()
            df_existing = pd.read_excel(EXCEL_FILE)

        df_new = pd.DataFrame([row])
        df_final = pd.concat([df_existing, df_new], ignore_index=True)
        df_final.to_excel(EXCEL_FILE, index=False)
        
        print("Avaliação salva no Excel local!")
        return jsonify({"message": "Sucesso", "status": "saved", "firebase": firebase_enabled}), 200

    except Exception as e:
        print(f"Erro ao salvar: {e}")
        return jsonify({"message": str(e), "status": "error"}), 500

@app.route('/relatorio')
def download_relatorio():
    """Gera um Excel consolidado a partir do Firebase ou do arquivo local"""
    try:
        if firebase_enabled:
            # Busca todos os registros do Firebase para o relatório ser sempre atualizado
            docs = db.collection(COLLECTION_NAME).order_by('timestamp').stream()
            data_list = []
            for doc in docs:
                d = doc.to_dict()
                if 'timestamp' in d:
                    del d['timestamp'] # Remove o objeto timestamp do Excel
                data_list.append(d)
            
            if data_list:
                df = pd.DataFrame(data_list)
                temp_file = 'Relatorio_Gerado.xlsx'
                df.to_excel(temp_file, index=False)
                return send_file(temp_file, as_attachment=True, download_name='Avaliacoes_INOVA_Firebase.xlsx')

        # Fallback para o arquivo local se o Firebase não estiver ativo ou sem dados
        if os.path.exists(EXCEL_FILE):
            return send_file(EXCEL_FILE, as_attachment=True, download_name='Avaliacoes_INOVA.xlsx')
        
        return jsonify({"error": "Nenhum dado encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Iniciando Sistema de Avaliação INOVA LOS...")
    init_excel_file()
    print("---------------------------------------------------------")
    print(" ACESSE O FORMULÁRIO AQUI: http://localhost:5001 ")
    print("---------------------------------------------------------")
    app.run(debug=True, port=5001)
