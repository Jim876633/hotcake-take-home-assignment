export interface Order {
  id: number;
  type: "NORMAL" | "VIP";
}

export interface Bot {
  id: number;
  currentOrder: Order | null;
  timerId: number | null;
}
