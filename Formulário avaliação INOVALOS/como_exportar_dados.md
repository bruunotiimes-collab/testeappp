# Como Baixar os Dados do Firebase em Excel/CSV

Agora que seu formulário está no Netlify e envia dados para o Firebase, existem **3 formas** de baixar os dados:

---

## 🔥 Método 1: Direto pelo Console do Firebase (Mais Fácil)

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto **INOVA-LOS**
3. No menu lateral, vá em **Build > Firestore Database**
4. Clique na coleção `avaliacoes_inova`
5. No canto superior direito, clique nos **3 pontinhos (⋮)** → **Exportar coleção**
6. Escolha o formato JSON

**Para converter JSON para Excel:**
- Use o site gratuito: https://www.convertcsv.com/json-to-csv.htm
- Cole o JSON → Baixe como CSV → Abra no Excel

---

## 📊 Método 2: Script Python Local (Recomendado para uso frequente)

Criei um script que você pode rodar no seu computador para baixar automaticamente:

### Passo 1: Certifique-se que tem o arquivo `firebase_credentials.json` na pasta

### Passo 2: Execute o script `exportar_firebase.py`

```bash
python exportar_firebase.py
```

O script irá:
- Conectar no Firebase
- Baixar todos os registros da coleção `avaliacoes_inova`
- Gerar um arquivo `Relatorio_INOVA_Firebase.xlsx` na pasta

---

## 🌐 Método 3: Criar uma Página de Admin (Avançado)

Se quiser, posso criar uma página protegida por senha no seu site onde você clica em um botão e baixa o Excel. Me avise se quiser essa opção!

---

## Estrutura dos Dados no Firebase

Cada documento na coleção `avaliacoes_inova` possui:

| Campo | Descrição |
|-------|-----------|
| `timestamp` | Data/hora do envio (automático) |
| `dataHora` | Data formatada (ex: 03/02/2026 00:40:00) |
| `avaliador` | Nome do avaliador |
| `funcao` | Função do avaliador |
| `area` | Área/Setor do avaliador |
| `ideiaId` | ID da ideia avaliada |
| `ideiaTitulo` | Título da ideia |
| `setorIdealizador` | Setor que propôs a ideia |
| `mediaGeral` | Média das notas (1-5) |
| `Clareza` | Nota do critério |
| `Grau de inovação` | Nota do critério |
| ... | (demais critérios) |

---

**Dúvidas?** Basta me perguntar!
