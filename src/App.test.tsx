import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { BOT_PROCESSING_TIME } from "./constant";

describe("McDonald's Order Controller", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(<App />);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Main UI", () => {
    it("renders the main UI elements", () => {
      expect(screen.getByText("New Normal Order")).toBeInTheDocument();
      expect(screen.getByText("New VIP Order")).toBeInTheDocument();
      expect(screen.getByText("+ Bot")).toBeInTheDocument();
      expect(screen.getByText("- Bot")).toBeInTheDocument();
      expect(screen.getByText("PENDING")).toBeInTheDocument();
      expect(screen.getByText("COMPLETE")).toBeInTheDocument();
    });

    it("adds a new normal order to the PENDING area", () => {
      const button = screen.getByText("New Normal Order");
      fireEvent.click(button);

      const firstPendingOrder = screen.getByText("PENDING").nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal)");
    });

    it("adds a new VIP order to the PENDING area", () => {
      const vipButton = screen.getByText("New VIP Order");

      fireEvent.click(vipButton);

      const firstPendingOrder = screen.getByText("PENDING").nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (VIP)");
    });

    it("adds a new normal order and a VIP order to the PENDING area", () => {
      const normalButton = screen.getByText("New Normal Order");
      const vipButton = screen.getByText("New VIP Order");

      fireEvent.click(normalButton);
      fireEvent.click(vipButton);

      const firstPendingOrder = screen.getByText("PENDING").nextSibling;
      const secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (VIP)");
    });
  });

  describe("Processing Normal Orders", () => {
    it("increments a bot after adds two new normal orders", async () => {
      const normalButton = screen.getByText("New Normal Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(normalButton);
      fireEvent.click(normalButton);
      fireEvent.click(addBotButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 1");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstPendingOrder).toHaveTextContent("Order #2 (Normal) (Bot 1)");
      expect(secondCompleteOrder).toBe(null);
      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (Normal)");
      expect(firstPendingOrder).toBe(null);
    });

    it("increments two bot after adds two new normal orders", () => {
      const normalButton = screen.getByText("New Normal Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(normalButton);
      fireEvent.click(normalButton);
      fireEvent.click(addBotButton);
      fireEvent.click(addBotButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 2");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (Normal) (Bot 2)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (Normal)");
      expect(firstPendingOrder).toBe(null);
    });

    it("adds two normal orders after adding a bot", async () => {
      const normalButton = screen.getByText("New Normal Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(addBotButton);
      fireEvent.click(normalButton);
      fireEvent.click(normalButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 1");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (Normal)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;
      secondPendingOrder = firstPendingOrder?.nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondCompleteOrder).toBe(null);
      expect(firstPendingOrder).toHaveTextContent("Order #2 (Normal) (Bot 1)");
      expect(secondPendingOrder).toBe(null);

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (Normal)");
      expect(firstPendingOrder).toBe(null);
    });

    it("adds two normal orders after adding two bots", async () => {
      const normalButton = screen.getByText("New Normal Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(addBotButton);
      fireEvent.click(addBotButton);
      fireEvent.click(normalButton);
      fireEvent.click(normalButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 2");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (Normal) (Bot 2)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (Normal)");
      expect(firstPendingOrder).toBe(null);
    });
  });

  describe("Processing VIP Orders", () => {
    it("increments a bot after adds two new VIP orders", async () => {
      const vipButton = screen.getByText("New VIP Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(vipButton);
      fireEvent.click(vipButton);
      fireEvent.click(addBotButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 1");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (VIP) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (VIP)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;
      secondPendingOrder = firstPendingOrder?.nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (VIP)");
      expect(secondCompleteOrder).toBe(null);
      expect(firstPendingOrder).toHaveTextContent("Order #2 (VIP) (Bot 1)");
      expect(secondPendingOrder).toBe(null);

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (VIP)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (VIP)");
      expect(firstPendingOrder).toBe(null);
    });

    it("increments two bot after adds two new VIP orders", () => {
      const vipButton = screen.getByText("New VIP Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(vipButton);
      fireEvent.click(vipButton);
      fireEvent.click(addBotButton);
      fireEvent.click(addBotButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 2");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (VIP) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (VIP) (Bot 2)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (VIP)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (VIP)");
      expect(firstPendingOrder).toBe(null);
    });

    it("adds two VIP orders after adding a bot", async () => {
      const vipButton = screen.getByText("New VIP Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(addBotButton);
      fireEvent.click(vipButton);
      fireEvent.click(vipButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 1");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (VIP) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (VIP)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;
      secondPendingOrder = firstPendingOrder?.nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (VIP)");
      expect(secondCompleteOrder).toBe(null);
      expect(firstPendingOrder).toHaveTextContent("Order #2 (VIP) (Bot 1)");
      expect(secondPendingOrder).toBe(null);

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (VIP)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (VIP)");
      expect(firstPendingOrder).toBe(null);
    });

    it("adds two VIP orders after adding two bots", async () => {
      const vipButton = screen.getByText("New VIP Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(addBotButton);
      fireEvent.click(addBotButton);
      fireEvent.click(vipButton);
      fireEvent.click(vipButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 2");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (VIP) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (VIP) (Bot 2)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (VIP)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (VIP)");
      expect(firstPendingOrder).toBe(null);
    });
  });

  describe("Processing Mixed Orders", () => {
    it("increments a bot after adds a normal and a VIP order", async () => {
      const normalButton = screen.getByText("New Normal Order");
      const vipButton = screen.getByText("New VIP Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(normalButton);
      fireEvent.click(vipButton);
      fireEvent.click(addBotButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 1");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (VIP) (Bot 1)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;
      secondPendingOrder = firstPendingOrder?.nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #2 (VIP)");
      expect(secondCompleteOrder).toBe(null);
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");
      expect(secondPendingOrder).toBe(null);

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #2 (VIP)");
      expect(secondCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(firstPendingOrder).toBe(null);
    });

    it("increments two bot after adds a normal and a VIP order", async () => {
      const normalButton = screen.getByText("New Normal Order");
      const vipButton = screen.getByText("New VIP Order");
      const addBotButton = screen.getByText("+ Bot");

      fireEvent.click(normalButton);
      fireEvent.click(vipButton);
      fireEvent.click(addBotButton);
      fireEvent.click(addBotButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 2");
      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 2)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (VIP) (Bot 1)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });
      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #2 (VIP)");
      expect(secondCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(firstPendingOrder).toBe(null);
    });
  });

  describe("Remove Bot", () => {
    it("removes a bot and stops processing orders", () => {
      const normalButton = screen.getByText("New Normal Order");
      const addBotButton = screen.getByText("+ Bot");
      const removeBotButton = screen.getByText("- Bot");

      fireEvent.click(normalButton);
      fireEvent.click(addBotButton);

      const botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 1");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");

      fireEvent.click(removeBotButton);

      expect(botCount.textContent).toBe("Bot Count: 0");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });

      firstPendingOrder = screen.getByText("PENDING").nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal)");
    });

    it("removes one of the two bots and continues processing orders", () => {
      const normalButton = screen.getByText("New Normal Order");
      const addBotButton = screen.getByText("+ Bot");
      const removeBotButton = screen.getByText("- Bot");

      fireEvent.click(normalButton);
      fireEvent.click(normalButton);
      fireEvent.click(addBotButton);
      fireEvent.click(addBotButton);

      let botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 2");

      let firstPendingOrder = screen.getByText("PENDING").nextSibling;
      let secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (Normal) (Bot 2)");

      fireEvent.click(removeBotButton);

      botCount = screen.getByText(/Bot Count:/);
      expect(botCount.textContent).toBe("Bot Count: 1");

      firstPendingOrder = screen.getByText("PENDING").nextSibling;
      secondPendingOrder = firstPendingOrder?.nextSibling;
      expect(firstPendingOrder).toHaveTextContent("Order #1 (Normal) (Bot 1)");
      expect(secondPendingOrder).toHaveTextContent("Order #2 (Normal)");

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });

      let firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      let secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;
      secondPendingOrder = firstPendingOrder?.nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondCompleteOrder).toBe(null);
      expect(firstPendingOrder).toHaveTextContent("Order #2 (Normal) (Bot 1)");
      expect(secondPendingOrder).toBe(null);

      act(() => {
        vi.advanceTimersByTime(BOT_PROCESSING_TIME);
      });

      firstCompleteOrder = screen.getByText("COMPLETE").nextSibling;
      secondCompleteOrder = firstCompleteOrder?.nextSibling;
      firstPendingOrder = screen.getByText("PENDING").nextSibling;

      expect(firstCompleteOrder).toHaveTextContent("Order #1 (Normal)");
      expect(secondCompleteOrder).toHaveTextContent("Order #2 (Normal)");
      expect(firstPendingOrder).toBe(null);
    });
  });
});
