import { useState } from 'react'
import Identificacao from './components/Identificacao'
import Captura from './components/Captura'
import Feedback from './components/Feedback'

function App() {
  const [telaAtual, setTelaAtual] = useState('identificacao')

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {telaAtual === 'identificacao' && (
        <Identificacao avancarTela={setTelaAtual} />
      )}
      
      {telaAtual === 'captura' && (
        <Captura avancarTela={setTelaAtual} />
      )}
      
      {telaAtual === 'feedback' && (
        <Feedback avancarTela={setTelaAtual} />
      )}
    </div>
  )
}

export default App