var fs = require('fs');
var zlib = require('zlib');
var path = require('path');

function crc32(buf) {
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (var j = 0; j < 8; j++) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  var len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  var typeBuf = Buffer.from(type, 'ascii');
  var crcData = Buffer.concat([typeBuf, data]);
  var crc = crc32(crcData);
  var crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPNG(size, r, g, b) {
  var signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  var ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  var ihdrChunk = createChunk('IHDR', ihdrData);

  var cx = size / 2, cy = size / 2, radius = size * 0.38;
  var rawData = Buffer.alloc(size * (1 + size * 3));
  for (var y = 0; y < size; y++) {
    var rowStart = y * (1 + size * 3);
    rawData[rowStart] = 0;
    for (var x = 0; x < size; x++) {
      var dx = x - cx + 0.5, dy = y - cy + 0.5;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var px = x * 3 + rowStart + 1;
      if (dist <= radius) {
        rawData[px] = r;
        rawData[px + 1] = g;
        rawData[px + 2] = b;
      } else {
        rawData[px] = 0;
        rawData[px + 1] = 0;
        rawData[px + 2] = 0;
      }
    }
  }
  var compressed = zlib.deflateSync(rawData);
  var idatChunk = createChunk('IDAT', compressed);
  var iendChunk = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

var SIZE = 48;
var ACTIVE_COLOR = [79, 70, 229];
var INACTIVE_COLOR = [142, 142, 147];
var icons = ['home', 'learn', 'note', 'profile'];

var outputDir = path.join(__dirname, '..', 'images', 'tab');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (var i = 0; i < icons.length; i++) {
  var name = icons[i];
  var activePng = createPNG(SIZE, ACTIVE_COLOR[0], ACTIVE_COLOR[1], ACTIVE_COLOR[2]);
  var inactivePng = createPNG(SIZE, INACTIVE_COLOR[0], INACTIVE_COLOR[1], INACTIVE_COLOR[2]);
  fs.writeFileSync(path.join(outputDir, name + '.png'), inactivePng);
  fs.writeFileSync(path.join(outputDir, name + '-active.png'), activePng);
  console.log('Created: ' + name + '.png / ' + name + '-active.png');
}

console.log('All tabBar icons generated successfully.');
