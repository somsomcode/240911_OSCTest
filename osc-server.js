const osc = require('osc');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// OSC UDP 포트 설정
let oscPort1 = 7001;
let oscPort2 = 7002;
let oscAddress = '/test';

// OSC UDP 송신기 생성
let udpPort1 = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121,
    remoteAddress: "127.0.0.1", // 필요에 따라 IP 변경
    remotePort: oscPort1,
});

let udpPort2 = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57122,
    remoteAddress: "127.0.0.1", // 필요에 따라 IP 변경
    remotePort: oscPort2,
});

udpPort1.open();
udpPort2.open();

// WebSocket 통신
wss.on('connection', (ws) => {
    console.log('클라이언트 연결됨');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const { port, oscMessage, index } = data;

        console.log(`포트 ${port}로 메시지 전송: ${oscMessage}`);

        // OSC 메시지 전송
        const oscMsg = {
            address: oscAddress,
            args: [
                {
                    type: "s",
                    value: oscMessage
                }
            ]
        };

        if (port === 1) {
            udpPort1.send(oscMsg);
        } else if (port === 2) {
            udpPort2.send(oscMsg);
        }
    });
});

// 포트 번호 설정 및 OSC 주소 저장 API
app.use(express.json());

app.post('/save-settings', (req, res) => {
    oscAddress = req.body.oscAddress || oscAddress;
    oscPort1 = req.body.oscPort1 || oscPort1;
    oscPort2 = req.body.oscPort2 || oscPort2;

    udpPort1.options.remotePort = oscPort1;
    udpPort2.options.remotePort = oscPort2;

    res.json({ message: '설정이 저장되었습니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
