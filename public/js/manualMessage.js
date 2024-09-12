import { ws } from './websocket.js';

document.getElementById("sendOscButton").addEventListener("click", () => {
  const oscMsgAddress = document.getElementById("oscMsgAddress").value;

  if (oscMsgAddress) {
    if (ws.readyState === WebSocket.OPEN) {
      const message = {
        oscMsgAddress: oscMsgAddress,
        content: "버튼 클릭 신호 전송",
        isLoopMessage: false
      };

      ws.send(JSON.stringify(message));
      console.log(`OSC 신호 전송: 메시지 Address: ${oscMsgAddress}`);
    } else {
      console.log("WebSocket 연결 상태가 아닙니다.");
    }
  } else {
    console.log("메시지 Address를 입력하세요.");
  }
});
