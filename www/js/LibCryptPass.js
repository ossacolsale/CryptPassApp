"use strict";
var LibCryptPass = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../base64-js/index.js
  var require_base64_js = __commonJS({
    "../base64-js/index.js"(exports) {
      "use strict";
      init_browser_globals();
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // ../ieee754/index.js
  var require_ieee754 = __commonJS({
    "../ieee754/index.js"(exports) {
      init_browser_globals();
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // ../buffer/index.js
  var require_buffer = __commonJS({
    "../buffer/index.js"(exports) {
      "use strict";
      init_browser_globals();
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer3;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer3.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer3.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function Buffer3(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer3.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer3.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer3, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer3.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer3.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer3.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer3.alloc(+length);
      }
      Buffer3.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer3.prototype;
      };
      Buffer3.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
        if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer3.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer3.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer3.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer3.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer3.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer3.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer3.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer3.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer3.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
      Buffer3.prototype.equals = function equals(b) {
        if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer3.compare(this, b) === 0;
      };
      Buffer3.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
      }
      Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer3.from(target, target.offset, target.byteLength);
        }
        if (!Buffer3.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer3.from(val, encoding);
        }
        if (Buffer3.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer3.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer3.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer3.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer3.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer3.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // ../process/browser.js
  var require_browser = __commonJS({
    "../process/browser.js"(exports, module) {
      init_browser_globals();
      var process2 = module.exports = {};
      var cachedSetTimeout;
      var cachedClearTimeout;
      function defaultSetTimout() {
        throw new Error("setTimeout has not been defined");
      }
      function defaultClearTimeout() {
        throw new Error("clearTimeout has not been defined");
      }
      (function() {
        try {
          if (typeof setTimeout === "function") {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === "function") {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          return setTimeout(fun, 0);
        }
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e2) {
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          return clearTimeout(marker);
        }
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            return cachedClearTimeout.call(null, marker);
          } catch (e2) {
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;
      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }
      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }
      process2.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      process2.title = "browser";
      process2.browser = true;
      process2.env = {};
      process2.argv = [];
      process2.version = "";
      process2.versions = {};
      function noop() {
      }
      process2.on = noop;
      process2.addListener = noop;
      process2.once = noop;
      process2.off = noop;
      process2.removeListener = noop;
      process2.removeAllListeners = noop;
      process2.emit = noop;
      process2.prependListener = noop;
      process2.prependOnceListener = noop;
      process2.listeners = function(name) {
        return [];
      };
      process2.binding = function(name) {
        throw new Error("process.binding is not supported");
      };
      process2.cwd = function() {
        return "/";
      };
      process2.chdir = function(dir) {
        throw new Error("process.chdir is not supported");
      };
      process2.umask = function() {
        return 0;
      };
    }
  });

  // scripts/browser-globals.js
  var import_buffer, import_browser;
  var init_browser_globals = __esm({
    "scripts/browser-globals.js"() {
      import_buffer = __toESM(require_buffer());
      import_browser = __toESM(require_browser());
    }
  });

  // ../scrypt-js/scrypt.js
  var require_scrypt = __commonJS({
    "../scrypt-js/scrypt.js"(exports, module) {
      "use strict";
      init_browser_globals();
      (function(root) {
        const MAX_VALUE = 2147483647;
        function SHA256(m) {
          const K = new Uint32Array([
            1116352408,
            1899447441,
            3049323471,
            3921009573,
            961987163,
            1508970993,
            2453635748,
            2870763221,
            3624381080,
            310598401,
            607225278,
            1426881987,
            1925078388,
            2162078206,
            2614888103,
            3248222580,
            3835390401,
            4022224774,
            264347078,
            604807628,
            770255983,
            1249150122,
            1555081692,
            1996064986,
            2554220882,
            2821834349,
            2952996808,
            3210313671,
            3336571891,
            3584528711,
            113926993,
            338241895,
            666307205,
            773529912,
            1294757372,
            1396182291,
            1695183700,
            1986661051,
            2177026350,
            2456956037,
            2730485921,
            2820302411,
            3259730800,
            3345764771,
            3516065817,
            3600352804,
            4094571909,
            275423344,
            430227734,
            506948616,
            659060556,
            883997877,
            958139571,
            1322822218,
            1537002063,
            1747873779,
            1955562222,
            2024104815,
            2227730452,
            2361852424,
            2428436474,
            2756734187,
            3204031479,
            3329325298
          ]);
          let h0 = 1779033703, h1 = 3144134277, h2 = 1013904242, h3 = 2773480762;
          let h4 = 1359893119, h5 = 2600822924, h6 = 528734635, h7 = 1541459225;
          const w = new Uint32Array(64);
          function blocks(p2) {
            let off = 0, len = p2.length;
            while (len >= 64) {
              let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7, u, i2, j, t1, t2;
              for (i2 = 0; i2 < 16; i2++) {
                j = off + i2 * 4;
                w[i2] = (p2[j] & 255) << 24 | (p2[j + 1] & 255) << 16 | (p2[j + 2] & 255) << 8 | p2[j + 3] & 255;
              }
              for (i2 = 16; i2 < 64; i2++) {
                u = w[i2 - 2];
                t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
                u = w[i2 - 15];
                t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
                w[i2] = (t1 + w[i2 - 7] | 0) + (t2 + w[i2 - 16] | 0) | 0;
              }
              for (i2 = 0; i2 < 64; i2++) {
                t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f ^ ~e & g) | 0) + (h + (K[i2] + w[i2] | 0) | 0) | 0;
                t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b ^ a & c ^ b & c) | 0;
                h = g;
                g = f;
                f = e;
                e = d + t1 | 0;
                d = c;
                c = b;
                b = a;
                a = t1 + t2 | 0;
              }
              h0 = h0 + a | 0;
              h1 = h1 + b | 0;
              h2 = h2 + c | 0;
              h3 = h3 + d | 0;
              h4 = h4 + e | 0;
              h5 = h5 + f | 0;
              h6 = h6 + g | 0;
              h7 = h7 + h | 0;
              off += 64;
              len -= 64;
            }
          }
          blocks(m);
          let i, bytesLeft = m.length % 64, bitLenHi = m.length / 536870912 | 0, bitLenLo = m.length << 3, numZeros = bytesLeft < 56 ? 56 : 120, p = m.slice(m.length - bytesLeft, m.length);
          p.push(128);
          for (i = bytesLeft + 1; i < numZeros; i++) {
            p.push(0);
          }
          p.push(bitLenHi >>> 24 & 255);
          p.push(bitLenHi >>> 16 & 255);
          p.push(bitLenHi >>> 8 & 255);
          p.push(bitLenHi >>> 0 & 255);
          p.push(bitLenLo >>> 24 & 255);
          p.push(bitLenLo >>> 16 & 255);
          p.push(bitLenLo >>> 8 & 255);
          p.push(bitLenLo >>> 0 & 255);
          blocks(p);
          return [
            h0 >>> 24 & 255,
            h0 >>> 16 & 255,
            h0 >>> 8 & 255,
            h0 >>> 0 & 255,
            h1 >>> 24 & 255,
            h1 >>> 16 & 255,
            h1 >>> 8 & 255,
            h1 >>> 0 & 255,
            h2 >>> 24 & 255,
            h2 >>> 16 & 255,
            h2 >>> 8 & 255,
            h2 >>> 0 & 255,
            h3 >>> 24 & 255,
            h3 >>> 16 & 255,
            h3 >>> 8 & 255,
            h3 >>> 0 & 255,
            h4 >>> 24 & 255,
            h4 >>> 16 & 255,
            h4 >>> 8 & 255,
            h4 >>> 0 & 255,
            h5 >>> 24 & 255,
            h5 >>> 16 & 255,
            h5 >>> 8 & 255,
            h5 >>> 0 & 255,
            h6 >>> 24 & 255,
            h6 >>> 16 & 255,
            h6 >>> 8 & 255,
            h6 >>> 0 & 255,
            h7 >>> 24 & 255,
            h7 >>> 16 & 255,
            h7 >>> 8 & 255,
            h7 >>> 0 & 255
          ];
        }
        function PBKDF2_HMAC_SHA256_OneIter(password, salt, dkLen) {
          password = password.length <= 64 ? password : SHA256(password);
          const innerLen = 64 + salt.length + 4;
          const inner = new Array(innerLen);
          const outerKey = new Array(64);
          let i;
          let dk = [];
          for (i = 0; i < 64; i++) {
            inner[i] = 54;
          }
          for (i = 0; i < password.length; i++) {
            inner[i] ^= password[i];
          }
          for (i = 0; i < salt.length; i++) {
            inner[64 + i] = salt[i];
          }
          for (i = innerLen - 4; i < innerLen; i++) {
            inner[i] = 0;
          }
          for (i = 0; i < 64; i++) outerKey[i] = 92;
          for (i = 0; i < password.length; i++) outerKey[i] ^= password[i];
          function incrementCounter() {
            for (let i2 = innerLen - 1; i2 >= innerLen - 4; i2--) {
              inner[i2]++;
              if (inner[i2] <= 255) return;
              inner[i2] = 0;
            }
          }
          while (dkLen >= 32) {
            incrementCounter();
            dk = dk.concat(SHA256(outerKey.concat(SHA256(inner))));
            dkLen -= 32;
          }
          if (dkLen > 0) {
            incrementCounter();
            dk = dk.concat(SHA256(outerKey.concat(SHA256(inner))).slice(0, dkLen));
          }
          return dk;
        }
        function blockmix_salsa8(BY, Yi, r, x, _X) {
          let i;
          arraycopy(BY, (2 * r - 1) * 16, _X, 0, 16);
          for (i = 0; i < 2 * r; i++) {
            blockxor(BY, i * 16, _X, 16);
            salsa20_8(_X, x);
            arraycopy(_X, 0, BY, Yi + i * 16, 16);
          }
          for (i = 0; i < r; i++) {
            arraycopy(BY, Yi + i * 2 * 16, BY, i * 16, 16);
          }
          for (i = 0; i < r; i++) {
            arraycopy(BY, Yi + (i * 2 + 1) * 16, BY, (i + r) * 16, 16);
          }
        }
        function R(a, b) {
          return a << b | a >>> 32 - b;
        }
        function salsa20_8(B, x) {
          arraycopy(B, 0, x, 0, 16);
          for (let i = 8; i > 0; i -= 2) {
            x[4] ^= R(x[0] + x[12], 7);
            x[8] ^= R(x[4] + x[0], 9);
            x[12] ^= R(x[8] + x[4], 13);
            x[0] ^= R(x[12] + x[8], 18);
            x[9] ^= R(x[5] + x[1], 7);
            x[13] ^= R(x[9] + x[5], 9);
            x[1] ^= R(x[13] + x[9], 13);
            x[5] ^= R(x[1] + x[13], 18);
            x[14] ^= R(x[10] + x[6], 7);
            x[2] ^= R(x[14] + x[10], 9);
            x[6] ^= R(x[2] + x[14], 13);
            x[10] ^= R(x[6] + x[2], 18);
            x[3] ^= R(x[15] + x[11], 7);
            x[7] ^= R(x[3] + x[15], 9);
            x[11] ^= R(x[7] + x[3], 13);
            x[15] ^= R(x[11] + x[7], 18);
            x[1] ^= R(x[0] + x[3], 7);
            x[2] ^= R(x[1] + x[0], 9);
            x[3] ^= R(x[2] + x[1], 13);
            x[0] ^= R(x[3] + x[2], 18);
            x[6] ^= R(x[5] + x[4], 7);
            x[7] ^= R(x[6] + x[5], 9);
            x[4] ^= R(x[7] + x[6], 13);
            x[5] ^= R(x[4] + x[7], 18);
            x[11] ^= R(x[10] + x[9], 7);
            x[8] ^= R(x[11] + x[10], 9);
            x[9] ^= R(x[8] + x[11], 13);
            x[10] ^= R(x[9] + x[8], 18);
            x[12] ^= R(x[15] + x[14], 7);
            x[13] ^= R(x[12] + x[15], 9);
            x[14] ^= R(x[13] + x[12], 13);
            x[15] ^= R(x[14] + x[13], 18);
          }
          for (let i = 0; i < 16; ++i) {
            B[i] += x[i];
          }
        }
        function blockxor(S, Si, D, len) {
          for (let i = 0; i < len; i++) {
            D[i] ^= S[Si + i];
          }
        }
        function arraycopy(src, srcPos, dest, destPos, length) {
          while (length--) {
            dest[destPos++] = src[srcPos++];
          }
        }
        function checkBufferish(o) {
          if (!o || typeof o.length !== "number") {
            return false;
          }
          for (let i = 0; i < o.length; i++) {
            const v = o[i];
            if (typeof v !== "number" || v % 1 || v < 0 || v >= 256) {
              return false;
            }
          }
          return true;
        }
        function ensureInteger(value, name) {
          if (typeof value !== "number" || value % 1) {
            throw new Error("invalid " + name);
          }
          return value;
        }
        function _scrypt(password, salt, N, r, p, dkLen, callback) {
          N = ensureInteger(N, "N");
          r = ensureInteger(r, "r");
          p = ensureInteger(p, "p");
          dkLen = ensureInteger(dkLen, "dkLen");
          if (N === 0 || (N & N - 1) !== 0) {
            throw new Error("N must be power of 2");
          }
          if (N > MAX_VALUE / 128 / r) {
            throw new Error("N too large");
          }
          if (r > MAX_VALUE / 128 / p) {
            throw new Error("r too large");
          }
          if (!checkBufferish(password)) {
            throw new Error("password must be an array or buffer");
          }
          password = Array.prototype.slice.call(password);
          if (!checkBufferish(salt)) {
            throw new Error("salt must be an array or buffer");
          }
          salt = Array.prototype.slice.call(salt);
          let b = PBKDF2_HMAC_SHA256_OneIter(password, salt, p * 128 * r);
          const B = new Uint32Array(p * 32 * r);
          for (let i = 0; i < B.length; i++) {
            const j = i * 4;
            B[i] = (b[j + 3] & 255) << 24 | (b[j + 2] & 255) << 16 | (b[j + 1] & 255) << 8 | (b[j + 0] & 255) << 0;
          }
          const XY = new Uint32Array(64 * r);
          const V = new Uint32Array(32 * r * N);
          const Yi = 32 * r;
          const x = new Uint32Array(16);
          const _X = new Uint32Array(16);
          const totalOps = p * N * 2;
          let currentOp = 0;
          let lastPercent10 = null;
          let stop = false;
          let state = 0;
          let i0 = 0, i1;
          let Bi;
          const limit = callback ? parseInt(1e3 / r) : 4294967295;
          const nextTick = typeof setImmediate !== "undefined" ? setImmediate : setTimeout;
          const incrementalSMix = function() {
            if (stop) {
              return callback(new Error("cancelled"), currentOp / totalOps);
            }
            let steps;
            switch (state) {
              case 0:
                Bi = i0 * 32 * r;
                arraycopy(B, Bi, XY, 0, Yi);
                state = 1;
                i1 = 0;
              // Fall through
              case 1:
                steps = N - i1;
                if (steps > limit) {
                  steps = limit;
                }
                for (let i = 0; i < steps; i++) {
                  arraycopy(XY, 0, V, (i1 + i) * Yi, Yi);
                  blockmix_salsa8(XY, Yi, r, x, _X);
                }
                i1 += steps;
                currentOp += steps;
                if (callback) {
                  const percent10 = parseInt(1e3 * currentOp / totalOps);
                  if (percent10 !== lastPercent10) {
                    stop = callback(null, currentOp / totalOps);
                    if (stop) {
                      break;
                    }
                    lastPercent10 = percent10;
                  }
                }
                if (i1 < N) {
                  break;
                }
                i1 = 0;
                state = 2;
              // Fall through
              case 2:
                steps = N - i1;
                if (steps > limit) {
                  steps = limit;
                }
                for (let i = 0; i < steps; i++) {
                  const offset = (2 * r - 1) * 16;
                  const j = XY[offset] & N - 1;
                  blockxor(V, j * Yi, XY, Yi);
                  blockmix_salsa8(XY, Yi, r, x, _X);
                }
                i1 += steps;
                currentOp += steps;
                if (callback) {
                  const percent10 = parseInt(1e3 * currentOp / totalOps);
                  if (percent10 !== lastPercent10) {
                    stop = callback(null, currentOp / totalOps);
                    if (stop) {
                      break;
                    }
                    lastPercent10 = percent10;
                  }
                }
                if (i1 < N) {
                  break;
                }
                arraycopy(XY, 0, B, Bi, Yi);
                i0++;
                if (i0 < p) {
                  state = 0;
                  break;
                }
                b = [];
                for (let i = 0; i < B.length; i++) {
                  b.push(B[i] >> 0 & 255);
                  b.push(B[i] >> 8 & 255);
                  b.push(B[i] >> 16 & 255);
                  b.push(B[i] >> 24 & 255);
                }
                const derivedKey = PBKDF2_HMAC_SHA256_OneIter(password, b, dkLen);
                if (callback) {
                  callback(null, 1, derivedKey);
                }
                return derivedKey;
            }
            if (callback) {
              nextTick(incrementalSMix);
            }
          };
          if (!callback) {
            while (true) {
              const derivedKey = incrementalSMix();
              if (derivedKey != void 0) {
                return derivedKey;
              }
            }
          }
          incrementalSMix();
        }
        const lib = {
          scrypt: function(password, salt, N, r, p, dkLen, progressCallback) {
            return new Promise(function(resolve, reject) {
              let lastProgress = 0;
              if (progressCallback) {
                progressCallback(0);
              }
              _scrypt(password, salt, N, r, p, dkLen, function(error, progress, key) {
                if (error) {
                  reject(error);
                } else if (key) {
                  if (progressCallback && lastProgress !== 1) {
                    progressCallback(1);
                  }
                  resolve(new Uint8Array(key));
                } else if (progressCallback && progress !== lastProgress) {
                  lastProgress = progress;
                  return progressCallback(progress);
                }
              });
            });
          },
          syncScrypt: function(password, salt, N, r, p, dkLen) {
            return new Uint8Array(_scrypt(password, salt, N, r, p, dkLen));
          }
        };
        if (typeof exports !== "undefined") {
          module.exports = lib;
        } else if (typeof define === "function" && define.amd) {
          define(lib);
        } else if (root) {
          if (root.scrypt) {
            root._scrypt = root.scrypt;
          }
          root.scrypt = lib;
        }
      })(exports);
    }
  });

  // ../browserify-aes/modes/ecb.js
  var require_ecb = __commonJS({
    "../browserify-aes/modes/ecb.js"(exports) {
      init_browser_globals();
      exports.encrypt = function(self2, block) {
        return self2._cipher.encryptBlock(block);
      };
      exports.decrypt = function(self2, block) {
        return self2._cipher.decryptBlock(block);
      };
    }
  });

  // ../buffer-xor/index.js
  var require_buffer_xor = __commonJS({
    "../buffer-xor/index.js"(exports, module) {
      init_browser_globals();
      module.exports = function xor(a, b) {
        var length = Math.min(a.length, b.length);
        var buffer = new import_buffer.Buffer(length);
        for (var i = 0; i < length; ++i) {
          buffer[i] = a[i] ^ b[i];
        }
        return buffer;
      };
    }
  });

  // ../browserify-aes/modes/cbc.js
  var require_cbc = __commonJS({
    "../browserify-aes/modes/cbc.js"(exports) {
      init_browser_globals();
      var xor = require_buffer_xor();
      exports.encrypt = function(self2, block) {
        var data = xor(block, self2._prev);
        self2._prev = self2._cipher.encryptBlock(data);
        return self2._prev;
      };
      exports.decrypt = function(self2, block) {
        var pad = self2._prev;
        self2._prev = block;
        var out = self2._cipher.decryptBlock(block);
        return xor(out, pad);
      };
    }
  });

  // ../safe-buffer/index.js
  var require_safe_buffer = __commonJS({
    "../safe-buffer/index.js"(exports, module) {
      init_browser_globals();
      var buffer = require_buffer();
      var Buffer3 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer3.from && Buffer3.alloc && Buffer3.allocUnsafe && Buffer3.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer3(arg, encodingOrOffset, length);
      }
      SafeBuffer.prototype = Object.create(Buffer3.prototype);
      copyProps(Buffer3, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer3(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer3(size);
        if (fill !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer3(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    }
  });

  // ../browserify-aes/modes/cfb.js
  var require_cfb = __commonJS({
    "../browserify-aes/modes/cfb.js"(exports) {
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      var xor = require_buffer_xor();
      function encryptStart(self2, data, decrypt) {
        var len = data.length;
        var out = xor(data, self2._cache);
        self2._cache = self2._cache.slice(len);
        self2._prev = Buffer3.concat([self2._prev, decrypt ? data : out]);
        return out;
      }
      exports.encrypt = function(self2, data, decrypt) {
        var out = Buffer3.allocUnsafe(0);
        var len;
        while (data.length) {
          if (self2._cache.length === 0) {
            self2._cache = self2._cipher.encryptBlock(self2._prev);
            self2._prev = Buffer3.allocUnsafe(0);
          }
          if (self2._cache.length <= data.length) {
            len = self2._cache.length;
            out = Buffer3.concat([out, encryptStart(self2, data.slice(0, len), decrypt)]);
            data = data.slice(len);
          } else {
            out = Buffer3.concat([out, encryptStart(self2, data, decrypt)]);
            break;
          }
        }
        return out;
      };
    }
  });

  // ../browserify-aes/modes/cfb8.js
  var require_cfb8 = __commonJS({
    "../browserify-aes/modes/cfb8.js"(exports) {
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      function encryptByte(self2, byteParam, decrypt) {
        var pad = self2._cipher.encryptBlock(self2._prev);
        var out = pad[0] ^ byteParam;
        self2._prev = Buffer3.concat([
          self2._prev.slice(1),
          Buffer3.from([decrypt ? byteParam : out])
        ]);
        return out;
      }
      exports.encrypt = function(self2, chunk, decrypt) {
        var len = chunk.length;
        var out = Buffer3.allocUnsafe(len);
        var i = -1;
        while (++i < len) {
          out[i] = encryptByte(self2, chunk[i], decrypt);
        }
        return out;
      };
    }
  });

  // ../browserify-aes/modes/cfb1.js
  var require_cfb1 = __commonJS({
    "../browserify-aes/modes/cfb1.js"(exports) {
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      function encryptByte(self2, byteParam, decrypt) {
        var pad;
        var i = -1;
        var len = 8;
        var out = 0;
        var bit, value;
        while (++i < len) {
          pad = self2._cipher.encryptBlock(self2._prev);
          bit = byteParam & 1 << 7 - i ? 128 : 0;
          value = pad[0] ^ bit;
          out += (value & 128) >> i % 8;
          self2._prev = shiftIn(self2._prev, decrypt ? bit : value);
        }
        return out;
      }
      function shiftIn(buffer, value) {
        var len = buffer.length;
        var i = -1;
        var out = Buffer3.allocUnsafe(buffer.length);
        buffer = Buffer3.concat([buffer, Buffer3.from([value])]);
        while (++i < len) {
          out[i] = buffer[i] << 1 | buffer[i + 1] >> 7;
        }
        return out;
      }
      exports.encrypt = function(self2, chunk, decrypt) {
        var len = chunk.length;
        var out = Buffer3.allocUnsafe(len);
        var i = -1;
        while (++i < len) {
          out[i] = encryptByte(self2, chunk[i], decrypt);
        }
        return out;
      };
    }
  });

  // ../browserify-aes/modes/ofb.js
  var require_ofb = __commonJS({
    "../browserify-aes/modes/ofb.js"(exports) {
      init_browser_globals();
      var xor = require_buffer_xor();
      function getBlock(self2) {
        self2._prev = self2._cipher.encryptBlock(self2._prev);
        return self2._prev;
      }
      exports.encrypt = function(self2, chunk) {
        while (self2._cache.length < chunk.length) {
          self2._cache = import_buffer.Buffer.concat([self2._cache, getBlock(self2)]);
        }
        var pad = self2._cache.slice(0, chunk.length);
        self2._cache = self2._cache.slice(chunk.length);
        return xor(chunk, pad);
      };
    }
  });

  // ../browserify-aes/incr32.js
  var require_incr32 = __commonJS({
    "../browserify-aes/incr32.js"(exports, module) {
      init_browser_globals();
      function incr32(iv) {
        var len = iv.length;
        var item;
        while (len--) {
          item = iv.readUInt8(len);
          if (item === 255) {
            iv.writeUInt8(0, len);
          } else {
            item++;
            iv.writeUInt8(item, len);
            break;
          }
        }
      }
      module.exports = incr32;
    }
  });

  // ../browserify-aes/modes/ctr.js
  var require_ctr = __commonJS({
    "../browserify-aes/modes/ctr.js"(exports) {
      init_browser_globals();
      var xor = require_buffer_xor();
      var Buffer3 = require_safe_buffer().Buffer;
      var incr32 = require_incr32();
      function getBlock(self2) {
        var out = self2._cipher.encryptBlockRaw(self2._prev);
        incr32(self2._prev);
        return out;
      }
      var blockSize = 16;
      exports.encrypt = function(self2, chunk) {
        var chunkNum = Math.ceil(chunk.length / blockSize);
        var start = self2._cache.length;
        self2._cache = Buffer3.concat([
          self2._cache,
          Buffer3.allocUnsafe(chunkNum * blockSize)
        ]);
        for (var i = 0; i < chunkNum; i++) {
          var out = getBlock(self2);
          var offset = start + i * blockSize;
          self2._cache.writeUInt32BE(out[0], offset + 0);
          self2._cache.writeUInt32BE(out[1], offset + 4);
          self2._cache.writeUInt32BE(out[2], offset + 8);
          self2._cache.writeUInt32BE(out[3], offset + 12);
        }
        var pad = self2._cache.slice(0, chunk.length);
        self2._cache = self2._cache.slice(chunk.length);
        return xor(chunk, pad);
      };
    }
  });

  // ../browserify-aes/modes/list.json
  var require_list = __commonJS({
    "../browserify-aes/modes/list.json"(exports, module) {
      module.exports = {
        "aes-128-ecb": {
          cipher: "AES",
          key: 128,
          iv: 0,
          mode: "ECB",
          type: "block"
        },
        "aes-192-ecb": {
          cipher: "AES",
          key: 192,
          iv: 0,
          mode: "ECB",
          type: "block"
        },
        "aes-256-ecb": {
          cipher: "AES",
          key: 256,
          iv: 0,
          mode: "ECB",
          type: "block"
        },
        "aes-128-cbc": {
          cipher: "AES",
          key: 128,
          iv: 16,
          mode: "CBC",
          type: "block"
        },
        "aes-192-cbc": {
          cipher: "AES",
          key: 192,
          iv: 16,
          mode: "CBC",
          type: "block"
        },
        "aes-256-cbc": {
          cipher: "AES",
          key: 256,
          iv: 16,
          mode: "CBC",
          type: "block"
        },
        aes128: {
          cipher: "AES",
          key: 128,
          iv: 16,
          mode: "CBC",
          type: "block"
        },
        aes192: {
          cipher: "AES",
          key: 192,
          iv: 16,
          mode: "CBC",
          type: "block"
        },
        aes256: {
          cipher: "AES",
          key: 256,
          iv: 16,
          mode: "CBC",
          type: "block"
        },
        "aes-128-cfb": {
          cipher: "AES",
          key: 128,
          iv: 16,
          mode: "CFB",
          type: "stream"
        },
        "aes-192-cfb": {
          cipher: "AES",
          key: 192,
          iv: 16,
          mode: "CFB",
          type: "stream"
        },
        "aes-256-cfb": {
          cipher: "AES",
          key: 256,
          iv: 16,
          mode: "CFB",
          type: "stream"
        },
        "aes-128-cfb8": {
          cipher: "AES",
          key: 128,
          iv: 16,
          mode: "CFB8",
          type: "stream"
        },
        "aes-192-cfb8": {
          cipher: "AES",
          key: 192,
          iv: 16,
          mode: "CFB8",
          type: "stream"
        },
        "aes-256-cfb8": {
          cipher: "AES",
          key: 256,
          iv: 16,
          mode: "CFB8",
          type: "stream"
        },
        "aes-128-cfb1": {
          cipher: "AES",
          key: 128,
          iv: 16,
          mode: "CFB1",
          type: "stream"
        },
        "aes-192-cfb1": {
          cipher: "AES",
          key: 192,
          iv: 16,
          mode: "CFB1",
          type: "stream"
        },
        "aes-256-cfb1": {
          cipher: "AES",
          key: 256,
          iv: 16,
          mode: "CFB1",
          type: "stream"
        },
        "aes-128-ofb": {
          cipher: "AES",
          key: 128,
          iv: 16,
          mode: "OFB",
          type: "stream"
        },
        "aes-192-ofb": {
          cipher: "AES",
          key: 192,
          iv: 16,
          mode: "OFB",
          type: "stream"
        },
        "aes-256-ofb": {
          cipher: "AES",
          key: 256,
          iv: 16,
          mode: "OFB",
          type: "stream"
        },
        "aes-128-ctr": {
          cipher: "AES",
          key: 128,
          iv: 16,
          mode: "CTR",
          type: "stream"
        },
        "aes-192-ctr": {
          cipher: "AES",
          key: 192,
          iv: 16,
          mode: "CTR",
          type: "stream"
        },
        "aes-256-ctr": {
          cipher: "AES",
          key: 256,
          iv: 16,
          mode: "CTR",
          type: "stream"
        },
        "aes-128-gcm": {
          cipher: "AES",
          key: 128,
          iv: 12,
          mode: "GCM",
          type: "auth"
        },
        "aes-192-gcm": {
          cipher: "AES",
          key: 192,
          iv: 12,
          mode: "GCM",
          type: "auth"
        },
        "aes-256-gcm": {
          cipher: "AES",
          key: 256,
          iv: 12,
          mode: "GCM",
          type: "auth"
        }
      };
    }
  });

  // ../browserify-aes/modes/index.js
  var require_modes = __commonJS({
    "../browserify-aes/modes/index.js"(exports, module) {
      init_browser_globals();
      var modeModules = {
        ECB: require_ecb(),
        CBC: require_cbc(),
        CFB: require_cfb(),
        CFB8: require_cfb8(),
        CFB1: require_cfb1(),
        OFB: require_ofb(),
        CTR: require_ctr(),
        GCM: require_ctr()
      };
      var modes = require_list();
      for (key in modes) {
        modes[key].module = modeModules[modes[key].mode];
      }
      var key;
      module.exports = modes;
    }
  });

  // ../browserify-aes/aes.js
  var require_aes = __commonJS({
    "../browserify-aes/aes.js"(exports, module) {
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      function asUInt32Array(buf) {
        if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
        var len = buf.length / 4 | 0;
        var out = new Array(len);
        for (var i = 0; i < len; i++) {
          out[i] = buf.readUInt32BE(i * 4);
        }
        return out;
      }
      function scrubVec(v) {
        for (var i = 0; i < v.length; v++) {
          v[i] = 0;
        }
      }
      function cryptBlock(M, keySchedule, SUB_MIX, SBOX, nRounds) {
        var SUB_MIX0 = SUB_MIX[0];
        var SUB_MIX1 = SUB_MIX[1];
        var SUB_MIX2 = SUB_MIX[2];
        var SUB_MIX3 = SUB_MIX[3];
        var s0 = M[0] ^ keySchedule[0];
        var s1 = M[1] ^ keySchedule[1];
        var s2 = M[2] ^ keySchedule[2];
        var s3 = M[3] ^ keySchedule[3];
        var t0, t1, t2, t3;
        var ksRow = 4;
        for (var round = 1; round < nRounds; round++) {
          t0 = SUB_MIX0[s0 >>> 24] ^ SUB_MIX1[s1 >>> 16 & 255] ^ SUB_MIX2[s2 >>> 8 & 255] ^ SUB_MIX3[s3 & 255] ^ keySchedule[ksRow++];
          t1 = SUB_MIX0[s1 >>> 24] ^ SUB_MIX1[s2 >>> 16 & 255] ^ SUB_MIX2[s3 >>> 8 & 255] ^ SUB_MIX3[s0 & 255] ^ keySchedule[ksRow++];
          t2 = SUB_MIX0[s2 >>> 24] ^ SUB_MIX1[s3 >>> 16 & 255] ^ SUB_MIX2[s0 >>> 8 & 255] ^ SUB_MIX3[s1 & 255] ^ keySchedule[ksRow++];
          t3 = SUB_MIX0[s3 >>> 24] ^ SUB_MIX1[s0 >>> 16 & 255] ^ SUB_MIX2[s1 >>> 8 & 255] ^ SUB_MIX3[s2 & 255] ^ keySchedule[ksRow++];
          s0 = t0;
          s1 = t1;
          s2 = t2;
          s3 = t3;
        }
        t0 = (SBOX[s0 >>> 24] << 24 | SBOX[s1 >>> 16 & 255] << 16 | SBOX[s2 >>> 8 & 255] << 8 | SBOX[s3 & 255]) ^ keySchedule[ksRow++];
        t1 = (SBOX[s1 >>> 24] << 24 | SBOX[s2 >>> 16 & 255] << 16 | SBOX[s3 >>> 8 & 255] << 8 | SBOX[s0 & 255]) ^ keySchedule[ksRow++];
        t2 = (SBOX[s2 >>> 24] << 24 | SBOX[s3 >>> 16 & 255] << 16 | SBOX[s0 >>> 8 & 255] << 8 | SBOX[s1 & 255]) ^ keySchedule[ksRow++];
        t3 = (SBOX[s3 >>> 24] << 24 | SBOX[s0 >>> 16 & 255] << 16 | SBOX[s1 >>> 8 & 255] << 8 | SBOX[s2 & 255]) ^ keySchedule[ksRow++];
        t0 = t0 >>> 0;
        t1 = t1 >>> 0;
        t2 = t2 >>> 0;
        t3 = t3 >>> 0;
        return [t0, t1, t2, t3];
      }
      var RCON = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
      var G = (function() {
        var d = new Array(256);
        for (var j = 0; j < 256; j++) {
          if (j < 128) {
            d[j] = j << 1;
          } else {
            d[j] = j << 1 ^ 283;
          }
        }
        var SBOX = [];
        var INV_SBOX = [];
        var SUB_MIX = [[], [], [], []];
        var INV_SUB_MIX = [[], [], [], []];
        var x = 0;
        var xi = 0;
        for (var i = 0; i < 256; ++i) {
          var sx = xi ^ xi << 1 ^ xi << 2 ^ xi << 3 ^ xi << 4;
          sx = sx >>> 8 ^ sx & 255 ^ 99;
          SBOX[x] = sx;
          INV_SBOX[sx] = x;
          var x2 = d[x];
          var x4 = d[x2];
          var x8 = d[x4];
          var t = d[sx] * 257 ^ sx * 16843008;
          SUB_MIX[0][x] = t << 24 | t >>> 8;
          SUB_MIX[1][x] = t << 16 | t >>> 16;
          SUB_MIX[2][x] = t << 8 | t >>> 24;
          SUB_MIX[3][x] = t;
          t = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
          INV_SUB_MIX[0][sx] = t << 24 | t >>> 8;
          INV_SUB_MIX[1][sx] = t << 16 | t >>> 16;
          INV_SUB_MIX[2][sx] = t << 8 | t >>> 24;
          INV_SUB_MIX[3][sx] = t;
          if (x === 0) {
            x = xi = 1;
          } else {
            x = x2 ^ d[d[d[x8 ^ x2]]];
            xi ^= d[d[xi]];
          }
        }
        return {
          SBOX,
          INV_SBOX,
          SUB_MIX,
          INV_SUB_MIX
        };
      })();
      function AES(key) {
        this._key = asUInt32Array(key);
        this._reset();
      }
      AES.blockSize = 4 * 4;
      AES.keySize = 256 / 8;
      AES.prototype.blockSize = AES.blockSize;
      AES.prototype.keySize = AES.keySize;
      AES.prototype._reset = function() {
        var keyWords = this._key;
        var keySize = keyWords.length;
        var nRounds = keySize + 6;
        var ksRows = (nRounds + 1) * 4;
        var keySchedule = [];
        for (var k = 0; k < keySize; k++) {
          keySchedule[k] = keyWords[k];
        }
        for (k = keySize; k < ksRows; k++) {
          var t = keySchedule[k - 1];
          if (k % keySize === 0) {
            t = t << 8 | t >>> 24;
            t = G.SBOX[t >>> 24] << 24 | G.SBOX[t >>> 16 & 255] << 16 | G.SBOX[t >>> 8 & 255] << 8 | G.SBOX[t & 255];
            t ^= RCON[k / keySize | 0] << 24;
          } else if (keySize > 6 && k % keySize === 4) {
            t = G.SBOX[t >>> 24] << 24 | G.SBOX[t >>> 16 & 255] << 16 | G.SBOX[t >>> 8 & 255] << 8 | G.SBOX[t & 255];
          }
          keySchedule[k] = keySchedule[k - keySize] ^ t;
        }
        var invKeySchedule = [];
        for (var ik = 0; ik < ksRows; ik++) {
          var ksR = ksRows - ik;
          var tt = keySchedule[ksR - (ik % 4 ? 0 : 4)];
          if (ik < 4 || ksR <= 4) {
            invKeySchedule[ik] = tt;
          } else {
            invKeySchedule[ik] = G.INV_SUB_MIX[0][G.SBOX[tt >>> 24]] ^ G.INV_SUB_MIX[1][G.SBOX[tt >>> 16 & 255]] ^ G.INV_SUB_MIX[2][G.SBOX[tt >>> 8 & 255]] ^ G.INV_SUB_MIX[3][G.SBOX[tt & 255]];
          }
        }
        this._nRounds = nRounds;
        this._keySchedule = keySchedule;
        this._invKeySchedule = invKeySchedule;
      };
      AES.prototype.encryptBlockRaw = function(M) {
        M = asUInt32Array(M);
        return cryptBlock(M, this._keySchedule, G.SUB_MIX, G.SBOX, this._nRounds);
      };
      AES.prototype.encryptBlock = function(M) {
        var out = this.encryptBlockRaw(M);
        var buf = Buffer3.allocUnsafe(16);
        buf.writeUInt32BE(out[0], 0);
        buf.writeUInt32BE(out[1], 4);
        buf.writeUInt32BE(out[2], 8);
        buf.writeUInt32BE(out[3], 12);
        return buf;
      };
      AES.prototype.decryptBlock = function(M) {
        M = asUInt32Array(M);
        var m1 = M[1];
        M[1] = M[3];
        M[3] = m1;
        var out = cryptBlock(M, this._invKeySchedule, G.INV_SUB_MIX, G.INV_SBOX, this._nRounds);
        var buf = Buffer3.allocUnsafe(16);
        buf.writeUInt32BE(out[0], 0);
        buf.writeUInt32BE(out[3], 4);
        buf.writeUInt32BE(out[2], 8);
        buf.writeUInt32BE(out[1], 12);
        return buf;
      };
      AES.prototype.scrub = function() {
        scrubVec(this._keySchedule);
        scrubVec(this._invKeySchedule);
        scrubVec(this._key);
      };
      module.exports.AES = AES;
    }
  });

  // ../events/events.js
  var require_events = __commonJS({
    "../events/events.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var R = typeof Reflect === "object" ? Reflect : null;
      var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
        return Function.prototype.apply.call(target, receiver, args);
      };
      var ReflectOwnKeys;
      if (R && typeof R.ownKeys === "function") {
        ReflectOwnKeys = R.ownKeys;
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
        };
      } else {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target);
        };
      }
      function ProcessEmitWarning(warning) {
        if (console && console.warn) console.warn(warning);
      }
      var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
        return value !== value;
      };
      function EventEmitter() {
        EventEmitter.init.call(this);
      }
      module.exports = EventEmitter;
      module.exports.once = once;
      EventEmitter.EventEmitter = EventEmitter;
      EventEmitter.prototype._events = void 0;
      EventEmitter.prototype._eventsCount = 0;
      EventEmitter.prototype._maxListeners = void 0;
      var defaultMaxListeners = 10;
      function checkListener(listener) {
        if (typeof listener !== "function") {
          throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
        }
      }
      Object.defineProperty(EventEmitter, "defaultMaxListeners", {
        enumerable: true,
        get: function() {
          return defaultMaxListeners;
        },
        set: function(arg) {
          if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
          }
          defaultMaxListeners = arg;
        }
      });
      EventEmitter.init = function() {
        if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        }
        this._maxListeners = this._maxListeners || void 0;
      };
      EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
          throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
        }
        this._maxListeners = n;
        return this;
      };
      function _getMaxListeners(that) {
        if (that._maxListeners === void 0)
          return EventEmitter.defaultMaxListeners;
        return that._maxListeners;
      }
      EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this);
      };
      EventEmitter.prototype.emit = function emit(type) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        var doError = type === "error";
        var events = this._events;
        if (events !== void 0)
          doError = doError && events.error === void 0;
        else if (!doError)
          return false;
        if (doError) {
          var er;
          if (args.length > 0)
            er = args[0];
          if (er instanceof Error) {
            throw er;
          }
          var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
          err.context = er;
          throw err;
        }
        var handler = events[type];
        if (handler === void 0)
          return false;
        if (typeof handler === "function") {
          ReflectApply(handler, this, args);
        } else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i)
            ReflectApply(listeners[i], this, args);
        }
        return true;
      };
      function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;
        checkListener(listener);
        events = target._events;
        if (events === void 0) {
          events = target._events = /* @__PURE__ */ Object.create(null);
          target._eventsCount = 0;
        } else {
          if (events.newListener !== void 0) {
            target.emit(
              "newListener",
              type,
              listener.listener ? listener.listener : listener
            );
            events = target._events;
          }
          existing = events[type];
        }
        if (existing === void 0) {
          existing = events[type] = listener;
          ++target._eventsCount;
        } else {
          if (typeof existing === "function") {
            existing = events[type] = prepend ? [listener, existing] : [existing, listener];
          } else if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
          m = _getMaxListeners(target);
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            w.name = "MaxListenersExceededWarning";
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            ProcessEmitWarning(w);
          }
        }
        return target;
      }
      EventEmitter.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
      };
      EventEmitter.prototype.on = EventEmitter.prototype.addListener;
      EventEmitter.prototype.prependListener = function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };
      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn);
          this.fired = true;
          if (arguments.length === 0)
            return this.listener.call(this.target);
          return this.listener.apply(this.target, arguments);
        }
      }
      function _onceWrap(target, type, listener) {
        var state = { fired: false, wrapFn: void 0, target, type, listener };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
      }
      EventEmitter.prototype.once = function once2(type, listener) {
        checkListener(listener);
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter.prototype.removeListener = function removeListener(type, listener) {
        var list, events, position, i, originalListener;
        checkListener(listener);
        events = this._events;
        if (events === void 0)
          return this;
        list = events[type];
        if (list === void 0)
          return this;
        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else {
            delete events[type];
            if (events.removeListener)
              this.emit("removeListener", type, list.listener || listener);
          }
        } else if (typeof list !== "function") {
          position = -1;
          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }
          if (position < 0)
            return this;
          if (position === 0)
            list.shift();
          else {
            spliceOne(list, position);
          }
          if (list.length === 1)
            events[type] = list[0];
          if (events.removeListener !== void 0)
            this.emit("removeListener", type, originalListener || listener);
        }
        return this;
      };
      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
      EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
        var listeners, events, i;
        events = this._events;
        if (events === void 0)
          return this;
        if (events.removeListener === void 0) {
          if (arguments.length === 0) {
            this._events = /* @__PURE__ */ Object.create(null);
            this._eventsCount = 0;
          } else if (events[type] !== void 0) {
            if (--this._eventsCount === 0)
              this._events = /* @__PURE__ */ Object.create(null);
            else
              delete events[type];
          }
          return this;
        }
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === "removeListener") continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners("removeListener");
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
          return this;
        }
        listeners = events[type];
        if (typeof listeners === "function") {
          this.removeListener(type, listeners);
        } else if (listeners !== void 0) {
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }
        return this;
      };
      function _listeners(target, type, unwrap) {
        var events = target._events;
        if (events === void 0)
          return [];
        var evlistener = events[type];
        if (evlistener === void 0)
          return [];
        if (typeof evlistener === "function")
          return unwrap ? [evlistener.listener || evlistener] : [evlistener];
        return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
      }
      EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
      };
      EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
      };
      EventEmitter.listenerCount = function(emitter, type) {
        if (typeof emitter.listenerCount === "function") {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };
      EventEmitter.prototype.listenerCount = listenerCount;
      function listenerCount(type) {
        var events = this._events;
        if (events !== void 0) {
          var evlistener = events[type];
          if (typeof evlistener === "function") {
            return 1;
          } else if (evlistener !== void 0) {
            return evlistener.length;
          }
        }
        return 0;
      }
      EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
      };
      function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i)
          copy[i] = arr[i];
        return copy;
      }
      function spliceOne(list, index) {
        for (; index + 1 < list.length; index++)
          list[index] = list[index + 1];
        list.pop();
      }
      function unwrapListeners(arr) {
        var ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i];
        }
        return ret;
      }
      function once(emitter, name) {
        return new Promise(function(resolve, reject) {
          function errorListener(err) {
            emitter.removeListener(name, resolver);
            reject(err);
          }
          function resolver() {
            if (typeof emitter.removeListener === "function") {
              emitter.removeListener("error", errorListener);
            }
            resolve([].slice.call(arguments));
          }
          ;
          eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
          if (name !== "error") {
            addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
          }
        });
      }
      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === "function") {
          eventTargetAgnosticAddListener(emitter, "error", handler, flags);
        }
      }
      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === "function") {
          if (flags.once) {
            emitter.once(name, listener);
          } else {
            emitter.on(name, listener);
          }
        } else if (typeof emitter.addEventListener === "function") {
          emitter.addEventListener(name, function wrapListener(arg) {
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener);
            }
            listener(arg);
          });
        } else {
          throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
        }
      }
    }
  });

  // ../inherits/inherits_browser.js
  var require_inherits_browser = __commonJS({
    "../inherits/inherits_browser.js"(exports, module) {
      init_browser_globals();
      if (typeof Object.create === "function") {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            });
          }
        };
      } else {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {
            };
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          }
        };
      }
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/stream-browser.js
  var require_stream_browser = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/stream-browser.js"(exports, module) {
      init_browser_globals();
      module.exports = require_events().EventEmitter;
    }
  });

  // (disabled):util
  var require_util = __commonJS({
    "(disabled):util"() {
      init_browser_globals();
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/buffer_list.js
  var require_buffer_list = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/buffer_list.js"(exports, module) {
      "use strict";
      init_browser_globals();
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          enumerableOnly && (symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          })), keys.push.apply(keys, symbols);
        }
        return keys;
      }
      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {};
          i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
            _defineProperty(target, key, source[key]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
        return target;
      }
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key);
        if (key in obj) {
          Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return typeof key === "symbol" ? key : String(key);
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== "object" || input === null) return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (typeof res !== "object") return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      var _require = require_buffer();
      var Buffer3 = _require.Buffer;
      var _require2 = require_util();
      var inspect = _require2.inspect;
      var custom = inspect && inspect.custom || "inspect";
      function copyBuffer(src, target, offset) {
        Buffer3.prototype.copy.call(src, target, offset);
      }
      module.exports = /* @__PURE__ */ (function() {
        function BufferList() {
          _classCallCheck(this, BufferList);
          this.head = null;
          this.tail = null;
          this.length = 0;
        }
        _createClass(BufferList, [{
          key: "push",
          value: function push(v) {
            var entry = {
              data: v,
              next: null
            };
            if (this.length > 0) this.tail.next = entry;
            else this.head = entry;
            this.tail = entry;
            ++this.length;
          }
        }, {
          key: "unshift",
          value: function unshift(v) {
            var entry = {
              data: v,
              next: this.head
            };
            if (this.length === 0) this.tail = entry;
            this.head = entry;
            ++this.length;
          }
        }, {
          key: "shift",
          value: function shift() {
            if (this.length === 0) return;
            var ret = this.head.data;
            if (this.length === 1) this.head = this.tail = null;
            else this.head = this.head.next;
            --this.length;
            return ret;
          }
        }, {
          key: "clear",
          value: function clear() {
            this.head = this.tail = null;
            this.length = 0;
          }
        }, {
          key: "join",
          value: function join(s) {
            if (this.length === 0) return "";
            var p = this.head;
            var ret = "" + p.data;
            while (p = p.next) ret += s + p.data;
            return ret;
          }
        }, {
          key: "concat",
          value: function concat(n) {
            if (this.length === 0) return Buffer3.alloc(0);
            var ret = Buffer3.allocUnsafe(n >>> 0);
            var p = this.head;
            var i = 0;
            while (p) {
              copyBuffer(p.data, ret, i);
              i += p.data.length;
              p = p.next;
            }
            return ret;
          }
          // Consumes a specified amount of bytes or characters from the buffered data.
        }, {
          key: "consume",
          value: function consume(n, hasStrings) {
            var ret;
            if (n < this.head.data.length) {
              ret = this.head.data.slice(0, n);
              this.head.data = this.head.data.slice(n);
            } else if (n === this.head.data.length) {
              ret = this.shift();
            } else {
              ret = hasStrings ? this._getString(n) : this._getBuffer(n);
            }
            return ret;
          }
        }, {
          key: "first",
          value: function first() {
            return this.head.data;
          }
          // Consumes a specified amount of characters from the buffered data.
        }, {
          key: "_getString",
          value: function _getString(n) {
            var p = this.head;
            var c = 1;
            var ret = p.data;
            n -= ret.length;
            while (p = p.next) {
              var str = p.data;
              var nb = n > str.length ? str.length : n;
              if (nb === str.length) ret += str;
              else ret += str.slice(0, n);
              n -= nb;
              if (n === 0) {
                if (nb === str.length) {
                  ++c;
                  if (p.next) this.head = p.next;
                  else this.head = this.tail = null;
                } else {
                  this.head = p;
                  p.data = str.slice(nb);
                }
                break;
              }
              ++c;
            }
            this.length -= c;
            return ret;
          }
          // Consumes a specified amount of bytes from the buffered data.
        }, {
          key: "_getBuffer",
          value: function _getBuffer(n) {
            var ret = Buffer3.allocUnsafe(n);
            var p = this.head;
            var c = 1;
            p.data.copy(ret);
            n -= p.data.length;
            while (p = p.next) {
              var buf = p.data;
              var nb = n > buf.length ? buf.length : n;
              buf.copy(ret, ret.length - n, 0, nb);
              n -= nb;
              if (n === 0) {
                if (nb === buf.length) {
                  ++c;
                  if (p.next) this.head = p.next;
                  else this.head = this.tail = null;
                } else {
                  this.head = p;
                  p.data = buf.slice(nb);
                }
                break;
              }
              ++c;
            }
            this.length -= c;
            return ret;
          }
          // Make sure the linked list only shows the minimal necessary information.
        }, {
          key: custom,
          value: function value(_, options) {
            return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
              // Only inspect one level.
              depth: 0,
              // It should not recurse.
              customInspect: false
            }));
          }
        }]);
        return BufferList;
      })();
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/destroy.js
  var require_destroy = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module) {
      "use strict";
      init_browser_globals();
      function destroy(err, cb) {
        var _this = this;
        var readableDestroyed = this._readableState && this._readableState.destroyed;
        var writableDestroyed = this._writableState && this._writableState.destroyed;
        if (readableDestroyed || writableDestroyed) {
          if (cb) {
            cb(err);
          } else if (err) {
            if (!this._writableState) {
              import_browser.default.nextTick(emitErrorNT, this, err);
            } else if (!this._writableState.errorEmitted) {
              this._writableState.errorEmitted = true;
              import_browser.default.nextTick(emitErrorNT, this, err);
            }
          }
          return this;
        }
        if (this._readableState) {
          this._readableState.destroyed = true;
        }
        if (this._writableState) {
          this._writableState.destroyed = true;
        }
        this._destroy(err || null, function(err2) {
          if (!cb && err2) {
            if (!_this._writableState) {
              import_browser.default.nextTick(emitErrorAndCloseNT, _this, err2);
            } else if (!_this._writableState.errorEmitted) {
              _this._writableState.errorEmitted = true;
              import_browser.default.nextTick(emitErrorAndCloseNT, _this, err2);
            } else {
              import_browser.default.nextTick(emitCloseNT, _this);
            }
          } else if (cb) {
            import_browser.default.nextTick(emitCloseNT, _this);
            cb(err2);
          } else {
            import_browser.default.nextTick(emitCloseNT, _this);
          }
        });
        return this;
      }
      function emitErrorAndCloseNT(self2, err) {
        emitErrorNT(self2, err);
        emitCloseNT(self2);
      }
      function emitCloseNT(self2) {
        if (self2._writableState && !self2._writableState.emitClose) return;
        if (self2._readableState && !self2._readableState.emitClose) return;
        self2.emit("close");
      }
      function undestroy() {
        if (this._readableState) {
          this._readableState.destroyed = false;
          this._readableState.reading = false;
          this._readableState.ended = false;
          this._readableState.endEmitted = false;
        }
        if (this._writableState) {
          this._writableState.destroyed = false;
          this._writableState.ended = false;
          this._writableState.ending = false;
          this._writableState.finalCalled = false;
          this._writableState.prefinished = false;
          this._writableState.finished = false;
          this._writableState.errorEmitted = false;
        }
      }
      function emitErrorNT(self2, err) {
        self2.emit("error", err);
      }
      function errorOrDestroy(stream, err) {
        var rState = stream._readableState;
        var wState = stream._writableState;
        if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);
        else stream.emit("error", err);
      }
      module.exports = {
        destroy,
        undestroy,
        errorOrDestroy
      };
    }
  });

  // ../stream-browserify/node_modules/readable-stream/errors-browser.js
  var require_errors_browser = __commonJS({
    "../stream-browserify/node_modules/readable-stream/errors-browser.js"(exports, module) {
      "use strict";
      init_browser_globals();
      function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
      }
      var codes = {};
      function createErrorType(code, message, Base) {
        if (!Base) {
          Base = Error;
        }
        function getMessage(arg1, arg2, arg3) {
          if (typeof message === "string") {
            return message;
          } else {
            return message(arg1, arg2, arg3);
          }
        }
        var NodeError = /* @__PURE__ */ (function(_Base) {
          _inheritsLoose(NodeError2, _Base);
          function NodeError2(arg1, arg2, arg3) {
            return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
          }
          return NodeError2;
        })(Base);
        NodeError.prototype.name = Base.name;
        NodeError.prototype.code = code;
        codes[code] = NodeError;
      }
      function oneOf(expected, thing) {
        if (Array.isArray(expected)) {
          var len = expected.length;
          expected = expected.map(function(i) {
            return String(i);
          });
          if (len > 2) {
            return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(", "), ", or ") + expected[len - 1];
          } else if (len === 2) {
            return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
          } else {
            return "of ".concat(thing, " ").concat(expected[0]);
          }
        } else {
          return "of ".concat(thing, " ").concat(String(expected));
        }
      }
      function startsWith(str, search, pos) {
        return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
      }
      function endsWith(str, search, this_len) {
        if (this_len === void 0 || this_len > str.length) {
          this_len = str.length;
        }
        return str.substring(this_len - search.length, this_len) === search;
      }
      function includes(str, search, start) {
        if (typeof start !== "number") {
          start = 0;
        }
        if (start + search.length > str.length) {
          return false;
        } else {
          return str.indexOf(search, start) !== -1;
        }
      }
      createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
        return 'The value "' + value + '" is invalid for option "' + name + '"';
      }, TypeError);
      createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
        var determiner;
        if (typeof expected === "string" && startsWith(expected, "not ")) {
          determiner = "must not be";
          expected = expected.replace(/^not /, "");
        } else {
          determiner = "must be";
        }
        var msg;
        if (endsWith(name, " argument")) {
          msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
        } else {
          var type = includes(name, ".") ? "property" : "argument";
          msg = 'The "'.concat(name, '" ').concat(type, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
        }
        msg += ". Received type ".concat(typeof actual);
        return msg;
      }, TypeError);
      createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
      createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
        return "The " + name + " method is not implemented";
      });
      createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
      createErrorType("ERR_STREAM_DESTROYED", function(name) {
        return "Cannot call " + name + " after a stream was destroyed";
      });
      createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
      createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
      createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
      createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
      createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
        return "Unknown encoding: " + arg;
      }, TypeError);
      createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
      module.exports.codes = codes;
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/state.js
  var require_state = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/state.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var ERR_INVALID_OPT_VALUE = require_errors_browser().codes.ERR_INVALID_OPT_VALUE;
      function highWaterMarkFrom(options, isDuplex, duplexKey) {
        return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
      }
      function getHighWaterMark(state, options, duplexKey, isDuplex) {
        var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
        if (hwm != null) {
          if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
            var name = isDuplex ? duplexKey : "highWaterMark";
            throw new ERR_INVALID_OPT_VALUE(name, hwm);
          }
          return Math.floor(hwm);
        }
        return state.objectMode ? 16 : 16 * 1024;
      }
      module.exports = {
        getHighWaterMark
      };
    }
  });

  // ../util-deprecate/browser.js
  var require_browser2 = __commonJS({
    "../util-deprecate/browser.js"(exports, module) {
      init_browser_globals();
      module.exports = deprecate;
      function deprecate(fn, msg) {
        if (config("noDeprecation")) {
          return fn;
        }
        var warned = false;
        function deprecated() {
          if (!warned) {
            if (config("throwDeprecation")) {
              throw new Error(msg);
            } else if (config("traceDeprecation")) {
              console.trace(msg);
            } else {
              console.warn(msg);
            }
            warned = true;
          }
          return fn.apply(this, arguments);
        }
        return deprecated;
      }
      function config(name) {
        try {
          if (!globalThis.localStorage) return false;
        } catch (_) {
          return false;
        }
        var val = globalThis.localStorage[name];
        if (null == val) return false;
        return String(val).toLowerCase() === "true";
      }
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/_stream_writable.js
  var require_stream_writable = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/_stream_writable.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Writable;
      function CorkedRequest(state) {
        var _this = this;
        this.next = null;
        this.entry = null;
        this.finish = function() {
          onCorkedFinish(_this, state);
        };
      }
      var Duplex;
      Writable.WritableState = WritableState;
      var internalUtil = {
        deprecate: require_browser2()
      };
      var Stream = require_stream_browser();
      var Buffer3 = require_buffer().Buffer;
      var OurUint8Array = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
      };
      function _uint8ArrayToBuffer(chunk) {
        return Buffer3.from(chunk);
      }
      function _isUint8Array(obj) {
        return Buffer3.isBuffer(obj) || obj instanceof OurUint8Array;
      }
      var destroyImpl = require_destroy();
      var _require = require_state();
      var getHighWaterMark = _require.getHighWaterMark;
      var _require$codes = require_errors_browser().codes;
      var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
      var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
      var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
      var ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE;
      var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
      var ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
      var ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END;
      var ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
      var errorOrDestroy = destroyImpl.errorOrDestroy;
      require_inherits_browser()(Writable, Stream);
      function nop() {
      }
      function WritableState(options, stream, isDuplex) {
        Duplex = Duplex || require_stream_duplex();
        options = options || {};
        if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex;
        this.objectMode = !!options.objectMode;
        if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
        this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
        this.finalCalled = false;
        this.needDrain = false;
        this.ending = false;
        this.ended = false;
        this.finished = false;
        this.destroyed = false;
        var noDecode = options.decodeStrings === false;
        this.decodeStrings = !noDecode;
        this.defaultEncoding = options.defaultEncoding || "utf8";
        this.length = 0;
        this.writing = false;
        this.corked = 0;
        this.sync = true;
        this.bufferProcessing = false;
        this.onwrite = function(er) {
          onwrite(stream, er);
        };
        this.writecb = null;
        this.writelen = 0;
        this.bufferedRequest = null;
        this.lastBufferedRequest = null;
        this.pendingcb = 0;
        this.prefinished = false;
        this.errorEmitted = false;
        this.emitClose = options.emitClose !== false;
        this.autoDestroy = !!options.autoDestroy;
        this.bufferedRequestCount = 0;
        this.corkedRequestsFree = new CorkedRequest(this);
      }
      WritableState.prototype.getBuffer = function getBuffer() {
        var current = this.bufferedRequest;
        var out = [];
        while (current) {
          out.push(current);
          current = current.next;
        }
        return out;
      };
      (function() {
        try {
          Object.defineProperty(WritableState.prototype, "buffer", {
            get: internalUtil.deprecate(function writableStateBufferGetter() {
              return this.getBuffer();
            }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
          });
        } catch (_) {
        }
      })();
      var realHasInstance;
      if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
        realHasInstance = Function.prototype[Symbol.hasInstance];
        Object.defineProperty(Writable, Symbol.hasInstance, {
          value: function value(object) {
            if (realHasInstance.call(this, object)) return true;
            if (this !== Writable) return false;
            return object && object._writableState instanceof WritableState;
          }
        });
      } else {
        realHasInstance = function realHasInstance2(object) {
          return object instanceof this;
        };
      }
      function Writable(options) {
        Duplex = Duplex || require_stream_duplex();
        var isDuplex = this instanceof Duplex;
        if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
        this._writableState = new WritableState(options, this, isDuplex);
        this.writable = true;
        if (options) {
          if (typeof options.write === "function") this._write = options.write;
          if (typeof options.writev === "function") this._writev = options.writev;
          if (typeof options.destroy === "function") this._destroy = options.destroy;
          if (typeof options.final === "function") this._final = options.final;
        }
        Stream.call(this);
      }
      Writable.prototype.pipe = function() {
        errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
      };
      function writeAfterEnd(stream, cb) {
        var er = new ERR_STREAM_WRITE_AFTER_END();
        errorOrDestroy(stream, er);
        import_browser.default.nextTick(cb, er);
      }
      function validChunk(stream, state, chunk, cb) {
        var er;
        if (chunk === null) {
          er = new ERR_STREAM_NULL_VALUES();
        } else if (typeof chunk !== "string" && !state.objectMode) {
          er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
        }
        if (er) {
          errorOrDestroy(stream, er);
          import_browser.default.nextTick(cb, er);
          return false;
        }
        return true;
      }
      Writable.prototype.write = function(chunk, encoding, cb) {
        var state = this._writableState;
        var ret = false;
        var isBuf = !state.objectMode && _isUint8Array(chunk);
        if (isBuf && !Buffer3.isBuffer(chunk)) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (typeof encoding === "function") {
          cb = encoding;
          encoding = null;
        }
        if (isBuf) encoding = "buffer";
        else if (!encoding) encoding = state.defaultEncoding;
        if (typeof cb !== "function") cb = nop;
        if (state.ending) writeAfterEnd(this, cb);
        else if (isBuf || validChunk(this, state, chunk, cb)) {
          state.pendingcb++;
          ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
        }
        return ret;
      };
      Writable.prototype.cork = function() {
        this._writableState.corked++;
      };
      Writable.prototype.uncork = function() {
        var state = this._writableState;
        if (state.corked) {
          state.corked--;
          if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
        }
      };
      Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
        if (typeof encoding === "string") encoding = encoding.toLowerCase();
        if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
        this._writableState.defaultEncoding = encoding;
        return this;
      };
      Object.defineProperty(Writable.prototype, "writableBuffer", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState && this._writableState.getBuffer();
        }
      });
      function decodeChunk(state, chunk, encoding) {
        if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
          chunk = Buffer3.from(chunk, encoding);
        }
        return chunk;
      }
      Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.highWaterMark;
        }
      });
      function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
        if (!isBuf) {
          var newChunk = decodeChunk(state, chunk, encoding);
          if (chunk !== newChunk) {
            isBuf = true;
            encoding = "buffer";
            chunk = newChunk;
          }
        }
        var len = state.objectMode ? 1 : chunk.length;
        state.length += len;
        var ret = state.length < state.highWaterMark;
        if (!ret) state.needDrain = true;
        if (state.writing || state.corked) {
          var last = state.lastBufferedRequest;
          state.lastBufferedRequest = {
            chunk,
            encoding,
            isBuf,
            callback: cb,
            next: null
          };
          if (last) {
            last.next = state.lastBufferedRequest;
          } else {
            state.bufferedRequest = state.lastBufferedRequest;
          }
          state.bufferedRequestCount += 1;
        } else {
          doWrite(stream, state, false, len, chunk, encoding, cb);
        }
        return ret;
      }
      function doWrite(stream, state, writev, len, chunk, encoding, cb) {
        state.writelen = len;
        state.writecb = cb;
        state.writing = true;
        state.sync = true;
        if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED("write"));
        else if (writev) stream._writev(chunk, state.onwrite);
        else stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      function onwriteError(stream, state, sync, er, cb) {
        --state.pendingcb;
        if (sync) {
          import_browser.default.nextTick(cb, er);
          import_browser.default.nextTick(finishMaybe, stream, state);
          stream._writableState.errorEmitted = true;
          errorOrDestroy(stream, er);
        } else {
          cb(er);
          stream._writableState.errorEmitted = true;
          errorOrDestroy(stream, er);
          finishMaybe(stream, state);
        }
      }
      function onwriteStateUpdate(state) {
        state.writing = false;
        state.writecb = null;
        state.length -= state.writelen;
        state.writelen = 0;
      }
      function onwrite(stream, er) {
        var state = stream._writableState;
        var sync = state.sync;
        var cb = state.writecb;
        if (typeof cb !== "function") throw new ERR_MULTIPLE_CALLBACK();
        onwriteStateUpdate(state);
        if (er) onwriteError(stream, state, sync, er, cb);
        else {
          var finished = needFinish(state) || stream.destroyed;
          if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
            clearBuffer(stream, state);
          }
          if (sync) {
            import_browser.default.nextTick(afterWrite, stream, state, finished, cb);
          } else {
            afterWrite(stream, state, finished, cb);
          }
        }
      }
      function afterWrite(stream, state, finished, cb) {
        if (!finished) onwriteDrain(stream, state);
        state.pendingcb--;
        cb();
        finishMaybe(stream, state);
      }
      function onwriteDrain(stream, state) {
        if (state.length === 0 && state.needDrain) {
          state.needDrain = false;
          stream.emit("drain");
        }
      }
      function clearBuffer(stream, state) {
        state.bufferProcessing = true;
        var entry = state.bufferedRequest;
        if (stream._writev && entry && entry.next) {
          var l = state.bufferedRequestCount;
          var buffer = new Array(l);
          var holder = state.corkedRequestsFree;
          holder.entry = entry;
          var count = 0;
          var allBuffers = true;
          while (entry) {
            buffer[count] = entry;
            if (!entry.isBuf) allBuffers = false;
            entry = entry.next;
            count += 1;
          }
          buffer.allBuffers = allBuffers;
          doWrite(stream, state, true, state.length, buffer, "", holder.finish);
          state.pendingcb++;
          state.lastBufferedRequest = null;
          if (holder.next) {
            state.corkedRequestsFree = holder.next;
            holder.next = null;
          } else {
            state.corkedRequestsFree = new CorkedRequest(state);
          }
          state.bufferedRequestCount = 0;
        } else {
          while (entry) {
            var chunk = entry.chunk;
            var encoding = entry.encoding;
            var cb = entry.callback;
            var len = state.objectMode ? 1 : chunk.length;
            doWrite(stream, state, false, len, chunk, encoding, cb);
            entry = entry.next;
            state.bufferedRequestCount--;
            if (state.writing) {
              break;
            }
          }
          if (entry === null) state.lastBufferedRequest = null;
        }
        state.bufferedRequest = entry;
        state.bufferProcessing = false;
      }
      Writable.prototype._write = function(chunk, encoding, cb) {
        cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
      };
      Writable.prototype._writev = null;
      Writable.prototype.end = function(chunk, encoding, cb) {
        var state = this._writableState;
        if (typeof chunk === "function") {
          cb = chunk;
          chunk = null;
          encoding = null;
        } else if (typeof encoding === "function") {
          cb = encoding;
          encoding = null;
        }
        if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
        if (state.corked) {
          state.corked = 1;
          this.uncork();
        }
        if (!state.ending) endWritable(this, state, cb);
        return this;
      };
      Object.defineProperty(Writable.prototype, "writableLength", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.length;
        }
      });
      function needFinish(state) {
        return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
      }
      function callFinal(stream, state) {
        stream._final(function(err) {
          state.pendingcb--;
          if (err) {
            errorOrDestroy(stream, err);
          }
          state.prefinished = true;
          stream.emit("prefinish");
          finishMaybe(stream, state);
        });
      }
      function prefinish(stream, state) {
        if (!state.prefinished && !state.finalCalled) {
          if (typeof stream._final === "function" && !state.destroyed) {
            state.pendingcb++;
            state.finalCalled = true;
            import_browser.default.nextTick(callFinal, stream, state);
          } else {
            state.prefinished = true;
            stream.emit("prefinish");
          }
        }
      }
      function finishMaybe(stream, state) {
        var need = needFinish(state);
        if (need) {
          prefinish(stream, state);
          if (state.pendingcb === 0) {
            state.finished = true;
            stream.emit("finish");
            if (state.autoDestroy) {
              var rState = stream._readableState;
              if (!rState || rState.autoDestroy && rState.endEmitted) {
                stream.destroy();
              }
            }
          }
        }
        return need;
      }
      function endWritable(stream, state, cb) {
        state.ending = true;
        finishMaybe(stream, state);
        if (cb) {
          if (state.finished) import_browser.default.nextTick(cb);
          else stream.once("finish", cb);
        }
        state.ended = true;
        stream.writable = false;
      }
      function onCorkedFinish(corkReq, state, err) {
        var entry = corkReq.entry;
        corkReq.entry = null;
        while (entry) {
          var cb = entry.callback;
          state.pendingcb--;
          cb(err);
          entry = entry.next;
        }
        state.corkedRequestsFree.next = corkReq;
      }
      Object.defineProperty(Writable.prototype, "destroyed", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          if (this._writableState === void 0) {
            return false;
          }
          return this._writableState.destroyed;
        },
        set: function set(value) {
          if (!this._writableState) {
            return;
          }
          this._writableState.destroyed = value;
        }
      });
      Writable.prototype.destroy = destroyImpl.destroy;
      Writable.prototype._undestroy = destroyImpl.undestroy;
      Writable.prototype._destroy = function(err, cb) {
        cb(err);
      };
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/_stream_duplex.js
  var require_stream_duplex = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/_stream_duplex.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var objectKeys = Object.keys || function(obj) {
        var keys2 = [];
        for (var key in obj) keys2.push(key);
        return keys2;
      };
      module.exports = Duplex;
      var Readable = require_stream_readable();
      var Writable = require_stream_writable();
      require_inherits_browser()(Duplex, Readable);
      {
        keys = objectKeys(Writable.prototype);
        for (v = 0; v < keys.length; v++) {
          method = keys[v];
          if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
        }
      }
      var keys;
      var method;
      var v;
      function Duplex(options) {
        if (!(this instanceof Duplex)) return new Duplex(options);
        Readable.call(this, options);
        Writable.call(this, options);
        this.allowHalfOpen = true;
        if (options) {
          if (options.readable === false) this.readable = false;
          if (options.writable === false) this.writable = false;
          if (options.allowHalfOpen === false) {
            this.allowHalfOpen = false;
            this.once("end", onend);
          }
        }
      }
      Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.highWaterMark;
        }
      });
      Object.defineProperty(Duplex.prototype, "writableBuffer", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState && this._writableState.getBuffer();
        }
      });
      Object.defineProperty(Duplex.prototype, "writableLength", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.length;
        }
      });
      function onend() {
        if (this._writableState.ended) return;
        import_browser.default.nextTick(onEndNT, this);
      }
      function onEndNT(self2) {
        self2.end();
      }
      Object.defineProperty(Duplex.prototype, "destroyed", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set: function set(value) {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return;
          }
          this._readableState.destroyed = value;
          this._writableState.destroyed = value;
        }
      });
    }
  });

  // ../string_decoder/node_modules/safe-buffer/index.js
  var require_safe_buffer2 = __commonJS({
    "../string_decoder/node_modules/safe-buffer/index.js"(exports, module) {
      init_browser_globals();
      var buffer = require_buffer();
      var Buffer3 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer3.from && Buffer3.alloc && Buffer3.allocUnsafe && Buffer3.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer3(arg, encodingOrOffset, length);
      }
      copyProps(Buffer3, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer3(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer3(size);
        if (fill !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer3(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    }
  });

  // ../string_decoder/lib/string_decoder.js
  var require_string_decoder = __commonJS({
    "../string_decoder/lib/string_decoder.js"(exports) {
      "use strict";
      init_browser_globals();
      var Buffer3 = require_safe_buffer2().Buffer;
      var isEncoding = Buffer3.isEncoding || function(encoding) {
        encoding = "" + encoding;
        switch (encoding && encoding.toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
          case "raw":
            return true;
          default:
            return false;
        }
      };
      function _normalizeEncoding(enc) {
        if (!enc) return "utf8";
        var retried;
        while (true) {
          switch (enc) {
            case "utf8":
            case "utf-8":
              return "utf8";
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return "utf16le";
            case "latin1":
            case "binary":
              return "latin1";
            case "base64":
            case "ascii":
            case "hex":
              return enc;
            default:
              if (retried) return;
              enc = ("" + enc).toLowerCase();
              retried = true;
          }
        }
      }
      function normalizeEncoding(enc) {
        var nenc = _normalizeEncoding(enc);
        if (typeof nenc !== "string" && (Buffer3.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
        return nenc || enc;
      }
      exports.StringDecoder = StringDecoder;
      function StringDecoder(encoding) {
        this.encoding = normalizeEncoding(encoding);
        var nb;
        switch (this.encoding) {
          case "utf16le":
            this.text = utf16Text;
            this.end = utf16End;
            nb = 4;
            break;
          case "utf8":
            this.fillLast = utf8FillLast;
            nb = 4;
            break;
          case "base64":
            this.text = base64Text;
            this.end = base64End;
            nb = 3;
            break;
          default:
            this.write = simpleWrite;
            this.end = simpleEnd;
            return;
        }
        this.lastNeed = 0;
        this.lastTotal = 0;
        this.lastChar = Buffer3.allocUnsafe(nb);
      }
      StringDecoder.prototype.write = function(buf) {
        if (buf.length === 0) return "";
        var r;
        var i;
        if (this.lastNeed) {
          r = this.fillLast(buf);
          if (r === void 0) return "";
          i = this.lastNeed;
          this.lastNeed = 0;
        } else {
          i = 0;
        }
        if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
        return r || "";
      };
      StringDecoder.prototype.end = utf8End;
      StringDecoder.prototype.text = utf8Text;
      StringDecoder.prototype.fillLast = function(buf) {
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
        this.lastNeed -= buf.length;
      };
      function utf8CheckByte(byte) {
        if (byte <= 127) return 0;
        else if (byte >> 5 === 6) return 2;
        else if (byte >> 4 === 14) return 3;
        else if (byte >> 3 === 30) return 4;
        return byte >> 6 === 2 ? -1 : -2;
      }
      function utf8CheckIncomplete(self2, buf, i) {
        var j = buf.length - 1;
        if (j < i) return 0;
        var nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) self2.lastNeed = nb - 1;
          return nb;
        }
        if (--j < i || nb === -2) return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) self2.lastNeed = nb - 2;
          return nb;
        }
        if (--j < i || nb === -2) return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) {
            if (nb === 2) nb = 0;
            else self2.lastNeed = nb - 3;
          }
          return nb;
        }
        return 0;
      }
      function utf8CheckExtraBytes(self2, buf, p) {
        if ((buf[0] & 192) !== 128) {
          self2.lastNeed = 0;
          return "\uFFFD";
        }
        if (self2.lastNeed > 1 && buf.length > 1) {
          if ((buf[1] & 192) !== 128) {
            self2.lastNeed = 1;
            return "\uFFFD";
          }
          if (self2.lastNeed > 2 && buf.length > 2) {
            if ((buf[2] & 192) !== 128) {
              self2.lastNeed = 2;
              return "\uFFFD";
            }
          }
        }
      }
      function utf8FillLast(buf) {
        var p = this.lastTotal - this.lastNeed;
        var r = utf8CheckExtraBytes(this, buf, p);
        if (r !== void 0) return r;
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, p, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, p, 0, buf.length);
        this.lastNeed -= buf.length;
      }
      function utf8Text(buf, i) {
        var total = utf8CheckIncomplete(this, buf, i);
        if (!this.lastNeed) return buf.toString("utf8", i);
        this.lastTotal = total;
        var end = buf.length - (total - this.lastNeed);
        buf.copy(this.lastChar, 0, end);
        return buf.toString("utf8", i, end);
      }
      function utf8End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) return r + "\uFFFD";
        return r;
      }
      function utf16Text(buf, i) {
        if ((buf.length - i) % 2 === 0) {
          var r = buf.toString("utf16le", i);
          if (r) {
            var c = r.charCodeAt(r.length - 1);
            if (c >= 55296 && c <= 56319) {
              this.lastNeed = 2;
              this.lastTotal = 4;
              this.lastChar[0] = buf[buf.length - 2];
              this.lastChar[1] = buf[buf.length - 1];
              return r.slice(0, -1);
            }
          }
          return r;
        }
        this.lastNeed = 1;
        this.lastTotal = 2;
        this.lastChar[0] = buf[buf.length - 1];
        return buf.toString("utf16le", i, buf.length - 1);
      }
      function utf16End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) {
          var end = this.lastTotal - this.lastNeed;
          return r + this.lastChar.toString("utf16le", 0, end);
        }
        return r;
      }
      function base64Text(buf, i) {
        var n = (buf.length - i) % 3;
        if (n === 0) return buf.toString("base64", i);
        this.lastNeed = 3 - n;
        this.lastTotal = 3;
        if (n === 1) {
          this.lastChar[0] = buf[buf.length - 1];
        } else {
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
        }
        return buf.toString("base64", i, buf.length - n);
      }
      function base64End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
        return r;
      }
      function simpleWrite(buf) {
        return buf.toString(this.encoding);
      }
      function simpleEnd(buf) {
        return buf && buf.length ? this.write(buf) : "";
      }
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/end-of-stream.js
  var require_end_of_stream = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/end-of-stream.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var ERR_STREAM_PREMATURE_CLOSE = require_errors_browser().codes.ERR_STREAM_PREMATURE_CLOSE;
      function once(callback) {
        var called = false;
        return function() {
          if (called) return;
          called = true;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          callback.apply(this, args);
        };
      }
      function noop() {
      }
      function isRequest(stream) {
        return stream.setHeader && typeof stream.abort === "function";
      }
      function eos(stream, opts, callback) {
        if (typeof opts === "function") return eos(stream, null, opts);
        if (!opts) opts = {};
        callback = once(callback || noop);
        var readable = opts.readable || opts.readable !== false && stream.readable;
        var writable = opts.writable || opts.writable !== false && stream.writable;
        var onlegacyfinish = function onlegacyfinish2() {
          if (!stream.writable) onfinish();
        };
        var writableEnded = stream._writableState && stream._writableState.finished;
        var onfinish = function onfinish2() {
          writable = false;
          writableEnded = true;
          if (!readable) callback.call(stream);
        };
        var readableEnded = stream._readableState && stream._readableState.endEmitted;
        var onend = function onend2() {
          readable = false;
          readableEnded = true;
          if (!writable) callback.call(stream);
        };
        var onerror = function onerror2(err) {
          callback.call(stream, err);
        };
        var onclose = function onclose2() {
          var err;
          if (readable && !readableEnded) {
            if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
            return callback.call(stream, err);
          }
          if (writable && !writableEnded) {
            if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
            return callback.call(stream, err);
          }
        };
        var onrequest = function onrequest2() {
          stream.req.on("finish", onfinish);
        };
        if (isRequest(stream)) {
          stream.on("complete", onfinish);
          stream.on("abort", onclose);
          if (stream.req) onrequest();
          else stream.on("request", onrequest);
        } else if (writable && !stream._writableState) {
          stream.on("end", onlegacyfinish);
          stream.on("close", onlegacyfinish);
        }
        stream.on("end", onend);
        stream.on("finish", onfinish);
        if (opts.error !== false) stream.on("error", onerror);
        stream.on("close", onclose);
        return function() {
          stream.removeListener("complete", onfinish);
          stream.removeListener("abort", onclose);
          stream.removeListener("request", onrequest);
          if (stream.req) stream.req.removeListener("finish", onfinish);
          stream.removeListener("end", onlegacyfinish);
          stream.removeListener("close", onlegacyfinish);
          stream.removeListener("finish", onfinish);
          stream.removeListener("end", onend);
          stream.removeListener("error", onerror);
          stream.removeListener("close", onclose);
        };
      }
      module.exports = eos;
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/async_iterator.js
  var require_async_iterator = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/async_iterator.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var _Object$setPrototypeO;
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key);
        if (key in obj) {
          Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return typeof key === "symbol" ? key : String(key);
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== "object" || input === null) return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (typeof res !== "object") return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      var finished = require_end_of_stream();
      var kLastResolve = /* @__PURE__ */ Symbol("lastResolve");
      var kLastReject = /* @__PURE__ */ Symbol("lastReject");
      var kError = /* @__PURE__ */ Symbol("error");
      var kEnded = /* @__PURE__ */ Symbol("ended");
      var kLastPromise = /* @__PURE__ */ Symbol("lastPromise");
      var kHandlePromise = /* @__PURE__ */ Symbol("handlePromise");
      var kStream = /* @__PURE__ */ Symbol("stream");
      function createIterResult(value, done) {
        return {
          value,
          done
        };
      }
      function readAndResolve(iter) {
        var resolve = iter[kLastResolve];
        if (resolve !== null) {
          var data = iter[kStream].read();
          if (data !== null) {
            iter[kLastPromise] = null;
            iter[kLastResolve] = null;
            iter[kLastReject] = null;
            resolve(createIterResult(data, false));
          }
        }
      }
      function onReadable(iter) {
        import_browser.default.nextTick(readAndResolve, iter);
      }
      function wrapForNext(lastPromise, iter) {
        return function(resolve, reject) {
          lastPromise.then(function() {
            if (iter[kEnded]) {
              resolve(createIterResult(void 0, true));
              return;
            }
            iter[kHandlePromise](resolve, reject);
          }, reject);
        };
      }
      var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
      });
      var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
        get stream() {
          return this[kStream];
        },
        next: function next() {
          var _this = this;
          var error = this[kError];
          if (error !== null) {
            return Promise.reject(error);
          }
          if (this[kEnded]) {
            return Promise.resolve(createIterResult(void 0, true));
          }
          if (this[kStream].destroyed) {
            return new Promise(function(resolve, reject) {
              import_browser.default.nextTick(function() {
                if (_this[kError]) {
                  reject(_this[kError]);
                } else {
                  resolve(createIterResult(void 0, true));
                }
              });
            });
          }
          var lastPromise = this[kLastPromise];
          var promise;
          if (lastPromise) {
            promise = new Promise(wrapForNext(lastPromise, this));
          } else {
            var data = this[kStream].read();
            if (data !== null) {
              return Promise.resolve(createIterResult(data, false));
            }
            promise = new Promise(this[kHandlePromise]);
          }
          this[kLastPromise] = promise;
          return promise;
        }
      }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
        return this;
      }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
        var _this2 = this;
        return new Promise(function(resolve, reject) {
          _this2[kStream].destroy(null, function(err) {
            if (err) {
              reject(err);
              return;
            }
            resolve(createIterResult(void 0, true));
          });
        });
      }), _Object$setPrototypeO), AsyncIteratorPrototype);
      var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream) {
        var _Object$create;
        var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
          value: stream,
          writable: true
        }), _defineProperty(_Object$create, kLastResolve, {
          value: null,
          writable: true
        }), _defineProperty(_Object$create, kLastReject, {
          value: null,
          writable: true
        }), _defineProperty(_Object$create, kError, {
          value: null,
          writable: true
        }), _defineProperty(_Object$create, kEnded, {
          value: stream._readableState.endEmitted,
          writable: true
        }), _defineProperty(_Object$create, kHandlePromise, {
          value: function value(resolve, reject) {
            var data = iterator[kStream].read();
            if (data) {
              iterator[kLastPromise] = null;
              iterator[kLastResolve] = null;
              iterator[kLastReject] = null;
              resolve(createIterResult(data, false));
            } else {
              iterator[kLastResolve] = resolve;
              iterator[kLastReject] = reject;
            }
          },
          writable: true
        }), _Object$create));
        iterator[kLastPromise] = null;
        finished(stream, function(err) {
          if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
            var reject = iterator[kLastReject];
            if (reject !== null) {
              iterator[kLastPromise] = null;
              iterator[kLastResolve] = null;
              iterator[kLastReject] = null;
              reject(err);
            }
            iterator[kError] = err;
            return;
          }
          var resolve = iterator[kLastResolve];
          if (resolve !== null) {
            iterator[kLastPromise] = null;
            iterator[kLastResolve] = null;
            iterator[kLastReject] = null;
            resolve(createIterResult(void 0, true));
          }
          iterator[kEnded] = true;
        });
        stream.on("readable", onReadable.bind(null, iterator));
        return iterator;
      };
      module.exports = createReadableStreamAsyncIterator;
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/from-browser.js
  var require_from_browser = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/from-browser.js"(exports, module) {
      init_browser_globals();
      module.exports = function() {
        throw new Error("Readable.from is not available in the browser");
      };
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/_stream_readable.js
  var require_stream_readable = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/_stream_readable.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Readable;
      var Duplex;
      Readable.ReadableState = ReadableState;
      var EE = require_events().EventEmitter;
      var EElistenerCount = function EElistenerCount2(emitter, type) {
        return emitter.listeners(type).length;
      };
      var Stream = require_stream_browser();
      var Buffer3 = require_buffer().Buffer;
      var OurUint8Array = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
      };
      function _uint8ArrayToBuffer(chunk) {
        return Buffer3.from(chunk);
      }
      function _isUint8Array(obj) {
        return Buffer3.isBuffer(obj) || obj instanceof OurUint8Array;
      }
      var debugUtil = require_util();
      var debug;
      if (debugUtil && debugUtil.debuglog) {
        debug = debugUtil.debuglog("stream");
      } else {
        debug = function debug2() {
        };
      }
      var BufferList = require_buffer_list();
      var destroyImpl = require_destroy();
      var _require = require_state();
      var getHighWaterMark = _require.getHighWaterMark;
      var _require$codes = require_errors_browser().codes;
      var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
      var ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF;
      var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
      var ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
      var StringDecoder;
      var createReadableStreamAsyncIterator;
      var from;
      require_inherits_browser()(Readable, Stream);
      var errorOrDestroy = destroyImpl.errorOrDestroy;
      var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
      function prependListener(emitter, event, fn) {
        if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
        if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
        else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);
        else emitter._events[event] = [fn, emitter._events[event]];
      }
      function ReadableState(options, stream, isDuplex) {
        Duplex = Duplex || require_stream_duplex();
        options = options || {};
        if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex;
        this.objectMode = !!options.objectMode;
        if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
        this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
        this.buffer = new BufferList();
        this.length = 0;
        this.pipes = null;
        this.pipesCount = 0;
        this.flowing = null;
        this.ended = false;
        this.endEmitted = false;
        this.reading = false;
        this.sync = true;
        this.needReadable = false;
        this.emittedReadable = false;
        this.readableListening = false;
        this.resumeScheduled = false;
        this.paused = true;
        this.emitClose = options.emitClose !== false;
        this.autoDestroy = !!options.autoDestroy;
        this.destroyed = false;
        this.defaultEncoding = options.defaultEncoding || "utf8";
        this.awaitDrain = 0;
        this.readingMore = false;
        this.decoder = null;
        this.encoding = null;
        if (options.encoding) {
          if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
          this.decoder = new StringDecoder(options.encoding);
          this.encoding = options.encoding;
        }
      }
      function Readable(options) {
        Duplex = Duplex || require_stream_duplex();
        if (!(this instanceof Readable)) return new Readable(options);
        var isDuplex = this instanceof Duplex;
        this._readableState = new ReadableState(options, this, isDuplex);
        this.readable = true;
        if (options) {
          if (typeof options.read === "function") this._read = options.read;
          if (typeof options.destroy === "function") this._destroy = options.destroy;
        }
        Stream.call(this);
      }
      Object.defineProperty(Readable.prototype, "destroyed", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          if (this._readableState === void 0) {
            return false;
          }
          return this._readableState.destroyed;
        },
        set: function set(value) {
          if (!this._readableState) {
            return;
          }
          this._readableState.destroyed = value;
        }
      });
      Readable.prototype.destroy = destroyImpl.destroy;
      Readable.prototype._undestroy = destroyImpl.undestroy;
      Readable.prototype._destroy = function(err, cb) {
        cb(err);
      };
      Readable.prototype.push = function(chunk, encoding) {
        var state = this._readableState;
        var skipChunkCheck;
        if (!state.objectMode) {
          if (typeof chunk === "string") {
            encoding = encoding || state.defaultEncoding;
            if (encoding !== state.encoding) {
              chunk = Buffer3.from(chunk, encoding);
              encoding = "";
            }
            skipChunkCheck = true;
          }
        } else {
          skipChunkCheck = true;
        }
        return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
      };
      Readable.prototype.unshift = function(chunk) {
        return readableAddChunk(this, chunk, null, true, false);
      };
      function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
        debug("readableAddChunk", chunk);
        var state = stream._readableState;
        if (chunk === null) {
          state.reading = false;
          onEofChunk(stream, state);
        } else {
          var er;
          if (!skipChunkCheck) er = chunkInvalid(state, chunk);
          if (er) {
            errorOrDestroy(stream, er);
          } else if (state.objectMode || chunk && chunk.length > 0) {
            if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer3.prototype) {
              chunk = _uint8ArrayToBuffer(chunk);
            }
            if (addToFront) {
              if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
              else addChunk(stream, state, chunk, true);
            } else if (state.ended) {
              errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
            } else if (state.destroyed) {
              return false;
            } else {
              state.reading = false;
              if (state.decoder && !encoding) {
                chunk = state.decoder.write(chunk);
                if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
                else maybeReadMore(stream, state);
              } else {
                addChunk(stream, state, chunk, false);
              }
            }
          } else if (!addToFront) {
            state.reading = false;
            maybeReadMore(stream, state);
          }
        }
        return !state.ended && (state.length < state.highWaterMark || state.length === 0);
      }
      function addChunk(stream, state, chunk, addToFront) {
        if (state.flowing && state.length === 0 && !state.sync) {
          state.awaitDrain = 0;
          stream.emit("data", chunk);
        } else {
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);
          else state.buffer.push(chunk);
          if (state.needReadable) emitReadable(stream);
        }
        maybeReadMore(stream, state);
      }
      function chunkInvalid(state, chunk) {
        var er;
        if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
          er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
        }
        return er;
      }
      Readable.prototype.isPaused = function() {
        return this._readableState.flowing === false;
      };
      Readable.prototype.setEncoding = function(enc) {
        if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
        var decoder = new StringDecoder(enc);
        this._readableState.decoder = decoder;
        this._readableState.encoding = this._readableState.decoder.encoding;
        var p = this._readableState.buffer.head;
        var content = "";
        while (p !== null) {
          content += decoder.write(p.data);
          p = p.next;
        }
        this._readableState.buffer.clear();
        if (content !== "") this._readableState.buffer.push(content);
        this._readableState.length = content.length;
        return this;
      };
      var MAX_HWM = 1073741824;
      function computeNewHighWaterMark(n) {
        if (n >= MAX_HWM) {
          n = MAX_HWM;
        } else {
          n--;
          n |= n >>> 1;
          n |= n >>> 2;
          n |= n >>> 4;
          n |= n >>> 8;
          n |= n >>> 16;
          n++;
        }
        return n;
      }
      function howMuchToRead(n, state) {
        if (n <= 0 || state.length === 0 && state.ended) return 0;
        if (state.objectMode) return 1;
        if (n !== n) {
          if (state.flowing && state.length) return state.buffer.head.data.length;
          else return state.length;
        }
        if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
        if (n <= state.length) return n;
        if (!state.ended) {
          state.needReadable = true;
          return 0;
        }
        return state.length;
      }
      Readable.prototype.read = function(n) {
        debug("read", n);
        n = parseInt(n, 10);
        var state = this._readableState;
        var nOrig = n;
        if (n !== 0) state.emittedReadable = false;
        if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
          debug("read: emitReadable", state.length, state.ended);
          if (state.length === 0 && state.ended) endReadable(this);
          else emitReadable(this);
          return null;
        }
        n = howMuchToRead(n, state);
        if (n === 0 && state.ended) {
          if (state.length === 0) endReadable(this);
          return null;
        }
        var doRead = state.needReadable;
        debug("need readable", doRead);
        if (state.length === 0 || state.length - n < state.highWaterMark) {
          doRead = true;
          debug("length less than watermark", doRead);
        }
        if (state.ended || state.reading) {
          doRead = false;
          debug("reading or ended", doRead);
        } else if (doRead) {
          debug("do read");
          state.reading = true;
          state.sync = true;
          if (state.length === 0) state.needReadable = true;
          this._read(state.highWaterMark);
          state.sync = false;
          if (!state.reading) n = howMuchToRead(nOrig, state);
        }
        var ret;
        if (n > 0) ret = fromList(n, state);
        else ret = null;
        if (ret === null) {
          state.needReadable = state.length <= state.highWaterMark;
          n = 0;
        } else {
          state.length -= n;
          state.awaitDrain = 0;
        }
        if (state.length === 0) {
          if (!state.ended) state.needReadable = true;
          if (nOrig !== n && state.ended) endReadable(this);
        }
        if (ret !== null) this.emit("data", ret);
        return ret;
      };
      function onEofChunk(stream, state) {
        debug("onEofChunk");
        if (state.ended) return;
        if (state.decoder) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) {
            state.buffer.push(chunk);
            state.length += state.objectMode ? 1 : chunk.length;
          }
        }
        state.ended = true;
        if (state.sync) {
          emitReadable(stream);
        } else {
          state.needReadable = false;
          if (!state.emittedReadable) {
            state.emittedReadable = true;
            emitReadable_(stream);
          }
        }
      }
      function emitReadable(stream) {
        var state = stream._readableState;
        debug("emitReadable", state.needReadable, state.emittedReadable);
        state.needReadable = false;
        if (!state.emittedReadable) {
          debug("emitReadable", state.flowing);
          state.emittedReadable = true;
          import_browser.default.nextTick(emitReadable_, stream);
        }
      }
      function emitReadable_(stream) {
        var state = stream._readableState;
        debug("emitReadable_", state.destroyed, state.length, state.ended);
        if (!state.destroyed && (state.length || state.ended)) {
          stream.emit("readable");
          state.emittedReadable = false;
        }
        state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
        flow(stream);
      }
      function maybeReadMore(stream, state) {
        if (!state.readingMore) {
          state.readingMore = true;
          import_browser.default.nextTick(maybeReadMore_, stream, state);
        }
      }
      function maybeReadMore_(stream, state) {
        while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
          var len = state.length;
          debug("maybeReadMore read 0");
          stream.read(0);
          if (len === state.length)
            break;
        }
        state.readingMore = false;
      }
      Readable.prototype._read = function(n) {
        errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
      };
      Readable.prototype.pipe = function(dest, pipeOpts) {
        var src = this;
        var state = this._readableState;
        switch (state.pipesCount) {
          case 0:
            state.pipes = dest;
            break;
          case 1:
            state.pipes = [state.pipes, dest];
            break;
          default:
            state.pipes.push(dest);
            break;
        }
        state.pipesCount += 1;
        debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
        var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== import_browser.default.stdout && dest !== import_browser.default.stderr;
        var endFn = doEnd ? onend : unpipe;
        if (state.endEmitted) import_browser.default.nextTick(endFn);
        else src.once("end", endFn);
        dest.on("unpipe", onunpipe);
        function onunpipe(readable, unpipeInfo) {
          debug("onunpipe");
          if (readable === src) {
            if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
              unpipeInfo.hasUnpiped = true;
              cleanup();
            }
          }
        }
        function onend() {
          debug("onend");
          dest.end();
        }
        var ondrain = pipeOnDrain(src);
        dest.on("drain", ondrain);
        var cleanedUp = false;
        function cleanup() {
          debug("cleanup");
          dest.removeListener("close", onclose);
          dest.removeListener("finish", onfinish);
          dest.removeListener("drain", ondrain);
          dest.removeListener("error", onerror);
          dest.removeListener("unpipe", onunpipe);
          src.removeListener("end", onend);
          src.removeListener("end", unpipe);
          src.removeListener("data", ondata);
          cleanedUp = true;
          if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
        }
        src.on("data", ondata);
        function ondata(chunk) {
          debug("ondata");
          var ret = dest.write(chunk);
          debug("dest.write", ret);
          if (ret === false) {
            if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
              debug("false write response, pause", state.awaitDrain);
              state.awaitDrain++;
            }
            src.pause();
          }
        }
        function onerror(er) {
          debug("onerror", er);
          unpipe();
          dest.removeListener("error", onerror);
          if (EElistenerCount(dest, "error") === 0) errorOrDestroy(dest, er);
        }
        prependListener(dest, "error", onerror);
        function onclose() {
          dest.removeListener("finish", onfinish);
          unpipe();
        }
        dest.once("close", onclose);
        function onfinish() {
          debug("onfinish");
          dest.removeListener("close", onclose);
          unpipe();
        }
        dest.once("finish", onfinish);
        function unpipe() {
          debug("unpipe");
          src.unpipe(dest);
        }
        dest.emit("pipe", src);
        if (!state.flowing) {
          debug("pipe resume");
          src.resume();
        }
        return dest;
      };
      function pipeOnDrain(src) {
        return function pipeOnDrainFunctionResult() {
          var state = src._readableState;
          debug("pipeOnDrain", state.awaitDrain);
          if (state.awaitDrain) state.awaitDrain--;
          if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
            state.flowing = true;
            flow(src);
          }
        };
      }
      Readable.prototype.unpipe = function(dest) {
        var state = this._readableState;
        var unpipeInfo = {
          hasUnpiped: false
        };
        if (state.pipesCount === 0) return this;
        if (state.pipesCount === 1) {
          if (dest && dest !== state.pipes) return this;
          if (!dest) dest = state.pipes;
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;
          if (dest) dest.emit("unpipe", this, unpipeInfo);
          return this;
        }
        if (!dest) {
          var dests = state.pipes;
          var len = state.pipesCount;
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;
          for (var i = 0; i < len; i++) dests[i].emit("unpipe", this, {
            hasUnpiped: false
          });
          return this;
        }
        var index = indexOf(state.pipes, dest);
        if (index === -1) return this;
        state.pipes.splice(index, 1);
        state.pipesCount -= 1;
        if (state.pipesCount === 1) state.pipes = state.pipes[0];
        dest.emit("unpipe", this, unpipeInfo);
        return this;
      };
      Readable.prototype.on = function(ev, fn) {
        var res = Stream.prototype.on.call(this, ev, fn);
        var state = this._readableState;
        if (ev === "data") {
          state.readableListening = this.listenerCount("readable") > 0;
          if (state.flowing !== false) this.resume();
        } else if (ev === "readable") {
          if (!state.endEmitted && !state.readableListening) {
            state.readableListening = state.needReadable = true;
            state.flowing = false;
            state.emittedReadable = false;
            debug("on readable", state.length, state.reading);
            if (state.length) {
              emitReadable(this);
            } else if (!state.reading) {
              import_browser.default.nextTick(nReadingNextTick, this);
            }
          }
        }
        return res;
      };
      Readable.prototype.addListener = Readable.prototype.on;
      Readable.prototype.removeListener = function(ev, fn) {
        var res = Stream.prototype.removeListener.call(this, ev, fn);
        if (ev === "readable") {
          import_browser.default.nextTick(updateReadableListening, this);
        }
        return res;
      };
      Readable.prototype.removeAllListeners = function(ev) {
        var res = Stream.prototype.removeAllListeners.apply(this, arguments);
        if (ev === "readable" || ev === void 0) {
          import_browser.default.nextTick(updateReadableListening, this);
        }
        return res;
      };
      function updateReadableListening(self2) {
        var state = self2._readableState;
        state.readableListening = self2.listenerCount("readable") > 0;
        if (state.resumeScheduled && !state.paused) {
          state.flowing = true;
        } else if (self2.listenerCount("data") > 0) {
          self2.resume();
        }
      }
      function nReadingNextTick(self2) {
        debug("readable nexttick read 0");
        self2.read(0);
      }
      Readable.prototype.resume = function() {
        var state = this._readableState;
        if (!state.flowing) {
          debug("resume");
          state.flowing = !state.readableListening;
          resume(this, state);
        }
        state.paused = false;
        return this;
      };
      function resume(stream, state) {
        if (!state.resumeScheduled) {
          state.resumeScheduled = true;
          import_browser.default.nextTick(resume_, stream, state);
        }
      }
      function resume_(stream, state) {
        debug("resume", state.reading);
        if (!state.reading) {
          stream.read(0);
        }
        state.resumeScheduled = false;
        stream.emit("resume");
        flow(stream);
        if (state.flowing && !state.reading) stream.read(0);
      }
      Readable.prototype.pause = function() {
        debug("call pause flowing=%j", this._readableState.flowing);
        if (this._readableState.flowing !== false) {
          debug("pause");
          this._readableState.flowing = false;
          this.emit("pause");
        }
        this._readableState.paused = true;
        return this;
      };
      function flow(stream) {
        var state = stream._readableState;
        debug("flow", state.flowing);
        while (state.flowing && stream.read() !== null) ;
      }
      Readable.prototype.wrap = function(stream) {
        var _this = this;
        var state = this._readableState;
        var paused = false;
        stream.on("end", function() {
          debug("wrapped end");
          if (state.decoder && !state.ended) {
            var chunk = state.decoder.end();
            if (chunk && chunk.length) _this.push(chunk);
          }
          _this.push(null);
        });
        stream.on("data", function(chunk) {
          debug("wrapped data");
          if (state.decoder) chunk = state.decoder.write(chunk);
          if (state.objectMode && (chunk === null || chunk === void 0)) return;
          else if (!state.objectMode && (!chunk || !chunk.length)) return;
          var ret = _this.push(chunk);
          if (!ret) {
            paused = true;
            stream.pause();
          }
        });
        for (var i in stream) {
          if (this[i] === void 0 && typeof stream[i] === "function") {
            this[i] = /* @__PURE__ */ (function methodWrap(method) {
              return function methodWrapReturnFunction() {
                return stream[method].apply(stream, arguments);
              };
            })(i);
          }
        }
        for (var n = 0; n < kProxyEvents.length; n++) {
          stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
        }
        this._read = function(n2) {
          debug("wrapped _read", n2);
          if (paused) {
            paused = false;
            stream.resume();
          }
        };
        return this;
      };
      if (typeof Symbol === "function") {
        Readable.prototype[Symbol.asyncIterator] = function() {
          if (createReadableStreamAsyncIterator === void 0) {
            createReadableStreamAsyncIterator = require_async_iterator();
          }
          return createReadableStreamAsyncIterator(this);
        };
      }
      Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState.highWaterMark;
        }
      });
      Object.defineProperty(Readable.prototype, "readableBuffer", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState && this._readableState.buffer;
        }
      });
      Object.defineProperty(Readable.prototype, "readableFlowing", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState.flowing;
        },
        set: function set(state) {
          if (this._readableState) {
            this._readableState.flowing = state;
          }
        }
      });
      Readable._fromList = fromList;
      Object.defineProperty(Readable.prototype, "readableLength", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState.length;
        }
      });
      function fromList(n, state) {
        if (state.length === 0) return null;
        var ret;
        if (state.objectMode) ret = state.buffer.shift();
        else if (!n || n >= state.length) {
          if (state.decoder) ret = state.buffer.join("");
          else if (state.buffer.length === 1) ret = state.buffer.first();
          else ret = state.buffer.concat(state.length);
          state.buffer.clear();
        } else {
          ret = state.buffer.consume(n, state.decoder);
        }
        return ret;
      }
      function endReadable(stream) {
        var state = stream._readableState;
        debug("endReadable", state.endEmitted);
        if (!state.endEmitted) {
          state.ended = true;
          import_browser.default.nextTick(endReadableNT, state, stream);
        }
      }
      function endReadableNT(state, stream) {
        debug("endReadableNT", state.endEmitted, state.length);
        if (!state.endEmitted && state.length === 0) {
          state.endEmitted = true;
          stream.readable = false;
          stream.emit("end");
          if (state.autoDestroy) {
            var wState = stream._writableState;
            if (!wState || wState.autoDestroy && wState.finished) {
              stream.destroy();
            }
          }
        }
      }
      if (typeof Symbol === "function") {
        Readable.from = function(iterable, opts) {
          if (from === void 0) {
            from = require_from_browser();
          }
          return from(Readable, iterable, opts);
        };
      }
      function indexOf(xs, x) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x) return i;
        }
        return -1;
      }
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/_stream_transform.js
  var require_stream_transform = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/_stream_transform.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Transform;
      var _require$codes = require_errors_browser().codes;
      var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
      var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
      var ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING;
      var ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
      var Duplex = require_stream_duplex();
      require_inherits_browser()(Transform, Duplex);
      function afterTransform(er, data) {
        var ts = this._transformState;
        ts.transforming = false;
        var cb = ts.writecb;
        if (cb === null) {
          return this.emit("error", new ERR_MULTIPLE_CALLBACK());
        }
        ts.writechunk = null;
        ts.writecb = null;
        if (data != null)
          this.push(data);
        cb(er);
        var rs = this._readableState;
        rs.reading = false;
        if (rs.needReadable || rs.length < rs.highWaterMark) {
          this._read(rs.highWaterMark);
        }
      }
      function Transform(options) {
        if (!(this instanceof Transform)) return new Transform(options);
        Duplex.call(this, options);
        this._transformState = {
          afterTransform: afterTransform.bind(this),
          needTransform: false,
          transforming: false,
          writecb: null,
          writechunk: null,
          writeencoding: null
        };
        this._readableState.needReadable = true;
        this._readableState.sync = false;
        if (options) {
          if (typeof options.transform === "function") this._transform = options.transform;
          if (typeof options.flush === "function") this._flush = options.flush;
        }
        this.on("prefinish", prefinish);
      }
      function prefinish() {
        var _this = this;
        if (typeof this._flush === "function" && !this._readableState.destroyed) {
          this._flush(function(er, data) {
            done(_this, er, data);
          });
        } else {
          done(this, null, null);
        }
      }
      Transform.prototype.push = function(chunk, encoding) {
        this._transformState.needTransform = false;
        return Duplex.prototype.push.call(this, chunk, encoding);
      };
      Transform.prototype._transform = function(chunk, encoding, cb) {
        cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
      };
      Transform.prototype._write = function(chunk, encoding, cb) {
        var ts = this._transformState;
        ts.writecb = cb;
        ts.writechunk = chunk;
        ts.writeencoding = encoding;
        if (!ts.transforming) {
          var rs = this._readableState;
          if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
        }
      };
      Transform.prototype._read = function(n) {
        var ts = this._transformState;
        if (ts.writechunk !== null && !ts.transforming) {
          ts.transforming = true;
          this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
        } else {
          ts.needTransform = true;
        }
      };
      Transform.prototype._destroy = function(err, cb) {
        Duplex.prototype._destroy.call(this, err, function(err2) {
          cb(err2);
        });
      };
      function done(stream, er, data) {
        if (er) return stream.emit("error", er);
        if (data != null)
          stream.push(data);
        if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
        if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
        return stream.push(null);
      }
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/_stream_passthrough.js
  var require_stream_passthrough = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/_stream_passthrough.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = PassThrough;
      var Transform = require_stream_transform();
      require_inherits_browser()(PassThrough, Transform);
      function PassThrough(options) {
        if (!(this instanceof PassThrough)) return new PassThrough(options);
        Transform.call(this, options);
      }
      PassThrough.prototype._transform = function(chunk, encoding, cb) {
        cb(null, chunk);
      };
    }
  });

  // ../stream-browserify/node_modules/readable-stream/lib/internal/streams/pipeline.js
  var require_pipeline = __commonJS({
    "../stream-browserify/node_modules/readable-stream/lib/internal/streams/pipeline.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var eos;
      function once(callback) {
        var called = false;
        return function() {
          if (called) return;
          called = true;
          callback.apply(void 0, arguments);
        };
      }
      var _require$codes = require_errors_browser().codes;
      var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
      var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
      function noop(err) {
        if (err) throw err;
      }
      function isRequest(stream) {
        return stream.setHeader && typeof stream.abort === "function";
      }
      function destroyer(stream, reading, writing, callback) {
        callback = once(callback);
        var closed = false;
        stream.on("close", function() {
          closed = true;
        });
        if (eos === void 0) eos = require_end_of_stream();
        eos(stream, {
          readable: reading,
          writable: writing
        }, function(err) {
          if (err) return callback(err);
          closed = true;
          callback();
        });
        var destroyed = false;
        return function(err) {
          if (closed) return;
          if (destroyed) return;
          destroyed = true;
          if (isRequest(stream)) return stream.abort();
          if (typeof stream.destroy === "function") return stream.destroy();
          callback(err || new ERR_STREAM_DESTROYED("pipe"));
        };
      }
      function call(fn) {
        fn();
      }
      function pipe(from, to) {
        return from.pipe(to);
      }
      function popCallback(streams) {
        if (!streams.length) return noop;
        if (typeof streams[streams.length - 1] !== "function") return noop;
        return streams.pop();
      }
      function pipeline() {
        for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
          streams[_key] = arguments[_key];
        }
        var callback = popCallback(streams);
        if (Array.isArray(streams[0])) streams = streams[0];
        if (streams.length < 2) {
          throw new ERR_MISSING_ARGS("streams");
        }
        var error;
        var destroys = streams.map(function(stream, i) {
          var reading = i < streams.length - 1;
          var writing = i > 0;
          return destroyer(stream, reading, writing, function(err) {
            if (!error) error = err;
            if (err) destroys.forEach(call);
            if (reading) return;
            destroys.forEach(call);
            callback(error);
          });
        });
        return streams.reduce(pipe);
      }
      module.exports = pipeline;
    }
  });

  // ../stream-browserify/index.js
  var require_stream_browserify = __commonJS({
    "../stream-browserify/index.js"(exports, module) {
      init_browser_globals();
      module.exports = Stream;
      var EE = require_events().EventEmitter;
      var inherits = require_inherits_browser();
      inherits(Stream, EE);
      Stream.Readable = require_stream_readable();
      Stream.Writable = require_stream_writable();
      Stream.Duplex = require_stream_duplex();
      Stream.Transform = require_stream_transform();
      Stream.PassThrough = require_stream_passthrough();
      Stream.finished = require_end_of_stream();
      Stream.pipeline = require_pipeline();
      Stream.Stream = Stream;
      function Stream() {
        EE.call(this);
      }
      Stream.prototype.pipe = function(dest, options) {
        var source = this;
        function ondata(chunk) {
          if (dest.writable) {
            if (false === dest.write(chunk) && source.pause) {
              source.pause();
            }
          }
        }
        source.on("data", ondata);
        function ondrain() {
          if (source.readable && source.resume) {
            source.resume();
          }
        }
        dest.on("drain", ondrain);
        if (!dest._isStdio && (!options || options.end !== false)) {
          source.on("end", onend);
          source.on("close", onclose);
        }
        var didOnEnd = false;
        function onend() {
          if (didOnEnd) return;
          didOnEnd = true;
          dest.end();
        }
        function onclose() {
          if (didOnEnd) return;
          didOnEnd = true;
          if (typeof dest.destroy === "function") dest.destroy();
        }
        function onerror(er) {
          cleanup();
          if (EE.listenerCount(this, "error") === 0) {
            throw er;
          }
        }
        source.on("error", onerror);
        dest.on("error", onerror);
        function cleanup() {
          source.removeListener("data", ondata);
          dest.removeListener("drain", ondrain);
          source.removeListener("end", onend);
          source.removeListener("close", onclose);
          source.removeListener("error", onerror);
          dest.removeListener("error", onerror);
          source.removeListener("end", cleanup);
          source.removeListener("close", cleanup);
          dest.removeListener("close", cleanup);
        }
        source.on("end", cleanup);
        source.on("close", cleanup);
        dest.on("close", cleanup);
        dest.emit("pipe", source);
        return dest;
      };
    }
  });

  // ../to-buffer/node_modules/isarray/index.js
  var require_isarray = __commonJS({
    "../to-buffer/node_modules/isarray/index.js"(exports, module) {
      init_browser_globals();
      var toString = {}.toString;
      module.exports = Array.isArray || function(arr) {
        return toString.call(arr) == "[object Array]";
      };
    }
  });

  // ../es-errors/type.js
  var require_type = __commonJS({
    "../es-errors/type.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = TypeError;
    }
  });

  // ../es-object-atoms/index.js
  var require_es_object_atoms = __commonJS({
    "../es-object-atoms/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Object;
    }
  });

  // ../es-errors/index.js
  var require_es_errors = __commonJS({
    "../es-errors/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Error;
    }
  });

  // ../es-errors/eval.js
  var require_eval = __commonJS({
    "../es-errors/eval.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = EvalError;
    }
  });

  // ../es-errors/range.js
  var require_range = __commonJS({
    "../es-errors/range.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = RangeError;
    }
  });

  // ../es-errors/ref.js
  var require_ref = __commonJS({
    "../es-errors/ref.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = ReferenceError;
    }
  });

  // ../es-errors/syntax.js
  var require_syntax = __commonJS({
    "../es-errors/syntax.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = SyntaxError;
    }
  });

  // ../es-errors/uri.js
  var require_uri = __commonJS({
    "../es-errors/uri.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = URIError;
    }
  });

  // ../math-intrinsics/abs.js
  var require_abs = __commonJS({
    "../math-intrinsics/abs.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Math.abs;
    }
  });

  // ../math-intrinsics/floor.js
  var require_floor = __commonJS({
    "../math-intrinsics/floor.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Math.floor;
    }
  });

  // ../math-intrinsics/max.js
  var require_max = __commonJS({
    "../math-intrinsics/max.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Math.max;
    }
  });

  // ../math-intrinsics/min.js
  var require_min = __commonJS({
    "../math-intrinsics/min.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Math.min;
    }
  });

  // ../math-intrinsics/pow.js
  var require_pow = __commonJS({
    "../math-intrinsics/pow.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Math.pow;
    }
  });

  // ../math-intrinsics/round.js
  var require_round = __commonJS({
    "../math-intrinsics/round.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Math.round;
    }
  });

  // ../math-intrinsics/isNaN.js
  var require_isNaN = __commonJS({
    "../math-intrinsics/isNaN.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Number.isNaN || function isNaN2(a) {
        return a !== a;
      };
    }
  });

  // ../math-intrinsics/sign.js
  var require_sign = __commonJS({
    "../math-intrinsics/sign.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var $isNaN = require_isNaN();
      module.exports = function sign(number) {
        if ($isNaN(number) || number === 0) {
          return number;
        }
        return number < 0 ? -1 : 1;
      };
    }
  });

  // ../gopd/gOPD.js
  var require_gOPD = __commonJS({
    "../gopd/gOPD.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Object.getOwnPropertyDescriptor;
    }
  });

  // ../gopd/index.js
  var require_gopd = __commonJS({
    "../gopd/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var $gOPD = require_gOPD();
      if ($gOPD) {
        try {
          $gOPD([], "length");
        } catch (e) {
          $gOPD = null;
        }
      }
      module.exports = $gOPD;
    }
  });

  // ../es-define-property/index.js
  var require_es_define_property = __commonJS({
    "../es-define-property/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var $defineProperty = Object.defineProperty || false;
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
        } catch (e) {
          $defineProperty = false;
        }
      }
      module.exports = $defineProperty;
    }
  });

  // ../has-symbols/shams.js
  var require_shams = __commonJS({
    "../has-symbols/shams.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = function hasSymbols() {
        if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
          return false;
        }
        if (typeof Symbol.iterator === "symbol") {
          return true;
        }
        var obj = {};
        var sym = /* @__PURE__ */ Symbol("test");
        var symObj = Object(sym);
        if (typeof sym === "string") {
          return false;
        }
        if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
          return false;
        }
        if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
          return false;
        }
        var symVal = 42;
        obj[sym] = symVal;
        for (var _ in obj) {
          return false;
        }
        if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
          return false;
        }
        if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
          return false;
        }
        var syms = Object.getOwnPropertySymbols(obj);
        if (syms.length !== 1 || syms[0] !== sym) {
          return false;
        }
        if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
          return false;
        }
        if (typeof Object.getOwnPropertyDescriptor === "function") {
          var descriptor = (
            /** @type {PropertyDescriptor} */
            Object.getOwnPropertyDescriptor(obj, sym)
          );
          if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
          }
        }
        return true;
      };
    }
  });

  // ../has-symbols/index.js
  var require_has_symbols = __commonJS({
    "../has-symbols/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var origSymbol = typeof Symbol !== "undefined" && Symbol;
      var hasSymbolSham = require_shams();
      module.exports = function hasNativeSymbols() {
        if (typeof origSymbol !== "function") {
          return false;
        }
        if (typeof Symbol !== "function") {
          return false;
        }
        if (typeof origSymbol("foo") !== "symbol") {
          return false;
        }
        if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
          return false;
        }
        return hasSymbolSham();
      };
    }
  });

  // ../get-proto/Reflect.getPrototypeOf.js
  var require_Reflect_getPrototypeOf = __commonJS({
    "../get-proto/Reflect.getPrototypeOf.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
    }
  });

  // ../get-proto/Object.getPrototypeOf.js
  var require_Object_getPrototypeOf = __commonJS({
    "../get-proto/Object.getPrototypeOf.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var $Object = require_es_object_atoms();
      module.exports = $Object.getPrototypeOf || null;
    }
  });

  // ../function-bind/implementation.js
  var require_implementation = __commonJS({
    "../function-bind/implementation.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
      var toStr = Object.prototype.toString;
      var max = Math.max;
      var funcType = "[object Function]";
      var concatty = function concatty2(a, b) {
        var arr = [];
        for (var i = 0; i < a.length; i += 1) {
          arr[i] = a[i];
        }
        for (var j = 0; j < b.length; j += 1) {
          arr[j + a.length] = b[j];
        }
        return arr;
      };
      var slicy = function slicy2(arrLike, offset) {
        var arr = [];
        for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
          arr[j] = arrLike[i];
        }
        return arr;
      };
      var joiny = function(arr, joiner) {
        var str = "";
        for (var i = 0; i < arr.length; i += 1) {
          str += arr[i];
          if (i + 1 < arr.length) {
            str += joiner;
          }
        }
        return str;
      };
      module.exports = function bind(that) {
        var target = this;
        if (typeof target !== "function" || toStr.apply(target) !== funcType) {
          throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slicy(arguments, 1);
        var bound;
        var binder = function() {
          if (this instanceof bound) {
            var result = target.apply(
              this,
              concatty(args, arguments)
            );
            if (Object(result) === result) {
              return result;
            }
            return this;
          }
          return target.apply(
            that,
            concatty(args, arguments)
          );
        };
        var boundLength = max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
          boundArgs[i] = "$" + i;
        }
        bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
        if (target.prototype) {
          var Empty = function Empty2() {
          };
          Empty.prototype = target.prototype;
          bound.prototype = new Empty();
          Empty.prototype = null;
        }
        return bound;
      };
    }
  });

  // ../function-bind/index.js
  var require_function_bind = __commonJS({
    "../function-bind/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var implementation = require_implementation();
      module.exports = Function.prototype.bind || implementation;
    }
  });

  // ../call-bind-apply-helpers/functionCall.js
  var require_functionCall = __commonJS({
    "../call-bind-apply-helpers/functionCall.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Function.prototype.call;
    }
  });

  // ../call-bind-apply-helpers/functionApply.js
  var require_functionApply = __commonJS({
    "../call-bind-apply-helpers/functionApply.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Function.prototype.apply;
    }
  });

  // ../call-bind-apply-helpers/reflectApply.js
  var require_reflectApply = __commonJS({
    "../call-bind-apply-helpers/reflectApply.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
    }
  });

  // ../call-bind-apply-helpers/actualApply.js
  var require_actualApply = __commonJS({
    "../call-bind-apply-helpers/actualApply.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var $reflectApply = require_reflectApply();
      module.exports = $reflectApply || bind.call($call, $apply);
    }
  });

  // ../call-bind-apply-helpers/index.js
  var require_call_bind_apply_helpers = __commonJS({
    "../call-bind-apply-helpers/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var bind = require_function_bind();
      var $TypeError = require_type();
      var $call = require_functionCall();
      var $actualApply = require_actualApply();
      module.exports = function callBindBasic(args) {
        if (args.length < 1 || typeof args[0] !== "function") {
          throw new $TypeError("a function is required");
        }
        return $actualApply(bind, $call, args);
      };
    }
  });

  // ../dunder-proto/get.js
  var require_get = __commonJS({
    "../dunder-proto/get.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var callBind = require_call_bind_apply_helpers();
      var gOPD = require_gopd();
      var hasProtoAccessor;
      try {
        hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
        [].__proto__ === Array.prototype;
      } catch (e) {
        if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
          throw e;
        }
      }
      var desc = !!hasProtoAccessor && gOPD && gOPD(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      );
      var $Object = Object;
      var $getPrototypeOf = $Object.getPrototypeOf;
      module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
        /** @type {import('./get')} */
        function getDunder(value) {
          return $getPrototypeOf(value == null ? value : $Object(value));
        }
      ) : false;
    }
  });

  // ../get-proto/index.js
  var require_get_proto = __commonJS({
    "../get-proto/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var reflectGetProto = require_Reflect_getPrototypeOf();
      var originalGetProto = require_Object_getPrototypeOf();
      var getDunderProto = require_get();
      module.exports = reflectGetProto ? function getProto(O) {
        return reflectGetProto(O);
      } : originalGetProto ? function getProto(O) {
        if (!O || typeof O !== "object" && typeof O !== "function") {
          throw new TypeError("getProto: not an object");
        }
        return originalGetProto(O);
      } : getDunderProto ? function getProto(O) {
        return getDunderProto(O);
      } : null;
    }
  });

  // ../hasown/index.js
  var require_hasown = __commonJS({
    "../hasown/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var call = Function.prototype.call;
      var $hasOwn = Object.prototype.hasOwnProperty;
      var bind = require_function_bind();
      module.exports = bind.call(call, $hasOwn);
    }
  });

  // ../get-intrinsic/index.js
  var require_get_intrinsic = __commonJS({
    "../get-intrinsic/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var undefined2;
      var $Object = require_es_object_atoms();
      var $Error = require_es_errors();
      var $EvalError = require_eval();
      var $RangeError = require_range();
      var $ReferenceError = require_ref();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var $URIError = require_uri();
      var abs = require_abs();
      var floor = require_floor();
      var max = require_max();
      var min = require_min();
      var pow = require_pow();
      var round = require_round();
      var sign = require_sign();
      var $Function = Function;
      var getEvalledConstructor = function(expressionSyntax) {
        try {
          return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
        } catch (e) {
        }
      };
      var $gOPD = require_gopd();
      var $defineProperty = require_es_define_property();
      var throwTypeError = function() {
        throw new $TypeError();
      };
      var ThrowTypeError = $gOPD ? (function() {
        try {
          arguments.callee;
          return throwTypeError;
        } catch (calleeThrows) {
          try {
            return $gOPD(arguments, "callee").get;
          } catch (gOPDthrows) {
            return throwTypeError;
          }
        }
      })() : throwTypeError;
      var hasSymbols = require_has_symbols()();
      var getProto = require_get_proto();
      var $ObjectGPO = require_Object_getPrototypeOf();
      var $ReflectGPO = require_Reflect_getPrototypeOf();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var needsEval = {};
      var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
      var INTRINSICS = {
        __proto__: null,
        "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
        "%Array%": Array,
        "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
        "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
        "%AsyncFromSyncIteratorPrototype%": undefined2,
        "%AsyncFunction%": needsEval,
        "%AsyncGenerator%": needsEval,
        "%AsyncGeneratorFunction%": needsEval,
        "%AsyncIteratorPrototype%": needsEval,
        "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
        "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
        "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
        "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
        "%Boolean%": Boolean,
        "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
        "%Date%": Date,
        "%decodeURI%": decodeURI,
        "%decodeURIComponent%": decodeURIComponent,
        "%encodeURI%": encodeURI,
        "%encodeURIComponent%": encodeURIComponent,
        "%Error%": $Error,
        "%eval%": eval,
        // eslint-disable-line no-eval
        "%EvalError%": $EvalError,
        "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
        "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
        "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
        "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
        "%Function%": $Function,
        "%GeneratorFunction%": needsEval,
        "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
        "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
        "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
        "%isFinite%": isFinite,
        "%isNaN%": isNaN,
        "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
        "%JSON%": typeof JSON === "object" ? JSON : undefined2,
        "%Map%": typeof Map === "undefined" ? undefined2 : Map,
        "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
        "%Math%": Math,
        "%Number%": Number,
        "%Object%": $Object,
        "%Object.getOwnPropertyDescriptor%": $gOPD,
        "%parseFloat%": parseFloat,
        "%parseInt%": parseInt,
        "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
        "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
        "%RangeError%": $RangeError,
        "%ReferenceError%": $ReferenceError,
        "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
        "%RegExp%": RegExp,
        "%Set%": typeof Set === "undefined" ? undefined2 : Set,
        "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
        "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
        "%String%": String,
        "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
        "%Symbol%": hasSymbols ? Symbol : undefined2,
        "%SyntaxError%": $SyntaxError,
        "%ThrowTypeError%": ThrowTypeError,
        "%TypedArray%": TypedArray,
        "%TypeError%": $TypeError,
        "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
        "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
        "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
        "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
        "%URIError%": $URIError,
        "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
        "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
        "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
        "%Function.prototype.call%": $call,
        "%Function.prototype.apply%": $apply,
        "%Object.defineProperty%": $defineProperty,
        "%Object.getPrototypeOf%": $ObjectGPO,
        "%Math.abs%": abs,
        "%Math.floor%": floor,
        "%Math.max%": max,
        "%Math.min%": min,
        "%Math.pow%": pow,
        "%Math.round%": round,
        "%Math.sign%": sign,
        "%Reflect.getPrototypeOf%": $ReflectGPO
      };
      if (getProto) {
        try {
          null.error;
        } catch (e) {
          errorProto = getProto(getProto(e));
          INTRINSICS["%Error.prototype%"] = errorProto;
        }
      }
      var errorProto;
      var doEval = function doEval2(name) {
        var value;
        if (name === "%AsyncFunction%") {
          value = getEvalledConstructor("async function () {}");
        } else if (name === "%GeneratorFunction%") {
          value = getEvalledConstructor("function* () {}");
        } else if (name === "%AsyncGeneratorFunction%") {
          value = getEvalledConstructor("async function* () {}");
        } else if (name === "%AsyncGenerator%") {
          var fn = doEval2("%AsyncGeneratorFunction%");
          if (fn) {
            value = fn.prototype;
          }
        } else if (name === "%AsyncIteratorPrototype%") {
          var gen = doEval2("%AsyncGenerator%");
          if (gen && getProto) {
            value = getProto(gen.prototype);
          }
        }
        INTRINSICS[name] = value;
        return value;
      };
      var LEGACY_ALIASES = {
        __proto__: null,
        "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
        "%ArrayPrototype%": ["Array", "prototype"],
        "%ArrayProto_entries%": ["Array", "prototype", "entries"],
        "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
        "%ArrayProto_keys%": ["Array", "prototype", "keys"],
        "%ArrayProto_values%": ["Array", "prototype", "values"],
        "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
        "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
        "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
        "%BooleanPrototype%": ["Boolean", "prototype"],
        "%DataViewPrototype%": ["DataView", "prototype"],
        "%DatePrototype%": ["Date", "prototype"],
        "%ErrorPrototype%": ["Error", "prototype"],
        "%EvalErrorPrototype%": ["EvalError", "prototype"],
        "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
        "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
        "%FunctionPrototype%": ["Function", "prototype"],
        "%Generator%": ["GeneratorFunction", "prototype"],
        "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
        "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
        "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
        "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
        "%JSONParse%": ["JSON", "parse"],
        "%JSONStringify%": ["JSON", "stringify"],
        "%MapPrototype%": ["Map", "prototype"],
        "%NumberPrototype%": ["Number", "prototype"],
        "%ObjectPrototype%": ["Object", "prototype"],
        "%ObjProto_toString%": ["Object", "prototype", "toString"],
        "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
        "%PromisePrototype%": ["Promise", "prototype"],
        "%PromiseProto_then%": ["Promise", "prototype", "then"],
        "%Promise_all%": ["Promise", "all"],
        "%Promise_reject%": ["Promise", "reject"],
        "%Promise_resolve%": ["Promise", "resolve"],
        "%RangeErrorPrototype%": ["RangeError", "prototype"],
        "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
        "%RegExpPrototype%": ["RegExp", "prototype"],
        "%SetPrototype%": ["Set", "prototype"],
        "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
        "%StringPrototype%": ["String", "prototype"],
        "%SymbolPrototype%": ["Symbol", "prototype"],
        "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
        "%TypedArrayPrototype%": ["TypedArray", "prototype"],
        "%TypeErrorPrototype%": ["TypeError", "prototype"],
        "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
        "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
        "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
        "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
        "%URIErrorPrototype%": ["URIError", "prototype"],
        "%WeakMapPrototype%": ["WeakMap", "prototype"],
        "%WeakSetPrototype%": ["WeakSet", "prototype"]
      };
      var bind = require_function_bind();
      var hasOwn = require_hasown();
      var $concat = bind.call($call, Array.prototype.concat);
      var $spliceApply = bind.call($apply, Array.prototype.splice);
      var $replace = bind.call($call, String.prototype.replace);
      var $strSlice = bind.call($call, String.prototype.slice);
      var $exec = bind.call($call, RegExp.prototype.exec);
      var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = function stringToPath2(string) {
        var first = $strSlice(string, 0, 1);
        var last = $strSlice(string, -1);
        if (first === "%" && last !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
        } else if (last === "%" && first !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
        }
        var result = [];
        $replace(string, rePropName, function(match, number, quote, subString) {
          result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
        });
        return result;
      };
      var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
        var intrinsicName = name;
        var alias;
        if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
          alias = LEGACY_ALIASES[intrinsicName];
          intrinsicName = "%" + alias[0] + "%";
        }
        if (hasOwn(INTRINSICS, intrinsicName)) {
          var value = INTRINSICS[intrinsicName];
          if (value === needsEval) {
            value = doEval(intrinsicName);
          }
          if (typeof value === "undefined" && !allowMissing) {
            throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
          }
          return {
            alias,
            name: intrinsicName,
            value
          };
        }
        throw new $SyntaxError("intrinsic " + name + " does not exist!");
      };
      module.exports = function GetIntrinsic(name, allowMissing) {
        if (typeof name !== "string" || name.length === 0) {
          throw new $TypeError("intrinsic name must be a non-empty string");
        }
        if (arguments.length > 1 && typeof allowMissing !== "boolean") {
          throw new $TypeError('"allowMissing" argument must be a boolean');
        }
        if ($exec(/^%?[^%]*%?$/, name) === null) {
          throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
        }
        var parts = stringToPath(name);
        var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
        var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
        var intrinsicRealName = intrinsic.name;
        var value = intrinsic.value;
        var skipFurtherCaching = false;
        var alias = intrinsic.alias;
        if (alias) {
          intrinsicBaseName = alias[0];
          $spliceApply(parts, $concat([0, 1], alias));
        }
        for (var i = 1, isOwn = true; i < parts.length; i += 1) {
          var part = parts[i];
          var first = $strSlice(part, 0, 1);
          var last = $strSlice(part, -1);
          if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
            throw new $SyntaxError("property names with quotes must have matching quotes");
          }
          if (part === "constructor" || !isOwn) {
            skipFurtherCaching = true;
          }
          intrinsicBaseName += "." + part;
          intrinsicRealName = "%" + intrinsicBaseName + "%";
          if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
          } else if (value != null) {
            if (!(part in value)) {
              if (!allowMissing) {
                throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
              }
              return void undefined2;
            }
            if ($gOPD && i + 1 >= parts.length) {
              var desc = $gOPD(value, part);
              isOwn = !!desc;
              if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
                value = desc.get;
              } else {
                value = value[part];
              }
            } else {
              isOwn = hasOwn(value, part);
              value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
              INTRINSICS[intrinsicRealName] = value;
            }
          }
        }
        return value;
      };
    }
  });

  // ../call-bound/index.js
  var require_call_bound = __commonJS({
    "../call-bound/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var GetIntrinsic = require_get_intrinsic();
      var callBindBasic = require_call_bind_apply_helpers();
      var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
      module.exports = function callBoundIntrinsic(name, allowMissing) {
        var intrinsic = (
          /** @type {(this: unknown, ...args: unknown[]) => unknown} */
          GetIntrinsic(name, !!allowMissing)
        );
        if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
          return callBindBasic(
            /** @type {const} */
            [intrinsic]
          );
        }
        return intrinsic;
      };
    }
  });

  // ../is-callable/index.js
  var require_is_callable = __commonJS({
    "../is-callable/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var fnToStr = Function.prototype.toString;
      var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
      var badArrayLike;
      var isCallableMarker;
      if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") {
        try {
          badArrayLike = Object.defineProperty({}, "length", {
            get: function() {
              throw isCallableMarker;
            }
          });
          isCallableMarker = {};
          reflectApply(function() {
            throw 42;
          }, null, badArrayLike);
        } catch (_) {
          if (_ !== isCallableMarker) {
            reflectApply = null;
          }
        }
      } else {
        reflectApply = null;
      }
      var constructorRegex = /^\s*class\b/;
      var isES6ClassFn = function isES6ClassFunction(value) {
        try {
          var fnStr = fnToStr.call(value);
          return constructorRegex.test(fnStr);
        } catch (e) {
          return false;
        }
      };
      var tryFunctionObject = function tryFunctionToStr(value) {
        try {
          if (isES6ClassFn(value)) {
            return false;
          }
          fnToStr.call(value);
          return true;
        } catch (e) {
          return false;
        }
      };
      var toStr = Object.prototype.toString;
      var objectClass = "[object Object]";
      var fnClass = "[object Function]";
      var genClass = "[object GeneratorFunction]";
      var ddaClass = "[object HTMLAllCollection]";
      var ddaClass2 = "[object HTML document.all class]";
      var ddaClass3 = "[object HTMLCollection]";
      var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
      var isIE68 = !(0 in [,]);
      var isDDA = function isDocumentDotAll() {
        return false;
      };
      if (typeof document === "object") {
        all = document.all;
        if (toStr.call(all) === toStr.call(document.all)) {
          isDDA = function isDocumentDotAll(value) {
            if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) {
              try {
                var str = toStr.call(value);
                return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
              } catch (e) {
              }
            }
            return false;
          };
        }
      }
      var all;
      module.exports = reflectApply ? function isCallable(value) {
        if (isDDA(value)) {
          return true;
        }
        if (!value) {
          return false;
        }
        if (typeof value !== "function" && typeof value !== "object") {
          return false;
        }
        try {
          reflectApply(value, null, badArrayLike);
        } catch (e) {
          if (e !== isCallableMarker) {
            return false;
          }
        }
        return !isES6ClassFn(value) && tryFunctionObject(value);
      } : function isCallable(value) {
        if (isDDA(value)) {
          return true;
        }
        if (!value) {
          return false;
        }
        if (typeof value !== "function" && typeof value !== "object") {
          return false;
        }
        if (hasToStringTag) {
          return tryFunctionObject(value);
        }
        if (isES6ClassFn(value)) {
          return false;
        }
        var strClass = toStr.call(value);
        if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) {
          return false;
        }
        return tryFunctionObject(value);
      };
    }
  });

  // ../for-each/index.js
  var require_for_each = __commonJS({
    "../for-each/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var isCallable = require_is_callable();
      var toStr = Object.prototype.toString;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var forEachArray = function forEachArray2(array, iterator, receiver) {
        for (var i = 0, len = array.length; i < len; i++) {
          if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
              iterator(array[i], i, array);
            } else {
              iterator.call(receiver, array[i], i, array);
            }
          }
        }
      };
      var forEachString = function forEachString2(string, iterator, receiver) {
        for (var i = 0, len = string.length; i < len; i++) {
          if (receiver == null) {
            iterator(string.charAt(i), i, string);
          } else {
            iterator.call(receiver, string.charAt(i), i, string);
          }
        }
      };
      var forEachObject = function forEachObject2(object, iterator, receiver) {
        for (var k in object) {
          if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
              iterator(object[k], k, object);
            } else {
              iterator.call(receiver, object[k], k, object);
            }
          }
        }
      };
      function isArray(x) {
        return toStr.call(x) === "[object Array]";
      }
      module.exports = function forEach(list, iterator, thisArg) {
        if (!isCallable(iterator)) {
          throw new TypeError("iterator must be a function");
        }
        var receiver;
        if (arguments.length >= 3) {
          receiver = thisArg;
        }
        if (isArray(list)) {
          forEachArray(list, iterator, receiver);
        } else if (typeof list === "string") {
          forEachString(list, iterator, receiver);
        } else {
          forEachObject(list, iterator, receiver);
        }
      };
    }
  });

  // ../possible-typed-array-names/index.js
  var require_possible_typed_array_names = __commonJS({
    "../possible-typed-array-names/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = [
        "Float16Array",
        "Float32Array",
        "Float64Array",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "BigInt64Array",
        "BigUint64Array"
      ];
    }
  });

  // ../available-typed-arrays/index.js
  var require_available_typed_arrays = __commonJS({
    "../available-typed-arrays/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var possibleNames = require_possible_typed_array_names();
      var g = typeof globalThis === "undefined" ? globalThis : globalThis;
      module.exports = function availableTypedArrays() {
        var out = [];
        for (var i = 0; i < possibleNames.length; i++) {
          if (typeof g[possibleNames[i]] === "function") {
            out[out.length] = possibleNames[i];
          }
        }
        return out;
      };
    }
  });

  // ../define-data-property/index.js
  var require_define_data_property = __commonJS({
    "../define-data-property/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var $defineProperty = require_es_define_property();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var gopd = require_gopd();
      module.exports = function defineDataProperty(obj, property, value) {
        if (!obj || typeof obj !== "object" && typeof obj !== "function") {
          throw new $TypeError("`obj` must be an object or a function`");
        }
        if (typeof property !== "string" && typeof property !== "symbol") {
          throw new $TypeError("`property` must be a string or a symbol`");
        }
        if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) {
          throw new $TypeError("`nonEnumerable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) {
          throw new $TypeError("`nonWritable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) {
          throw new $TypeError("`nonConfigurable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 6 && typeof arguments[6] !== "boolean") {
          throw new $TypeError("`loose`, if provided, must be a boolean");
        }
        var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
        var nonWritable = arguments.length > 4 ? arguments[4] : null;
        var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
        var loose = arguments.length > 6 ? arguments[6] : false;
        var desc = !!gopd && gopd(obj, property);
        if ($defineProperty) {
          $defineProperty(obj, property, {
            configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
            enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
            value,
            writable: nonWritable === null && desc ? desc.writable : !nonWritable
          });
        } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
          obj[property] = value;
        } else {
          throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
        }
      };
    }
  });

  // ../has-property-descriptors/index.js
  var require_has_property_descriptors = __commonJS({
    "../has-property-descriptors/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var $defineProperty = require_es_define_property();
      var hasPropertyDescriptors = function hasPropertyDescriptors2() {
        return !!$defineProperty;
      };
      hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
        if (!$defineProperty) {
          return null;
        }
        try {
          return $defineProperty([], "length", { value: 1 }).length !== 1;
        } catch (e) {
          return true;
        }
      };
      module.exports = hasPropertyDescriptors;
    }
  });

  // ../set-function-length/index.js
  var require_set_function_length = __commonJS({
    "../set-function-length/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var GetIntrinsic = require_get_intrinsic();
      var define2 = require_define_data_property();
      var hasDescriptors = require_has_property_descriptors()();
      var gOPD = require_gopd();
      var $TypeError = require_type();
      var $floor = GetIntrinsic("%Math.floor%");
      module.exports = function setFunctionLength(fn, length) {
        if (typeof fn !== "function") {
          throw new $TypeError("`fn` is not a function");
        }
        if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) {
          throw new $TypeError("`length` must be a positive 32-bit integer");
        }
        var loose = arguments.length > 2 && !!arguments[2];
        var functionLengthIsConfigurable = true;
        var functionLengthIsWritable = true;
        if ("length" in fn && gOPD) {
          var desc = gOPD(fn, "length");
          if (desc && !desc.configurable) {
            functionLengthIsConfigurable = false;
          }
          if (desc && !desc.writable) {
            functionLengthIsWritable = false;
          }
        }
        if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
          if (hasDescriptors) {
            define2(
              /** @type {Parameters<define>[0]} */
              fn,
              "length",
              length,
              true,
              true
            );
          } else {
            define2(
              /** @type {Parameters<define>[0]} */
              fn,
              "length",
              length
            );
          }
        }
        return fn;
      };
    }
  });

  // ../call-bind-apply-helpers/applyBind.js
  var require_applyBind = __commonJS({
    "../call-bind-apply-helpers/applyBind.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var actualApply = require_actualApply();
      module.exports = function applyBind() {
        return actualApply(bind, $apply, arguments);
      };
    }
  });

  // ../call-bind/index.js
  var require_call_bind = __commonJS({
    "../call-bind/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var setFunctionLength = require_set_function_length();
      var $defineProperty = require_es_define_property();
      var callBindBasic = require_call_bind_apply_helpers();
      var applyBind = require_applyBind();
      module.exports = function callBind(originalFunction) {
        var func = callBindBasic(arguments);
        var adjustedLength = 1 + originalFunction.length - (arguments.length - 1);
        return setFunctionLength(
          func,
          adjustedLength > 0 ? adjustedLength : 0,
          true
        );
      };
      if ($defineProperty) {
        $defineProperty(module.exports, "apply", { value: applyBind });
      } else {
        module.exports.apply = applyBind;
      }
    }
  });

  // ../has-tostringtag/shams.js
  var require_shams2 = __commonJS({
    "../has-tostringtag/shams.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var hasSymbols = require_shams();
      module.exports = function hasToStringTagShams() {
        return hasSymbols() && !!Symbol.toStringTag;
      };
    }
  });

  // ../which-typed-array/index.js
  var require_which_typed_array = __commonJS({
    "../which-typed-array/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var forEach = require_for_each();
      var availableTypedArrays = require_available_typed_arrays();
      var callBind = require_call_bind();
      var callBound = require_call_bound();
      var gOPD = require_gopd();
      var getProto = require_get_proto();
      var $toString = callBound("Object.prototype.toString");
      var hasToStringTag = require_shams2()();
      var g = typeof globalThis === "undefined" ? globalThis : globalThis;
      var typedArrays = availableTypedArrays();
      var $slice = callBound("String.prototype.slice");
      var $indexOf = callBound("Array.prototype.indexOf", true) || function indexOf(array, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i] === value) {
            return i;
          }
        }
        return -1;
      };
      var cache = { __proto__: null };
      if (hasToStringTag && gOPD && getProto) {
        forEach(typedArrays, function(typedArray) {
          var arr = new g[typedArray]();
          if (Symbol.toStringTag in arr && getProto) {
            var proto = getProto(arr);
            var descriptor = gOPD(proto, Symbol.toStringTag);
            if (!descriptor && proto) {
              var superProto = getProto(proto);
              descriptor = gOPD(superProto, Symbol.toStringTag);
            }
            if (descriptor && descriptor.get) {
              var bound = callBind(descriptor.get);
              cache[
                /** @type {`$${TypedArrayName}`} */
                "$" + typedArray
              ] = bound;
            }
          }
        });
      } else {
        forEach(typedArrays, function(typedArray) {
          var arr = new g[typedArray]();
          var fn = arr.slice || arr.set;
          if (fn) {
            var bound = (
              /** @type {typeof BoundSlice | typeof BoundSet} */
              // @ts-expect-error TODO FIXME
              callBind(fn)
            );
            cache[
              /** @type {`$${TypedArrayName}`} */
              "$" + typedArray
            ] = bound;
          }
        });
      }
      function tryTypedArrays(value) {
        var found = false;
        forEach(
          /** @type {Record<`$${TypedArrayName}`, Getter>} */
          cache,
          /** @param {Getter} getter @param {`$${TypedArrayName}`} typedArray */
          function(getter, typedArray) {
            if (!found) {
              try {
                if ("$" + getter(value) === typedArray) {
                  found = /** @type {TypedArrayName} */
                  $slice(typedArray, 1);
                }
              } catch (e) {
              }
            }
          }
        );
        return found;
      }
      function trySlices(value) {
        var found = false;
        forEach(
          /** @type {Record<`$${TypedArrayName}`, Getter>} */
          cache,
          /** @param {Getter} getter @param {`$${TypedArrayName}`} name */
          function(getter, name) {
            if (!found) {
              try {
                getter(value);
                found = /** @type {TypedArrayName} */
                $slice(name, 1);
              } catch (e) {
              }
            }
          }
        );
        return found;
      }
      function isTATag(tag) {
        return $indexOf(typedArrays, tag) > -1;
      }
      function whichTypedArray(value) {
        if (!value || typeof value !== "object") {
          return false;
        }
        if (!hasToStringTag) {
          var tag = $slice($toString(value), 8, -1);
          if (isTATag(tag)) {
            return tag;
          }
          if (tag !== "Object") {
            return false;
          }
          return trySlices(value);
        }
        if (!gOPD) {
          return null;
        }
        return tryTypedArrays(value);
      }
      module.exports = whichTypedArray;
    }
  });

  // ../is-typed-array/index.js
  var require_is_typed_array = __commonJS({
    "../is-typed-array/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var whichTypedArray = require_which_typed_array();
      module.exports = function isTypedArray(value) {
        return !!whichTypedArray(value);
      };
    }
  });

  // ../typed-array-buffer/index.js
  var require_typed_array_buffer = __commonJS({
    "../typed-array-buffer/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var $TypeError = require_type();
      var callBound = require_call_bound();
      var $typedArrayBuffer = callBound("TypedArray.prototype.buffer", true);
      var isTypedArray = require_is_typed_array();
      module.exports = $typedArrayBuffer || function typedArrayBuffer(x) {
        if (!isTypedArray(x)) {
          throw new $TypeError("Not a Typed Array");
        }
        return x.buffer;
      };
    }
  });

  // ../to-buffer/index.js
  var require_to_buffer = __commonJS({
    "../to-buffer/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      var isArray = require_isarray();
      var typedArrayBuffer = require_typed_array_buffer();
      var isView = ArrayBuffer.isView || function isView2(obj) {
        try {
          typedArrayBuffer(obj);
          return true;
        } catch (e) {
          return false;
        }
      };
      var useUint8Array = typeof Uint8Array !== "undefined";
      var useArrayBuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
      var useFromArrayBuffer = useArrayBuffer && (Buffer3.prototype instanceof Uint8Array || Buffer3.TYPED_ARRAY_SUPPORT);
      module.exports = function toBuffer(data, encoding) {
        if (Buffer3.isBuffer(data)) {
          if (data.constructor && !("isBuffer" in data)) {
            return Buffer3.from(data);
          }
          return data;
        }
        if (typeof data === "string") {
          return Buffer3.from(data, encoding);
        }
        if (useArrayBuffer && isView(data)) {
          if (data.byteLength === 0) {
            return Buffer3.alloc(0);
          }
          if (useFromArrayBuffer) {
            var res = Buffer3.from(data.buffer, data.byteOffset, data.byteLength);
            if (res.byteLength === data.byteLength) {
              return res;
            }
          }
          var uint8 = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
          var result = Buffer3.from(uint8);
          if (result.length === data.byteLength) {
            return result;
          }
        }
        if (useUint8Array && data instanceof Uint8Array) {
          return Buffer3.from(data);
        }
        var isArr = isArray(data);
        if (isArr) {
          for (var i = 0; i < data.length; i += 1) {
            var x = data[i];
            if (typeof x !== "number" || x < 0 || x > 255 || ~~x !== x) {
              throw new RangeError("Array items must be numbers in the range 0-255.");
            }
          }
        }
        if (isArr || Buffer3.isBuffer(data) && data.constructor && typeof data.constructor.isBuffer === "function" && data.constructor.isBuffer(data)) {
          return Buffer3.from(data);
        }
        throw new TypeError('The "data" argument must be a string, an Array, a Buffer, a Uint8Array, or a DataView.');
      };
    }
  });

  // ../cipher-base/index.js
  var require_cipher_base = __commonJS({
    "../cipher-base/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      var Transform = require_stream_browserify().Transform;
      var StringDecoder = require_string_decoder().StringDecoder;
      var inherits = require_inherits_browser();
      var toBuffer = require_to_buffer();
      function CipherBase(hashMode) {
        Transform.call(this);
        this.hashMode = typeof hashMode === "string";
        if (this.hashMode) {
          this[hashMode] = this._finalOrDigest;
        } else {
          this["final"] = this._finalOrDigest;
        }
        if (this._final) {
          this.__final = this._final;
          this._final = null;
        }
        this._decoder = null;
        this._encoding = null;
      }
      inherits(CipherBase, Transform);
      CipherBase.prototype.update = function(data, inputEnc, outputEnc) {
        var bufferData = toBuffer(data, inputEnc);
        var outData = this._update(bufferData);
        if (this.hashMode) {
          return this;
        }
        if (outputEnc) {
          outData = this._toString(outData, outputEnc);
        }
        return outData;
      };
      CipherBase.prototype.setAutoPadding = function() {
      };
      CipherBase.prototype.getAuthTag = function() {
        throw new Error("trying to get auth tag in unsupported state");
      };
      CipherBase.prototype.setAuthTag = function() {
        throw new Error("trying to set auth tag in unsupported state");
      };
      CipherBase.prototype.setAAD = function() {
        throw new Error("trying to set aad in unsupported state");
      };
      CipherBase.prototype._transform = function(data, _, next) {
        var err;
        try {
          if (this.hashMode) {
            this._update(data);
          } else {
            this.push(this._update(data));
          }
        } catch (e) {
          err = e;
        } finally {
          next(err);
        }
      };
      CipherBase.prototype._flush = function(done) {
        var err;
        try {
          this.push(this.__final());
        } catch (e) {
          err = e;
        }
        done(err);
      };
      CipherBase.prototype._finalOrDigest = function(outputEnc) {
        var outData = this.__final() || Buffer3.alloc(0);
        if (outputEnc) {
          outData = this._toString(outData, outputEnc, true);
        }
        return outData;
      };
      CipherBase.prototype._toString = function(value, enc, fin) {
        if (!this._decoder) {
          this._decoder = new StringDecoder(enc);
          this._encoding = enc;
        }
        if (this._encoding !== enc) {
          throw new Error("can\u2019t switch encodings");
        }
        var out = this._decoder.write(value);
        if (fin) {
          out += this._decoder.end();
        }
        return out;
      };
      module.exports = CipherBase;
    }
  });

  // ../browserify-aes/ghash.js
  var require_ghash = __commonJS({
    "../browserify-aes/ghash.js"(exports, module) {
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      var ZEROES = Buffer3.alloc(16, 0);
      function toArray(buf) {
        return [
          buf.readUInt32BE(0),
          buf.readUInt32BE(4),
          buf.readUInt32BE(8),
          buf.readUInt32BE(12)
        ];
      }
      function fromArray(out) {
        var buf = Buffer3.allocUnsafe(16);
        buf.writeUInt32BE(out[0] >>> 0, 0);
        buf.writeUInt32BE(out[1] >>> 0, 4);
        buf.writeUInt32BE(out[2] >>> 0, 8);
        buf.writeUInt32BE(out[3] >>> 0, 12);
        return buf;
      }
      function GHASH(key) {
        this.h = key;
        this.state = Buffer3.alloc(16, 0);
        this.cache = Buffer3.allocUnsafe(0);
      }
      GHASH.prototype.ghash = function(block) {
        var i = -1;
        while (++i < block.length) {
          this.state[i] ^= block[i];
        }
        this._multiply();
      };
      GHASH.prototype._multiply = function() {
        var Vi = toArray(this.h);
        var Zi = [0, 0, 0, 0];
        var j, xi, lsbVi;
        var i = -1;
        while (++i < 128) {
          xi = (this.state[~~(i / 8)] & 1 << 7 - i % 8) !== 0;
          if (xi) {
            Zi[0] ^= Vi[0];
            Zi[1] ^= Vi[1];
            Zi[2] ^= Vi[2];
            Zi[3] ^= Vi[3];
          }
          lsbVi = (Vi[3] & 1) !== 0;
          for (j = 3; j > 0; j--) {
            Vi[j] = Vi[j] >>> 1 | (Vi[j - 1] & 1) << 31;
          }
          Vi[0] = Vi[0] >>> 1;
          if (lsbVi) {
            Vi[0] = Vi[0] ^ 225 << 24;
          }
        }
        this.state = fromArray(Zi);
      };
      GHASH.prototype.update = function(buf) {
        this.cache = Buffer3.concat([this.cache, buf]);
        var chunk;
        while (this.cache.length >= 16) {
          chunk = this.cache.slice(0, 16);
          this.cache = this.cache.slice(16);
          this.ghash(chunk);
        }
      };
      GHASH.prototype.final = function(abl, bl) {
        if (this.cache.length) {
          this.ghash(Buffer3.concat([this.cache, ZEROES], 16));
        }
        this.ghash(fromArray([0, abl, 0, bl]));
        return this.state;
      };
      module.exports = GHASH;
    }
  });

  // ../browserify-aes/authCipher.js
  var require_authCipher = __commonJS({
    "../browserify-aes/authCipher.js"(exports, module) {
      init_browser_globals();
      var aes = require_aes();
      var Buffer3 = require_safe_buffer().Buffer;
      var Transform = require_cipher_base();
      var inherits = require_inherits_browser();
      var GHASH = require_ghash();
      var xor = require_buffer_xor();
      var incr32 = require_incr32();
      function xorTest(a, b) {
        var out = 0;
        if (a.length !== b.length) out++;
        var len = Math.min(a.length, b.length);
        for (var i = 0; i < len; ++i) {
          out += a[i] ^ b[i];
        }
        return out;
      }
      function calcIv(self2, iv, ck) {
        if (iv.length === 12) {
          self2._finID = Buffer3.concat([iv, Buffer3.from([0, 0, 0, 1])]);
          return Buffer3.concat([iv, Buffer3.from([0, 0, 0, 2])]);
        }
        var ghash = new GHASH(ck);
        var len = iv.length;
        var toPad = len % 16;
        ghash.update(iv);
        if (toPad) {
          toPad = 16 - toPad;
          ghash.update(Buffer3.alloc(toPad, 0));
        }
        ghash.update(Buffer3.alloc(8, 0));
        var ivBits = len * 8;
        var tail = Buffer3.alloc(8);
        tail.writeUIntBE(ivBits, 0, 8);
        ghash.update(tail);
        self2._finID = ghash.state;
        var out = Buffer3.from(self2._finID);
        incr32(out);
        return out;
      }
      function StreamCipher(mode, key, iv, decrypt) {
        Transform.call(this);
        var h = Buffer3.alloc(4, 0);
        this._cipher = new aes.AES(key);
        var ck = this._cipher.encryptBlock(h);
        this._ghash = new GHASH(ck);
        iv = calcIv(this, iv, ck);
        this._prev = Buffer3.from(iv);
        this._cache = Buffer3.allocUnsafe(0);
        this._secCache = Buffer3.allocUnsafe(0);
        this._decrypt = decrypt;
        this._alen = 0;
        this._len = 0;
        this._mode = mode;
        this._authTag = null;
        this._called = false;
      }
      inherits(StreamCipher, Transform);
      StreamCipher.prototype._update = function(chunk) {
        if (!this._called && this._alen) {
          var rump = 16 - this._alen % 16;
          if (rump < 16) {
            rump = Buffer3.alloc(rump, 0);
            this._ghash.update(rump);
          }
        }
        this._called = true;
        var out = this._mode.encrypt(this, chunk);
        if (this._decrypt) {
          this._ghash.update(chunk);
        } else {
          this._ghash.update(out);
        }
        this._len += chunk.length;
        return out;
      };
      StreamCipher.prototype._final = function() {
        if (this._decrypt && !this._authTag) throw new Error("Unsupported state or unable to authenticate data");
        var tag = xor(this._ghash.final(this._alen * 8, this._len * 8), this._cipher.encryptBlock(this._finID));
        if (this._decrypt && xorTest(tag, this._authTag)) throw new Error("Unsupported state or unable to authenticate data");
        this._authTag = tag;
        this._cipher.scrub();
      };
      StreamCipher.prototype.getAuthTag = function getAuthTag() {
        if (this._decrypt || !Buffer3.isBuffer(this._authTag)) throw new Error("Attempting to get auth tag in unsupported state");
        return this._authTag;
      };
      StreamCipher.prototype.setAuthTag = function setAuthTag(tag) {
        if (!this._decrypt) throw new Error("Attempting to set auth tag in unsupported state");
        this._authTag = tag;
      };
      StreamCipher.prototype.setAAD = function setAAD(buf) {
        if (this._called) throw new Error("Attempting to set AAD in unsupported state");
        this._ghash.update(buf);
        this._alen += buf.length;
      };
      module.exports = StreamCipher;
    }
  });

  // ../browserify-aes/streamCipher.js
  var require_streamCipher = __commonJS({
    "../browserify-aes/streamCipher.js"(exports, module) {
      init_browser_globals();
      var aes = require_aes();
      var Buffer3 = require_safe_buffer().Buffer;
      var Transform = require_cipher_base();
      var inherits = require_inherits_browser();
      function StreamCipher(mode, key, iv, decrypt) {
        Transform.call(this);
        this._cipher = new aes.AES(key);
        this._prev = Buffer3.from(iv);
        this._cache = Buffer3.allocUnsafe(0);
        this._secCache = Buffer3.allocUnsafe(0);
        this._decrypt = decrypt;
        this._mode = mode;
      }
      inherits(StreamCipher, Transform);
      StreamCipher.prototype._update = function(chunk) {
        return this._mode.encrypt(this, chunk, this._decrypt);
      };
      StreamCipher.prototype._final = function() {
        this._cipher.scrub();
      };
      module.exports = StreamCipher;
    }
  });

  // ../hash-base/to-buffer.js
  var require_to_buffer2 = __commonJS({
    "../hash-base/to-buffer.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      var toBuffer = require_to_buffer();
      var useUint8Array = typeof Uint8Array !== "undefined";
      var useArrayBuffer = useUint8Array && typeof ArrayBuffer !== "undefined";
      var isView = useArrayBuffer && ArrayBuffer.isView;
      module.exports = function(thing, encoding) {
        if (typeof thing === "string" || Buffer3.isBuffer(thing) || useUint8Array && thing instanceof Uint8Array || isView && isView(thing)) {
          return toBuffer(thing, encoding);
        }
        throw new TypeError('The "data" argument must be a string, a Buffer, a Uint8Array, or a DataView');
      };
    }
  });

  // ../process-nextick-args/index.js
  var require_process_nextick_args = __commonJS({
    "../process-nextick-args/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      if (typeof import_browser.default === "undefined" || !import_browser.default.version || import_browser.default.version.indexOf("v0.") === 0 || import_browser.default.version.indexOf("v1.") === 0 && import_browser.default.version.indexOf("v1.8.") !== 0) {
        module.exports = { nextTick };
      } else {
        module.exports = import_browser.default;
      }
      function nextTick(fn, arg1, arg2, arg3) {
        if (typeof fn !== "function") {
          throw new TypeError('"callback" argument must be a function');
        }
        var len = arguments.length;
        var args, i;
        switch (len) {
          case 0:
          case 1:
            return import_browser.default.nextTick(fn);
          case 2:
            return import_browser.default.nextTick(function afterTickOne() {
              fn.call(null, arg1);
            });
          case 3:
            return import_browser.default.nextTick(function afterTickTwo() {
              fn.call(null, arg1, arg2);
            });
          case 4:
            return import_browser.default.nextTick(function afterTickThree() {
              fn.call(null, arg1, arg2, arg3);
            });
          default:
            args = new Array(len - 1);
            i = 0;
            while (i < args.length) {
              args[i++] = arguments[i];
            }
            return import_browser.default.nextTick(function afterTick() {
              fn.apply(null, args);
            });
        }
      }
    }
  });

  // ../isarray/index.js
  var require_isarray2 = __commonJS({
    "../isarray/index.js"(exports, module) {
      init_browser_globals();
      var toString = {}.toString;
      module.exports = Array.isArray || function(arr) {
        return toString.call(arr) == "[object Array]";
      };
    }
  });

  // ../readable-stream/lib/internal/streams/stream-browser.js
  var require_stream_browser2 = __commonJS({
    "../readable-stream/lib/internal/streams/stream-browser.js"(exports, module) {
      init_browser_globals();
      module.exports = require_events().EventEmitter;
    }
  });

  // ../readable-stream/node_modules/safe-buffer/index.js
  var require_safe_buffer3 = __commonJS({
    "../readable-stream/node_modules/safe-buffer/index.js"(exports, module) {
      init_browser_globals();
      var buffer = require_buffer();
      var Buffer3 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer3.from && Buffer3.alloc && Buffer3.allocUnsafe && Buffer3.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer3(arg, encodingOrOffset, length);
      }
      copyProps(Buffer3, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer3(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer3(size);
        if (fill !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer3(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    }
  });

  // ../core-util-is/lib/util.js
  var require_util2 = __commonJS({
    "../core-util-is/lib/util.js"(exports) {
      init_browser_globals();
      function isArray(arg) {
        if (Array.isArray) {
          return Array.isArray(arg);
        }
        return objectToString(arg) === "[object Array]";
      }
      exports.isArray = isArray;
      function isBoolean(arg) {
        return typeof arg === "boolean";
      }
      exports.isBoolean = isBoolean;
      function isNull(arg) {
        return arg === null;
      }
      exports.isNull = isNull;
      function isNullOrUndefined(arg) {
        return arg == null;
      }
      exports.isNullOrUndefined = isNullOrUndefined;
      function isNumber(arg) {
        return typeof arg === "number";
      }
      exports.isNumber = isNumber;
      function isString(arg) {
        return typeof arg === "string";
      }
      exports.isString = isString;
      function isSymbol(arg) {
        return typeof arg === "symbol";
      }
      exports.isSymbol = isSymbol;
      function isUndefined(arg) {
        return arg === void 0;
      }
      exports.isUndefined = isUndefined;
      function isRegExp(re) {
        return objectToString(re) === "[object RegExp]";
      }
      exports.isRegExp = isRegExp;
      function isObject(arg) {
        return typeof arg === "object" && arg !== null;
      }
      exports.isObject = isObject;
      function isDate(d) {
        return objectToString(d) === "[object Date]";
      }
      exports.isDate = isDate;
      function isError(e) {
        return objectToString(e) === "[object Error]" || e instanceof Error;
      }
      exports.isError = isError;
      function isFunction(arg) {
        return typeof arg === "function";
      }
      exports.isFunction = isFunction;
      function isPrimitive(arg) {
        return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
        typeof arg === "undefined";
      }
      exports.isPrimitive = isPrimitive;
      exports.isBuffer = require_buffer().Buffer.isBuffer;
      function objectToString(o) {
        return Object.prototype.toString.call(o);
      }
    }
  });

  // ../readable-stream/lib/internal/streams/BufferList.js
  var require_BufferList = __commonJS({
    "../readable-stream/lib/internal/streams/BufferList.js"(exports, module) {
      "use strict";
      init_browser_globals();
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var Buffer3 = require_safe_buffer3().Buffer;
      var util = require_util();
      function copyBuffer(src, target, offset) {
        src.copy(target, offset);
      }
      module.exports = (function() {
        function BufferList() {
          _classCallCheck(this, BufferList);
          this.head = null;
          this.tail = null;
          this.length = 0;
        }
        BufferList.prototype.push = function push(v) {
          var entry = { data: v, next: null };
          if (this.length > 0) this.tail.next = entry;
          else this.head = entry;
          this.tail = entry;
          ++this.length;
        };
        BufferList.prototype.unshift = function unshift(v) {
          var entry = { data: v, next: this.head };
          if (this.length === 0) this.tail = entry;
          this.head = entry;
          ++this.length;
        };
        BufferList.prototype.shift = function shift() {
          if (this.length === 0) return;
          var ret = this.head.data;
          if (this.length === 1) this.head = this.tail = null;
          else this.head = this.head.next;
          --this.length;
          return ret;
        };
        BufferList.prototype.clear = function clear() {
          this.head = this.tail = null;
          this.length = 0;
        };
        BufferList.prototype.join = function join(s) {
          if (this.length === 0) return "";
          var p = this.head;
          var ret = "" + p.data;
          while (p = p.next) {
            ret += s + p.data;
          }
          return ret;
        };
        BufferList.prototype.concat = function concat(n) {
          if (this.length === 0) return Buffer3.alloc(0);
          var ret = Buffer3.allocUnsafe(n >>> 0);
          var p = this.head;
          var i = 0;
          while (p) {
            copyBuffer(p.data, ret, i);
            i += p.data.length;
            p = p.next;
          }
          return ret;
        };
        return BufferList;
      })();
      if (util && util.inspect && util.inspect.custom) {
        module.exports.prototype[util.inspect.custom] = function() {
          var obj = util.inspect({ length: this.length });
          return this.constructor.name + " " + obj;
        };
      }
    }
  });

  // ../readable-stream/lib/internal/streams/destroy.js
  var require_destroy2 = __commonJS({
    "../readable-stream/lib/internal/streams/destroy.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var pna = require_process_nextick_args();
      function destroy(err, cb) {
        var _this = this;
        var readableDestroyed = this._readableState && this._readableState.destroyed;
        var writableDestroyed = this._writableState && this._writableState.destroyed;
        if (readableDestroyed || writableDestroyed) {
          if (cb) {
            cb(err);
          } else if (err) {
            if (!this._writableState) {
              pna.nextTick(emitErrorNT, this, err);
            } else if (!this._writableState.errorEmitted) {
              this._writableState.errorEmitted = true;
              pna.nextTick(emitErrorNT, this, err);
            }
          }
          return this;
        }
        if (this._readableState) {
          this._readableState.destroyed = true;
        }
        if (this._writableState) {
          this._writableState.destroyed = true;
        }
        this._destroy(err || null, function(err2) {
          if (!cb && err2) {
            if (!_this._writableState) {
              pna.nextTick(emitErrorNT, _this, err2);
            } else if (!_this._writableState.errorEmitted) {
              _this._writableState.errorEmitted = true;
              pna.nextTick(emitErrorNT, _this, err2);
            }
          } else if (cb) {
            cb(err2);
          }
        });
        return this;
      }
      function undestroy() {
        if (this._readableState) {
          this._readableState.destroyed = false;
          this._readableState.reading = false;
          this._readableState.ended = false;
          this._readableState.endEmitted = false;
        }
        if (this._writableState) {
          this._writableState.destroyed = false;
          this._writableState.ended = false;
          this._writableState.ending = false;
          this._writableState.finalCalled = false;
          this._writableState.prefinished = false;
          this._writableState.finished = false;
          this._writableState.errorEmitted = false;
        }
      }
      function emitErrorNT(self2, err) {
        self2.emit("error", err);
      }
      module.exports = {
        destroy,
        undestroy
      };
    }
  });

  // ../readable-stream/lib/_stream_writable.js
  var require_stream_writable2 = __commonJS({
    "../readable-stream/lib/_stream_writable.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var pna = require_process_nextick_args();
      module.exports = Writable;
      function CorkedRequest(state) {
        var _this = this;
        this.next = null;
        this.entry = null;
        this.finish = function() {
          onCorkedFinish(_this, state);
        };
      }
      var asyncWrite = !import_browser.default.browser && ["v0.10", "v0.9."].indexOf(import_browser.default.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
      var Duplex;
      Writable.WritableState = WritableState;
      var util = Object.create(require_util2());
      util.inherits = require_inherits_browser();
      var internalUtil = {
        deprecate: require_browser2()
      };
      var Stream = require_stream_browser2();
      var Buffer3 = require_safe_buffer3().Buffer;
      var OurUint8Array = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
      };
      function _uint8ArrayToBuffer(chunk) {
        return Buffer3.from(chunk);
      }
      function _isUint8Array(obj) {
        return Buffer3.isBuffer(obj) || obj instanceof OurUint8Array;
      }
      var destroyImpl = require_destroy2();
      util.inherits(Writable, Stream);
      function nop() {
      }
      function WritableState(options, stream) {
        Duplex = Duplex || require_stream_duplex2();
        options = options || {};
        var isDuplex = stream instanceof Duplex;
        this.objectMode = !!options.objectMode;
        if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
        var hwm = options.highWaterMark;
        var writableHwm = options.writableHighWaterMark;
        var defaultHwm = this.objectMode ? 16 : 16 * 1024;
        if (hwm || hwm === 0) this.highWaterMark = hwm;
        else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;
        else this.highWaterMark = defaultHwm;
        this.highWaterMark = Math.floor(this.highWaterMark);
        this.finalCalled = false;
        this.needDrain = false;
        this.ending = false;
        this.ended = false;
        this.finished = false;
        this.destroyed = false;
        var noDecode = options.decodeStrings === false;
        this.decodeStrings = !noDecode;
        this.defaultEncoding = options.defaultEncoding || "utf8";
        this.length = 0;
        this.writing = false;
        this.corked = 0;
        this.sync = true;
        this.bufferProcessing = false;
        this.onwrite = function(er) {
          onwrite(stream, er);
        };
        this.writecb = null;
        this.writelen = 0;
        this.bufferedRequest = null;
        this.lastBufferedRequest = null;
        this.pendingcb = 0;
        this.prefinished = false;
        this.errorEmitted = false;
        this.bufferedRequestCount = 0;
        this.corkedRequestsFree = new CorkedRequest(this);
      }
      WritableState.prototype.getBuffer = function getBuffer() {
        var current = this.bufferedRequest;
        var out = [];
        while (current) {
          out.push(current);
          current = current.next;
        }
        return out;
      };
      (function() {
        try {
          Object.defineProperty(WritableState.prototype, "buffer", {
            get: internalUtil.deprecate(function() {
              return this.getBuffer();
            }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
          });
        } catch (_) {
        }
      })();
      var realHasInstance;
      if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
        realHasInstance = Function.prototype[Symbol.hasInstance];
        Object.defineProperty(Writable, Symbol.hasInstance, {
          value: function(object) {
            if (realHasInstance.call(this, object)) return true;
            if (this !== Writable) return false;
            return object && object._writableState instanceof WritableState;
          }
        });
      } else {
        realHasInstance = function(object) {
          return object instanceof this;
        };
      }
      function Writable(options) {
        Duplex = Duplex || require_stream_duplex2();
        if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
          return new Writable(options);
        }
        this._writableState = new WritableState(options, this);
        this.writable = true;
        if (options) {
          if (typeof options.write === "function") this._write = options.write;
          if (typeof options.writev === "function") this._writev = options.writev;
          if (typeof options.destroy === "function") this._destroy = options.destroy;
          if (typeof options.final === "function") this._final = options.final;
        }
        Stream.call(this);
      }
      Writable.prototype.pipe = function() {
        this.emit("error", new Error("Cannot pipe, not readable"));
      };
      function writeAfterEnd(stream, cb) {
        var er = new Error("write after end");
        stream.emit("error", er);
        pna.nextTick(cb, er);
      }
      function validChunk(stream, state, chunk, cb) {
        var valid = true;
        var er = false;
        if (chunk === null) {
          er = new TypeError("May not write null values to stream");
        } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
          er = new TypeError("Invalid non-string/buffer chunk");
        }
        if (er) {
          stream.emit("error", er);
          pna.nextTick(cb, er);
          valid = false;
        }
        return valid;
      }
      Writable.prototype.write = function(chunk, encoding, cb) {
        var state = this._writableState;
        var ret = false;
        var isBuf = !state.objectMode && _isUint8Array(chunk);
        if (isBuf && !Buffer3.isBuffer(chunk)) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (typeof encoding === "function") {
          cb = encoding;
          encoding = null;
        }
        if (isBuf) encoding = "buffer";
        else if (!encoding) encoding = state.defaultEncoding;
        if (typeof cb !== "function") cb = nop;
        if (state.ended) writeAfterEnd(this, cb);
        else if (isBuf || validChunk(this, state, chunk, cb)) {
          state.pendingcb++;
          ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
        }
        return ret;
      };
      Writable.prototype.cork = function() {
        var state = this._writableState;
        state.corked++;
      };
      Writable.prototype.uncork = function() {
        var state = this._writableState;
        if (state.corked) {
          state.corked--;
          if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
        }
      };
      Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
        if (typeof encoding === "string") encoding = encoding.toLowerCase();
        if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
        this._writableState.defaultEncoding = encoding;
        return this;
      };
      function decodeChunk(state, chunk, encoding) {
        if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
          chunk = Buffer3.from(chunk, encoding);
        }
        return chunk;
      }
      Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function() {
          return this._writableState.highWaterMark;
        }
      });
      function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
        if (!isBuf) {
          var newChunk = decodeChunk(state, chunk, encoding);
          if (chunk !== newChunk) {
            isBuf = true;
            encoding = "buffer";
            chunk = newChunk;
          }
        }
        var len = state.objectMode ? 1 : chunk.length;
        state.length += len;
        var ret = state.length < state.highWaterMark;
        if (!ret) state.needDrain = true;
        if (state.writing || state.corked) {
          var last = state.lastBufferedRequest;
          state.lastBufferedRequest = {
            chunk,
            encoding,
            isBuf,
            callback: cb,
            next: null
          };
          if (last) {
            last.next = state.lastBufferedRequest;
          } else {
            state.bufferedRequest = state.lastBufferedRequest;
          }
          state.bufferedRequestCount += 1;
        } else {
          doWrite(stream, state, false, len, chunk, encoding, cb);
        }
        return ret;
      }
      function doWrite(stream, state, writev, len, chunk, encoding, cb) {
        state.writelen = len;
        state.writecb = cb;
        state.writing = true;
        state.sync = true;
        if (writev) stream._writev(chunk, state.onwrite);
        else stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      function onwriteError(stream, state, sync, er, cb) {
        --state.pendingcb;
        if (sync) {
          pna.nextTick(cb, er);
          pna.nextTick(finishMaybe, stream, state);
          stream._writableState.errorEmitted = true;
          stream.emit("error", er);
        } else {
          cb(er);
          stream._writableState.errorEmitted = true;
          stream.emit("error", er);
          finishMaybe(stream, state);
        }
      }
      function onwriteStateUpdate(state) {
        state.writing = false;
        state.writecb = null;
        state.length -= state.writelen;
        state.writelen = 0;
      }
      function onwrite(stream, er) {
        var state = stream._writableState;
        var sync = state.sync;
        var cb = state.writecb;
        onwriteStateUpdate(state);
        if (er) onwriteError(stream, state, sync, er, cb);
        else {
          var finished = needFinish(state);
          if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
            clearBuffer(stream, state);
          }
          if (sync) {
            asyncWrite(afterWrite, stream, state, finished, cb);
          } else {
            afterWrite(stream, state, finished, cb);
          }
        }
      }
      function afterWrite(stream, state, finished, cb) {
        if (!finished) onwriteDrain(stream, state);
        state.pendingcb--;
        cb();
        finishMaybe(stream, state);
      }
      function onwriteDrain(stream, state) {
        if (state.length === 0 && state.needDrain) {
          state.needDrain = false;
          stream.emit("drain");
        }
      }
      function clearBuffer(stream, state) {
        state.bufferProcessing = true;
        var entry = state.bufferedRequest;
        if (stream._writev && entry && entry.next) {
          var l = state.bufferedRequestCount;
          var buffer = new Array(l);
          var holder = state.corkedRequestsFree;
          holder.entry = entry;
          var count = 0;
          var allBuffers = true;
          while (entry) {
            buffer[count] = entry;
            if (!entry.isBuf) allBuffers = false;
            entry = entry.next;
            count += 1;
          }
          buffer.allBuffers = allBuffers;
          doWrite(stream, state, true, state.length, buffer, "", holder.finish);
          state.pendingcb++;
          state.lastBufferedRequest = null;
          if (holder.next) {
            state.corkedRequestsFree = holder.next;
            holder.next = null;
          } else {
            state.corkedRequestsFree = new CorkedRequest(state);
          }
          state.bufferedRequestCount = 0;
        } else {
          while (entry) {
            var chunk = entry.chunk;
            var encoding = entry.encoding;
            var cb = entry.callback;
            var len = state.objectMode ? 1 : chunk.length;
            doWrite(stream, state, false, len, chunk, encoding, cb);
            entry = entry.next;
            state.bufferedRequestCount--;
            if (state.writing) {
              break;
            }
          }
          if (entry === null) state.lastBufferedRequest = null;
        }
        state.bufferedRequest = entry;
        state.bufferProcessing = false;
      }
      Writable.prototype._write = function(chunk, encoding, cb) {
        cb(new Error("_write() is not implemented"));
      };
      Writable.prototype._writev = null;
      Writable.prototype.end = function(chunk, encoding, cb) {
        var state = this._writableState;
        if (typeof chunk === "function") {
          cb = chunk;
          chunk = null;
          encoding = null;
        } else if (typeof encoding === "function") {
          cb = encoding;
          encoding = null;
        }
        if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
        if (state.corked) {
          state.corked = 1;
          this.uncork();
        }
        if (!state.ending) endWritable(this, state, cb);
      };
      function needFinish(state) {
        return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
      }
      function callFinal(stream, state) {
        stream._final(function(err) {
          state.pendingcb--;
          if (err) {
            stream.emit("error", err);
          }
          state.prefinished = true;
          stream.emit("prefinish");
          finishMaybe(stream, state);
        });
      }
      function prefinish(stream, state) {
        if (!state.prefinished && !state.finalCalled) {
          if (typeof stream._final === "function") {
            state.pendingcb++;
            state.finalCalled = true;
            pna.nextTick(callFinal, stream, state);
          } else {
            state.prefinished = true;
            stream.emit("prefinish");
          }
        }
      }
      function finishMaybe(stream, state) {
        var need = needFinish(state);
        if (need) {
          prefinish(stream, state);
          if (state.pendingcb === 0) {
            state.finished = true;
            stream.emit("finish");
          }
        }
        return need;
      }
      function endWritable(stream, state, cb) {
        state.ending = true;
        finishMaybe(stream, state);
        if (cb) {
          if (state.finished) pna.nextTick(cb);
          else stream.once("finish", cb);
        }
        state.ended = true;
        stream.writable = false;
      }
      function onCorkedFinish(corkReq, state, err) {
        var entry = corkReq.entry;
        corkReq.entry = null;
        while (entry) {
          var cb = entry.callback;
          state.pendingcb--;
          cb(err);
          entry = entry.next;
        }
        state.corkedRequestsFree.next = corkReq;
      }
      Object.defineProperty(Writable.prototype, "destroyed", {
        get: function() {
          if (this._writableState === void 0) {
            return false;
          }
          return this._writableState.destroyed;
        },
        set: function(value) {
          if (!this._writableState) {
            return;
          }
          this._writableState.destroyed = value;
        }
      });
      Writable.prototype.destroy = destroyImpl.destroy;
      Writable.prototype._undestroy = destroyImpl.undestroy;
      Writable.prototype._destroy = function(err, cb) {
        this.end();
        cb(err);
      };
    }
  });

  // ../readable-stream/lib/_stream_duplex.js
  var require_stream_duplex2 = __commonJS({
    "../readable-stream/lib/_stream_duplex.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var pna = require_process_nextick_args();
      var objectKeys = Object.keys || function(obj) {
        var keys2 = [];
        for (var key in obj) {
          keys2.push(key);
        }
        return keys2;
      };
      module.exports = Duplex;
      var util = Object.create(require_util2());
      util.inherits = require_inherits_browser();
      var Readable = require_stream_readable2();
      var Writable = require_stream_writable2();
      util.inherits(Duplex, Readable);
      {
        keys = objectKeys(Writable.prototype);
        for (v = 0; v < keys.length; v++) {
          method = keys[v];
          if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
        }
      }
      var keys;
      var method;
      var v;
      function Duplex(options) {
        if (!(this instanceof Duplex)) return new Duplex(options);
        Readable.call(this, options);
        Writable.call(this, options);
        if (options && options.readable === false) this.readable = false;
        if (options && options.writable === false) this.writable = false;
        this.allowHalfOpen = true;
        if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
        this.once("end", onend);
      }
      Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function() {
          return this._writableState.highWaterMark;
        }
      });
      function onend() {
        if (this.allowHalfOpen || this._writableState.ended) return;
        pna.nextTick(onEndNT, this);
      }
      function onEndNT(self2) {
        self2.end();
      }
      Object.defineProperty(Duplex.prototype, "destroyed", {
        get: function() {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set: function(value) {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return;
          }
          this._readableState.destroyed = value;
          this._writableState.destroyed = value;
        }
      });
      Duplex.prototype._destroy = function(err, cb) {
        this.push(null);
        this.end();
        pna.nextTick(cb, err);
      };
    }
  });

  // ../readable-stream/lib/_stream_readable.js
  var require_stream_readable2 = __commonJS({
    "../readable-stream/lib/_stream_readable.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var pna = require_process_nextick_args();
      module.exports = Readable;
      var isArray = require_isarray2();
      var Duplex;
      Readable.ReadableState = ReadableState;
      var EE = require_events().EventEmitter;
      var EElistenerCount = function(emitter, type) {
        return emitter.listeners(type).length;
      };
      var Stream = require_stream_browser2();
      var Buffer3 = require_safe_buffer3().Buffer;
      var OurUint8Array = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
      };
      function _uint8ArrayToBuffer(chunk) {
        return Buffer3.from(chunk);
      }
      function _isUint8Array(obj) {
        return Buffer3.isBuffer(obj) || obj instanceof OurUint8Array;
      }
      var util = Object.create(require_util2());
      util.inherits = require_inherits_browser();
      var debugUtil = require_util();
      var debug = void 0;
      if (debugUtil && debugUtil.debuglog) {
        debug = debugUtil.debuglog("stream");
      } else {
        debug = function() {
        };
      }
      var BufferList = require_BufferList();
      var destroyImpl = require_destroy2();
      var StringDecoder;
      util.inherits(Readable, Stream);
      var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
      function prependListener(emitter, event, fn) {
        if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
        if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
        else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);
        else emitter._events[event] = [fn, emitter._events[event]];
      }
      function ReadableState(options, stream) {
        Duplex = Duplex || require_stream_duplex2();
        options = options || {};
        var isDuplex = stream instanceof Duplex;
        this.objectMode = !!options.objectMode;
        if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
        var hwm = options.highWaterMark;
        var readableHwm = options.readableHighWaterMark;
        var defaultHwm = this.objectMode ? 16 : 16 * 1024;
        if (hwm || hwm === 0) this.highWaterMark = hwm;
        else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;
        else this.highWaterMark = defaultHwm;
        this.highWaterMark = Math.floor(this.highWaterMark);
        this.buffer = new BufferList();
        this.length = 0;
        this.pipes = null;
        this.pipesCount = 0;
        this.flowing = null;
        this.ended = false;
        this.endEmitted = false;
        this.reading = false;
        this.sync = true;
        this.needReadable = false;
        this.emittedReadable = false;
        this.readableListening = false;
        this.resumeScheduled = false;
        this.destroyed = false;
        this.defaultEncoding = options.defaultEncoding || "utf8";
        this.awaitDrain = 0;
        this.readingMore = false;
        this.decoder = null;
        this.encoding = null;
        if (options.encoding) {
          if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
          this.decoder = new StringDecoder(options.encoding);
          this.encoding = options.encoding;
        }
      }
      function Readable(options) {
        Duplex = Duplex || require_stream_duplex2();
        if (!(this instanceof Readable)) return new Readable(options);
        this._readableState = new ReadableState(options, this);
        this.readable = true;
        if (options) {
          if (typeof options.read === "function") this._read = options.read;
          if (typeof options.destroy === "function") this._destroy = options.destroy;
        }
        Stream.call(this);
      }
      Object.defineProperty(Readable.prototype, "destroyed", {
        get: function() {
          if (this._readableState === void 0) {
            return false;
          }
          return this._readableState.destroyed;
        },
        set: function(value) {
          if (!this._readableState) {
            return;
          }
          this._readableState.destroyed = value;
        }
      });
      Readable.prototype.destroy = destroyImpl.destroy;
      Readable.prototype._undestroy = destroyImpl.undestroy;
      Readable.prototype._destroy = function(err, cb) {
        this.push(null);
        cb(err);
      };
      Readable.prototype.push = function(chunk, encoding) {
        var state = this._readableState;
        var skipChunkCheck;
        if (!state.objectMode) {
          if (typeof chunk === "string") {
            encoding = encoding || state.defaultEncoding;
            if (encoding !== state.encoding) {
              chunk = Buffer3.from(chunk, encoding);
              encoding = "";
            }
            skipChunkCheck = true;
          }
        } else {
          skipChunkCheck = true;
        }
        return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
      };
      Readable.prototype.unshift = function(chunk) {
        return readableAddChunk(this, chunk, null, true, false);
      };
      function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
        var state = stream._readableState;
        if (chunk === null) {
          state.reading = false;
          onEofChunk(stream, state);
        } else {
          var er;
          if (!skipChunkCheck) er = chunkInvalid(state, chunk);
          if (er) {
            stream.emit("error", er);
          } else if (state.objectMode || chunk && chunk.length > 0) {
            if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer3.prototype) {
              chunk = _uint8ArrayToBuffer(chunk);
            }
            if (addToFront) {
              if (state.endEmitted) stream.emit("error", new Error("stream.unshift() after end event"));
              else addChunk(stream, state, chunk, true);
            } else if (state.ended) {
              stream.emit("error", new Error("stream.push() after EOF"));
            } else {
              state.reading = false;
              if (state.decoder && !encoding) {
                chunk = state.decoder.write(chunk);
                if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
                else maybeReadMore(stream, state);
              } else {
                addChunk(stream, state, chunk, false);
              }
            }
          } else if (!addToFront) {
            state.reading = false;
          }
        }
        return needMoreData(state);
      }
      function addChunk(stream, state, chunk, addToFront) {
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit("data", chunk);
          stream.read(0);
        } else {
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);
          else state.buffer.push(chunk);
          if (state.needReadable) emitReadable(stream);
        }
        maybeReadMore(stream, state);
      }
      function chunkInvalid(state, chunk) {
        var er;
        if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
          er = new TypeError("Invalid non-string/buffer chunk");
        }
        return er;
      }
      function needMoreData(state) {
        return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
      }
      Readable.prototype.isPaused = function() {
        return this._readableState.flowing === false;
      };
      Readable.prototype.setEncoding = function(enc) {
        if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
        this._readableState.decoder = new StringDecoder(enc);
        this._readableState.encoding = enc;
        return this;
      };
      var MAX_HWM = 8388608;
      function computeNewHighWaterMark(n) {
        if (n >= MAX_HWM) {
          n = MAX_HWM;
        } else {
          n--;
          n |= n >>> 1;
          n |= n >>> 2;
          n |= n >>> 4;
          n |= n >>> 8;
          n |= n >>> 16;
          n++;
        }
        return n;
      }
      function howMuchToRead(n, state) {
        if (n <= 0 || state.length === 0 && state.ended) return 0;
        if (state.objectMode) return 1;
        if (n !== n) {
          if (state.flowing && state.length) return state.buffer.head.data.length;
          else return state.length;
        }
        if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
        if (n <= state.length) return n;
        if (!state.ended) {
          state.needReadable = true;
          return 0;
        }
        return state.length;
      }
      Readable.prototype.read = function(n) {
        debug("read", n);
        n = parseInt(n, 10);
        var state = this._readableState;
        var nOrig = n;
        if (n !== 0) state.emittedReadable = false;
        if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
          debug("read: emitReadable", state.length, state.ended);
          if (state.length === 0 && state.ended) endReadable(this);
          else emitReadable(this);
          return null;
        }
        n = howMuchToRead(n, state);
        if (n === 0 && state.ended) {
          if (state.length === 0) endReadable(this);
          return null;
        }
        var doRead = state.needReadable;
        debug("need readable", doRead);
        if (state.length === 0 || state.length - n < state.highWaterMark) {
          doRead = true;
          debug("length less than watermark", doRead);
        }
        if (state.ended || state.reading) {
          doRead = false;
          debug("reading or ended", doRead);
        } else if (doRead) {
          debug("do read");
          state.reading = true;
          state.sync = true;
          if (state.length === 0) state.needReadable = true;
          this._read(state.highWaterMark);
          state.sync = false;
          if (!state.reading) n = howMuchToRead(nOrig, state);
        }
        var ret;
        if (n > 0) ret = fromList(n, state);
        else ret = null;
        if (ret === null) {
          state.needReadable = true;
          n = 0;
        } else {
          state.length -= n;
        }
        if (state.length === 0) {
          if (!state.ended) state.needReadable = true;
          if (nOrig !== n && state.ended) endReadable(this);
        }
        if (ret !== null) this.emit("data", ret);
        return ret;
      };
      function onEofChunk(stream, state) {
        if (state.ended) return;
        if (state.decoder) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) {
            state.buffer.push(chunk);
            state.length += state.objectMode ? 1 : chunk.length;
          }
        }
        state.ended = true;
        emitReadable(stream);
      }
      function emitReadable(stream) {
        var state = stream._readableState;
        state.needReadable = false;
        if (!state.emittedReadable) {
          debug("emitReadable", state.flowing);
          state.emittedReadable = true;
          if (state.sync) pna.nextTick(emitReadable_, stream);
          else emitReadable_(stream);
        }
      }
      function emitReadable_(stream) {
        debug("emit readable");
        stream.emit("readable");
        flow(stream);
      }
      function maybeReadMore(stream, state) {
        if (!state.readingMore) {
          state.readingMore = true;
          pna.nextTick(maybeReadMore_, stream, state);
        }
      }
      function maybeReadMore_(stream, state) {
        var len = state.length;
        while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
          debug("maybeReadMore read 0");
          stream.read(0);
          if (len === state.length)
            break;
          else len = state.length;
        }
        state.readingMore = false;
      }
      Readable.prototype._read = function(n) {
        this.emit("error", new Error("_read() is not implemented"));
      };
      Readable.prototype.pipe = function(dest, pipeOpts) {
        var src = this;
        var state = this._readableState;
        switch (state.pipesCount) {
          case 0:
            state.pipes = dest;
            break;
          case 1:
            state.pipes = [state.pipes, dest];
            break;
          default:
            state.pipes.push(dest);
            break;
        }
        state.pipesCount += 1;
        debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
        var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== import_browser.default.stdout && dest !== import_browser.default.stderr;
        var endFn = doEnd ? onend : unpipe;
        if (state.endEmitted) pna.nextTick(endFn);
        else src.once("end", endFn);
        dest.on("unpipe", onunpipe);
        function onunpipe(readable, unpipeInfo) {
          debug("onunpipe");
          if (readable === src) {
            if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
              unpipeInfo.hasUnpiped = true;
              cleanup();
            }
          }
        }
        function onend() {
          debug("onend");
          dest.end();
        }
        var ondrain = pipeOnDrain(src);
        dest.on("drain", ondrain);
        var cleanedUp = false;
        function cleanup() {
          debug("cleanup");
          dest.removeListener("close", onclose);
          dest.removeListener("finish", onfinish);
          dest.removeListener("drain", ondrain);
          dest.removeListener("error", onerror);
          dest.removeListener("unpipe", onunpipe);
          src.removeListener("end", onend);
          src.removeListener("end", unpipe);
          src.removeListener("data", ondata);
          cleanedUp = true;
          if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
        }
        var increasedAwaitDrain = false;
        src.on("data", ondata);
        function ondata(chunk) {
          debug("ondata");
          increasedAwaitDrain = false;
          var ret = dest.write(chunk);
          if (false === ret && !increasedAwaitDrain) {
            if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
              debug("false write response, pause", state.awaitDrain);
              state.awaitDrain++;
              increasedAwaitDrain = true;
            }
            src.pause();
          }
        }
        function onerror(er) {
          debug("onerror", er);
          unpipe();
          dest.removeListener("error", onerror);
          if (EElistenerCount(dest, "error") === 0) dest.emit("error", er);
        }
        prependListener(dest, "error", onerror);
        function onclose() {
          dest.removeListener("finish", onfinish);
          unpipe();
        }
        dest.once("close", onclose);
        function onfinish() {
          debug("onfinish");
          dest.removeListener("close", onclose);
          unpipe();
        }
        dest.once("finish", onfinish);
        function unpipe() {
          debug("unpipe");
          src.unpipe(dest);
        }
        dest.emit("pipe", src);
        if (!state.flowing) {
          debug("pipe resume");
          src.resume();
        }
        return dest;
      };
      function pipeOnDrain(src) {
        return function() {
          var state = src._readableState;
          debug("pipeOnDrain", state.awaitDrain);
          if (state.awaitDrain) state.awaitDrain--;
          if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
            state.flowing = true;
            flow(src);
          }
        };
      }
      Readable.prototype.unpipe = function(dest) {
        var state = this._readableState;
        var unpipeInfo = { hasUnpiped: false };
        if (state.pipesCount === 0) return this;
        if (state.pipesCount === 1) {
          if (dest && dest !== state.pipes) return this;
          if (!dest) dest = state.pipes;
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;
          if (dest) dest.emit("unpipe", this, unpipeInfo);
          return this;
        }
        if (!dest) {
          var dests = state.pipes;
          var len = state.pipesCount;
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;
          for (var i = 0; i < len; i++) {
            dests[i].emit("unpipe", this, { hasUnpiped: false });
          }
          return this;
        }
        var index = indexOf(state.pipes, dest);
        if (index === -1) return this;
        state.pipes.splice(index, 1);
        state.pipesCount -= 1;
        if (state.pipesCount === 1) state.pipes = state.pipes[0];
        dest.emit("unpipe", this, unpipeInfo);
        return this;
      };
      Readable.prototype.on = function(ev, fn) {
        var res = Stream.prototype.on.call(this, ev, fn);
        if (ev === "data") {
          if (this._readableState.flowing !== false) this.resume();
        } else if (ev === "readable") {
          var state = this._readableState;
          if (!state.endEmitted && !state.readableListening) {
            state.readableListening = state.needReadable = true;
            state.emittedReadable = false;
            if (!state.reading) {
              pna.nextTick(nReadingNextTick, this);
            } else if (state.length) {
              emitReadable(this);
            }
          }
        }
        return res;
      };
      Readable.prototype.addListener = Readable.prototype.on;
      function nReadingNextTick(self2) {
        debug("readable nexttick read 0");
        self2.read(0);
      }
      Readable.prototype.resume = function() {
        var state = this._readableState;
        if (!state.flowing) {
          debug("resume");
          state.flowing = true;
          resume(this, state);
        }
        return this;
      };
      function resume(stream, state) {
        if (!state.resumeScheduled) {
          state.resumeScheduled = true;
          pna.nextTick(resume_, stream, state);
        }
      }
      function resume_(stream, state) {
        if (!state.reading) {
          debug("resume read 0");
          stream.read(0);
        }
        state.resumeScheduled = false;
        state.awaitDrain = 0;
        stream.emit("resume");
        flow(stream);
        if (state.flowing && !state.reading) stream.read(0);
      }
      Readable.prototype.pause = function() {
        debug("call pause flowing=%j", this._readableState.flowing);
        if (false !== this._readableState.flowing) {
          debug("pause");
          this._readableState.flowing = false;
          this.emit("pause");
        }
        return this;
      };
      function flow(stream) {
        var state = stream._readableState;
        debug("flow", state.flowing);
        while (state.flowing && stream.read() !== null) {
        }
      }
      Readable.prototype.wrap = function(stream) {
        var _this = this;
        var state = this._readableState;
        var paused = false;
        stream.on("end", function() {
          debug("wrapped end");
          if (state.decoder && !state.ended) {
            var chunk = state.decoder.end();
            if (chunk && chunk.length) _this.push(chunk);
          }
          _this.push(null);
        });
        stream.on("data", function(chunk) {
          debug("wrapped data");
          if (state.decoder) chunk = state.decoder.write(chunk);
          if (state.objectMode && (chunk === null || chunk === void 0)) return;
          else if (!state.objectMode && (!chunk || !chunk.length)) return;
          var ret = _this.push(chunk);
          if (!ret) {
            paused = true;
            stream.pause();
          }
        });
        for (var i in stream) {
          if (this[i] === void 0 && typeof stream[i] === "function") {
            this[i] = /* @__PURE__ */ (function(method) {
              return function() {
                return stream[method].apply(stream, arguments);
              };
            })(i);
          }
        }
        for (var n = 0; n < kProxyEvents.length; n++) {
          stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
        }
        this._read = function(n2) {
          debug("wrapped _read", n2);
          if (paused) {
            paused = false;
            stream.resume();
          }
        };
        return this;
      };
      Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function() {
          return this._readableState.highWaterMark;
        }
      });
      Readable._fromList = fromList;
      function fromList(n, state) {
        if (state.length === 0) return null;
        var ret;
        if (state.objectMode) ret = state.buffer.shift();
        else if (!n || n >= state.length) {
          if (state.decoder) ret = state.buffer.join("");
          else if (state.buffer.length === 1) ret = state.buffer.head.data;
          else ret = state.buffer.concat(state.length);
          state.buffer.clear();
        } else {
          ret = fromListPartial(n, state.buffer, state.decoder);
        }
        return ret;
      }
      function fromListPartial(n, list, hasStrings) {
        var ret;
        if (n < list.head.data.length) {
          ret = list.head.data.slice(0, n);
          list.head.data = list.head.data.slice(n);
        } else if (n === list.head.data.length) {
          ret = list.shift();
        } else {
          ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
        }
        return ret;
      }
      function copyFromBufferString(n, list) {
        var p = list.head;
        var c = 1;
        var ret = p.data;
        n -= ret.length;
        while (p = p.next) {
          var str = p.data;
          var nb = n > str.length ? str.length : n;
          if (nb === str.length) ret += str;
          else ret += str.slice(0, n);
          n -= nb;
          if (n === 0) {
            if (nb === str.length) {
              ++c;
              if (p.next) list.head = p.next;
              else list.head = list.tail = null;
            } else {
              list.head = p;
              p.data = str.slice(nb);
            }
            break;
          }
          ++c;
        }
        list.length -= c;
        return ret;
      }
      function copyFromBuffer(n, list) {
        var ret = Buffer3.allocUnsafe(n);
        var p = list.head;
        var c = 1;
        p.data.copy(ret);
        n -= p.data.length;
        while (p = p.next) {
          var buf = p.data;
          var nb = n > buf.length ? buf.length : n;
          buf.copy(ret, ret.length - n, 0, nb);
          n -= nb;
          if (n === 0) {
            if (nb === buf.length) {
              ++c;
              if (p.next) list.head = p.next;
              else list.head = list.tail = null;
            } else {
              list.head = p;
              p.data = buf.slice(nb);
            }
            break;
          }
          ++c;
        }
        list.length -= c;
        return ret;
      }
      function endReadable(stream) {
        var state = stream._readableState;
        if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
        if (!state.endEmitted) {
          state.ended = true;
          pna.nextTick(endReadableNT, state, stream);
        }
      }
      function endReadableNT(state, stream) {
        if (!state.endEmitted && state.length === 0) {
          state.endEmitted = true;
          stream.readable = false;
          stream.emit("end");
        }
      }
      function indexOf(xs, x) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x) return i;
        }
        return -1;
      }
    }
  });

  // ../readable-stream/lib/_stream_transform.js
  var require_stream_transform2 = __commonJS({
    "../readable-stream/lib/_stream_transform.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = Transform;
      var Duplex = require_stream_duplex2();
      var util = Object.create(require_util2());
      util.inherits = require_inherits_browser();
      util.inherits(Transform, Duplex);
      function afterTransform(er, data) {
        var ts = this._transformState;
        ts.transforming = false;
        var cb = ts.writecb;
        if (!cb) {
          return this.emit("error", new Error("write callback called multiple times"));
        }
        ts.writechunk = null;
        ts.writecb = null;
        if (data != null)
          this.push(data);
        cb(er);
        var rs = this._readableState;
        rs.reading = false;
        if (rs.needReadable || rs.length < rs.highWaterMark) {
          this._read(rs.highWaterMark);
        }
      }
      function Transform(options) {
        if (!(this instanceof Transform)) return new Transform(options);
        Duplex.call(this, options);
        this._transformState = {
          afterTransform: afterTransform.bind(this),
          needTransform: false,
          transforming: false,
          writecb: null,
          writechunk: null,
          writeencoding: null
        };
        this._readableState.needReadable = true;
        this._readableState.sync = false;
        if (options) {
          if (typeof options.transform === "function") this._transform = options.transform;
          if (typeof options.flush === "function") this._flush = options.flush;
        }
        this.on("prefinish", prefinish);
      }
      function prefinish() {
        var _this = this;
        if (typeof this._flush === "function") {
          this._flush(function(er, data) {
            done(_this, er, data);
          });
        } else {
          done(this, null, null);
        }
      }
      Transform.prototype.push = function(chunk, encoding) {
        this._transformState.needTransform = false;
        return Duplex.prototype.push.call(this, chunk, encoding);
      };
      Transform.prototype._transform = function(chunk, encoding, cb) {
        throw new Error("_transform() is not implemented");
      };
      Transform.prototype._write = function(chunk, encoding, cb) {
        var ts = this._transformState;
        ts.writecb = cb;
        ts.writechunk = chunk;
        ts.writeencoding = encoding;
        if (!ts.transforming) {
          var rs = this._readableState;
          if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
        }
      };
      Transform.prototype._read = function(n) {
        var ts = this._transformState;
        if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
          ts.transforming = true;
          this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
        } else {
          ts.needTransform = true;
        }
      };
      Transform.prototype._destroy = function(err, cb) {
        var _this2 = this;
        Duplex.prototype._destroy.call(this, err, function(err2) {
          cb(err2);
          _this2.emit("close");
        });
      };
      function done(stream, er, data) {
        if (er) return stream.emit("error", er);
        if (data != null)
          stream.push(data);
        if (stream._writableState.length) throw new Error("Calling transform done when ws.length != 0");
        if (stream._transformState.transforming) throw new Error("Calling transform done when still transforming");
        return stream.push(null);
      }
    }
  });

  // ../readable-stream/lib/_stream_passthrough.js
  var require_stream_passthrough2 = __commonJS({
    "../readable-stream/lib/_stream_passthrough.js"(exports, module) {
      "use strict";
      init_browser_globals();
      module.exports = PassThrough;
      var Transform = require_stream_transform2();
      var util = Object.create(require_util2());
      util.inherits = require_inherits_browser();
      util.inherits(PassThrough, Transform);
      function PassThrough(options) {
        if (!(this instanceof PassThrough)) return new PassThrough(options);
        Transform.call(this, options);
      }
      PassThrough.prototype._transform = function(chunk, encoding, cb) {
        cb(null, chunk);
      };
    }
  });

  // ../readable-stream/readable-browser.js
  var require_readable_browser = __commonJS({
    "../readable-stream/readable-browser.js"(exports, module) {
      init_browser_globals();
      exports = module.exports = require_stream_readable2();
      exports.Stream = exports;
      exports.Readable = exports;
      exports.Writable = require_stream_writable2();
      exports.Duplex = require_stream_duplex2();
      exports.Transform = require_stream_transform2();
      exports.PassThrough = require_stream_passthrough2();
    }
  });

  // ../hash-base/index.js
  var require_hash_base = __commonJS({
    "../hash-base/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      var toBuffer = require_to_buffer2();
      var Transform = require_readable_browser().Transform;
      var inherits = require_inherits_browser();
      function HashBase(blockSize) {
        Transform.call(this);
        this._block = Buffer3.allocUnsafe(blockSize);
        this._blockSize = blockSize;
        this._blockOffset = 0;
        this._length = [0, 0, 0, 0];
        this._finalized = false;
      }
      inherits(HashBase, Transform);
      HashBase.prototype._transform = function(chunk, encoding, callback) {
        var error = null;
        try {
          this.update(chunk, encoding);
        } catch (err) {
          error = err;
        }
        callback(error);
      };
      HashBase.prototype._flush = function(callback) {
        var error = null;
        try {
          this.push(this.digest());
        } catch (err) {
          error = err;
        }
        callback(error);
      };
      HashBase.prototype.update = function(data, encoding) {
        if (this._finalized) {
          throw new Error("Digest already called");
        }
        var dataBuffer = toBuffer(data, encoding);
        var block = this._block;
        var offset = 0;
        while (this._blockOffset + dataBuffer.length - offset >= this._blockSize) {
          for (var i = this._blockOffset; i < this._blockSize; ) {
            block[i] = dataBuffer[offset];
            i += 1;
            offset += 1;
          }
          this._update();
          this._blockOffset = 0;
        }
        while (offset < dataBuffer.length) {
          block[this._blockOffset] = dataBuffer[offset];
          this._blockOffset += 1;
          offset += 1;
        }
        for (var j = 0, carry = dataBuffer.length * 8; carry > 0; ++j) {
          this._length[j] += carry;
          carry = this._length[j] / 4294967296 | 0;
          if (carry > 0) {
            this._length[j] -= 4294967296 * carry;
          }
        }
        return this;
      };
      HashBase.prototype._update = function() {
        throw new Error("_update is not implemented");
      };
      HashBase.prototype.digest = function(encoding) {
        if (this._finalized) {
          throw new Error("Digest already called");
        }
        this._finalized = true;
        var digest = this._digest();
        if (encoding !== void 0) {
          digest = digest.toString(encoding);
        }
        this._block.fill(0);
        this._blockOffset = 0;
        for (var i = 0; i < 4; ++i) {
          this._length[i] = 0;
        }
        return digest;
      };
      HashBase.prototype._digest = function() {
        throw new Error("_digest is not implemented");
      };
      module.exports = HashBase;
    }
  });

  // ../md5.js/index.js
  var require_md5 = __commonJS({
    "../md5.js/index.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var inherits = require_inherits_browser();
      var HashBase = require_hash_base();
      var Buffer3 = require_safe_buffer().Buffer;
      var ARRAY16 = new Array(16);
      function MD5() {
        HashBase.call(this, 64);
        this._a = 1732584193;
        this._b = 4023233417;
        this._c = 2562383102;
        this._d = 271733878;
      }
      inherits(MD5, HashBase);
      MD5.prototype._update = function() {
        var M = ARRAY16;
        for (var i = 0; i < 16; ++i) M[i] = this._block.readInt32LE(i * 4);
        var a = this._a;
        var b = this._b;
        var c = this._c;
        var d = this._d;
        a = fnF(a, b, c, d, M[0], 3614090360, 7);
        d = fnF(d, a, b, c, M[1], 3905402710, 12);
        c = fnF(c, d, a, b, M[2], 606105819, 17);
        b = fnF(b, c, d, a, M[3], 3250441966, 22);
        a = fnF(a, b, c, d, M[4], 4118548399, 7);
        d = fnF(d, a, b, c, M[5], 1200080426, 12);
        c = fnF(c, d, a, b, M[6], 2821735955, 17);
        b = fnF(b, c, d, a, M[7], 4249261313, 22);
        a = fnF(a, b, c, d, M[8], 1770035416, 7);
        d = fnF(d, a, b, c, M[9], 2336552879, 12);
        c = fnF(c, d, a, b, M[10], 4294925233, 17);
        b = fnF(b, c, d, a, M[11], 2304563134, 22);
        a = fnF(a, b, c, d, M[12], 1804603682, 7);
        d = fnF(d, a, b, c, M[13], 4254626195, 12);
        c = fnF(c, d, a, b, M[14], 2792965006, 17);
        b = fnF(b, c, d, a, M[15], 1236535329, 22);
        a = fnG(a, b, c, d, M[1], 4129170786, 5);
        d = fnG(d, a, b, c, M[6], 3225465664, 9);
        c = fnG(c, d, a, b, M[11], 643717713, 14);
        b = fnG(b, c, d, a, M[0], 3921069994, 20);
        a = fnG(a, b, c, d, M[5], 3593408605, 5);
        d = fnG(d, a, b, c, M[10], 38016083, 9);
        c = fnG(c, d, a, b, M[15], 3634488961, 14);
        b = fnG(b, c, d, a, M[4], 3889429448, 20);
        a = fnG(a, b, c, d, M[9], 568446438, 5);
        d = fnG(d, a, b, c, M[14], 3275163606, 9);
        c = fnG(c, d, a, b, M[3], 4107603335, 14);
        b = fnG(b, c, d, a, M[8], 1163531501, 20);
        a = fnG(a, b, c, d, M[13], 2850285829, 5);
        d = fnG(d, a, b, c, M[2], 4243563512, 9);
        c = fnG(c, d, a, b, M[7], 1735328473, 14);
        b = fnG(b, c, d, a, M[12], 2368359562, 20);
        a = fnH(a, b, c, d, M[5], 4294588738, 4);
        d = fnH(d, a, b, c, M[8], 2272392833, 11);
        c = fnH(c, d, a, b, M[11], 1839030562, 16);
        b = fnH(b, c, d, a, M[14], 4259657740, 23);
        a = fnH(a, b, c, d, M[1], 2763975236, 4);
        d = fnH(d, a, b, c, M[4], 1272893353, 11);
        c = fnH(c, d, a, b, M[7], 4139469664, 16);
        b = fnH(b, c, d, a, M[10], 3200236656, 23);
        a = fnH(a, b, c, d, M[13], 681279174, 4);
        d = fnH(d, a, b, c, M[0], 3936430074, 11);
        c = fnH(c, d, a, b, M[3], 3572445317, 16);
        b = fnH(b, c, d, a, M[6], 76029189, 23);
        a = fnH(a, b, c, d, M[9], 3654602809, 4);
        d = fnH(d, a, b, c, M[12], 3873151461, 11);
        c = fnH(c, d, a, b, M[15], 530742520, 16);
        b = fnH(b, c, d, a, M[2], 3299628645, 23);
        a = fnI(a, b, c, d, M[0], 4096336452, 6);
        d = fnI(d, a, b, c, M[7], 1126891415, 10);
        c = fnI(c, d, a, b, M[14], 2878612391, 15);
        b = fnI(b, c, d, a, M[5], 4237533241, 21);
        a = fnI(a, b, c, d, M[12], 1700485571, 6);
        d = fnI(d, a, b, c, M[3], 2399980690, 10);
        c = fnI(c, d, a, b, M[10], 4293915773, 15);
        b = fnI(b, c, d, a, M[1], 2240044497, 21);
        a = fnI(a, b, c, d, M[8], 1873313359, 6);
        d = fnI(d, a, b, c, M[15], 4264355552, 10);
        c = fnI(c, d, a, b, M[6], 2734768916, 15);
        b = fnI(b, c, d, a, M[13], 1309151649, 21);
        a = fnI(a, b, c, d, M[4], 4149444226, 6);
        d = fnI(d, a, b, c, M[11], 3174756917, 10);
        c = fnI(c, d, a, b, M[2], 718787259, 15);
        b = fnI(b, c, d, a, M[9], 3951481745, 21);
        this._a = this._a + a | 0;
        this._b = this._b + b | 0;
        this._c = this._c + c | 0;
        this._d = this._d + d | 0;
      };
      MD5.prototype._digest = function() {
        this._block[this._blockOffset++] = 128;
        if (this._blockOffset > 56) {
          this._block.fill(0, this._blockOffset, 64);
          this._update();
          this._blockOffset = 0;
        }
        this._block.fill(0, this._blockOffset, 56);
        this._block.writeUInt32LE(this._length[0], 56);
        this._block.writeUInt32LE(this._length[1], 60);
        this._update();
        var buffer = Buffer3.allocUnsafe(16);
        buffer.writeInt32LE(this._a, 0);
        buffer.writeInt32LE(this._b, 4);
        buffer.writeInt32LE(this._c, 8);
        buffer.writeInt32LE(this._d, 12);
        return buffer;
      };
      function rotl(x, n) {
        return x << n | x >>> 32 - n;
      }
      function fnF(a, b, c, d, m, k, s) {
        return rotl(a + (b & c | ~b & d) + m + k | 0, s) + b | 0;
      }
      function fnG(a, b, c, d, m, k, s) {
        return rotl(a + (b & d | c & ~d) + m + k | 0, s) + b | 0;
      }
      function fnH(a, b, c, d, m, k, s) {
        return rotl(a + (b ^ c ^ d) + m + k | 0, s) + b | 0;
      }
      function fnI(a, b, c, d, m, k, s) {
        return rotl(a + (c ^ (b | ~d)) + m + k | 0, s) + b | 0;
      }
      module.exports = MD5;
    }
  });

  // ../evp_bytestokey/index.js
  var require_evp_bytestokey = __commonJS({
    "../evp_bytestokey/index.js"(exports, module) {
      init_browser_globals();
      var Buffer3 = require_safe_buffer().Buffer;
      var MD5 = require_md5();
      function EVP_BytesToKey(password, salt, keyBits, ivLen) {
        if (!Buffer3.isBuffer(password)) password = Buffer3.from(password, "binary");
        if (salt) {
          if (!Buffer3.isBuffer(salt)) salt = Buffer3.from(salt, "binary");
          if (salt.length !== 8) throw new RangeError("salt should be Buffer with 8 byte length");
        }
        var keyLen = keyBits / 8;
        var key = Buffer3.alloc(keyLen);
        var iv = Buffer3.alloc(ivLen || 0);
        var tmp = Buffer3.alloc(0);
        while (keyLen > 0 || ivLen > 0) {
          var hash = new MD5();
          hash.update(tmp);
          hash.update(password);
          if (salt) hash.update(salt);
          tmp = hash.digest();
          var used = 0;
          if (keyLen > 0) {
            var keyStart = key.length - keyLen;
            used = Math.min(keyLen, tmp.length);
            tmp.copy(key, keyStart, 0, used);
            keyLen -= used;
          }
          if (used < tmp.length && ivLen > 0) {
            var ivStart = iv.length - ivLen;
            var length = Math.min(ivLen, tmp.length - used);
            tmp.copy(iv, ivStart, used, used + length);
            ivLen -= length;
          }
        }
        tmp.fill(0);
        return { key, iv };
      }
      module.exports = EVP_BytesToKey;
    }
  });

  // ../browserify-aes/encrypter.js
  var require_encrypter = __commonJS({
    "../browserify-aes/encrypter.js"(exports) {
      init_browser_globals();
      var MODES = require_modes();
      var AuthCipher = require_authCipher();
      var Buffer3 = require_safe_buffer().Buffer;
      var StreamCipher = require_streamCipher();
      var Transform = require_cipher_base();
      var aes = require_aes();
      var ebtk = require_evp_bytestokey();
      var inherits = require_inherits_browser();
      function Cipher(mode, key, iv) {
        Transform.call(this);
        this._cache = new Splitter();
        this._cipher = new aes.AES(key);
        this._prev = Buffer3.from(iv);
        this._mode = mode;
        this._autopadding = true;
      }
      inherits(Cipher, Transform);
      Cipher.prototype._update = function(data) {
        this._cache.add(data);
        var chunk;
        var thing;
        var out = [];
        while (chunk = this._cache.get()) {
          thing = this._mode.encrypt(this, chunk);
          out.push(thing);
        }
        return Buffer3.concat(out);
      };
      var PADDING = Buffer3.alloc(16, 16);
      Cipher.prototype._final = function() {
        var chunk = this._cache.flush();
        if (this._autopadding) {
          chunk = this._mode.encrypt(this, chunk);
          this._cipher.scrub();
          return chunk;
        }
        if (!chunk.equals(PADDING)) {
          this._cipher.scrub();
          throw new Error("data not multiple of block length");
        }
      };
      Cipher.prototype.setAutoPadding = function(setTo) {
        this._autopadding = !!setTo;
        return this;
      };
      function Splitter() {
        this.cache = Buffer3.allocUnsafe(0);
      }
      Splitter.prototype.add = function(data) {
        this.cache = Buffer3.concat([this.cache, data]);
      };
      Splitter.prototype.get = function() {
        if (this.cache.length > 15) {
          var out = this.cache.slice(0, 16);
          this.cache = this.cache.slice(16);
          return out;
        }
        return null;
      };
      Splitter.prototype.flush = function() {
        var len = 16 - this.cache.length;
        var padBuff = Buffer3.allocUnsafe(len);
        var i = -1;
        while (++i < len) {
          padBuff.writeUInt8(len, i);
        }
        return Buffer3.concat([this.cache, padBuff]);
      };
      function createCipheriv(suite, password, iv) {
        var config = MODES[suite.toLowerCase()];
        if (!config) throw new TypeError("invalid suite type");
        if (typeof password === "string") password = Buffer3.from(password);
        if (password.length !== config.key / 8) throw new TypeError("invalid key length " + password.length);
        if (typeof iv === "string") iv = Buffer3.from(iv);
        if (config.mode !== "GCM" && iv.length !== config.iv) throw new TypeError("invalid iv length " + iv.length);
        if (config.type === "stream") {
          return new StreamCipher(config.module, password, iv);
        } else if (config.type === "auth") {
          return new AuthCipher(config.module, password, iv);
        }
        return new Cipher(config.module, password, iv);
      }
      function createCipher(suite, password) {
        var config = MODES[suite.toLowerCase()];
        if (!config) throw new TypeError("invalid suite type");
        var keys = ebtk(password, false, config.key, config.iv);
        return createCipheriv(suite, keys.key, keys.iv);
      }
      exports.createCipheriv = createCipheriv;
      exports.createCipher = createCipher;
    }
  });

  // ../browserify-aes/decrypter.js
  var require_decrypter = __commonJS({
    "../browserify-aes/decrypter.js"(exports) {
      init_browser_globals();
      var AuthCipher = require_authCipher();
      var Buffer3 = require_safe_buffer().Buffer;
      var MODES = require_modes();
      var StreamCipher = require_streamCipher();
      var Transform = require_cipher_base();
      var aes = require_aes();
      var ebtk = require_evp_bytestokey();
      var inherits = require_inherits_browser();
      function Decipher(mode, key, iv) {
        Transform.call(this);
        this._cache = new Splitter();
        this._last = void 0;
        this._cipher = new aes.AES(key);
        this._prev = Buffer3.from(iv);
        this._mode = mode;
        this._autopadding = true;
      }
      inherits(Decipher, Transform);
      Decipher.prototype._update = function(data) {
        this._cache.add(data);
        var chunk;
        var thing;
        var out = [];
        while (chunk = this._cache.get(this._autopadding)) {
          thing = this._mode.decrypt(this, chunk);
          out.push(thing);
        }
        return Buffer3.concat(out);
      };
      Decipher.prototype._final = function() {
        var chunk = this._cache.flush();
        if (this._autopadding) {
          return unpad(this._mode.decrypt(this, chunk));
        } else if (chunk) {
          throw new Error("data not multiple of block length");
        }
      };
      Decipher.prototype.setAutoPadding = function(setTo) {
        this._autopadding = !!setTo;
        return this;
      };
      function Splitter() {
        this.cache = Buffer3.allocUnsafe(0);
      }
      Splitter.prototype.add = function(data) {
        this.cache = Buffer3.concat([this.cache, data]);
      };
      Splitter.prototype.get = function(autoPadding) {
        var out;
        if (autoPadding) {
          if (this.cache.length > 16) {
            out = this.cache.slice(0, 16);
            this.cache = this.cache.slice(16);
            return out;
          }
        } else {
          if (this.cache.length >= 16) {
            out = this.cache.slice(0, 16);
            this.cache = this.cache.slice(16);
            return out;
          }
        }
        return null;
      };
      Splitter.prototype.flush = function() {
        if (this.cache.length) return this.cache;
      };
      function unpad(last) {
        var padded = last[15];
        if (padded < 1 || padded > 16) {
          throw new Error("unable to decrypt data");
        }
        var i = -1;
        while (++i < padded) {
          if (last[i + (16 - padded)] !== padded) {
            throw new Error("unable to decrypt data");
          }
        }
        if (padded === 16) return;
        return last.slice(0, 16 - padded);
      }
      function createDecipheriv(suite, password, iv) {
        var config = MODES[suite.toLowerCase()];
        if (!config) throw new TypeError("invalid suite type");
        if (typeof iv === "string") iv = Buffer3.from(iv);
        if (config.mode !== "GCM" && iv.length !== config.iv) throw new TypeError("invalid iv length " + iv.length);
        if (typeof password === "string") password = Buffer3.from(password);
        if (password.length !== config.key / 8) throw new TypeError("invalid key length " + password.length);
        if (config.type === "stream") {
          return new StreamCipher(config.module, password, iv, true);
        } else if (config.type === "auth") {
          return new AuthCipher(config.module, password, iv, true);
        }
        return new Decipher(config.module, password, iv);
      }
      function createDecipher(suite, password) {
        var config = MODES[suite.toLowerCase()];
        if (!config) throw new TypeError("invalid suite type");
        var keys = ebtk(password, false, config.key, config.iv);
        return createDecipheriv(suite, keys.key, keys.iv);
      }
      exports.createDecipher = createDecipher;
      exports.createDecipheriv = createDecipheriv;
    }
  });

  // ../browserify-aes/browser.js
  var require_browser3 = __commonJS({
    "../browserify-aes/browser.js"(exports) {
      init_browser_globals();
      var ciphers = require_encrypter();
      var deciphers = require_decrypter();
      var modes = require_list();
      function getCiphers() {
        return Object.keys(modes);
      }
      exports.createCipher = exports.Cipher = ciphers.createCipher;
      exports.createCipheriv = exports.Cipheriv = ciphers.createCipheriv;
      exports.createDecipher = exports.Decipher = deciphers.createDecipher;
      exports.createDecipheriv = exports.Decipheriv = deciphers.createDecipheriv;
      exports.listCiphers = exports.getCiphers = getCiphers;
    }
  });

  // ../randombytes/browser.js
  var require_browser4 = __commonJS({
    "../randombytes/browser.js"(exports, module) {
      "use strict";
      init_browser_globals();
      var MAX_BYTES = 65536;
      var MAX_UINT32 = 4294967295;
      function oldBrowser() {
        throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11");
      }
      var Buffer3 = require_safe_buffer().Buffer;
      var crypto = globalThis.crypto || globalThis.msCrypto;
      if (crypto && crypto.getRandomValues) {
        module.exports = randomBytes;
      } else {
        module.exports = oldBrowser;
      }
      function randomBytes(size, cb) {
        if (size > MAX_UINT32) throw new RangeError("requested too many random bytes");
        var bytes = Buffer3.allocUnsafe(size);
        if (size > 0) {
          if (size > MAX_BYTES) {
            for (var generated = 0; generated < size; generated += MAX_BYTES) {
              crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
            }
          } else {
            crypto.getRandomValues(bytes);
          }
        }
        if (typeof cb === "function") {
          return import_browser.default.nextTick(function() {
            cb(null, bytes);
          });
        }
        return bytes;
      }
    }
  });

  // dist/Common.js
  var require_Common = __commonJS({
    "dist/Common.js"(exports) {
      "use strict";
      init_browser_globals();
      var _a;
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CommonSymEnc = void 0;
      var scrypt_js_1 = require_scrypt();
      var { createCipheriv, createDecipheriv } = require_browser3();
      var randomBytes = require_browser4();
      var CommonSymEnc = class {
        static RandomKey() {
          return this.RandomBytesGenerator(32);
        }
        static RandomNonce() {
          return this.RandomBytesGenerator(12);
        }
        static DeriveKey(password, saltHex, params = this.KdfParams) {
          if (!password || typeof password !== "string" || !/^[0-9a-f]{32,128}$/i.test(saltHex))
            throw new Error("Invalid cryptographic input");
          const normalized = import_buffer.Buffer.from(password.normalize("NFKC"));
          return import_buffer.Buffer.from((0, scrypt_js_1.syncScrypt)(normalized, import_buffer.Buffer.from(saltHex, "hex"), params.N, params.r, params.p, 32));
        }
        static EncryptAead(key, plainText, aad) {
          if (key.length !== 32)
            throw new Error("Invalid cryptographic input");
          const nonce = this.RandomNonce();
          const cipher = createCipheriv("aes-256-gcm", key, nonce);
          if (aad !== void 0)
            cipher.setAAD(import_buffer.Buffer.from(aad, "utf8"));
          const ciphertext = import_buffer.Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
          return { v: 2, alg: "A256GCM", nonce: nonce.toString("hex"), ciphertext: ciphertext.toString("hex"), tag: cipher.getAuthTag().toString("hex") };
        }
        static DecryptAead(key, envelope, aad) {
          try {
            if (key.length !== 32 || envelope.v !== 2 || envelope.alg !== "A256GCM" || !/^[\da-f]{24}$/i.test(envelope.nonce) || !/^[\da-f]*$/i.test(envelope.ciphertext) || !/^[\da-f]{32}$/i.test(envelope.tag))
              throw new Error();
            const dec = createDecipheriv("aes-256-gcm", key, import_buffer.Buffer.from(envelope.nonce, "hex"));
            if (aad !== void 0)
              dec.setAAD(import_buffer.Buffer.from(aad, "utf8"));
            dec.setAuthTag(import_buffer.Buffer.from(envelope.tag, "hex"));
            return import_buffer.Buffer.concat([dec.update(import_buffer.Buffer.from(envelope.ciphertext, "hex")), dec.final()]).toString("utf8");
          } catch (_) {
            throw new Error("Decryption failed");
          }
        }
        static EncryptWithPassword(password, saltHex, plainText) {
          const envelope = this.EncryptAead(this.DeriveKey(password, saltHex), plainText, "CryptPass:v2");
          return JSON.stringify(envelope);
        }
        static DecryptWithPassword(password, saltHex, cipherText, params = this.KdfParams) {
          try {
            return this.DecryptAead(this.DeriveKey(password, saltHex, params), JSON.parse(cipherText), "CryptPass:v2");
          } catch (_) {
            throw new Error("Decryption failed");
          }
        }
        static LegacyGetEncKey(password, salt) {
          const d = this.legacyScrypt(password, salt, 48).toString("hex").slice(0, 48);
          return { key: d.substring(0, 32), iv: d.substring(32, 16) };
        }
        static legacyScrypt(password, salt, len) {
          return import_buffer.Buffer.from((0, scrypt_js_1.syncScrypt)(import_buffer.Buffer.from(password.normalize("NFKC")), import_buffer.Buffer.from(salt.normalize("NFKC")), 16384, 8, 1, len));
        }
        static LegacyDecryptByPassword(password, salt, cipherText) {
          try {
            const k = this.LegacyGetEncKey(password, salt);
            const d = createDecipheriv("aes-256-cbc", k.key, k.iv);
            return d.update(cipherText, "hex", "utf8") + d.final("utf8");
          } catch (_) {
            throw new Error("Decryption failed");
          }
        }
        static LegacyDecrypt(key, iv, cipherText) {
          try {
            const d = createDecipheriv("aes-256-cbc", key, iv);
            return d.update(cipherText, "hex", "utf8") + d.final("utf8");
          } catch (_) {
            throw new Error("Decryption failed");
          }
        }
        static GenerateSalt() {
          return this.RandomBytesGenerator(16).toString("hex");
        }
        static GenerateIV() {
          return this.RandomBytesGenerator(12).toString("hex");
        }
        static GenerateRandomKey() {
          return this.RandomKey().toString("hex");
        }
      };
      exports.CommonSymEnc = CommonSymEnc;
      _a = CommonSymEnc;
      CommonSymEnc._EncAlg = "aes-256-cbc";
      CommonSymEnc._SymKeyLen = 48;
      CommonSymEnc.KdfParams = { N: 65536, r: 8, p: 1 };
      CommonSymEnc.RandomBytesGenerator = (n) => randomBytes(n);
      CommonSymEnc.Scrypt = (Password, Salt, KeyLen) => {
        const password = import_buffer.Buffer.from(Password.normalize("NFKC"));
        const salt = import_buffer.Buffer.from(Salt.normalize("NFKC"));
        const p = _a.KdfParams;
        return import_buffer.Buffer.from((0, scrypt_js_1.syncScrypt)(password, salt, p.N, p.r, p.p, KeyLen));
      };
    }
  });

  // dist/EntriesManage.js
  var require_EntriesManage = __commonJS({
    "dist/EntriesManage.js"(exports) {
      "use strict";
      init_browser_globals();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.EntriesManage = void 0;
      var EntriesManage = class {
        constructor(entries) {
          this._entries = entries;
        }
        set Entries(entries) {
          this._entries = entries;
        }
        GetEntryNames() {
          let Names = new Array();
          for (let N in this._entries)
            Names.push(N);
          return Names;
        }
        GetEntry(Name) {
          const entry = this._entries[Name];
          if (entry !== void 0 && entry !== null) {
            entry.Name = Name;
            entry.Date = new Date(entry.DateStr);
            return entry;
          }
          return false;
        }
        UpdateEntryName(Name, NewName) {
          const entry = this.GetEntry(Name);
          if (entry !== false && this.GetEntry(NewName) === false) {
            this._entries[NewName] = entry;
            delete this._entries[Name];
            return true;
          }
          return false;
        }
        UpdateEntry(Value) {
          if (Value.Name !== void 0) {
            const name = Value.Name;
            delete Value.Name;
            const entry = this.GetEntry(name);
            if (entry !== false) {
              Value.DateStr = (/* @__PURE__ */ new Date()).toISOString();
              this._entries[name] = Value;
              return true;
            }
            return false;
          }
          return false;
        }
        DeleteEntry(Name) {
          const entry = this.GetEntry(Name);
          if (entry !== false) {
            delete this._entries[Name];
            return true;
          }
          return false;
        }
        AddEntry(Value) {
          if (Value.Name !== void 0) {
            const name = Value.Name;
            delete Value.Name;
            const entry = this.GetEntry(name);
            if (entry === false) {
              Value.DateStr = (/* @__PURE__ */ new Date()).toISOString();
              this._entries[name] = Value;
              return true;
            }
            return false;
          }
          return false;
        }
        Export() {
          return this._entries;
        }
      };
      exports.EntriesManage = EntriesManage;
    }
  });

  // dist/KeyPassManage.js
  var require_KeyPassManage = __commonJS({
    "dist/KeyPassManage.js"(exports) {
      "use strict";
      init_browser_globals();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.KeyPassManage = void 0;
      var Common_1 = require_Common();
      var EntriesManage_1 = require_EntriesManage();
      var KeyPassManage = class {
        constructor(keypass, seqManage) {
          this._KeyPass = keypass;
          this._SeqManage = seqManage;
          this._EntriesManage = new EntriesManage_1.EntriesManage({});
        }
        get LastChange() {
          return this._KeyPass.LastChange;
        }
        InitializeKey(password_1) {
          return __awaiter(this, arguments, void 0, function* (password, InitializeSeq = false) {
            if (!password)
              return false;
            if (InitializeSeq && !(yield this._SeqManage.Initialize()))
              return false;
            const prev = { salt: this._KeyPass.Salt, chunks: this._KeyPass.MasterKChunks, version: this._KeyPass.FormatVersion, kdf: this._KeyPass.Kdf, entries: this._KeyPass.GetEntries() };
            try {
              const salt = Common_1.CommonSymEnc.GenerateSalt();
              const key = Common_1.CommonSymEnc.GenerateRandomKey();
              const encEntries = Common_1.CommonSymEnc.EncryptAead(import_buffer.Buffer.from(key, "hex"), JSON.stringify({}), "CryptPass:entries:v2");
              const chunks = this.Chunk(this.EncryptMaster(password, salt, key));
              this._KeyPass.Salt = salt;
              this._KeyPass.FormatVersion = 2;
              this._KeyPass.Kdf = Object.assign({ name: "scrypt" }, Common_1.CommonSymEnc.KdfParams);
              this._KeyPass.MasterKChunks = chunks;
              this._KeyPass.LastChange = /* @__PURE__ */ new Date();
              yield this._KeyPass.SetEntries(JSON.stringify(encEntries));
              if (yield this._KeyPass.Export())
                return true;
            } catch (_) {
            }
            if (prev.salt)
              this._KeyPass.Salt = prev.salt;
            if (Array.isArray(prev.chunks) && prev.chunks.length === 26 && prev.chunks.every((c) => typeof c === "string" && c.length))
              this._KeyPass.MasterKChunks = prev.chunks;
            this._KeyPass.FormatVersion = prev.version;
            this._KeyPass.Kdf = prev.kdf;
            yield this._KeyPass.SetEntries(prev.entries);
            return false;
          });
        }
        set SeqManage(sm) {
          this._SeqManage = sm;
        }
        get KeyPass() {
          return this._KeyPass;
        }
        RefreshSequence(password) {
          return __awaiter(this, void 0, void 0, function* () {
            const oldKey = this.GetK(password);
            if (oldKey === false)
              return false;
            let entries;
            try {
              entries = this.decryptEntries(oldKey);
            } catch (_) {
              return false;
            }
            const previousSeq = this._SeqManage.Sequence.Sequence.slice();
            const previous = { salt: this._KeyPass.Salt, chunks: this._KeyPass.MasterKChunks, version: this._KeyPass.FormatVersion, kdf: this._KeyPass.Kdf, data: this._KeyPass.GetEntries() };
            try {
              if (!(yield this._SeqManage.Initialize()))
                return false;
              const salt = this._KeyPass.FormatVersion === 2 ? this._KeyPass.Salt : Common_1.CommonSymEnc.GenerateSalt();
              const key = this._KeyPass.FormatVersion === 2 ? oldKey : Common_1.CommonSymEnc.GenerateRandomKey();
              this._KeyPass.Salt = salt;
              this._KeyPass.FormatVersion = 2;
              this._KeyPass.Kdf = Object.assign({ name: "scrypt" }, Common_1.CommonSymEnc.KdfParams);
              this._KeyPass.MasterKChunks = this.Chunk(this.EncryptMaster(password, salt, key));
              yield this._KeyPass.SetEntries(JSON.stringify(Common_1.CommonSymEnc.EncryptAead(import_buffer.Buffer.from(key, "hex"), JSON.stringify(entries), "CryptPass:entries:v2")));
              if (yield this._KeyPass.Export())
                return true;
            } catch (_) {
            }
            yield this._SeqManage.RestoreSequence(previousSeq);
            this._KeyPass.Salt = previous.salt;
            this._KeyPass.MasterKChunks = previous.chunks;
            this._KeyPass.FormatVersion = previous.version;
            this._KeyPass.Kdf = previous.kdf;
            yield this._KeyPass.SetEntries(previous.data);
            return false;
          });
        }
        BackupRecover(_password) {
          return true;
        }
        CheckPassword(password) {
          return this.GetK(password) !== false;
        }
        ChangePassword(oldPassword, newPassword) {
          return __awaiter(this, void 0, void 0, function* () {
            if (!newPassword)
              return false;
            const oldK = this.GetK(oldPassword);
            if (oldK === false)
              return false;
            try {
              const entries = this.decryptEntries(oldK);
              const salt = Common_1.CommonSymEnc.GenerateSalt(), key = Common_1.CommonSymEnc.GenerateRandomKey();
              const newChunks = this.Chunk(this.EncryptMaster(newPassword, salt, key));
              const newEntries = JSON.stringify(Common_1.CommonSymEnc.EncryptAead(import_buffer.Buffer.from(key, "hex"), JSON.stringify(entries), "CryptPass:entries:v2"));
              const previous = { salt: this._KeyPass.Salt, chunks: this._KeyPass.MasterKChunks, version: this._KeyPass.FormatVersion, kdf: this._KeyPass.Kdf, data: this._KeyPass.GetEntries() };
              this._KeyPass.Salt = salt;
              this._KeyPass.MasterKChunks = newChunks;
              this._KeyPass.FormatVersion = 2;
              this._KeyPass.Kdf = Object.assign({ name: "scrypt" }, Common_1.CommonSymEnc.KdfParams);
              this._KeyPass.LastChange = /* @__PURE__ */ new Date();
              yield this._KeyPass.SetEntries(newEntries);
              if (yield this._KeyPass.Export())
                return true;
              this._KeyPass.Salt = previous.salt;
              this._KeyPass.MasterKChunks = previous.chunks;
              this._KeyPass.FormatVersion = previous.version;
              this._KeyPass.Kdf = previous.kdf;
              yield this._KeyPass.SetEntries(previous.data);
              return false;
            } catch (_) {
              return false;
            }
          });
        }
        MasterEncrypt(passwordOrK, txt, isK = false) {
          const key = isK ? passwordOrK : this.GetK(passwordOrK);
          if (key === false)
            return "";
          if (key.indexOf(":") >= 0) {
            const parts = key.split(":");
            return JSON.stringify(Common_1.CommonSymEnc.EncryptAead(import_buffer.Buffer.from(parts[0], "utf8"), txt, "CryptPass:entries:v2"));
          }
          return JSON.stringify(Common_1.CommonSymEnc.EncryptAead(import_buffer.Buffer.from(key, "hex"), txt, "CryptPass:entries:v2"));
        }
        MasterDecrypt(passwordOrK, txt, isK = false) {
          const key = isK ? passwordOrK : this.GetK(passwordOrK);
          if (key === false)
            throw new Error("Decryption failed");
          if (key.indexOf(":") >= 0) {
            const parts = key.split(":");
            return Common_1.CommonSymEnc.LegacyDecrypt(parts[0], parts[1], txt);
          }
          try {
            return Common_1.CommonSymEnc.DecryptAead(import_buffer.Buffer.from(key, "hex"), JSON.parse(txt), "CryptPass:entries:v2");
          } catch (_) {
            throw new Error("Decryption failed");
          }
        }
        SymEncrypt(password, plainText) {
          return Common_1.CommonSymEnc.EncryptWithPassword(password, this._KeyPass.Salt, plainText);
        }
        SymDecrypt(password, encText) {
          if (this._KeyPass.FormatVersion === 2)
            return Common_1.CommonSymEnc.DecryptWithPassword(password, this._KeyPass.Salt, encText);
          return Common_1.CommonSymEnc.LegacyDecryptByPassword(password, this._KeyPass.Salt, encText);
        }
        EncryptMaster(password, salt, key) {
          return Common_1.CommonSymEnc.EncryptWithPassword(password, salt, key);
        }
        Chunk(value) {
          const n = this._SeqManage.NChunks, chunks = new Array(n);
          if (value.length < n)
            throw new Error("Invalid encrypted payload");
          for (let i = 0; i < n; i++)
            chunks[this._SeqManage.Sequence.Sequence[i]] = value.substring(Math.floor(i * value.length / n), Math.floor((i + 1) * value.length / n));
          return chunks;
        }
        GetK(password) {
          try {
            const seq = this._SeqManage.Sequence.Sequence;
            if (!Array.isArray(this._KeyPass.MasterKChunks) || this._KeyPass.MasterKChunks.length !== 26 || this._KeyPass.MasterKChunks.some((c) => typeof c !== "string" || !c.length))
              return false;
            const joined = new Array(26);
            if (this._KeyPass.FormatVersion === 2) {
              for (let i = 0; i < 26; i++) {
                const part = this._KeyPass.MasterKChunks[seq[i]];
                if (typeof part !== "string")
                  return false;
                joined[i] = part;
              }
            } else {
              const inverse = new Array(26);
              for (let i = 0; i < 26; i++)
                inverse[seq[i]] = i;
              for (let i = 0; i < 26; i++) {
                const part = this._KeyPass.MasterKChunks[inverse[i]];
                if (typeof part !== "string")
                  return false;
                joined[i] = part;
              }
            }
            const ciphertext = joined.join("");
            if (this._KeyPass.FormatVersion === 2) {
              const kdf = this._KeyPass.Kdf;
              if (!kdf || kdf.name !== "scrypt" || !Number.isInteger(kdf.N) || kdf.N < 16384 || kdf.N > 1048576 || !Number.isInteger(kdf.r) || kdf.r < 1 || kdf.r > 32 || !Number.isInteger(kdf.p) || kdf.p < 1 || kdf.p > 16)
                return false;
              const key = Common_1.CommonSymEnc.DecryptWithPassword(password, this._KeyPass.Salt, ciphertext, kdf);
              if (!/^[0-9a-f]{64}$/i.test(key))
                return false;
              return key;
            }
            return Common_1.CommonSymEnc.LegacyDecryptByPassword(password, this._KeyPass.Salt, ciphertext);
          } catch (_) {
            return false;
          }
        }
        decryptEntries(key) {
          const ciphertext = this._KeyPass.GetEntries();
          if (key.indexOf(":") >= 0)
            return JSON.parse(this.MasterDecrypt(key, ciphertext, true));
          return JSON.parse(this.MasterDecrypt(key, ciphertext, true));
        }
        SetEntries(entries_1, password_1) {
          return __awaiter(this, arguments, void 0, function* (entries, password, isK = false) {
            this._EntriesManage.Entries = entries;
            yield this.setEntries(password, isK);
            return this._KeyPass.Export();
          });
        }
        GetEntriesManage(password, isK = false) {
          this.getEntries(password, isK);
          return this._EntriesManage;
        }
        setPassDescription(description) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KeyPass.SetDescription(description);
          });
        }
        getPassDescription() {
          return this._KeyPass.GetDescription();
        }
        getEntries(passwordOrK, isK = false) {
          this._EntriesManage.Entries = JSON.parse(this.MasterDecrypt(passwordOrK, this._KeyPass.GetEntries(), isK));
        }
        setEntries(passwordOrK_1) {
          return __awaiter(this, arguments, void 0, function* (passwordOrK, isK = false) {
            try {
              if (this._KeyPass.FormatVersion !== 2 && !isK) {
                const salt = Common_1.CommonSymEnc.GenerateSalt(), key = Common_1.CommonSymEnc.GenerateRandomKey();
                this._KeyPass.Salt = salt;
                this._KeyPass.FormatVersion = 2;
                this._KeyPass.Kdf = Object.assign({ name: "scrypt" }, Common_1.CommonSymEnc.KdfParams);
                this._KeyPass.MasterKChunks = this.Chunk(this.EncryptMaster(passwordOrK, salt, key));
                yield this._KeyPass.SetEntries(JSON.stringify(Common_1.CommonSymEnc.EncryptAead(import_buffer.Buffer.from(key, "hex"), JSON.stringify(this._EntriesManage.Export()), "CryptPass:entries:v2")));
                return;
              }
              yield this._KeyPass.SetEntries(this.MasterEncrypt(passwordOrK, JSON.stringify(this._EntriesManage.Export()), isK));
            } catch (_) {
              throw new Error("Vault update failed");
            }
          });
        }
        GetEntryNames(password) {
          this.getEntries(password);
          return this._EntriesManage.GetEntryNames();
        }
        GetEntry(password, name) {
          this.getEntries(password);
          return this._EntriesManage.GetEntry(name);
        }
        UpdateEntryName(password, Name, NewName) {
          return __awaiter(this, void 0, void 0, function* () {
            this.getEntries(password);
            if (this._EntriesManage.UpdateEntryName(Name, NewName)) {
              this.setEntries(password);
              return this._KeyPass.Export();
            }
            return false;
          });
        }
        UpdateEntry(password, Value) {
          return __awaiter(this, void 0, void 0, function* () {
            this.getEntries(password);
            if (this._EntriesManage.UpdateEntry(Value)) {
              this.setEntries(password);
              return this._KeyPass.Export();
            }
            return false;
          });
        }
        DeleteEntry(password, Name) {
          return __awaiter(this, void 0, void 0, function* () {
            this.getEntries(password);
            if (this._EntriesManage.DeleteEntry(Name)) {
              this.setEntries(password);
              return this._KeyPass.Export();
            }
            return false;
          });
        }
        AddEntry(password, Value) {
          return __awaiter(this, void 0, void 0, function* () {
            this.getEntries(password);
            if (this._EntriesManage.AddEntry(Value)) {
              this.setEntries(password);
              return this._KeyPass.Export();
            }
            return false;
          });
        }
      };
      exports.KeyPassManage = KeyPassManage;
    }
  });

  // dist/Models/AbstrObj.js
  var require_AbstrObj = __commonJS({
    "dist/Models/AbstrObj.js"(exports) {
      "use strict";
      init_browser_globals();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GenericObj = void 0;
      var GenericObj = class {
        get ObjToJSON() {
          return JSON.stringify(this.Obj);
        }
        get Obj() {
          return this._Obj;
        }
        Export(KeepBackup) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._writer(this.Save(), KeepBackup);
          });
        }
        constructor(writer, importObj) {
          if (importObj === void 0)
            this._Obj = {};
          else
            this._Obj = importObj;
          this._writer = writer;
        }
      };
      exports.GenericObj = GenericObj;
    }
  });

  // dist/Models/KeyPass.js
  var require_KeyPass = __commonJS({
    "dist/Models/KeyPass.js"(exports) {
      "use strict";
      init_browser_globals();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.KeyPass = void 0;
      var AbstrObj_1 = require_AbstrObj();
      var KeyPass = class extends AbstrObj_1.GenericObj {
        get Salt() {
          return this._Salt;
        }
        set Salt(salt) {
          salt = salt.trim();
          if (salt != "")
            this._Salt = salt;
        }
        get MasterKChunks() {
          return this._MasterKChunks;
        }
        set MasterKChunks(chunks) {
          if (!Array.isArray(chunks) || chunks.length !== 26 || chunks.some((c) => typeof c !== "string" || c.length === 0))
            throw new Error("Invalid key data");
          this._MasterKChunks = chunks.slice();
        }
        get FormatVersion() {
          return this._FormatVersion;
        }
        set FormatVersion(version) {
          this._FormatVersion = version;
        }
        get Kdf() {
          return this._Kdf;
        }
        set Kdf(value) {
          this._Kdf = value;
        }
        get LastChange() {
          return this._LastChange;
        }
        set LastChange(lastchange) {
          this._LastChange = lastchange;
        }
        constructor(writer, importObj) {
          super(writer, importObj);
          this._MasterKChunks = new Array();
          if (this._Obj.Key === void 0)
            this._Obj.Key = {};
          if (this._Obj.Pass === void 0)
            this._Obj.Pass = { Description: "", Entries: "" };
          if (importObj !== void 0) {
            this._Salt = this._Obj.Key.Salt;
            if (this._Obj.Key.MasterKChunks !== void 0)
              this.MasterKChunks = this._Obj.Key.MasterKChunks;
            this._LastChange = new Date(this._Obj.Key.LastChange);
            this._FormatVersion = this._Obj.Key.FormatVersion;
            this._Kdf = this._Obj.Key.Kdf;
          }
        }
        SetDescription(description) {
          return __awaiter(this, void 0, void 0, function* () {
            this._Obj.Pass.Description = description;
            return this.Export();
          });
        }
        GetDescription() {
          return this._Obj.Pass.Description;
        }
        SetEntries(entries) {
          return __awaiter(this, void 0, void 0, function* () {
            this._Obj.Pass.Entries = entries;
            return this.Export();
          });
        }
        GetEntries() {
          return this._Obj.Pass.Entries;
        }
        Save() {
          this._Obj.Key.Salt = this._Salt;
          this._Obj.Key.MasterKChunks = this._MasterKChunks;
          if (this._FormatVersion !== void 0)
            this._Obj.Key.FormatVersion = this._FormatVersion;
          if (this._Kdf !== void 0)
            this._Obj.Key.Kdf = this._Kdf;
          this._Obj.Key.LastChange = this._LastChange.toISOString();
          return this._Obj;
        }
      };
      exports.KeyPass = KeyPass;
    }
  });

  // dist/Models/Sequence.js
  var require_Sequence = __commonJS({
    "dist/Models/Sequence.js"(exports) {
      "use strict";
      init_browser_globals();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Sequence = void 0;
      var AbstrObj_1 = require_AbstrObj();
      var Sequence = class _Sequence extends AbstrObj_1.GenericObj {
        get Sequence() {
          return this._Sequence;
        }
        set Sequence(sequence) {
          if (!_Sequence.IsValid(sequence))
            throw new Error("Invalid sequence");
          this._Sequence = sequence.slice();
        }
        static IsValid(sequence) {
          if (!Array.isArray(sequence) || sequence.length !== 26)
            return false;
          const seen = /* @__PURE__ */ new Set();
          for (const n of sequence) {
            if (!Number.isInteger(n) || n < 0 || n >= 26 || seen.has(n))
              return false;
            seen.add(n);
          }
          return seen.size === 26;
        }
        constructor(writer, importObj) {
          super(writer, importObj);
          if (importObj !== void 0)
            this.Sequence = this._Obj.Sequence;
        }
        Save() {
          this._Obj.Sequence = this._Sequence;
          return this._Obj;
        }
      };
      exports.Sequence = Sequence;
    }
  });

  // dist/Helpers/crypto-extensions.js
  var require_crypto_extensions = __commonJS({
    "dist/Helpers/crypto-extensions.js"(exports) {
      "use strict";
      init_browser_globals();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.cryptoXt = void 0;
      var randomBytes = require_browser4();
      var cryptoXt = class {
        static secureMathRandom() {
          return this.RandomBytesGenerator(4).readUInt32LE() / 4294967296;
        }
        static randomInt(max) {
          const range = 4294967296;
          const limit = Math.floor(range / max) * max;
          let value;
          do {
            value = this.RandomBytesGenerator(4).readUInt32LE();
          } while (value >= limit);
          return value % max;
        }
        static arrayShuffle(array, minDistance = 4) {
          if (!Array.isArray(array)) {
            throw new TypeError(`Expected an array, got ${typeof array}`);
          }
          minDistance = array.length <= 3 ? 0 : Math.min(array.length, minDistance);
          let orig_array = [...array];
          let reverse_array = [...array].reverse();
          while (true) {
            for (let index = array.length - 1; index > 0; index--) {
              const newIndex = this.randomInt(index + 1);
              [array[index], array[newIndex]] = [array[newIndex], array[index]];
            }
            if (this.arrayDistance(array, orig_array) >= minDistance && this.arrayDistance(array, reverse_array) >= minDistance)
              return array;
          }
        }
        static arrayDistance(arr1, arr2) {
          if (arr1.length != arr2.length)
            return 0;
          else {
            let distance = 0;
            for (let i = 0; i < arr1.length; ++i) {
              if (arr1[i] != arr2[i])
                ++distance;
            }
            return distance;
          }
        }
      };
      exports.cryptoXt = cryptoXt;
      cryptoXt.RandomBytesGenerator = (n) => randomBytes(n);
    }
  });

  // dist/SequenceManage.js
  var require_SequenceManage = __commonJS({
    "dist/SequenceManage.js"(exports) {
      "use strict";
      init_browser_globals();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SequenceManage = void 0;
      var crypto_extensions_1 = require_crypto_extensions();
      var Sequence_1 = require_Sequence();
      var SequenceManage = class {
        constructor(sequence) {
          this._NChunks = 26;
          this._Sequence = sequence;
        }
        get NChunks() {
          return this._NChunks;
        }
        get Sequence() {
          return this._Sequence;
        }
        Initialize() {
          return __awaiter(this, void 0, void 0, function* () {
            const sequence = new Array(this._NChunks);
            for (let i = 0; i < this._NChunks; ++i) {
              sequence[i] = i;
            }
            this._Sequence.Sequence = crypto_extensions_1.cryptoXt.arrayShuffle(sequence);
            return this._Sequence.Export();
          });
        }
        RestoreSequence(sequence) {
          return __awaiter(this, void 0, void 0, function* () {
            if (!Sequence_1.Sequence.IsValid(sequence))
              return false;
            const previous = this._Sequence.Sequence.slice();
            try {
              this._Sequence.Sequence = sequence;
              const saved = yield this._Sequence.Export();
              if (!saved)
                this._Sequence.Sequence = previous;
              return saved;
            } catch (_) {
              this._Sequence.Sequence = previous;
              return false;
            }
          });
        }
      };
      exports.SequenceManage = SequenceManage;
    }
  });

  // dist/crypt.js
  var require_crypt = __commonJS({
    "dist/crypt.js"(exports) {
      init_browser_globals();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CryptPass = exports.CryptPassCached = exports.ConfigCryptPass = void 0;
      var KeyPassManage_1 = require_KeyPassManage();
      var KeyPass_1 = require_KeyPass();
      var Sequence_1 = require_Sequence();
      var SequenceManage_1 = require_SequenceManage();
      var ConfigCryptPass = class {
        getLastChange() {
          return this._KPM.LastChange;
        }
        restoreSeq(sequence) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._SM.RestoreSequence(sequence);
          });
        }
        getSequence() {
          return this._SM.Sequence.Sequence;
        }
        initSeqAndKey(password) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.InitializeKey(password, true);
          });
        }
        refreshSequence(password) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.RefreshSequence(password);
          });
        }
        checkPwd(password) {
          return this._KPM.CheckPassword(password);
        }
        chPwd(oldPassword, newPassword) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.ChangePassword(oldPassword, newPassword);
          });
        }
        constructor(ObjRW, KeyPassObj, SequenceObj) {
          this._SM = new SequenceManage_1.SequenceManage(new Sequence_1.Sequence(ObjRW.SequenceWriter, SequenceObj));
          this._KPM = new KeyPassManage_1.KeyPassManage(new KeyPass_1.KeyPass(ObjRW.KeyPassWriter, KeyPassObj), this._SM);
        }
      };
      exports.ConfigCryptPass = ConfigCryptPass;
      var CryptPassCached = class {
        constructor(ObjRW, KeyPassObj, SequenceObj) {
          this._KPM = new KeyPassManage_1.KeyPassManage(new KeyPass_1.KeyPass(ObjRW.KeyPassWriter, KeyPassObj), new SequenceManage_1.SequenceManage(new Sequence_1.Sequence(ObjRW.SequenceWriter, SequenceObj)));
        }
        getPassDescription() {
          return this._KPM.getPassDescription();
        }
        setPassDescription(description) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.setPassDescription(description);
          });
        }
        SetEntries(entries_1, passwordOrK_1) {
          return __awaiter(this, arguments, void 0, function* (entries, passwordOrK, isK = false) {
            return this._KPM.SetEntries(entries, passwordOrK, isK);
          });
        }
        GetEntriesManage(passwordOrK, isK = false) {
          return this._KPM.GetEntriesManage(passwordOrK, isK);
        }
        GetK(password) {
          return this._KPM.GetK(password);
        }
      };
      exports.CryptPassCached = CryptPassCached;
      var CryptPass = class {
        constructor(password, ObjRW, KeyPassObj, SequenceObj) {
          this._Password = password;
          this._KPM = new KeyPassManage_1.KeyPassManage(new KeyPass_1.KeyPass(ObjRW.KeyPassWriter, KeyPassObj), new SequenceManage_1.SequenceManage(new Sequence_1.Sequence(ObjRW.SequenceWriter, SequenceObj)));
        }
        getPassDescription() {
          return this._KPM.getPassDescription();
        }
        setPassDescription(description) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.setPassDescription(description);
          });
        }
        addEntry(entry) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.AddEntry(this._Password, entry);
          });
        }
        getEntry(name) {
          return this._KPM.GetEntry(this._Password, name);
        }
        getEntryNames() {
          return this._KPM.GetEntryNames(this._Password);
        }
        updateEntry(entry) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.UpdateEntry(this._Password, entry);
          });
        }
        updateEntryName(oldName, newName) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.UpdateEntryName(this._Password, oldName, newName);
          });
        }
        deleteEntry(name) {
          return __awaiter(this, void 0, void 0, function* () {
            return this._KPM.DeleteEntry(this._Password, name);
          });
        }
      };
      exports.CryptPass = CryptPass;
    }
  });
  return require_crypt();
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
