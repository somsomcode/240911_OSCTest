import { ws } from './js/websocket.js';  

document.getElementById("saveSettingsButton").addEventListener("click", () => {
  const oscAddress = document.getElementById("oscAddress").value;
  const oscPort = document.getElementById("oscPort").value;

  if (oscAddress && oscPort) {
    console.log(`OSC 설정 저장: OSC 주소: ${oscAddress}, 포트: ${oscPort}`);

    if (ws.readyState === WebSocket.OPEN) {
      const message = {
        oscAddress: oscAddress,
        oscPort: parseInt(oscPort, 10),
        isLoopMessage: false
      };
      ws.send(JSON.stringify(message));
    } else {
      console.log("WebSocket 연결 상태가 아닙니다.");
    }
  } else {
    console.log("OSC 주소와 포트를 입력하세요.");
  }
});
