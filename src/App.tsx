import "./App.css";

function App() {
  const normalOrderHandler = () => {};

  const vipOrderHandler = () => {};

  const addBotHandler = () => {};

  const removeBotHandler = () => {};

  return (
    <div className='container'>
      <div className='flex-center'>
        <button onClick={normalOrderHandler}>New Normal Order</button>
        <button onClick={vipOrderHandler}>New VIP Order</button>
      </div>
      <div className='flex-center'>
        <button onClick={addBotHandler}>+ Bot</button>
        <p>Bot Count: </p>
        <button onClick={removeBotHandler}>- Bot</button>
      </div>
      <div className='flex-center'>
        <div className='card pending'>
          <h3>PENDING</h3>
        </div>
        <div className='card complete'>
          <h3>COMPLETE</h3>
        </div>
      </div>
    </div>
  );
}

export default App;
