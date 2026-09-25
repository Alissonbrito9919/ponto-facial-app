import React, { useRef, useEffect, useState } from 'react';

export default function Captura({ avancarTela }) {
  const videoRef = useRef(null);
  const [erroCamera, setErroCamera] = useState(false);

  useEffect(() => {
    // Liga a câmera frontal
    const iniciarCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        setErroCamera(true);
      }
    };

    iniciarCamera();

    // Desliga a câmera para liberar a memória quando o usuário sair desta tela
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const lidarComCaptura = () => {
    // Na próxima etapa, adicionaremos a lógica de tirar a foto e enviar à API.
    // Por enquanto, o clique simula o sucesso e vai para o comprovante.
    avancarTela('feedback');
  };

  return (
    <div style={styles.container}>
      {erroCamera ? (
        <p style={styles.erro}>Erro ao acessar a câmera. Verifique as permissões do navegador.</p>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={styles.video} 
          />
          
          <div style={styles.mascara}>
            <div style={styles.textoFlutuante}>Alinhe seu rosto no centro</div>
            
            <div style={styles.guiaRosto}></div>
            
            <button onClick={lidarComCaptura} style={styles.btnCaptura}>
              <div style={styles.btnCapturaInterno}></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#000',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden'
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1
  },
  mascara: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '60px 0 40px 0',
    zIndex: 2,
    // Cria a camada escura em cima do vídeo sem esconder o recorte central
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  textoFlutuante: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
  },
  guiaRosto: {
    width: '280px',
    height: '380px',
    border: '3px solid #2563EB',
    borderRadius: '50%',
    // O boxShadow gigante simula o recorte vazado na máscara
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
    marginTop: '20px'
  },
  btnCaptura: {
    width: '80px',
    height: '80px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
    marginBottom: '20px'
  },
  btnCapturaInterno: {
    width: '64px',
    height: '64px',
    border: '3px solid #2563EB',
    borderRadius: '50%'
  },
  erro: {
    color: '#FFFFFF',
    padding: '20px',
    textAlign: 'center'
  }
};