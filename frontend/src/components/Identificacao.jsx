import React, { useState } from 'react';

export default function Identificacao({ avancarTela }) {
  const [matricula, setMatricula] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (matricula.trim() !== '') {
      // Aqui vamos passar o ID para a próxima tela no futuro
      avancarTela('captura');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Registro de Ponto</h1>
        <p style={styles.subtitle}>Acesso Seguro por Biometria</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Digite sua Matrícula ou ID</label>
        <input 
          type="text" 
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          placeholder="Ex: 123456" 
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Avançar
        </button>
      </form>
    </div>
  );
}

// Estilos direto no componente para agilizar o MVP
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#F8FAFC', // Fundo off-white
    padding: '20px',
    fontFamily: 'sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    color: '#2563EB', // Azul primário
    fontSize: '28px',
    margin: '0 0 8px 0'
  },
  subtitle: {
    color: '#64748B',
    fontSize: '16px',
    margin: 0
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    color: '#1E293B',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  input: {
    height: '56px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    padding: '0 16px',
    fontSize: '16px',
    marginBottom: '24px',
    outline: 'none'
  },
  button: {
    height: '56px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};