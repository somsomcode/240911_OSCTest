// loopMessage.js

import { ws } from './websocket.js';  // websocket.js에서 ws 가져오기

document.getElementById("startLoopButton").addEventListener("click", () => {
  const loopMsgAddress = document.getElementById("loopMsgAddress").value;
  const loopInterval = parseInt(document.getElementById("loopInterval").value, 10);

  if (loopMsgAddress && loopInterval) {
    console.log(`반복 메시지 설정: Address: ${loopMsgAddress}, 간격: ${loopInterval}ms`);

    if (ws.readyState === WebSocket.OPEN) {
      const message = {
        loopAddress: loopMsgAddress,
        loopInterval: loopInterval,
        isLoopMessage: true
      };
      ws.send(JSON.stringify(message));
    }

    console.log(`반복 메시지 전송 시작: ${loopInterval}ms 간격`);
  } else {
    console.log("반복 메시지 Address 및 간격을 입력하세요.");
  }
});

document.getElementById("stopLoopButton").addEventListener("click", () => {
  if (ws.readyState === WebSocket.OPEN) {
    const message = {
      stopLoop: true,
      isLoopMessage: true
    };
    ws.send(JSON.stringify(message));
    console.log("반복 메시지 전송 중지 요청 전송");
  } else {
    console.log("WebSocket 연결 상태가 아닙니다.");
  }
});
