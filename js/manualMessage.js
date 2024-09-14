import { ws } from './websocket.js';  // WebSocket 인스턴스 가져오기

// WebSocket 연결 상태 확인
function isWebSocketOpen() {
  if (ws.readyState === WebSocket.OPEN) {
    return true;
  } else {
    console.log("WebSocket 연결 상태가 아닙니다.");
    return false;
  }
}

// OSC 메시지를 WebSocket으로 전송하는 함수
function sendOSCMessage(oscMsgAddress, content) {
  if (isWebSocketOpen()) {
    const message = {
      oscMsgAddress: oscMsgAddress,
      content: content,  // 전송할 메시지 내용
      isLoopMessage: false
    };

    ws.send(JSON.stringify(message));
    console.log(`OSC 신호 전송: 메시지 Address: ${oscMsgAddress}, 내용: ${content}`);
  }
}

// DOM이 완전히 로드된 후에 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
  const oscMsgAddressInput = document.getElementById("oscMsgAddress");
  const sendOscButtonPort1 = document.getElementById("sendOscButtonPort1");
  const sendOscButtonPort2 = document.getElementById("sendOscButtonPort2");

  if (!oscMsgAddressInput || !sendOscButtonPort1 || !sendOscButtonPort2) {
    console.error("필요한 DOM 요소를 찾을 수 없습니다.");
    return;
  }

  // 포트 1에 수동 OSC 메시지 전송
  sendOscButtonPort1.addEventListener("click", () => {
    const oscMsgAddress = oscMsgAddressInput.value;
    const content = "포트 1로 전송된 메시지";  // 포트 1에 전송할 내용

    if (oscMsgAddress) {
      sendOSCMessage(oscMsgAddress, content);
    } else {
      console.log("메시지 Address를 입력하세요.");
    }
  });

  // 포트 2에 수동 OSC 메시지 전송
  sendOscButtonPort2.addEventListener("click", () => {
    const oscMsgAddress = oscMsgAddressInput.value;
    const content = "포트 2로 전송된 메시지";  // 포트 2에 전송할 내용

    if (oscMsgAddress) {
      sendOSCMessage(oscMsgAddress, content);
    } else {
      console.log("메시지 Address를 입력하세요.");
    }
  });
});
