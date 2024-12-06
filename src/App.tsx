import { useRef, useState } from "react";
import "./App.css";
import { BOT_PROCESSING_TIME } from "./constant";
import { Bot, Order } from "./type";

function App() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  const orderIdRef = useRef(1);
  const botIdRef = useRef(1);

  const pendingNormalOrderQueueRef = useRef<Order[]>([]);
  const pendingVipOrderQueueRef = useRef<Order[]>([]);
  const idleBotQueueRef = useRef<Bot[]>([]);

  const handleOrder = (type: "NORMAL" | "VIP") => {
    const newOrder: Order = {
      id: orderIdRef.current,
      type,
    };
    switch (type) {
      case "NORMAL":
        pendingNormalOrderQueueRef.current.push(newOrder);
        break;
      case "VIP":
        pendingVipOrderQueueRef.current.push(newOrder);
        break;
    }
    orderIdRef.current = orderIdRef.current + 1;
    setPendingOrders((prev) => [...prev, newOrder]);
    processNextOrder();
  };

  const addNormalOrderHandler = () => {
    handleOrder("NORMAL");
  };

  const addVipOrderHandler = () => {
    handleOrder("VIP");
  };

  const addBotHandler = () => {
    const newBot: Bot = {
      id: botIdRef.current,
      currentOrder: null,
      timerId: null,
    };
    idleBotQueueRef.current.push(newBot);
    botIdRef.current = botIdRef.current + 1;
    setBots((prev) => [...prev, newBot]);
    processNextOrder();
  };

  const removeBotHandler = () => {
    if (bots.length === 0) return;
    const lastBot = bots[bots.length - 1];
    idleBotQueueRef.current = idleBotQueueRef.current.filter(
      (bot) => bot.id !== lastBot.id
    );
    setBots((prev) => prev.slice(0, prev.length - 1));

    const currentOrder = lastBot?.currentOrder;

    if (lastBot.timerId) {
      clearTimeout(lastBot.timerId);
    }

    if (currentOrder) {
      switch (currentOrder.type) {
        case "NORMAL":
          pendingNormalOrderQueueRef.current.unshift(currentOrder);
          break;
        case "VIP":
          pendingVipOrderQueueRef.current.unshift(currentOrder);
          break;
      }
    }
  };

  const getNextOrder = () => {
    if (pendingVipOrderQueueRef.current.length > 0) {
      const vipOrder = pendingVipOrderQueueRef.current.shift();
      return vipOrder;
    } else if (pendingNormalOrderQueueRef.current.length > 0) {
      const normalOrder = pendingNormalOrderQueueRef.current.shift();
      return normalOrder;
    }
  };

  const getNextBot = (order: Order | null) => {
    const nextBot = idleBotQueueRef.current.shift();
    if (nextBot) {
      nextBot.currentOrder = order;
      setBots((prev) =>
        prev.map((bot) => (bot.id === nextBot.id ? nextBot : bot))
      );
      return nextBot;
    }
  };

  const processNextOrder = () => {
    const isAnyBotIdle = idleBotQueueRef.current.length > 0;
    const isAnyOrderPending =
      pendingVipOrderQueueRef.current.length > 0 ||
      pendingNormalOrderQueueRef.current.length > 0;

    if (!isAnyBotIdle || !isAnyOrderPending) return;
    const nextOrder = getNextOrder();
    const nextBot = getNextBot(nextOrder || null);

    if (!nextOrder || !nextBot) return;

    processOrder(nextOrder, nextBot);
  };

  const processOrder = (targetOrder: Order, targetBot: Bot) => {
    const timerId = setTimeout(() => {
      const completedBot = {
        id: targetBot.id,
        currentOrder: null,
        timerId: null,
      };
      idleBotQueueRef.current.push(completedBot);

      setBots((prev) =>
        prev.map((bot) => (bot.id === targetBot.id ? completedBot : bot))
      );

      setCompletedOrders((prev) => [...prev, targetOrder]);
      setPendingOrders((prev) =>
        prev.filter((order) => order.id !== targetOrder.id)
      );

      processNextOrder();
    }, BOT_PROCESSING_TIME);

    targetBot.timerId = timerId;
    processNextOrder();
  };

  const getProcessingBot = (orderId: number) => {
    const bot = bots.find((bot) => bot.currentOrder?.id === orderId);
    return bot ? `(Bot ${bot.id})` : "";
  };

  return (
    <div className='container'>
      <div className='flex-center'>
        <button onClick={addNormalOrderHandler}>New Normal Order</button>
        <button onClick={addVipOrderHandler}>New VIP Order</button>
      </div>
      <div className='flex-center'>
        <button onClick={addBotHandler}>+ Bot</button>
        <p>Bot Count: {bots.length}</p>
        <button onClick={removeBotHandler}>- Bot</button>
      </div>
      <div className='flex-center'>
        <div className='card pending'>
          <h3>PENDING</h3>
          {pendingOrders.map((order) => (
            <div key={order.id}>
              Order #{order.id} ({order.type === "NORMAL" ? "Normal" : "VIP"}){" "}
              {getProcessingBot(order.id)}
            </div>
          ))}
        </div>
        <div className='card complete'>
          <h3>COMPLETE</h3>
          {completedOrders.map((order) => (
            <div key={order.id}>
              Order #{order.id} ({order.type === "NORMAL" ? "Normal" : "VIP"})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
