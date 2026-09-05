export interface WebSocketExt extends WebSocket {
  // ReturnType<typeof setTimeout> resolves to `number` in the browser and
  // `NodeJS.Timeout` in Node — using ReturnType keeps both environments happy.
  pingTimeout?: ReturnType<typeof setTimeout>;
}
