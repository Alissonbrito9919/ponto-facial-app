import { useState } from 'react'
import Home from './components/Home'
import Cadastro from './components/Cadastro'
import Identificacao from './components/Identificacao'
import Captura from './components/Captura'
import Feedback from './components/Feedback'

function App() {
  const [telaAtual, setTelaAtual] = useState('home')
  
  // Estado global para guardar os dados da batida (CPF e Tipo) para enviar à API depois
  const [dadosPonto, setDadosPonto] = useState({ cpf: '', tipo: '' })

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {telaAtual === 'home' && (
        <Home avancarTela={setTelaAtual} />
      )}

      {telaAtual === 'identificacao' && (
        <Identificacao avancarTela={setTelaAtual} guardarDadosPonto={setDadosPonto} />
      )}
      
      {telaAtual === 'cadastro' && (
        <Cadastro avancarTela={setTelaAtual} />
      )}
      
      {telaAtual === 'captura' && (
        <Captura avancarTela={setTelaAtual} dadosPonto={dadosPonto} />
      )}
      
      {telaAtual === 'feedback' && (
        <Feedback avancarTela={setTelaAtual} dadosPonto={dadosPonto} />
      )}
    </div>
  )
}

export default App