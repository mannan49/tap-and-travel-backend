import { WebSocketServer } from "ws";

// Create a function to initialize the WebSocket server
export const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized");

  let driverLocation = { lat: 40.7128, lng: -74.006 };
  let riderLocation = { lat: 40.7306, lng: -73.9352 };

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    // Send the initial locations to the client
    ws.send(JSON.stringify({ driverLocation, riderLocation }));

    const locationUpdateInterval = setInterval(() => {
      // Update driver and rider locations slightly for simulation
      driverLocation.lat += (Math.random() - 0.5) * 0.001;
      driverLocation.lng += (Math.random() - 0.5) * 0.001;
      riderLocation.lat += (Math.random() - 0.5) * 0.001;
      riderLocation.lng += (Math.random() - 0.5) * 0.001;

      // Send the updated locations to the client
      ws.send(JSON.stringify({ driverLocation, riderLocation }));
    }, 1000);

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
      clearInterval(locationUpdateInterval);
    });
  });
};
