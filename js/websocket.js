//export const ws = new WebSocket("ws://localhost:3000");
export const ws = new WebSocket("wss://port-0-osctest-m0xnhece5b39a09d.sel4.cloudtype.app/");


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
