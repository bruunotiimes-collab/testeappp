# Configuração do Firebase para o INOVA LOS

Para que as respostas sejam enviadas para o banco de dados na nuvem (Firebase), você precisa seguir estes passos simples:

## 1. Criar um Projeto no Firebase
1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Clique em **"Adicionar projeto"** e dê o nome de `INOVA-LOS`.
3. Siga as instruções e clique em **"Criar projeto"**.

## 2. Ativar o Firestore (Banco de Dados)
1. No menu lateral esquerdo, vá em **Build > Firestore Database**.
2. Clique em **"Criar banco de dados"**.
3. Escolha a localização (ex: `us-east1`) e clique em **Próximo**.
4. Inicie em **Modo de Produção** ou **Modo de Teste** (para começar rápido, modo de teste é mais fácil).

## 3. Gerar a Chave de Acesso (JSON)
1. Clique no ícone de engrenagem (Configurações do Projeto) ao lado de "Project Overview".
2. Vá na aba **Contas de Serviço**.
3. Certifique-se de que "Node.js" ou "Python" esteja selecionado.
4. Clique no botão azul **"Gerar nova chave privada"**.
5. Um arquivo `.json` será baixado.

## 4. Integrar com o App
1. Renomeie o arquivo baixado para `firebase_credentials.json`.
2. Cole este arquivo dentro da pasta do projeto:
   `...\Meus Apps Python\Formulário avaliação INOVALOS\`
3. Reinicie o seu `app.py`.

---

### O que mudou no código?
- **app.py**: Agora ele detecta automaticamente se o arquivo `firebase_credentials.json` existe. Se existir, ele salva cada avaliação no Google Cloud Firestore (nuvem) e também mantém o Excel local como backup.
- **Relatório**: Ao clicar em "Extrair Relatório Excel", o sistema agora baixa os dados diretamente do Firebase, garantindo que você tenha as informações mais atualizadas, mesmo que mude de computador.
- **Visual**: O design foi totalmente renovado para um visual "Premium" com fontes modernas, sombras suaves e animações.

**Dúvidas?** Basta me perguntar!
