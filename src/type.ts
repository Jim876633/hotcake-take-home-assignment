export interface Order {
  id: number;
  type: "NORMAL" | "VIP";
  status: "PENDING" | "COMPLETE";
}

export interface Bot {
  id: number;
  status: "IDLE" | "PROCESSING";
  currentOrder: Order | null;
}
