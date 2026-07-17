const net = require('net');
const http = require('http');
const fs = require('fs');
const path = require('path');

function writeVarInt(value) {
    const bytes = [];
    while (true) {
        if ((value & ~0x7F) === 0) {
            bytes.push(value);
            return Buffer.from(bytes);
        }
        bytes.push((value & 0x7F) | 0x80);
        value >>>= 7;
    }
}

function readVarInt(buffer, offset = 0) {
    let value = 0;
    let length = 0;
    let currentByte;
    while (true) {
        currentByte = buffer[offset + length];
        value |= (currentByte & 0x7F) << (7 * length);
        length++;
        if ((currentByte & 0x80) !== 0x80) break;
    }
    return { value, length };
}

function createPacket(packetId, data) {
    const packetIdBuffer = writeVarInt(packetId);
    const packetLength = packetIdBuffer.length + data.length;
    return Buffer.concat([
        writeVarInt(packetLength),
        packetIdBuffer,
        data
    ]);
}

function queryMinecraftServer(host, port) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        let buffer = Buffer.alloc(0);
        let packetLength = -1;

        socket.setTimeout(10000);

        socket.connect(port, host, () => {
            const protocolVersion = writeVarInt(767);
            const hostBytes = Buffer.from(host, 'utf-8');
            const hostLength = writeVarInt(hostBytes.length);
            const portBuffer = Buffer.alloc(2);
            portBuffer.writeUInt16BE(port);
            const nextState = writeVarInt(1);

            const handshakeData = Buffer.concat([
                protocolVersion,
                hostLength,
                hostBytes,
                portBuffer,
                nextState
            ]);

            socket.write(createPacket(0x00, handshakeData));
            socket.write(createPacket(0x00, Buffer.alloc(0)));
        });

        socket.on('data', (data) => {
            buffer = Buffer.concat([buffer, data]);

            while (buffer.length > 0) {
                if (packetLength === -1) {
                    try {
                        const result = readVarInt(buffer);
                        packetLength = result.value;
                        buffer = buffer.slice(result.length);
                    } catch (e) {
                        return;
                    }
                }

                if (buffer.length < packetLength) return;

                const packetData = buffer.slice(0, packetLength);
                buffer = buffer.slice(packetLength);
                packetLength = -1;

                const packetIdResult = readVarInt(packetData);
                const payload = packetData.slice(packetIdResult.length);

                const stringLengthResult = readVarInt(payload);
                const jsonString = payload.slice(stringLengthResult.length).toString('utf-8');
                try {
                    const response = JSON.parse(jsonString);
                    socket.destroy();
                    resolve(response);
                } catch (e) {
                    reject(e);
                }
            }
        });

        socket.on('error', reject);
        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Connection timeout'));
        });
    });
}

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function serveStaticFile(req, res) {
    let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
    
    const fullPath = path.join(__dirname, filePath);
    
    if (!fullPath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        fs.readFile(fullPath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Server error');
                return;
            }

            const ext = path.extname(fullPath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        });
    });
}

const server = http.createServer(async (req, res) => {
    if (req.url === '/api/server-status') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        try {
            const status = await queryMinecraftServer('服务器域名', 端口);
            res.writeHead(200);
            res.end(JSON.stringify({
                online: true,
                players: {
                    online: status.players?.online || 0,
                    max: status.players?.max || 0,
                    list: (status.players?.sample || []).map(p => p.name)
                }
            }));
        } catch (error) {
            res.writeHead(200);
            res.end(JSON.stringify({
                online: false,
                error: error.message
            }));
        }
    } else {
        serveStaticFile(req, res);
    }
});

const PORT = 3456;
server.listen(PORT, () => {
    console.log(`MC 服务器网页服务运行于 http://localhost:${PORT}`);
});
