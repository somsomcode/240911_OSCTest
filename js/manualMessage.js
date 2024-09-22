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

// 메시지 전송 이벤트를 처리하는 함수
function handleSendMessage(port) {
  const oscMsgAddress = document.getElementById("oscMsgAddress").value;
  const content = `포트 ${port}로 전송된 메시지`;  // 동적으로 메시지 내용 생성

  if (oscMsgAddress) {
    sendOSCMessage(oscMsgAddress, content);
  } else {
    console.log("메시지 Address를 입력하세요.");
  }
}

// DOM이 완전히 로드된 후에 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
  const sendOscButtonPort1 = document.getElementById("sendOscButtonPort1");
  const sendOscButtonPort2 = document.getElementById("sendOscButtonPort2");

  if (!sendOscButtonPort1 || !sendOscButtonPort2) {
    console.error("필요한 DOM 요소를 찾을 수 없습니다.");
    return;
  }

  // 포트 1에 수동 OSC 메시지 전송
  sendOscButtonPort1.addEventListener("click", () => handleSendMessage(1));

  // 포트 2에 수동 OSC 메시지 전송
  sendOscButtonPort2.addEventListener("click", () => handleSendMessage(2));
});
