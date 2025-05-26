import websocket from "@infrastructure/server/websocket";
(async () => websocket({ port: 5080, host: "0.0.0.0" }))();
