import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("McDonald's Order Controller", () => {
  beforeEach(() => {
    render(<App />);
  });

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

    const pendingOrders = screen.getByText("PENDING").nextSibling;
    expect(pendingOrders).toContainHTML("<div>Order #1 (Normal)</div>");
  });

  it("adds a new VIP order to the PENDING area before normal orders", () => {
    const normalButton = screen.getByText("New Normal Order");
    const vipButton = screen.getByText("New VIP Order");

    fireEvent.click(normalButton);
    fireEvent.click(vipButton);

    const pendingOrders = screen.getByText("PENDING").nextSibling;
    expect(pendingOrders).toContainHTML("<div>Order #2 (VIP)</div>");
    expect(pendingOrders).toContainHTML("<div>Order #1 (Normal)</div>");
    // Ensure the VIP order comes before the normal order
    expect((pendingOrders as HTMLElement).innerHTML).toMatch(
      /Order #2 \(VIP\).*Order #1 \(Normal\)/s
    );
  });

  it("increments bot count and starts processing orders", async () => {
    const normalButton = screen.getByText("New Normal Order");
    const addBotButton = screen.getByText("+ Bot");

    fireEvent.click(normalButton);
    fireEvent.click(addBotButton);

    // Check bot count
    const botCount = screen.getByText(/Bot Count:/);
    expect(botCount.textContent).toBe("Bot Count: 1");

    // Wait 10 seconds and check order status
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const pendingOrders = screen.getByText("PENDING")
      .nextSibling as HTMLElement;
    const completeOrders = screen.getByText("COMPLETE")
      .nextSibling as HTMLElement;

    expect(pendingOrders).not.toContainHTML("<div>Order #1 (Normal)</div>");
    expect(completeOrders).toContainHTML("<div>Order #1 (Normal)</div>");
  });

  it("removes the newest bot and stops processing orders", () => {
    const normalButton = screen.getByText("New Normal Order");
    const addBotButton = screen.getByText("+ Bot");
    const removeBotButton = screen.getByText("- Bot");

    fireEvent.click(normalButton);
    fireEvent.click(addBotButton);

    const botCount = screen.getByText(/Bot Count:/);
    expect(botCount.textContent).toBe("Bot Count: 1");

    fireEvent.click(removeBotButton);

    expect(botCount.textContent).toBe("Bot Count: 0");

    // Ensure the order is back in the PENDING area
    const pendingOrders = screen.getByText("PENDING").nextSibling;
    expect(pendingOrders).toContainHTML("<div>Order #1 (Normal)</div>");
  });

  it("processes orders in priority order with multiple bots", async () => {
    const normalButton = screen.getByText("New Normal Order");
    const vipButton = screen.getByText("New VIP Order");
    const addBotButton = screen.getByText("+ Bot");

    fireEvent.click(normalButton);
    fireEvent.click(vipButton);
    fireEvent.click(addBotButton);
    fireEvent.click(addBotButton);

    const botCount = screen.getByText(/Bot Count:/);
    expect(botCount.textContent).toBe("Bot Count: 2");

    // Wait 10 seconds for processing
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const pendingOrders = screen.getByText("PENDING").nextSibling;
    const completeOrders = screen.getByText("COMPLETE").nextSibling;

    expect(pendingOrders).not.toContainHTML("<div>Order #1 (Normal)</div>");
    expect(pendingOrders).not.toContainHTML("<div>Order #2 (VIP)</div>");
    if (completeOrders) {
      expect((completeOrders as HTMLElement).innerHTML).toMatch(
        /Order #2 \(VIP\).*Order #1 \(Normal\)/s
      );
    } else {
      throw new Error("completeOrders is null");
    }
  });
});
