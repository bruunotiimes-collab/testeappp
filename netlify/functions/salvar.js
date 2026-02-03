import admin from 'firebase-admin';

// Inicializa o Firebase apenas uma vez
let db;
function getFirestore() {
    if (!admin.apps.length) {
        const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        admin.initializeApp({
            credential: admin.credential.cert(credentials)
        });
    }
    if (!db) {
        db = admin.firestore();
    }
    return db;
}

export async function handler(event) {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Validação básica
        if (!data.avaliador || !data.ideia || !data.avaliacoes) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Dados incompletos' })
            };
        }

        // Prepara o documento para o Firestore
        const documento = {
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            dataHora: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            avaliador: data.avaliador.nome,
            funcao: data.avaliador.funcao,
            area: data.avaliador.area,
            ideiaId: data.ideia.id,
            ideiaTitulo: data.ideia.titulo,
            setorIdealizador: data.ideia.setorIdealizador,
            mediaGeral: data.mediaGeral,
            avaliacoes: {}
        };

        // Adiciona cada critério de avaliação
        for (const [key, value] of Object.entries(data.avaliacoes)) {
            documento.avaliacoes[key] = {
                label: value.label,
                valor: value.valor
            };
            // Também salva como campo direto para facilitar exportação
            documento[value.label] = value.valor;
        }

        // Salva no Firestore
        const firestore = getFirestore();
        await firestore.collection('avaliacoes_inova').add(documento);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Avaliação salva com sucesso!',
                status: 'saved',
                firebase: true
            })
        };

    } catch (error) {
        console.error('Erro ao salvar:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Erro ao processar avaliação',
                details: error.message
            })
        };
    }
}
