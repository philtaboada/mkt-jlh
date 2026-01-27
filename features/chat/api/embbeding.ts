'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Genera un embedding para una cadena de texto usando Google
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await genAI
      .getGenerativeModel({ model: 'text-embedding-004' })
      .embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generando embedding:', error);
    throw error;
  }
}

/**
 * Busca chunks relevantes en la base de datos vectorial
 */
export async function searchRelevantChunks(
  query: string,
  topK: number = 3,
  threshold: number = 0.5
): Promise<{ content: string; file_name: string; similarity: number }[]> {
  console.log('🔎 EMBEDDING SEARCH - INICIO');
  console.log('🔎 Query completa:', query);
  console.log('🔎 Parámetros: topK=' + topK + ', threshold=' + threshold);

  try {
    const supabase = await createClient();
    console.log('🔎 Supabase client creado');

    console.log('🔎 Generando embedding para la query...');
    const queryEmbedding = await generateEmbedding(query);
    console.log('🔎 Embedding generado exitosamente');
    console.log('🔎 Longitud del embedding:', queryEmbedding.length);
    console.log('🔎 Primeros 5 valores:', queryEmbedding.slice(0, 5));

    console.log('🔎 Ejecutando consulta RPC similarity_search...');
    const { data, error } = await supabase.rpc('similarity_search', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: threshold,
      match_count: topK,
    });

    console.log('🔎 Consulta RPC completada');
    console.log('🔎 Error de la consulta:', error);

    if (error) {
      console.error('❌ ERROR en búsqueda vectorial:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    console.log('🔎 Datos crudos de la respuesta:', data);
    console.log('🔎 Número de resultados encontrados:', data?.length || 0);

    if (data && data.length > 0) {
      console.log('📊 RESULTADOS DETALLADOS:');
      data.forEach((result: any, index: number) => {
        console.log(`   --- Resultado ${index + 1} ---`);
        console.log(`   Archivo: ${result.file_name}`);
        console.log(`   Similitud: ${result.similarity}`);
        console.log(`   Contenido (primeros 150 chars): "${result.content?.substring(0, 150)}..."`);
        console.log(`   Longitud del contenido: ${result.content?.length || 0} caracteres`);
      });
    } else {
      console.log('⚠️ NO SE ENCONTRARON RESULTADOS');
      console.log('⚠️ Posibles causas:');
      console.log('   - No hay documentos procesados en la base de datos');
      console.log('   - El threshold es demasiado alto (' + threshold + ')');
      console.log('   - La query no tiene similitud con el contenido existente');
      console.log('   - Error en la función RPC similarity_search');
    }

    const finalResult = data || [];
    console.log('🔎 RETORNANDO ' + finalResult.length + ' resultados');
    return finalResult;
  } catch (error) {
    console.error('❌ ERROR GENERAL en searchRelevantChunks:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return [];
  }
}

/**
 * Procesa un documento y guarda sus chunks con embeddings
 */
export async function processDocument(
  text: string,
  fileName: string,
  chunkSize: number = 500
): Promise<void> {
  console.log(
    `📄 Processing: Iniciando procesamiento de ${fileName}, tamaño: ${text.length} caracteres`
  );
  const supabase = await createClient();
  const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
  console.log(
    `✂️ Processing: Documento dividido en ${chunks.length} chunks de ${chunkSize} caracteres`
  );

  for (let i = 0; i < chunks.length; i++) {
    console.log(`🔄 Processing: Generando embedding para chunk ${i + 1}/${chunks.length}`);
    const embedding = await generateEmbedding(chunks[i]);

    const { error } = await supabase.from('mkt_document_chunks').insert({
      content: chunks[i],
      embedding: `[${embedding.join(',')}]`,
      file_name: fileName,
      chunk_index: i,
    });

    if (error) {
      console.error('❌ Processing: Error insertando chunk:', error);
      throw error;
    }
  }
  console.log(
    `✅ Processing: ${fileName} procesado exitosamente - ${chunks.length} chunks guardados`
  );
}

/**
 * Obtiene estadísticas de la base de conocimientos
 */
export async function getKnowledgeBaseStats(): Promise<{
  totalChunks: number;
  totalFiles: number;
}> {
  console.log('📊 Stats: Consultando estadísticas de la base de conocimientos...');
  try {
    const supabase = await createClient();
    console.log('📊 Stats: Cliente Supabase creado');

    const { count: totalChunks, error: countError } = await supabase
      .from('mkt_document_chunks')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('📊 Stats: Error en count query:', countError);
    }

    console.log('📊 Stats: Count query result:', { totalChunks, error: countError });

    const { data: files, error: filesError } = await supabase
      .from('mkt_document_chunks')
      .select('file_name');

    if (filesError) {
      console.error('📊 Stats: Error en files query:', filesError);
    }

    console.log('📊 Stats: Files query result:', { filesCount: files?.length, error: filesError });

    const uniqueFiles = new Set(files?.map((f) => f.file_name) || []);

    const result = {
      totalChunks: totalChunks || 0,
      totalFiles: uniqueFiles.size,
    };
    console.log('Knowledge base stats:', result);
    return result;
  } catch (error) {
    console.error('❌ Stats: Error obteniendo stats:', error);
    return { totalChunks: 0, totalFiles: 0 };
  }
}
