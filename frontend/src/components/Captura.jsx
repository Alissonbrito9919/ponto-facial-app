import React, { useRef, useEffect, useState } from 'react';

// 1. Função de compressão isolada (Não gasta memória recriando a cada render)
const comprimirImagem = (base64Original) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Original;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Crava a largura em 480px, mantendo a proporção (reduz drasticamente o peso)
      const scale = 480 / img.width;
      canvas.width = 480;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // 0.7 = 70% de qualidade JPEG. 
      const imagemComprimida = canvas.toDataURL('image/jpeg', 0.7);
      resolve(imagemComprimida);
    };
  });
};

export default function Captura({ avancarTela, dadosPonto }) {
  const videoRef = useRef(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Liga a câmara 
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

    // Pede a localização GPS do dispositivo PRIMEIRO
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (posicao) => {
          try {
            // 2. Extrai o frame atual do vídeo original
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            const fotoOriginal = canvas.toDataURL('image/jpeg', 1.0);

            // 3. APLICA A COMPRESSÃO ANTES DO ENVIO (O segredo da otimização)
            const fotoLeve = await comprimirImagem(fotoOriginal);

            const lat = posicao.coords.latitude;
            const lon = posicao.coords.longitude;

            // 4. Monta o pacote de dados com a foto de 30KB
            const pacote = {
              cpf: dadosPonto.cpf,
              tipo_batida: dadosPonto.tipo,
              foto_base64: fotoLeve, 
              latitude: lat,
              longitude: lon
            };

            // 5. Dispara o POST para o FastAPI
            const resposta = await fetch('https://api-ponto-facial-7h06.onrender.com/bater-ponto', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pacote)
            });

            const resultado = await resposta.json();
            setCarregando(false);

            // 6. Trata a resposta do servidor
            if (resultado.status === 'sucesso') {
              avancarTela('feedback'); // Vai para a tela azul de sucesso
            } else {
              alert("Erro: " + resultado.mensagem); 
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
      {/* Linha corrigida, removido o hífen solto que quebrava o JSX */}
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