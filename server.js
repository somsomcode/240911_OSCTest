const fs = require('fs');
const http = require('http');
const express = require("express");
const osc = require("osc");
const cors = require("cors");
const WebSocket = require("ws");

const app = express();

// HTTP 서버 설정
const server = http.createServer(app);

// WebSocket 서버 설정 (ws:// 사용)
const wss = new WebSocket.Server({ server });

// 전역 변수 초기화
let userOscAddress = "127.0.0.1";  // 기본 OSC 주소
let userOscPort = 7000;  // 기본 OSC 포트
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

  ws.on("message", (message) => {
    try {
      const {
        oscAddress,
        oscPort,
        oscMsgAddress,
        content,
        isLoopMessage,
        loopAddress,
        loopInterval,
        stopLoop
      } = JSON.parse(message);

      // OSC 설정 저장
      if (oscAddress && oscPort) {
        userOscAddress = oscAddress;
        userOscPort = oscPort;
        console.log(`OSC 설정 저장: 주소 ${userOscAddress}, 포트 ${userOscPort}`);
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
      else if (isLoopMessage && loopAddress && loopInterval) {
        if (loopIntervalId) {
          clearInterval(loopIntervalId);
        }
        loopIntervalId = setInterval(() => {
          let msg = { address: loopAddress };
          udpPort.send(msg, userOscAddress, userOscPort, (err) => {
            if (err) {
              console.error("OSC 메시지 전송 중 오류 발생:", err);
            } else {
              console.log(`반복 OSC 전송: ${userOscAddress}:${userOscPort}, Address: ${loopAddress}`);
            }
          });
        }, loopInterval);
        console.log(`반복 메시지 전송 시작: ${loopInterval}ms 간격`);
      }

      // 수동 OSC 메시지 전송
      if (!isLoopMessage && oscMsgAddress) {
        let msg = {
          address: oscMsgAddress,
          args: [content],
        };

        udpPort.send(msg, userOscAddress, userOscPort, (err) => {
          if (err) {
            console.error("OSC 메시지 전송 중 오류 발생:", err);
          } else {
            console.log(`수동 OSC 전송: ${userOscAddress}:${userOscPort}, Address: ${oscMsgAddress}`);
          }
        });
      }
    } catch (error) {
      console.error("메시지 처리 중 오류:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket 연결 종료");
    clearInterval(loopIntervalId);
    clearInterval(pingInterval);  // 연결 종료 시 Ping 전송 중지
  });
});

// HTTP 서버를 로컬 포트에서 실행
const port = 3000;  // 로컬 서버 포트
server.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 HTTP 및 WebSocket으로 실행 중입니다.`);
});
