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

// OSC 설정을 WebSocket으로 전송하는 함수
function sendOSCMessage(message) {
  if (isWebSocketOpen()) {
    ws.send(JSON.stringify(message));
    console.log("메시지 전송:", message);
  }
}

// DOM이 완전히 로드된 후에 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
  const saveSettingsButton = document.getElementById("saveSettingsButton");
  const oscAddressInput = document.getElementById("oscAddress");
  const oscPort1Input = document.getElementById("oscPort1");
  const oscPort2Input = document.getElementById("oscPort2");
  const sendOscButtonPort1 = document.getElementById("sendOscButtonPort1");
  const sendOscButtonPort2 = document.getElementById("sendOscButtonPort2");
  const oscMsgAddressInput = document.getElementById("oscMsgAddress");  // 메시지 Address 입력

  if (!saveSettingsButton || !oscAddressInput || !oscPort1Input || !oscPort2Input || !sendOscButtonPort1 || !sendOscButtonPort2 || !oscMsgAddressInput) {
    console.error("필요한 DOM 요소를 찾을 수 없습니다.");
    return;
  }

  // OSC 설정 저장 버튼 클릭
  saveSettingsButton.addEventListener("click", () => {
    const oscAddress = oscAddressInput.value;
    const oscPort1 = parseInt(oscPort1Input.value, 10);
    const oscPort2 = parseInt(oscPort2Input.value, 10);

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

  // OSC 메시지 전송 함수 (포트 1 또는 포트 2 선택)
  function sendOscMessageToPort(oscMsgAddress, oscPort) {
    if (oscMsgAddress && !isNaN(oscPort)) {
      console.log(`메시지 전송: 주소=${oscMsgAddress}, 포트=${oscPort}`);
      const content = "Your message content";  // 수동 메시지 내용 추가
      const message = {
        oscAddress: oscMsgAddress,
        oscPort: oscPort,
        content: content,  // 메시지 내용 포함
        isLoopMessage: false
      };
      sendOSCMessage(message);
    } else {
      console.log("유효한 OSC 메시지 주소와 포트를 입력하세요.");
    }
  }

  // 포트 1에 메시지 전송
  sendOscButtonPort1.addEventListener("click", () => {
    const oscMsgAddress = oscMsgAddressInput.value;
    const oscPort1 = parseInt(oscPort1Input.value, 10);
    sendOscMessageToPort(oscMsgAddress, oscPort1);
  });

  // 포트 2에 메시지 전송
  sendOscButtonPort2.addEventListener("click", () => {
    const oscMsgAddress = oscMsgAddressInput.value;
    const oscPort2 = parseInt(oscPort2Input.value, 10);
    sendOscMessageToPort(oscMsgAddress, oscPort2);
  });
});
