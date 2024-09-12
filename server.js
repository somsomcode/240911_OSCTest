const express = require("express");
const osc = require("osc");
const app = express();
const http = require("http");
const WebSocket = require("ws");

// 설정
const OSC_RECEIVE_PORT = 7002; // OSC 메시지 받을 포트
const SEND_INTERVAL = 3000; // 3초 간격으로 보냄

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

// OSC UDP 포트 설정 (보낼 때)
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0", // 모든 인터페이스에서 수신
  localPort: OSC_RECEIVE_PORT, // 메시지 받을 포트
});

// OSC 포트 열기
udpPort.open();

// OSC 메시지 수신 설정
udpPort.on("message", function (oscMessage) {
  console.log("Received OSC message:", oscMessage);
});

// WebSocket 연결 및 메시지 처리
wss.on("connection", (ws) => {
  console.log("WebSocket 클라이언트 연결됨");

  // 클라이언트로부터 메시지 수신 시 OSC 신호 전송
  ws.on("message", (message) => {
    try {
      const { oscAddress, oscPort, oscMsgAddress, content } = JSON.parse(message);

      console.log("받은 메시지:", content, "OSC 주소:", oscAddress, "포트:", oscPort, "메시지 Address:", oscMsgAddress);

      let msg = {
        address: oscMsgAddress,  // 사용자가 입력한 OSC address
        args: [content],
      };

      // OSC 신호 전송
      udpPort.send(msg, oscAddress, oscPort, (err) => {
        if (err) {
          console.error("OSC 메시지 전송 중 오류 발생:", err);
        } else {
          console.log(`OSC 신호를 ${oscAddress}:${oscPort} 에 전송 (Address: ${oscMsgAddress}):`, content);
        }
      });
    } catch (error) {
      console.error("WebSocket 메시지 처리 중 오류:", error);
    }
  });

  // 연결 종료 처리
  ws.on("close", () => {
    console.log("WebSocket 연결 종료");
  });
});

// 3초마다 OSC 신호 전송 (기본 값)
setInterval(() => {
  let msg = {
    address: "/test_loop",
    args: ["3초마다 신호 전송"],
  };

  // 비동기 전송 및 오류 처리
  udpPort.send(msg, "192.168.0.20", 7001, (err) => {
    if (err) {
      console.error("OSC 메시지 전송 중 오류 발생:", err);
    } else {
      console.log("3초마다 신호 전송");
    }
  });
}, SEND_INTERVAL);

// 서버 시작 (Cloudtype에서 제공하는 포트 사용)
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`OSC 메시지를 ${OSC_RECEIVE_PORT} 포트에서 수신 중입니다.`);
});
