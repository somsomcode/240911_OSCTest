import { ws } from './websocket.js';  // WebSocket 인스턴스 가져오기

// WebSocket이 연결되어 있는지 확인하는 함수
function isWebSocketOpen() {
  if (ws.readyState === WebSocket.OPEN) {
    return true;
  } else {
    console.log("WebSocket 연결 상태가 아닙니다.");
    return false;
  }
}

// OSC 메시지를 WebSocket으로 전송하는 함수
function sendOSCMessage(message) {
  if (isWebSocketOpen()) {
    ws.send(JSON.stringify(message));
    console.log("메시지 전송:", message);
  }
}

// DOM이 완전히 로드된 후에 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    saveSettingsButton: document.getElementById("saveSettingsButton"),
    oscAddressInput: document.getElementById("oscAddress"),
    oscPort1Input: document.getElementById("oscPort1"),
    oscPort2Input: document.getElementById("oscPort2"),
    sendOscButtonPort1: document.getElementById("sendOscButtonPort1"),
    sendOscButtonPort2: document.getElementById("sendOscButtonPort2"),
    oscMsgAddressInput: document.getElementById("oscMsgAddress")  // 메시지 Address 입력
  };

  // 필수 DOM 요소 확인
  for (const key in elements) {
    if (!elements[key]) {
      console.error("필요한 DOM 요소를 찾을 수 없습니다.");
      return;
    }
  }

  // OSC 설정 저장 버튼 클릭
  elements.saveSettingsButton.addEventListener("click", () => {
    const oscAddress = elements.oscAddressInput.value;
    const oscPort1 = parseInt(elements.oscPort1Input.value, 10);
    const oscPort2 = parseInt(elements.oscPort2Input.value, 10);

    if (oscAddress && !isNaN(oscPort1) && !isNaN(oscPort2)) {
      console.log(`OSC 설정 저장: OSC 주소: ${oscAddress}, 포트1: ${oscPort1}, 포트2: ${oscPort2}`);
      const message = {
        oscAddress: oscAddress,
        oscPorts: [oscPort1, oscPort2],  // 두 포트를 저장
        isLoopMessage: false
      };
      sendOSCMessage(message);
    } else {
      console.log("유효한 OSC 주소와 두 포트를 입력하세요.");
    }
  });

  // OSC 메시지 전송 함수
  function sendOscMessageToPort(oscMsgAddress, oscPort) {
    if (oscMsgAddress && !isNaN(oscPort)) {
      const message = {
        oscAddress: oscMsgAddress,
        oscPort: oscPort,
        content: "Your message content",  // 수동 메시지 내용
        isLoopMessage: false
      };
      sendOSCMessage(message);
    } else {
      console.log("유효한 OSC 메시지 주소와 포트를 입력하세요.");
    }
  }

  // 포트에 메시지 전송
  function setupSendButton(button, portInput) {
    button.addEventListener("click", () => {
      const oscMsgAddress = elements.oscMsgAddressInput.value;
      const oscPort = parseInt(portInput.value, 10);
      sendOscMessageToPort(oscMsgAddress, oscPort);
    });
  }

  // 포트 1 및 포트 2에 대한 버튼 설정
  setupSendButton(elements.sendOscButtonPort1, elements.oscPort1Input);
  setupSendButton(elements.sendOscButtonPort2, elements.oscPort2Input);
});
