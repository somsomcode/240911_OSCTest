import { ws } from './websocket.js';  // websocket.js에서 ws 가져오기

// DOM이 완전히 로드된 후에 실행되도록 설정
document.addEventListener('DOMContentLoaded', () => {
  const startLoopButton = document.getElementById("startLoopButton");
  const stopLoopButton = document.getElementById("stopLoopButton");

  // 반복 메시지 시작 버튼
  startLoopButton.addEventListener("click", () => {
    const loopMsgAddress = document.getElementById("loopMsgAddress").value;
    const loopInterval = parseInt(document.getElementById("loopInterval").value, 10);

    if (loopMsgAddress && loopInterval) {
      console.log(`반복 메시지 설정: Address: ${loopMsgAddress}, 간격: ${loopInterval}ms`);

      // WebSocket 연결 확인
      if (ws.readyState === WebSocket.OPEN) {
        const message = {
          loopAddress: loopMsgAddress,
          loopInterval: loopInterval,
          isLoopMessage: true
        };
        ws.send(JSON.stringify(message));
        console.log(`반복 메시지 전송 시작: ${loopInterval}ms 간격`);
      } else {
        console.log("WebSocket 연결이 준비되지 않았습니다. 다시 시도하세요.");
      }
    } else {
      console.log("반복 메시지 Address 및 간격을 입력하세요.");
    }
  });

  // 반복 메시지 중지 버튼
  stopLoopButton.addEventListener("click", () => {
    // WebSocket 연결 확인
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
});
