import React, { useState, useRef, useEffect } from 'react';

export default function Cadastro({ avancarTela }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [carregando, setCarregando] = useState(false);
  const videoRef = useRef(null);

  // Liga a câmara ao abrir o ecrã
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Erro ao aceder à câmara:", err));

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const lidarComCadastro = async () => {
    if (!nome || cpf.length < 11 || !dataNasc) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setCarregando(true);

    // 1. Tira a foto de base
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);

    // 2. Prepara o pacote de dados
    const pacote = {
      nome: nome,
      cpf: cpf,
      data_nascimento: dataNasc,
      foto_base64: fotoBase64
    };

    // 3. Envia para o FastAPI
    try {
      const resposta = await fetch('http://localhost:8000/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pacote)
      });

      const resultado = await resposta.json();
      setCarregando(false);

      if (resultado.status === 'sucesso') {
        alert("Cadastro realizado com sucesso! Já pode bater o ponto.");
        avancarTela('home'); // Volta ao início após o sucesso
      } else {
        alert("Erro no cadastro: " + resultado.mensagem);
      }
    } catch (erro) {
      setCarregando(false);
      alert("Erro ao conectar com o servidor. A API está a correr?");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Novo Registo</h2>
      
      <div style={styles.form}>
        <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} style={styles.input} />
        <input type="number" placeholder="CPF (apenas números)" value={cpf} onChange={e => setCpf(e.target.value)} style={styles.input} />
        <input type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)} style={styles.input} />
      </div>

      <div style={styles.videoContainer}>
        <video ref={videoRef} autoPlay playsInline style={styles.video} />
      </div>

      <button onClick={lidarComCadastro} disabled={carregando} style={{...styles.btnPrincipal, opacity: carregando ? 0.5 : 1}}>
        {carregando ? 'A registar...' : '📸 Tirar Foto e Registar'}
      </button>

      <button onClick={() => avancarTela('home')} style={styles.btnVoltar}>Cancelar</button>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '20px', fontFamily: 'sans-serif' },
  title: { color: '#2563EB', fontSize: '24px', marginBottom: '24px' },
  form: { width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  input: { height: '48px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 16px', fontSize: '16px', outline: 'none' },
  videoContainer: { width: '100%', maxWidth: '360px', height: '300px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  btnPrincipal: { width: '100%', maxWidth: '360px', height: '56px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' },
  btnVoltar: { background: 'none', border: 'none', color: '#64748B', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }
};