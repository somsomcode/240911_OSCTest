export const ws = new WebSocket('ws://159.223.42.128:3000');  // wss://로 변경
// Droplet의 IP와 WebSocket 포트 사용

let pingInterval;

ws.onopen = () => {
  console.log("WebSocket 연결 성공");

  // 주기적으로 서버에 ping 메시지 보내기 (30초 간격)
  pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
      console.log("서버로 ping 전송");
    }
  }, 30000);  // 30초 간격으로 ping 전송
};

ws.onmessage = (event) => {
  const message = event.data;
  console.log("서버로부터 메시지:", message);

  // 서버로부터 pong 메시지를 받으면 처리
  if (message === 'pong') {
    console.log("서버로부터 pong 응답");
  }
};

ws.onclose = () => {
  console.log("WebSocket 연결 종료");
  clearInterval(pingInterval);  // WebSocket 연결 종료 시 ping 메시지 중단
};

ws.onerror = (error) => {
  console.error("WebSocket 오류:", error);
  clearInterval(pingInterval);  // 오류 발생 시 ping 메시지 중단
};
