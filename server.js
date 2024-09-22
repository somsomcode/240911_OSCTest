const fs = require('fs');
const http = require('http');
const express = require("express");
const osc = require("osc");
const cors = require("cors");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 전역 변수 초기화
let userOscAddress = "127.0.0.1";  
let userOscPort1 = 7000;  
let userOscPort2 = 7001;  
let loopIntervalId = null;  

// CORS 및 정적 파일 제공 설정
app.use(cors());
app.use(express.static('public'));

// OSC 설정
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 7002,  
});

udpPort.open();

udpPort.on("ready", () => console.log("OSC 포트가 7002에서 열렸습니다."));
udpPort.on("error", (error) => console.error("OSC 포트 열기 중 오류 발생:", error));

// WebSocket 연결 처리
wss.on("connection", (ws) => {
  console.log("WebSocket 클라이언트 연결됨");

  // Ping 주기적으로 전송
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
      //console.log("Ping 전송");
    }
  }, 30000);

  ws.on("pong", () => console.log("소켓 연결"));


  // 메시지 처리 함수
const handleMessage = (message) => {
  try {
      const parsedMessage = JSON.parse(message);
      console.log("파싱된 메시지:", parsedMessage); // 파싱된 메시지 로그

     // 숫자에 따른 메시지 출력
     switch (parsedMessage) {
      case 0:
          console.log("클라이언트로부터 숫자 0을 받았습니다.");
          break;
      case 1:
          console.log("클라이언트로부터 숫자 1을 받았습니다.");
          break;
      case 2:
          console.log("클라이언트로부터 숫자 2을 받았습니다.");
          break;
      case 3:
          console.log("클라이언트로부터 숫자 3을 받았습니다.");
          break;
      case 4:
          console.log("클라이언트로부터 숫자 4를 받았습니다.");
          break;
      case 5:
          console.log("클라이언트로부터 숫자 5를 받았습니다.");
          break;
      default:
          console.log("유효하지 않은 숫자입니다.");
   }

  } catch (error) {
      console.error("메시지 처리 중 오류:", error);
  }
};


  // OSC 설정 처리
  const handleOscSettings = ({ oscAddress, oscPort1, oscPort2 }) => {
    if (oscAddress && oscPort1 && oscPort2) {
      userOscAddress = oscAddress;
      userOscPort1 = oscPort1;
      userOscPort2 = oscPort2;
      console.log(`OSC 설정 저장: 주소 ${userOscAddress}, 포트1 ${userOscPort1}, 포트2 ${userOscPort2}`);
    }
  };

  // OSC 메시지 처리
  const handleOscMessages = ({ isLoopMessage, oscMsgAddress, content, loopAddress, loopInterval, stopLoop }) => {
    if (!isLoopMessage && oscMsgAddress) {
      console.log("수동 메시지 전송 시작");
      sendOscMessage(oscMsgAddress, content || '', false, userOscPort1, userOscPort2);
    }

    if (stopLoop && isLoopMessage) {
      clearInterval(loopIntervalId);
      loopIntervalId = null;
      console.log("반복 메시지 전송 중지됨");
    }

    if (isLoopMessage && loopAddress && loopInterval) {
      clearInterval(loopIntervalId);
      loopIntervalId = setInterval(() => {
        sendOscMessage(loopAddress, null, true, userOscPort1, userOscPort2);
      }, loopInterval);
      console.log(`반복 메시지 전송 시작: ${loopInterval}ms 간격`);
    }
  };


  // OSC 메시지 전송 함수
  const sendOscMessage = (address, content = null, isLoop = false, port1, port2) => {
    let msg = { address, args: content !== null ? [content] : [] };
    console.log(`OSC 메시지 전송 준비: 주소: ${address}, 포트1: ${port1}, 포트2: ${port2}, 내용: ${content}`);

    // 두 포트로 OSC 메시지 전송
    [port1, port2].forEach(port => {
      udpPort.send(msg, userOscAddress, port, (err) => {
        if (err) {
          console.error(`포트(${port})로 OSC 메시지 전송 중 오류 발생:`, err);
        } else {
          const type = isLoop ? "반복" : "수동";
          console.log(`${type} OSC 전송 (${port}): ${userOscAddress}:${port}, Address: ${address}, Content: ${content}`);
        }
      });
    });
  };

  ws.on("message", handleMessage);
  
  // WebSocket 연결 종료 시 처리
  ws.on("close", () => {
    console.log("WebSocket 연결 종료");
    clearInterval(loopIntervalId);  
    clearInterval(pingInterval);  
  });
});

// HTTP 서버를 로컬 포트에서 실행
const port = 3001;  
server.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 HTTP 및 WebSocket으로 실행 중입니다.`);
});
