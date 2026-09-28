import React from 'react';
import logo from '../assets/logo.jpeg';


export default function Feedback({ avancarTela }) {
  // Captura a hora local para mostrar no comprovativo visual
  const horaAtual = new Date().toLocaleTimeString('pt-BR');

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Logótipo Puncto" style={styles.logo} />
        <div style={styles.icone}>✅</div>
        <h2 style={styles.titulo}>Ponto Aprovado!</h2>
        
        <div style={styles.dadosPonto}>
          {/* O nome está fixo temporariamente até ligarmos os estados */}
          <p style={styles.linhaDado}>Nome: <span style={styles.destaque}>Alisson</span></p>
          <p style={styles.linhaDado}>Horário: <span style={styles.destaque}>{horaAtual}</span></p>
          <p style={styles.linhaDado}>Status: <span style={styles.destaque}>Entrada Registrada</span></p>
        </div>
      </div>

      <button onClick={() => avancarTela('identificacao')} style={styles.btnSecundario}>
        Novo Registo
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#2563EB', // Fundo azul
    padding: '20px',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box'
  },
  logo: {
    height: '60px', 
    marginBottom: '16px',
    objectFit: 'contain'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '360px',
    padding: '40px 24px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    marginBottom: '24px'
  },
  icone: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  titulo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1E293B',
    margin: '0 0 24px 0'
  },
  dadosPonto: {
    textAlign: 'left',
    backgroundColor: '#F8FAFC',
    padding: '16px',
    borderRadius: '8px'
  },
  linhaDado: {
    margin: '0 0 8px 0',
    fontSize: '15px',
    color: '#1E293B'
  },
  destaque: {
    fontWeight: 'bold',
    color: '#2563EB'
  },
  btnSecundario: {
    width: '100%',
    maxWidth: '360px',
    height: '56px',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    border: '2px solid #FFFFFF',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};