// websocket.js

export const ws = new WebSocket('ws://localhost:3000');  // WebSocket 연결 설정

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

ws.onclose = () => {
  console.log("WebSocket 연결 종료");
  clearInterval(pingInterval);  // WebSocket 연결 종료 시 ping 메시지 중단

  // 연결 종료 후 일정 시간 후 재연결 시도
  setTimeout(() => {
    reconnectWebSocket();
  }, 5000);  // 5초 후 재연결 시도
};

ws.onerror = (error) => {
  console.error("WebSocket 오류:", error);
  clearInterval(pingInterval);  // 오류 발생 시 ping 메시지 중단
};

ws.onmessage = (event) => {
  console.log("서버로부터 메시지:", event.data);

  // 서버로부터 pong 메시지를 받으면 처리
  if (event.data === 'pong') {
    console.log("서버로부터 pong 응답");
  }
};

// WebSocket 재연결 함수
const reconnectWebSocket = () => {
  console.log("WebSocket 재연결 시도");

  // 새로운 WebSocket 객체 생성 후 다시 연결
  const newWs = new WebSocket('ws://localhost:3000');

  newWs.onopen = ws.onopen;
  newWs.onmessage = ws.onmessage;
  newWs.onclose = ws.onclose;
  newWs.onerror = ws.onerror;

  return newWs;
};
