import React, { useRef, useEffect, useState } from 'react';

export default function Captura({ avancarTela, dadosPonto }) {
  const videoRef = useRef(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Liga a câmara quando o ecrã abre
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Erro ao acessar a câmara:", err));

    // Desliga a câmara quando o ecrã fecha (limpeza de memória)
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const lidarComCaptura = () => {
    setCarregando(true);

    // 1. Tira a foto do vídeo para um canvas invisível
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Converte a imagem para base64
    const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);

    // 2. Pede a localização GPS do dispositivo
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (posicao) => {
          const lat = posicao.coords.latitude;
          const lon = posicao.coords.longitude;

          // 3. Monta o pacote de dados exigido pelo backend
          const pacote = {
            cpf: dadosPonto.cpf,
            tipo_batida: dadosPonto.tipo,
            foto_base64: fotoBase64,
            latitude: lat,
            longitude: lon
          };

          try {
            // 4. Dispara o POST para o FastAPI
            const resposta = await fetch('http://localhost:8000/bater-ponto', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pacote)
            });

            const resultado = await resposta.json();
            setCarregando(false);

            // 5. Trata a resposta do servidor
            if (resultado.status === 'sucesso') {
              avancarTela('feedback'); // Vai para a tela azul de sucesso
            } else {
              alert("Erro: " + resultado.mensagem); // Mostra o erro (ex: CPF não encontrado)
            }

          } catch (erro) {
            setCarregando(false);
            alert("Erro de comunicação com o servidor. Verifique se a API está rodando.");
            console.error(erro);
          }
        },
        (erro) => {
          setCarregando(false);
          alert("Por favor, ative a localização (GPS) para bater o ponto.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setCarregando(false);
      alert("O seu navegador não suporta geolocalização.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Posicione o seu rosto</h2>
      <p style={styles.subtitle}>{dadosPonto.tipo} - CPF: {dadosPonto.cpf}</p>
      
      <div style={styles.videoContainer}>
        <video ref={videoRef} autoPlay playsInline style={styles.video} />
      </div>

      <button 
        onClick={lidarComCaptura} 
        style={{...styles.btnCapturar, opacity: carregando ? 0.5 : 1}}
        disabled={carregando}
      >
        {carregando ? 'A validar biometria...' : '📸 Confirmar Ponto'}
      </button>
      
      <button style={styles.btnVoltar} onClick={() => avancarTela('identificacao')}>
        Cancelar
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', backgroundColor: '#1E293B', padding: '20px', fontFamily: 'sans-serif'
  },
  title: { color: '#FFFFFF', fontSize: '24px', marginBottom: '8px' },
  subtitle: { color: '#94A3B8', fontSize: '16px', marginBottom: '24px' },
  videoContainer: {
    width: '100%', maxWidth: '360px', height: '480px', backgroundColor: '#000',
    borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', border: '4px solid #334155'
  },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  btnCapturar: {
    width: '100%', maxWidth: '360px', height: '64px', backgroundColor: '#2563EB',
    color: '#FFFFFF', border: 'none', borderRadius: '32px', fontSize: '20px',
    fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px'
  },
  btnVoltar: {
    background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px',
    fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'
  }
};