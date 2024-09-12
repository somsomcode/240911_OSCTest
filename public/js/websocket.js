// websocket.js
export const ws = new WebSocket('wss://159.223.42.128:3000');  // wss://로 변경
 // Droplet의 IP와 WebSocket 포트 사용

ws.onopen = () => {
  console.log("WebSocket 연결 성공");
};

ws.onmessage = (event) => {
  console.log("서버로부터 메시지:", event.data);
};

ws.onclose = () => {
  console.log("WebSocket 연결 종료");
};

ws.onerror = (error) => {
  console.error("WebSocket 오류:", error);
};
