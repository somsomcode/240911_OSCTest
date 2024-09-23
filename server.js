const express = require("express");
const osc = require("osc");
const WebSocket = require("ws");

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// OSC 설정
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 7002, // 이 포트에서 수신
});

// OSC 포트 열기
udpPort.open();

udpPort.on("ready", () => {
  console.log("OSC 포트가 7002에서 열렸습니다.");

  // WebSocket 연결 처리
  wss.on("connection", (ws) => {
    console.log("WebSocket 클라이언트 연결됨");

    // 메시지 처리 함수
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        const { address, args, port1, port2 } = parsedMessage;

        // OSC 메시지 전송 함수
        const oscMessage = {
          address: address,
          args: args || []  // args 배열을 그대로 사용, 없을 경우 빈 배열
        };

        // 포트 1로 메시지 전송
        if (port1) {
          udpPort.send(oscMessage, "127.0.0.1", port1, (err) => {
            if (err) {
              console.error(`포트1 (${port1})로 메시지 전송 중 오류 발생:`, err);
            } else {
              console.log(`OSC 메시지 전송: 주소=${address}, 포트1=${port1}, 인자=${args}`);
            }
          });
        }

        // 포트 2로 메시지 전송
        if (port2) {
          udpPort.send(oscMessage, "127.0.0.1", port2, (err) => {
            if (err) {
              console.error(`포트2 (${port2})로 메시지 전송 중 오류 발생:`, err);
            } else {
              console.log(`OSC 메시지 전송: 주소=${address}, 포트2=${port2}, 인자=${args}`);
            }
          });
        }

        // 포트가 모두 없을 경우 에러 출력
        if (!port1 && !port2) {
          console.error("포트 정보가 없습니다. 포트 1 또는 포트 2를 지정하세요.");
        }
      } catch (error) {
        console.error("메시지 처리 중 오류:", error);
      }
    });

    // WebSocket 종료 처리
    ws.on("close", () => {
      console.log("WebSocket 연결 종료");
    });
  });
});

// HTTP 서버 실행
const port = 3001;
server.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
