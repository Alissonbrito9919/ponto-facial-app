import React from 'react';
import logo from '../assets/logo.jpeg';

export default function Home({ avancarTela }) {
  return (
    <div style={styles.container}>
      <img src={logo} alt="Logótipo Puncto" style={styles.logo} />
      <h1 style={styles.title}>Bem-vindo</h1>
      <p style={styles.subtitle}>Selecione uma opção para continuar</p>

      <div style={styles.botoes}>
        <button style={styles.btnPrincipal} onClick={() => avancarTela('identificacao')}>
          Bater Ponto
        </button>
        
        <button style={styles.btnSecundario} onClick={() => avancarTela('cadastro')}>
          Novo Registo
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#F8FAFC', padding: '20px', fontFamily: 'sans-serif'
  },
  logo: { height: '80px', marginBottom: '24px', objectFit: 'contain' },
  title: { color: '#1E293B', fontSize: '28px', marginBottom: '8px' },
  subtitle: { color: '#64748B', fontSize: '16px', marginBottom: '40px' },
  botoes: { width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '16px' },
  btnPrincipal: {
    height: '56px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none',
    borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
  },
  btnSecundario: {
    height: '56px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB',
    borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
  }
};