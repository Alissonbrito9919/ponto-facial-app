import React, { useState } from 'react';
import logo from '../assets/logo.jpeg';

export default function Identificacao({ avancarTela, guardarDadosPonto }) {
  const [cpf, setCpf] = useState('');

  const lidarComBatida = (tipo) => {
    if (cpf.length < 11) {
      alert("Por favor, introduza um CPF válido (11 dígitos).");
      return;
    }
    // Guarda o CPF e o Tipo (Entrada, Saída...) na memória principal do App
    guardarDadosPonto({ cpf, tipo });
    avancarTela('captura');
  };

  return (
    <div style={styles.container}>
      <img src={logo} alt="Logótipo Puncto" style={styles.logo} />
      <h2 style={styles.title}>Registo de Ponto</h2>
      
      <div style={styles.form}>
        <label style={styles.label}>O seu CPF (apenas números)</label>
        <input 
          type="number" 
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="Ex: 12345678900" 
          style={styles.input}
        />

        <label style={styles.label}>Selecione o tipo de registo:</label>
        <div style={styles.grid}>
          <button style={styles.btnGrid} onClick={() => lidarComBatida('Entrada')}>☀️ Entrada</button>
          <button style={styles.btnGrid} onClick={() => lidarComBatida('Almoço')}>🍽️ Almoço</button>
          <button style={styles.btnGrid} onClick={() => lidarComBatida('Retorno')}>💼 Retorno</button>
          <button style={styles.btnGrid} onClick={() => lidarComBatida('Saída')}>🌙 Saída</button>
        </div>
        
        <button style={styles.btnVoltar} onClick={() => avancarTela('home')}>
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 20px', fontFamily: 'sans-serif'
  },
  logo: { height: '50px', marginBottom: '16px', objectFit: 'contain' },
  title: { color: '#2563EB', fontSize: '24px', marginBottom: '32px' },
  form: { width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column' },
  label: { color: '#1E293B', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' },
  input: {
    height: '56px', borderRadius: '8px', border: '1px solid #E2E8F0',
    padding: '0 16px', fontSize: '16px', marginBottom: '24px', outline: 'none'
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px'
  },
  btnGrid: {
    height: '60px', backgroundColor: '#FFFFFF', color: '#1E293B', border: '1px solid #CBD5E1',
    borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  btnVoltar: {
    background: 'none', border: 'none', color: '#64748B', fontSize: '16px',
    fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'
  }
};