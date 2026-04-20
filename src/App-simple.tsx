function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#020617', 
      color: '#f1f5f9',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎉 Dashboard Funcionando!</h1>
      <p>Se você vê esta mensagem, o React está carregando corretamente.</p>
      <div style={{ 
        backgroundColor: '#1e293b', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '20px'
      }}>
        <h2>✅ Teste Básico</h2>
        <p>Servidor: Funcionando</p>
        <p>React: Funcionando</p>
        <p>CSS: Funcionando</p>
      </div>
    </div>
  );
}

export default App;