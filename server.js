const express = require("express");
const osc = require("osc");
const cors = require("cors");  // CORS 패키지 불러오기
const app = express();
const http = require("http");
const WebSocket = require("ws");

let userOscAddress = "";
let userOscPort = "";
let loopIntervalId = null;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// CORS 설정 추가
app.use(cors());  // 모든 도메인에서의 요청 허용

const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 7002,
});

udpPort.open();

udpPort.on("ready", function () {
  console.log("OSC 포트가 7002에서 열렸습니다.");
});

udpPort.on("error", function (error) {
  console.error("OSC 포트 열기 중 오류 발생:", error);
});

wss.on("connection", (ws) => {
  console.log("WebSocket 클라이언트 연결됨");

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

      // OSC 주소 및 포트 설정
      if (oscAddress && oscPort) {
        userOscAddress = oscAddress;
        userOscPort = oscPort;
        console.log(`OSC 설정 저장: 주소 ${userOscAddress}, 포트 ${userOscPort}`);
      }

      // 반복 메시지 중지 요청 처리
      if (stopLoop && isLoopMessage) {
        if (loopIntervalId) {
          clearInterval(loopIntervalId);
          loopIntervalId = null;
          console.log("반복 메시지 전송 중지됨");
        }
      }

      // 반복 메시지 설정 및 시작
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

      // 수동 메시지 전송
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
    clearInterval(loopIntervalId); // WebSocket 연결 종료 시 반복 메시지 중지
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
