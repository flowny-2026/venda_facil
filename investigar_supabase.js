#!/usr/bin/env node

/**
 * Script para investigar a estrutura do banco de dados Supabase
 * Usa a API REST do Supabase para obter informações sobre tabelas, colunas e políticas RLS
 */

const https = require('https');

const SUPABASE_URL = 'https://cvmjjzhvdmpbxquxepue.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWpqemh2ZG1wYnhxdXhlcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjUxMzQsImV4cCI6MjA4OTc0MTEzNH0.Kp_sWNFiQyBKvkEBFIp8Y5dQCYFP-WDDprCVM6wbqEg';

// Função para fazer requisições HTTPS
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Função para obter informações sobre tabelas
async function getTables() {
  console.log('\n📊 INVESTIGANDO TABELAS DO SUPABASE\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Projeto: responsabilidade_liz\n');
  
  try {
    // Tentar obter informações via REST API
    console.log('Tentando acessar via REST API...\n');
    
    // Listar tabelas
    const tablesPath = '/rest/v1/?apiversion=1';
    const tablesResponse = await makeRequest(tablesPath);
    
    console.log('Status:', tablesResponse.status);
    console.log('Response:', JSON.stringify(tablesResponse.data, null, 2));
    
  } catch (error) {
    console.error('Erro ao acessar Supabase:', error.message);
  }
}

// Executar
getTables().catch(console.error);
