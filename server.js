const fs = require('fs');
const http = require('http');
const express = require("express");
const osc = require("osc");
const cors = require("cors");
const WebSocket = require("ws");

const app = express();

// HTTP 서버 설정
const server = http.createServer(app);

// WebSocket 서버 설정
const wss = new WebSocket.Server({ server });

// 전역 변수 초기화
let userOscAddress = "127.0.0.1";  // 기본 OSC 주소
let userOscPort1 = 7000;  // 첫 번째 기본 OSC 포트
let userOscPort2 = 7001;  // 두 번째 기본 OSC 포트
let loopIntervalId = null;  // 반복 메시지 전송 제어

// CORS 설정
app.use(cors());
app.use(express.static('public'));

// OSC 설정
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 7002,  // 로컬 OSC 수신 포트
});

udpPort.open();

udpPort.on("ready", function () {
  console.log("OSC 포트가 7002에서 열렸습니다.");
});

udpPort.on("error", function (error) {
  console.error("OSC 포트 열기 중 오류 발생:", error);
});

// WebSocket 연결 처리
wss.on("connection", (ws) => {
  console.log("WebSocket 클라이언트 연결됨");

  // Ping 주기적으로 전송
  const interval = 30000; // 30초마다 Ping 전송
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();  // Ping 전송
      console.log("Ping 전송");
    }
  }, interval);

  ws.on("pong", () => {
    console.log("Pong 수신");
  });

  // 메시지 처리 함수
  const handleMessage = (message) => {
    try {
      const {
        oscAddress,
        oscPort1,
        oscPort2,
        oscMsgAddress,
        content,
        isLoopMessage,
        loopAddress,
        loopInterval,
        stopLoop
      } = JSON.parse(message);

      // OSC 설정 저장
      if (oscAddress && oscPort1 && oscPort2) {
        userOscAddress = oscAddress;
        userOscPort1 = oscPort1;
        userOscPort2 = oscPort2;
        console.log(`OSC 설정 저장: 주소 ${userOscAddress}, 포트1 ${userOscPort1}, 포트2 ${userOscPort2}`);
      }

      // 수동 OSC 메시지 전송
      if (!isLoopMessage && oscMsgAddress) {
        console.log("수동 메시지 전송 시작");
        sendOscMessage(oscMsgAddress, content || '', false, userOscPort1, userOscPort2);
        return;  // 수동 메시지 처리 후 바로 반환
      }

      // 반복 메시지 전송 중지
      if (stopLoop && isLoopMessage) {
        if (loopIntervalId) {
          clearInterval(loopIntervalId);
          loopIntervalId = null;
          console.log("반복 메시지 전송 중지됨");
        }
      }

      // 반복 메시지 전송 시작
      if (isLoopMessage && loopAddress && loopInterval) {
        if (loopIntervalId) {
          clearInterval(loopIntervalId);  // 기존 반복 메시지 중지
        }
        loopIntervalId = setInterval(() => {
          sendOscMessage(loopAddress, null, true, userOscPort1, userOscPort2);
        }, loopInterval);
        console.log(`반복 메시지 전송 시작: ${loopInterval}ms 간격`);
      }

    } catch (error) {
      console.error("메시지 처리 중 오류:", error);
    }
  };

  // OSC 메시지 전송 함수 (두 포트로 전송)
  const sendOscMessage = (address, content = null, isLoop = false, port1, port2) => {
    let msg = {
      address: address,
    };
    if (content) {
      msg.args = [content];
    }

    console.log(`OSC 메시지 전송 준비: 주소: ${address}, 포트1: ${port1}, 포트2: ${port2}, 내용: ${content}`);

    // 첫 번째 포트로 전송
    udpPort.send(msg, userOscAddress, port1, (err) => {
      if (err) {
        console.error(`첫 번째 포트(${port1})로 OSC 메시지 전송 중 오류 발생:`, err);
      } else {
        const type = isLoop ? "반복" : "수동";
        console.log(`${type} OSC 전송 (포트1): ${userOscAddress}:${port1}, Address: ${address}, Content: ${content}`);
      }
    });

    // 두 번째 포트로 전송
    udpPort.send(msg, userOscAddress, port2, (err) => {
      if (err) {
        console.error(`두 번째 포트(${port2})로 OSC 메시지 전송 중 오류 발생:`, err);
      } else {
        const type = isLoop ? "반복" : "수동";
        console.log(`${type} OSC 전송 (포트2): ${userOscAddress}:${port2}, Address: ${address}, Content: ${content}`);
      }
    });
  };

  ws.on("message", handleMessage);

  // WebSocket 연결 종료 시 처리
  ws.on("close", () => {
    console.log("WebSocket 연결 종료");
    if (loopIntervalId) {
      clearInterval(loopIntervalId);  // 반복 메시지 전송 중지
    }
    clearInterval(pingInterval);  // Ping 전송 중지
  });
});

// HTTP 서버를 로컬 포트에서 실행
const port = 3000;  // 로컬 서버 포트
server.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 HTTP 및 WebSocket으로 실행 중입니다.`);
});
