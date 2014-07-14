require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
// private property
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


// public method for encoding
exports.encode = function(input, utf8) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        }
        else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

    }

    return output;
};

// public method for decoding
exports.decode = function(input, utf8) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    return output;

};

},{}],2:[function(require,module,exports){
'use strict';
function CompressedObject() {
    this.compressedSize = 0;
    this.uncompressedSize = 0;
    this.crc32 = 0;
    this.compressionMethod = null;
    this.compressedContent = null;
}

CompressedObject.prototype = {
    /**
     * Return the decompressed content in an unspecified format.
     * The format will depend on the decompressor.
     * @return {Object} the decompressed content.
     */
    getContent: function() {
        return null; // see implementation
    },
    /**
     * Return the compressed content in an unspecified format.
     * The format will depend on the compressed conten source.
     * @return {Object} the compressed content.
     */
    getCompressedContent: function() {
        return null; // see implementation
    }
};
module.exports = CompressedObject;

},{}],3:[function(require,module,exports){
'use strict';
exports.STORE = {
    magic: "\x00\x00",
    compress: function(content) {
        return content; // no compression
    },
    uncompress: function(content) {
        return content; // no compression
    },
    compressInputType: null,
    uncompressInputType: null
};
exports.DEFLATE = require('./flate');

},{"./flate":8}],4:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var table = [
    0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA,
    0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
    0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,
    0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
    0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
    0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
    0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC,
    0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
    0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172,
    0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
    0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940,
    0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
    0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116,
    0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
    0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
    0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
    0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A,
    0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
    0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818,
    0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
    0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E,
    0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
    0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C,
    0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
    0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
    0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
    0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0,
    0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
    0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086,
    0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
    0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4,
    0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
    0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A,
    0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
    0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
    0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
    0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE,
    0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
    0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC,
    0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
    0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252,
    0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
    0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60,
    0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
    0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
    0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
    0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04,
    0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
    0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A,
    0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
    0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38,
    0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
    0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E,
    0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
    0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
    0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
    0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2,
    0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
    0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0,
    0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
    0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6,
    0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
    0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94,
    0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
];

/**
 *
 *  Javascript crc32
 *  http://www.webtoolkit.info/
 *
 */
module.exports = function crc32(input, crc) {
    if (typeof input === "undefined" || !input.length) {
        return 0;
    }

    var isArray = utils.getTypeOf(input) !== "string";

    if (typeof(crc) == "undefined") {
        crc = 0;
    }
    var x = 0;
    var y = 0;
    var b = 0;

    crc = crc ^ (-1);
    for (var i = 0, iTop = input.length; i < iTop; i++) {
        b = isArray ? input[i] : input.charCodeAt(i);
        y = (crc ^ b) & 0xFF;
        x = table[y];
        crc = (crc >>> 8) ^ x;
    }

    return crc ^ (-1);
};
// vim: set shiftwidth=4 softtabstop=4:

},{"./utils":20}],5:[function(require,module,exports){
'use strict';
var utils = require('./utils');

function DataReader(data) {
    this.data = null; // type : see implementation
    this.length = 0;
    this.index = 0;
}
DataReader.prototype = {
    /**
     * Check that the offset will not go too far.
     * @param {string} offset the additional offset to check.
     * @throws {Error} an Error if the offset is out of bounds.
     */
    checkOffset: function(offset) {
        this.checkIndex(this.index + offset);
    },
    /**
     * Check that the specifed index will not be too far.
     * @param {string} newIndex the index to check.
     * @throws {Error} an Error if the index is out of bounds.
     */
    checkIndex: function(newIndex) {
        if (this.length < newIndex || newIndex < 0) {
            throw new Error("End of data reached (data length = " + this.length + ", asked index = " + (newIndex) + "). Corrupted zip ?");
        }
    },
    /**
     * Change the index.
     * @param {number} newIndex The new index.
     * @throws {Error} if the new index is out of the data.
     */
    setIndex: function(newIndex) {
        this.checkIndex(newIndex);
        this.index = newIndex;
    },
    /**
     * Skip the next n bytes.
     * @param {number} n the number of bytes to skip.
     * @throws {Error} if the new index is out of the data.
     */
    skip: function(n) {
        this.setIndex(this.index + n);
    },
    /**
     * Get the byte at the specified index.
     * @param {number} i the index to use.
     * @return {number} a byte.
     */
    byteAt: function(i) {
        // see implementations
    },
    /**
     * Get the next number with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {number} the corresponding number.
     */
    readInt: function(size) {
        var result = 0,
            i;
        this.checkOffset(size);
        for (i = this.index + size - 1; i >= this.index; i--) {
            result = (result << 8) + this.byteAt(i);
        }
        this.index += size;
        return result;
    },
    /**
     * Get the next string with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {string} the corresponding string.
     */
    readString: function(size) {
        return utils.transformTo("string", this.readData(size));
    },
    /**
     * Get raw data without conversion, <size> bytes.
     * @param {number} size the number of bytes to read.
     * @return {Object} the raw data, implementation specific.
     */
    readData: function(size) {
        // see implementations
    },
    /**
     * Find the last occurence of a zip signature (4 bytes).
     * @param {string} sig the signature to find.
     * @return {number} the index of the last occurence, -1 if not found.
     */
    lastIndexOfSignature: function(sig) {
        // see implementations
    },
    /**
     * Get the next date.
     * @return {Date} the date.
     */
    readDate: function() {
        var dostime = this.readInt(4);
        return new Date(
        ((dostime >> 25) & 0x7f) + 1980, // year
        ((dostime >> 21) & 0x0f) - 1, // month
        (dostime >> 16) & 0x1f, // day
        (dostime >> 11) & 0x1f, // hour
        (dostime >> 5) & 0x3f, // minute
        (dostime & 0x1f) << 1); // second
    }
};
module.exports = DataReader;

},{"./utils":20}],6:[function(require,module,exports){
'use strict';
exports.base64 = false;
exports.binary = false;
exports.dir = false;
exports.date = null;
exports.compression = null;
exports.comment = null;

},{}],7:[function(require,module,exports){
'use strict';
var utils = require('./utils');

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2binary = function(str) {
    return utils.string2binary(str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2Uint8Array = function(str) {
    return utils.transformTo("uint8array", str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.uint8Array2String = function(array) {
    return utils.transformTo("string", array);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2Blob = function(str) {
    var buffer = utils.transformTo("arraybuffer", str);
    return utils.arrayBuffer2Blob(buffer);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.arrayBuffer2Blob = function(buffer) {
    return utils.arrayBuffer2Blob(buffer);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.transformTo = function(outputType, input) {
    return utils.transformTo(outputType, input);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.getTypeOf = function(input) {
    return utils.getTypeOf(input);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.checkSupport = function(type) {
    return utils.checkSupport(type);
};

/**
 * @deprecated
 * This value will be removed in a future version without replacement.
 */
exports.MAX_VALUE_16BITS = utils.MAX_VALUE_16BITS;

/**
 * @deprecated
 * This value will be removed in a future version without replacement.
 */
exports.MAX_VALUE_32BITS = utils.MAX_VALUE_32BITS;


/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.pretty = function(str) {
    return utils.pretty(str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.findCompression = function(compressionMethod) {
    return utils.findCompression(compressionMethod);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.isRegExp = function (object) {
    return utils.isRegExp(object);
};


},{"./utils":20}],8:[function(require,module,exports){
'use strict';
var USE_TYPEDARRAY = (typeof Uint8Array !== 'undefined') && (typeof Uint16Array !== 'undefined') && (typeof Uint32Array !== 'undefined');

var pako = require("pako");
exports.uncompressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
exports.compressInputType = USE_TYPEDARRAY ? "uint8array" : "array";

exports.magic = "\x08\x00";
exports.compress = function(input) {
    return pako.deflateRaw(input);
};
exports.uncompress =  function(input) {
    return pako.inflateRaw(input);
};

},{"pako":23}],"jszip":[function(require,module,exports){
module.exports=require('wq+8Dg');
},{}],"wq+8Dg":[function(require,module,exports){
'use strict';

var base64 = require('./base64');

/**
Usage:
   zip = new JSZip();
   zip.file("hello.txt", "Hello, World!").file("tempfile", "nothing");
   zip.folder("images").file("smile.gif", base64Data, {base64: true});
   zip.file("Xmas.txt", "Ho ho ho !", {date : new Date("December 25, 2007 00:00:01")});
   zip.remove("tempfile");

   base64zip = zip.generate();

**/

/**
 * Representation a of zip file in js
 * @constructor
 * @param {String=|ArrayBuffer=|Uint8Array=} data the data to load, if any (optional).
 * @param {Object=} options the options for creating this objects (optional).
 */
function JSZip(data, options) {
    // if this constructor is used without `new`, it adds `new` before itself:
    if(!(this instanceof JSZip)) return new JSZip(data, options);
    
    // object containing the files :
    // {
    //   "folder/" : {...},
    //   "folder/data.txt" : {...}
    // }
    this.files = {};

    this.comment = null;

    // Where we are in the hierarchy
    this.root = "";
    if (data) {
        this.load(data, options);
    }
    this.clone = function() {
        var newObj = new JSZip();
        for (var i in this) {
            if (typeof this[i] !== "function") {
                newObj[i] = this[i];
            }
        }
        return newObj;
    };
}
JSZip.prototype = require('./object');
JSZip.prototype.load = require('./load');
JSZip.support = require('./support');
JSZip.defaults = require('./defaults');

/**
 * @deprecated
 * This namespace will be removed in a future version without replacement.
 */
JSZip.utils = require('./deprecatedPublicUtils');

JSZip.base64 = {
    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    encode : function(input) {
        return base64.encode(input);
    },
    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    decode : function(input) {
        return base64.decode(input);
    }
};
JSZip.compressions = require('./compressions');
module.exports = JSZip;

},{"./base64":1,"./compressions":3,"./defaults":6,"./deprecatedPublicUtils":7,"./load":11,"./object":12,"./support":16}],11:[function(require,module,exports){
'use strict';
var base64 = require('./base64');
var ZipEntries = require('./zipEntries');
module.exports = function(data, options) {
    var files, zipEntries, i, input;
    options = options || {};
    if (options.base64) {
        data = base64.decode(data);
    }

    zipEntries = new ZipEntries(data, options);
    files = zipEntries.files;
    for (i = 0; i < files.length; i++) {
        input = files[i];
        this.file(input.fileName, input.decompressed, {
            binary: true,
            optimizedBinaryString: true,
            date: input.date,
            dir: input.dir,
            comment : input.fileComment.length ? input.fileComment : null
        });
    }
    if (zipEntries.zipComment.length) {
        this.comment = zipEntries.zipComment;
    }

    return this;
};

},{"./base64":1,"./zipEntries":21}],12:[function(require,module,exports){
'use strict';
var support = require('./support');
var utils = require('./utils');
var crc32 = require('./crc32');
var signature = require('./signature');
var defaults = require('./defaults');
var base64 = require('./base64');
var compressions = require('./compressions');
var CompressedObject = require('./compressedObject');
var nodeBuffer = require('./nodeBuffer');
var utf8 = require('./utf8');
var StringWriter = require('./stringWriter');
var Uint8ArrayWriter = require('./uint8ArrayWriter');

var textEncoder;
if (support.uint8array && typeof TextEncoder === "function") {
    textEncoder = new TextEncoder("utf-8");
}

/**
 * Returns the raw data of a ZipObject, decompress the content if necessary.
 * @param {ZipObject} file the file to use.
 * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
 */
var getRawData = function(file) {
    if (file._data instanceof CompressedObject) {
        file._data = file._data.getContent();
        file.options.binary = true;
        file.options.base64 = false;

        if (utils.getTypeOf(file._data) === "uint8array") {
            var copy = file._data;
            // when reading an arraybuffer, the CompressedObject mechanism will keep it and subarray() a Uint8Array.
            // if we request a file in the same format, we might get the same Uint8Array or its ArrayBuffer (the original zip file).
            file._data = new Uint8Array(copy.length);
            // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
            if (copy.length !== 0) {
                file._data.set(copy, 0);
            }
        }
    }
    return file._data;
};

/**
 * Returns the data of a ZipObject in a binary form. If the content is an unicode string, encode it.
 * @param {ZipObject} file the file to use.
 * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
 */
var getBinaryData = function(file) {
    var result = getRawData(file),
        type = utils.getTypeOf(result);
    if (type === "string") {
        if (!file.options.binary) {
            // unicode text !
            // unicode string => binary string is a painful process, check if we can avoid it.
            if (textEncoder) {
                return textEncoder.encode(result);
            }
            if (support.nodebuffer) {
                return nodeBuffer(result, "utf-8");
            }
        }
        return file.asBinary();
    }
    return result;
};

/**
 * Transform this._data into a string.
 * @param {function} filter a function String -> String, applied if not null on the result.
 * @return {String} the string representing this._data.
 */
var dataToString = function(asUTF8) {
    var result = getRawData(this);
    if (result === null || typeof result === "undefined") {
        return "";
    }
    // if the data is a base64 string, we decode it before checking the encoding !
    if (this.options.base64) {
        result = base64.decode(result);
    }
    if (asUTF8 && this.options.binary) {
        // JSZip.prototype.utf8decode supports arrays as input
        // skip to array => string step, utf8decode will do it.
        result = out.utf8decode(result);
    }
    else {
        // no utf8 transformation, do the array => string step.
        result = utils.transformTo("string", result);
    }

    if (!asUTF8 && !this.options.binary) {
        result = utils.transformTo("string", out.utf8encode(result));
    }
    return result;
};
/**
 * A simple object representing a file in the zip file.
 * @constructor
 * @param {string} name the name of the file
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
 * @param {Object} options the options of the file
 */
var ZipObject = function(name, data, options) {
    this.name = name;
    this.dir = options.dir;
    this.date = options.date;
    this.comment = options.comment;

    this._data = data;
    this.options = options;

    /*
     * This object contains initial values for dir and date.
     * With them, we can check if the user changed the deprecated metadata in
     * `ZipObject#options` or not.
     */
    this._initialMetadata = {
      dir : options.dir,
      date : options.date
    };
};

ZipObject.prototype = {
    /**
     * Return the content as UTF8 string.
     * @return {string} the UTF8 string.
     */
    asText: function() {
        return dataToString.call(this, true);
    },
    /**
     * Returns the binary content.
     * @return {string} the content as binary.
     */
    asBinary: function() {
        return dataToString.call(this, false);
    },
    /**
     * Returns the content as a nodejs Buffer.
     * @return {Buffer} the content as a Buffer.
     */
    asNodeBuffer: function() {
        var result = getBinaryData(this);
        return utils.transformTo("nodebuffer", result);
    },
    /**
     * Returns the content as an Uint8Array.
     * @return {Uint8Array} the content as an Uint8Array.
     */
    asUint8Array: function() {
        var result = getBinaryData(this);
        return utils.transformTo("uint8array", result);
    },
    /**
     * Returns the content as an ArrayBuffer.
     * @return {ArrayBuffer} the content as an ArrayBufer.
     */
    asArrayBuffer: function() {
        return this.asUint8Array().buffer;
    }
};

/**
 * Transform an integer into a string in hexadecimal.
 * @private
 * @param {number} dec the number to convert.
 * @param {number} bytes the number of bytes to generate.
 * @returns {string} the result.
 */
var decToHex = function(dec, bytes) {
    var hex = "",
        i;
    for (i = 0; i < bytes; i++) {
        hex += String.fromCharCode(dec & 0xff);
        dec = dec >>> 8;
    }
    return hex;
};

/**
 * Merge the objects passed as parameters into a new one.
 * @private
 * @param {...Object} var_args All objects to merge.
 * @return {Object} a new object with the data of the others.
 */
var extend = function() {
    var result = {}, i, attr;
    for (i = 0; i < arguments.length; i++) { // arguments is not enumerable in some browsers
        for (attr in arguments[i]) {
            if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === "undefined") {
                result[attr] = arguments[i][attr];
            }
        }
    }
    return result;
};

/**
 * Transforms the (incomplete) options from the user into the complete
 * set of options to create a file.
 * @private
 * @param {Object} o the options from the user.
 * @return {Object} the complete set of options.
 */
var prepareFileAttrs = function(o) {
    o = o || {};
    if (o.base64 === true && (o.binary === null || o.binary === undefined)) {
        o.binary = true;
    }
    o = extend(o, defaults);
    o.date = o.date || new Date();
    if (o.compression !== null) o.compression = o.compression.toUpperCase();

    return o;
};

/**
 * Add a file in the current folder.
 * @private
 * @param {string} name the name of the file
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data of the file
 * @param {Object} o the options of the file
 * @return {Object} the new file.
 */
var fileAdd = function(name, data, o) {
    // be sure sub folders exist
    var dataType = utils.getTypeOf(data);

    o = prepareFileAttrs(o);

    if (o.dir || data === null || typeof data === "undefined") {
        o.base64 = false;
        o.binary = false;
        data = null;
    }
    else if (dataType === "string") {
        if (o.binary && !o.base64) {
            // optimizedBinaryString == true means that the file has already been filtered with a 0xFF mask
            if (o.optimizedBinaryString !== true) {
                // this is a string, not in a base64 format.
                // Be sure that this is a correct "binary string"
                data = utils.string2binary(data);
            }
        }
    }
    else { // arraybuffer, uint8array, ...
        o.base64 = false;
        o.binary = true;

        if (!dataType && !(data instanceof CompressedObject)) {
            throw new Error("The data of '" + name + "' is in an unsupported format !");
        }

        // special case : it's way easier to work with Uint8Array than with ArrayBuffer
        if (dataType === "arraybuffer") {
            data = utils.transformTo("uint8array", data);
        }
    }

    var object = new ZipObject(name, data, o);
    this.files[name] = object;
    return object;
};

/**
 * Add a (sub) folder in the current folder.
 * @private
 * @param {string} name the folder's name
 * @return {Object} the new folder.
 */
var folderAdd = function(name) {
    // Check the name ends with a /
    if (name.slice(-1) != "/") {
        name += "/"; // IE doesn't like substr(-1)
    }

    // Does this folder already exist?
    if (!this.files[name]) {
        fileAdd.call(this, name, null, {
            dir: true
        });
    }
    return this.files[name];
};

/**
 * Generate a JSZip.CompressedObject for a given zipOject.
 * @param {ZipObject} file the object to read.
 * @param {JSZip.compression} compression the compression to use.
 * @return {JSZip.CompressedObject} the compressed result.
 */
var generateCompressedObjectFrom = function(file, compression) {
    var result = new CompressedObject(),
        content;

    // the data has not been decompressed, we might reuse things !
    if (file._data instanceof CompressedObject) {
        result.uncompressedSize = file._data.uncompressedSize;
        result.crc32 = file._data.crc32;

        if (result.uncompressedSize === 0 || file.dir) {
            compression = compressions['STORE'];
            result.compressedContent = "";
            result.crc32 = 0;
        }
        else if (file._data.compressionMethod === compression.magic) {
            result.compressedContent = file._data.getCompressedContent();
        }
        else {
            content = file._data.getContent();
            // need to decompress / recompress
            result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content));
        }
    }
    else {
        // have uncompressed data
        content = getBinaryData(file);
        if (!content || content.length === 0 || file.dir) {
            compression = compressions['STORE'];
            content = "";
        }
        result.uncompressedSize = content.length;
        result.crc32 = crc32(content);
        result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content));
    }

    result.compressedSize = result.compressedContent.length;
    result.compressionMethod = compression.magic;

    return result;
};

/**
 * Generate the various parts used in the construction of the final zip file.
 * @param {string} name the file name.
 * @param {ZipObject} file the file content.
 * @param {JSZip.CompressedObject} compressedObject the compressed object.
 * @param {number} offset the current offset from the start of the zip file.
 * @return {object} the zip parts.
 */
var generateZipParts = function(name, file, compressedObject, offset) {
    var data = compressedObject.compressedContent,
        utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)),
        comment = file.comment || "",
        utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)),
        useUTF8ForFileName = utfEncodedFileName.length !== file.name.length,
        useUTF8ForComment = utfEncodedComment.length !== comment.length,
        o = file.options,
        dosTime,
        dosDate,
        extraFields = "",
        unicodePathExtraField = "",
        unicodeCommentExtraField = "",
        dir, date;


    // handle the deprecated options.dir
    if (file._initialMetadata.dir !== file.dir) {
        dir = file.dir;
    } else {
        dir = o.dir;
    }

    // handle the deprecated options.date
    if(file._initialMetadata.date !== file.date) {
        date = file.date;
    } else {
        date = o.date;
    }

    // date
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html

    dosTime = date.getHours();
    dosTime = dosTime << 6;
    dosTime = dosTime | date.getMinutes();
    dosTime = dosTime << 5;
    dosTime = dosTime | date.getSeconds() / 2;

    dosDate = date.getFullYear() - 1980;
    dosDate = dosDate << 4;
    dosDate = dosDate | (date.getMonth() + 1);
    dosDate = dosDate << 5;
    dosDate = dosDate | date.getDate();

    if (useUTF8ForFileName) {
        // set the unicode path extra field. unzip needs at least one extra
        // field to correctly handle unicode path, so using the path is as good
        // as any other information. This could improve the situation with
        // other archive managers too.
        // This field is usually used without the utf8 flag, with a non
        // unicode path in the header (winrar, winzip). This helps (a bit)
        // with the messy Windows' default compressed folders feature but
        // breaks on p7zip which doesn't seek the unicode path extra field.
        // So for now, UTF-8 everywhere !
        unicodePathExtraField =
            // Version
            decToHex(1, 1) +
            // NameCRC32
            decToHex(crc32(utfEncodedFileName), 4) +
            // UnicodeName
            utfEncodedFileName;

        extraFields +=
            // Info-ZIP Unicode Path Extra Field
            "\x75\x70" +
            // size
            decToHex(unicodePathExtraField.length, 2) +
            // content
            unicodePathExtraField;
    }

    if(useUTF8ForComment) {

        unicodeCommentExtraField =
            // Version
            decToHex(1, 1) +
            // CommentCRC32
            decToHex(this.crc32(utfEncodedComment), 4) +
            // UnicodeName
            utfEncodedComment;

        extraFields +=
            // Info-ZIP Unicode Path Extra Field
            "\x75\x63" +
            // size
            decToHex(unicodeCommentExtraField.length, 2) +
            // content
            unicodeCommentExtraField;
    }

    var header = "";

    // version needed to extract
    header += "\x0A\x00";
    // general purpose bit flag
    // set bit 11 if utf8
    header += (useUTF8ForFileName || useUTF8ForComment) ? "\x00\x08" : "\x00\x00";
    // compression method
    header += compressedObject.compressionMethod;
    // last mod file time
    header += decToHex(dosTime, 2);
    // last mod file date
    header += decToHex(dosDate, 2);
    // crc-32
    header += decToHex(compressedObject.crc32, 4);
    // compressed size
    header += decToHex(compressedObject.compressedSize, 4);
    // uncompressed size
    header += decToHex(compressedObject.uncompressedSize, 4);
    // file name length
    header += decToHex(utfEncodedFileName.length, 2);
    // extra field length
    header += decToHex(extraFields.length, 2);


    var fileRecord = signature.LOCAL_FILE_HEADER + header + utfEncodedFileName + extraFields;

    var dirRecord = signature.CENTRAL_FILE_HEADER +
    // version made by (00: DOS)
    "\x14\x00" +
    // file header (common to file and central directory)
    header +
    // file comment length
    decToHex(utfEncodedComment.length, 2) +
    // disk number start
    "\x00\x00" +
    // internal file attributes TODO
    "\x00\x00" +
    // external file attributes
    (dir === true ? "\x10\x00\x00\x00" : "\x00\x00\x00\x00") +
    // relative offset of local header
    decToHex(offset, 4) +
    // file name
    utfEncodedFileName +
    // extra field
    extraFields +
    // file comment
    utfEncodedComment;

    return {
        fileRecord: fileRecord,
        dirRecord: dirRecord,
        compressedObject: compressedObject
    };
};


// return the actual prototype of JSZip
var out = {
    /**
     * Read an existing zip and merge the data in the current JSZip object.
     * The implementation is in jszip-load.js, don't forget to include it.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} stream  The stream to load
     * @param {Object} options Options for loading the stream.
     *  options.base64 : is the stream in base64 ? default : false
     * @return {JSZip} the current JSZip object
     */
    load: function(stream, options) {
        throw new Error("Load method is not defined. Is the file jszip-load.js included ?");
    },

    /**
     * Filter nested files/folders with the specified function.
     * @param {Function} search the predicate to use :
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     * @return {Array} An array of matching elements.
     */
    filter: function(search) {
        var result = [],
            filename, relativePath, file, fileClone;
        for (filename in this.files) {
            if (!this.files.hasOwnProperty(filename)) {
                continue;
            }
            file = this.files[filename];
            // return a new object, don't let the user mess with our internal objects :)
            fileClone = new ZipObject(file.name, file._data, extend(file.options));
            relativePath = filename.slice(this.root.length, filename.length);
            if (filename.slice(0, this.root.length) === this.root && // the file is in the current root
            search(relativePath, fileClone)) { // and the file matches the function
                result.push(fileClone);
            }
        }
        return result;
    },

    /**
     * Add a file to the zip file, or search a file.
     * @param   {string|RegExp} name The name of the file to add (if data is defined),
     * the name of the file to find (if no data) or a regex to match files.
     * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
     * @param   {Object} o     File options
     * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
     * a file (when searching by string) or an array of files (when searching by regex).
     */
    file: function(name, data, o) {
        if (arguments.length === 1) {
            if (utils.isRegExp(name)) {
                var regexp = name;
                return this.filter(function(relativePath, file) {
                    return !file.dir && regexp.test(relativePath);
                });
            }
            else { // text
                return this.filter(function(relativePath, file) {
                    return !file.dir && relativePath === name;
                })[0] || null;
            }
        }
        else { // more than one argument : we have data !
            name = this.root + name;
            fileAdd.call(this, name, data, o);
        }
        return this;
    },

    /**
     * Add a directory to the zip file, or search.
     * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
     * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
     */
    folder: function(arg) {
        if (!arg) {
            return this;
        }

        if (utils.isRegExp(arg)) {
            return this.filter(function(relativePath, file) {
                return file.dir && arg.test(relativePath);
            });
        }

        // else, name is a new folder
        var name = this.root + arg;
        var newFolder = folderAdd.call(this, name);

        // Allow chaining by returning a new object with this folder as the root
        var ret = this.clone();
        ret.root = newFolder.name;
        return ret;
    },

    /**
     * Delete a file, or a directory and all sub-files, from the zip
     * @param {string} name the name of the file to delete
     * @return {JSZip} this JSZip object
     */
    remove: function(name) {
        name = this.root + name;
        var file = this.files[name];
        if (!file) {
            // Look for any folders
            if (name.slice(-1) != "/") {
                name += "/";
            }
            file = this.files[name];
        }

        if (file && !file.dir) {
            // file
            delete this.files[name];
        } else {
            // maybe a folder, delete recursively
            var kids = this.filter(function(relativePath, file) {
                return file.name.slice(0, name.length) === name;
            });
            for (var i = 0; i < kids.length; i++) {
                delete this.files[kids[i].name];
            }
        }

        return this;
    },

    /**
     * Generate the complete zip file
     * @param {Object} options the options to generate the zip file :
     * - base64, (deprecated, use type instead) true to generate base64.
     * - compression, "STORE" by default.
     * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
     * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file
     */
    generate: function(options) {
        options = extend(options || {}, {
            base64: true,
            compression: "STORE",
            type: "base64",
            comment: null
        });

        utils.checkSupport(options.type);

        var zipData = [],
            localDirLength = 0,
            centralDirLength = 0,
            writer, i,
            utfEncodedComment = utils.transformTo("string", this.utf8encode(options.comment || this.comment || ""));

        // first, generate all the zip parts.
        for (var name in this.files) {
            if (!this.files.hasOwnProperty(name)) {
                continue;
            }
            var file = this.files[name];

            var compressionName = file.options.compression || options.compression.toUpperCase();
            var compression = compressions[compressionName];
            if (!compression) {
                throw new Error(compressionName + " is not a valid compression method !");
            }

            var compressedObject = generateCompressedObjectFrom.call(this, file, compression);

            var zipPart = generateZipParts.call(this, name, file, compressedObject, localDirLength);
            localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;
            centralDirLength += zipPart.dirRecord.length;
            zipData.push(zipPart);
        }

        var dirEnd = "";

        // end of central dir signature
        dirEnd = signature.CENTRAL_DIRECTORY_END +
        // number of this disk
        "\x00\x00" +
        // number of the disk with the start of the central directory
        "\x00\x00" +
        // total number of entries in the central directory on this disk
        decToHex(zipData.length, 2) +
        // total number of entries in the central directory
        decToHex(zipData.length, 2) +
        // size of the central directory   4 bytes
        decToHex(centralDirLength, 4) +
        // offset of start of central directory with respect to the starting disk number
        decToHex(localDirLength, 4) +
        // .ZIP file comment length
        decToHex(utfEncodedComment.length, 2) +
        // .ZIP file comment
        utfEncodedComment;


        // we have all the parts (and the total length)
        // time to create a writer !
        var typeName = options.type.toLowerCase();
        if(typeName==="uint8array"||typeName==="arraybuffer"||typeName==="blob"||typeName==="nodebuffer") {
            writer = new Uint8ArrayWriter(localDirLength + centralDirLength + dirEnd.length);
        }else{
            writer = new StringWriter(localDirLength + centralDirLength + dirEnd.length);
        }

        for (i = 0; i < zipData.length; i++) {
            writer.append(zipData[i].fileRecord);
            writer.append(zipData[i].compressedObject.compressedContent);
        }
        for (i = 0; i < zipData.length; i++) {
            writer.append(zipData[i].dirRecord);
        }

        writer.append(dirEnd);

        var zip = writer.finalize();



        switch(options.type.toLowerCase()) {
            // case "zip is an Uint8Array"
            case "uint8array" :
            case "arraybuffer" :
            case "nodebuffer" :
               return utils.transformTo(options.type.toLowerCase(), zip);
            case "blob" :
               return utils.arrayBuffer2Blob(utils.transformTo("arraybuffer", zip));
            // case "zip is a string"
            case "base64" :
               return (options.base64) ? base64.encode(zip) : zip;
            default : // case "string" :
               return zip;
         }
      
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    crc32: function (input, crc) {
        return crc32(input, crc);
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    utf8encode: function (string) {
        return utils.transformTo("string", utf8.utf8encode(string));
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    utf8decode: function (input) {
        return utf8.utf8decode(input);
    }
};
module.exports = out;

},{"./base64":1,"./compressedObject":2,"./compressions":3,"./crc32":4,"./defaults":6,"./nodeBuffer":39,"./signature":13,"./stringWriter":15,"./support":16,"./uint8ArrayWriter":18,"./utf8":19,"./utils":20}],13:[function(require,module,exports){
'use strict';
exports.LOCAL_FILE_HEADER = "PK\x03\x04";
exports.CENTRAL_FILE_HEADER = "PK\x01\x02";
exports.CENTRAL_DIRECTORY_END = "PK\x05\x06";
exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x06\x07";
exports.ZIP64_CENTRAL_DIRECTORY_END = "PK\x06\x06";
exports.DATA_DESCRIPTOR = "PK\x07\x08";

},{}],14:[function(require,module,exports){
'use strict';
var DataReader = require('./dataReader');
var utils = require('./utils');

function StringReader(data, optimizedBinaryString) {
    this.data = data;
    if (!optimizedBinaryString) {
        this.data = utils.string2binary(this.data);
    }
    this.length = this.data.length;
    this.index = 0;
}
StringReader.prototype = new DataReader();
/**
 * @see DataReader.byteAt
 */
StringReader.prototype.byteAt = function(i) {
    return this.data.charCodeAt(i);
};
/**
 * @see DataReader.lastIndexOfSignature
 */
StringReader.prototype.lastIndexOfSignature = function(sig) {
    return this.data.lastIndexOf(sig);
};
/**
 * @see DataReader.readData
 */
StringReader.prototype.readData = function(size) {
    this.checkOffset(size);
    // this will work because the constructor applied the "& 0xff" mask.
    var result = this.data.slice(this.index, this.index + size);
    this.index += size;
    return result;
};
module.exports = StringReader;

},{"./dataReader":5,"./utils":20}],15:[function(require,module,exports){
'use strict';

var utils = require('./utils');

/**
 * An object to write any content to a string.
 * @constructor
 */
var StringWriter = function() {
    this.data = [];
};
StringWriter.prototype = {
    /**
     * Append any content to the current string.
     * @param {Object} input the content to add.
     */
    append: function(input) {
        input = utils.transformTo("string", input);
        this.data.push(input);
    },
    /**
     * Finalize the construction an return the result.
     * @return {string} the generated string.
     */
    finalize: function() {
        return this.data.join("");
    }
};

module.exports = StringWriter;

},{"./utils":20}],16:[function(require,module,exports){
(function (process){
'use strict';
exports.base64 = true;
exports.array = true;
exports.string = true;
exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
// contains true if JSZip can read/generate nodejs Buffer, false otherwise, aka checks if we arn't in a browser.
exports.nodebuffer = !process.browser;
// contains true if JSZip can read/generate Uint8Array, false otherwise.
exports.uint8array = typeof Uint8Array !== "undefined";

if (typeof ArrayBuffer === "undefined") {
    exports.blob = false;
}
else {
    var buffer = new ArrayBuffer(0);
    try {
        exports.blob = new Blob([buffer], {
            type: "application/zip"
        }).size === 0;
    }
    catch (e) {
        try {
            var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new Builder();
            builder.append(buffer);
            exports.blob = builder.getBlob('application/zip').size === 0;
        }
        catch (e) {
            exports.blob = false;
        }
    }
}

}).call(this,require("q+64fw"))
},{"q+64fw":40}],17:[function(require,module,exports){
'use strict';
var DataReader = require('./dataReader');

function Uint8ArrayReader(data) {
    if (data) {
        this.data = data;
        this.length = this.data.length;
        this.index = 0;
    }
}
Uint8ArrayReader.prototype = new DataReader();
/**
 * @see DataReader.byteAt
 */
Uint8ArrayReader.prototype.byteAt = function(i) {
    return this.data[i];
};
/**
 * @see DataReader.lastIndexOfSignature
 */
Uint8ArrayReader.prototype.lastIndexOfSignature = function(sig) {
    var sig0 = sig.charCodeAt(0),
        sig1 = sig.charCodeAt(1),
        sig2 = sig.charCodeAt(2),
        sig3 = sig.charCodeAt(3);
    for (var i = this.length - 4; i >= 0; --i) {
        if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
            return i;
        }
    }

    return -1;
};
/**
 * @see DataReader.readData
 */
Uint8ArrayReader.prototype.readData = function(size) {
    this.checkOffset(size);
    if(size === 0) {
        // in IE10, when using subarray(idx, idx), we get the array [0x00] instead of [].
        return new Uint8Array(0);
    }
    var result = this.data.subarray(this.index, this.index + size);
    this.index += size;
    return result;
};
module.exports = Uint8ArrayReader;

},{"./dataReader":5}],18:[function(require,module,exports){
'use strict';

var utils = require('./utils');

/**
 * An object to write any content to an Uint8Array.
 * @constructor
 * @param {number} length The length of the array.
 */
var Uint8ArrayWriter = function(length) {
    this.data = new Uint8Array(length);
    this.index = 0;
};
Uint8ArrayWriter.prototype = {
    /**
     * Append any content to the current array.
     * @param {Object} input the content to add.
     */
    append: function(input) {
        if (input.length !== 0) {
            // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
            input = utils.transformTo("uint8array", input);
            this.data.set(input, this.index);
            this.index += input.length;
        }
    },
    /**
     * Finalize the construction an return the result.
     * @return {Uint8Array} the generated array.
     */
    finalize: function() {
        return this.data;
    }
};

module.exports = Uint8ArrayWriter;

},{"./utils":20}],19:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var support = require('./support');
var nodeBuffer = require('./nodeBuffer');

var textEncoder, textDecoder;
if (
    support.uint8array &&
    typeof TextEncoder === "function" &&
    typeof TextDecoder === "function"
) {
    textEncoder = new TextEncoder("utf-8");
    textDecoder = new TextDecoder("utf-8");
}

/**
 * The following functions come from pako, from pako/lib/utils/strings
 * released under the MIT license, see pako https://github.com/nodeca/pako/
 */

// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new Array(256);
for (var i=0; i<256; i++) {
  _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
}
_utf8len[254]=_utf8len[254]=1; // Invalid sequence start

// convert string to array (typed, when possible)
var string2buf = function (str) {
    var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

    // count binary size
    for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
            c2 = str.charCodeAt(m_pos+1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                m_pos++;
            }
        }
        buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
    }

    // allocate buffer
    if (support.uint8array) {
        buf = new Uint8Array(buf_len);
    } else {
        buf = new Array(buf_len);
    }

    // convert
    for (i=0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
            c2 = str.charCodeAt(m_pos+1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                m_pos++;
            }
        }
        if (c < 0x80) {
            /* one byte */
            buf[i++] = c;
        } else if (c < 0x800) {
            /* two bytes */
            buf[i++] = 0xC0 | (c >>> 6);
            buf[i++] = 0x80 | (c & 0x3f);
        } else if (c < 0x10000) {
            /* three bytes */
            buf[i++] = 0xE0 | (c >>> 12);
            buf[i++] = 0x80 | (c >>> 6 & 0x3f);
            buf[i++] = 0x80 | (c & 0x3f);
        } else {
            /* four bytes */
            buf[i++] = 0xf0 | (c >>> 18);
            buf[i++] = 0x80 | (c >>> 12 & 0x3f);
            buf[i++] = 0x80 | (c >>> 6 & 0x3f);
            buf[i++] = 0x80 | (c & 0x3f);
        }
    }

    return buf;
};

// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = function(buf, max) {
    var pos;

    max = max || buf.length;
    if (max > buf.length) { max = buf.length; }

    // go back from last position, until start of sequence found
    pos = max-1;
    while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

    // Fuckup - very small and broken sequence,
    // return max, because we should return something anyway.
    if (pos < 0) { return max; }

    // If we came to start of buffer - that means vuffer is too small,
    // return max too.
    if (pos === 0) { return max; }

    return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

// convert array to string
var buf2string = function (buf) {
    var str, i, out, c, c_len;
    var len = buf.length;

    // Reserve max possible length (2 words per char)
    // NB: by unknown reasons, Array is significantly faster for
    //     String.fromCharCode.apply than Uint16Array.
    var utf16buf = new Array(len*2);

    for (out=0, i=0; i<len;) {
        c = buf[i++];
        // quick process ascii
        if (c < 0x80) { utf16buf[out++] = c; continue; }

        c_len = _utf8len[c];
        // skip 5 & 6 byte codes
        if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len-1; continue; }

        // apply mask on first byte
        c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
        // join the rest
        while (c_len > 1 && i < len) {
            c = (c << 6) | (buf[i++] & 0x3f);
            c_len--;
        }

        // terminated by end of string?
        if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

        if (c < 0x10000) {
            utf16buf[out++] = c;
        } else {
            c -= 0x10000;
            utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
            utf16buf[out++] = 0xdc00 | (c & 0x3ff);
        }
    }

    // shrinkBuf(utf16buf, out)
    if (utf16buf.length !== out) {
        if(utf16buf.subarray) {
            utf16buf = utf16buf.subarray(0, out);
        } else {
            utf16buf.length = out;
        }
    }

    // return String.fromCharCode.apply(null, utf16buf);
    return utils.applyFromCharCode(utf16buf);
};


// That's all for the pako functions.


/**
 * Transform a javascript string into an array (typed if possible) of bytes,
 * UTF-8 encoded.
 * @param {String} str the string to encode
 * @return {Array|Uint8Array|Buffer} the UTF-8 encoded string.
 */
exports.utf8encode = function utf8encode(str) {
    // TextEncoder + Uint8Array to binary string is faster than checking every bytes on long strings.
    // http://jsperf.com/utf8encode-vs-textencoder
    // On short strings (file names for example), the TextEncoder API is (currently) slower.
    if (textEncoder) {
        return textEncoder.encode(str);
    }
    if (support.nodebuffer) {
        return nodeBuffer(str, "utf-8");
    }

    return string2buf(str);
};


/**
 * Transform a bytes array (or a representation) representing an UTF-8 encoded
 * string into a javascript string.
 * @param {Array|Uint8Array|Buffer} buf the data de decode
 * @return {String} the decoded string.
 */
exports.utf8decode = function utf8decode(buf) {
    // check if we can use the TextDecoder API
    // see http://encoding.spec.whatwg.org/#api
    if (textDecoder) {
        return textDecoder.decode(
            utils.transformTo("uint8array", buf)
        );
    }
    if (support.nodebuffer) {
        return utils.transformTo("nodebuffer", buf).toString("utf-8");
    }

    buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);

    // return buf2string(buf);
    // Chrome prefers to work with "small" chunks of data
    // for the method buf2string.
    // Firefox and Chrome has their own shortcut, IE doesn't seem to really care.
    var result = [], k = 0, len = buf.length, chunk = 65536;
    while (k < len) {
        var nextBoundary = utf8border(buf, Math.min(k + chunk, len));
        if (support.uint8array) {
            result.push(buf2string(buf.subarray(k, nextBoundary)));
        } else {
            result.push(buf2string(buf.slice(k, nextBoundary)));
        }
        k = nextBoundary;
    }
    return result.join("");

};
// vim: set shiftwidth=4 softtabstop=4:

},{"./nodeBuffer":39,"./support":16,"./utils":20}],20:[function(require,module,exports){
'use strict';
var support = require('./support');
var compressions = require('./compressions');
var nodeBuffer = require('./nodeBuffer');
/**
 * Convert a string to a "binary string" : a string containing only char codes between 0 and 255.
 * @param {string} str the string to transform.
 * @return {String} the binary string.
 */
exports.string2binary = function(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) & 0xff);
    }
    return result;
};
exports.arrayBuffer2Blob = function(buffer) {
    exports.checkSupport("blob");

    try {
        // Blob constructor
        return new Blob([buffer], {
            type: "application/zip"
        });
    }
    catch (e) {

        try {
            // deprecated, browser only, old way
            var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new Builder();
            builder.append(buffer);
            return builder.getBlob('application/zip');
        }
        catch (e) {

            // well, fuck ?!
            throw new Error("Bug : can't construct the Blob.");
        }
    }


};
/**
 * The identity function.
 * @param {Object} input the input.
 * @return {Object} the same input.
 */
function identity(input) {
    return input;
}

/**
 * Fill in an array with a string.
 * @param {String} str the string to use.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
 */
function stringToArrayLike(str, array) {
    for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 0xFF;
    }
    return array;
}

/**
 * Transform an array-like object to a string.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
 * @return {String} the result.
 */
function arrayLikeToString(array) {
    // Performances notes :
    // --------------------
    // String.fromCharCode.apply(null, array) is the fastest, see
    // see http://jsperf.com/converting-a-uint8array-to-a-string/2
    // but the stack is limited (and we can get huge arrays !).
    //
    // result += String.fromCharCode(array[i]); generate too many strings !
    //
    // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2
    var chunk = 65536;
    var result = [],
        len = array.length,
        type = exports.getTypeOf(array),
        k = 0,
        canUseApply = true;
      try {
         switch(type) {
            case "uint8array":
               String.fromCharCode.apply(null, new Uint8Array(0));
               break;
            case "nodebuffer":
               String.fromCharCode.apply(null, nodeBuffer(0));
               break;
         }
      } catch(e) {
         canUseApply = false;
      }

      // no apply : slow and painful algorithm
      // default browser on android 4.*
      if (!canUseApply) {
         var resultStr = "";
         for(var i = 0; i < array.length;i++) {
            resultStr += String.fromCharCode(array[i]);
         }
    return resultStr;
    }
    while (k < len && chunk > 1) {
        try {
            if (type === "array" || type === "nodebuffer") {
                result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
            }
            else {
                result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
            }
            k += chunk;
        }
        catch (e) {
            chunk = Math.floor(chunk / 2);
        }
    }
    return result.join("");
}

exports.applyFromCharCode = arrayLikeToString;


/**
 * Copy the data from an array-like to an other array-like.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
 */
function arrayLikeToArrayLike(arrayFrom, arrayTo) {
    for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
    }
    return arrayTo;
}

// a matrix containing functions to transform everything into everything.
var transform = {};

// string to ?
transform["string"] = {
    "string": identity,
    "array": function(input) {
        return stringToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function(input) {
        return transform["string"]["uint8array"](input).buffer;
    },
    "uint8array": function(input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
    },
    "nodebuffer": function(input) {
        return stringToArrayLike(input, nodeBuffer(input.length));
    }
};

// array to ?
transform["array"] = {
    "string": arrayLikeToString,
    "array": identity,
    "arraybuffer": function(input) {
        return (new Uint8Array(input)).buffer;
    },
    "uint8array": function(input) {
        return new Uint8Array(input);
    },
    "nodebuffer": function(input) {
        return nodeBuffer(input);
    }
};

// arraybuffer to ?
transform["arraybuffer"] = {
    "string": function(input) {
        return arrayLikeToString(new Uint8Array(input));
    },
    "array": function(input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
    },
    "arraybuffer": identity,
    "uint8array": function(input) {
        return new Uint8Array(input);
    },
    "nodebuffer": function(input) {
        return nodeBuffer(new Uint8Array(input));
    }
};

// uint8array to ?
transform["uint8array"] = {
    "string": arrayLikeToString,
    "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function(input) {
        return input.buffer;
    },
    "uint8array": identity,
    "nodebuffer": function(input) {
        return nodeBuffer(input);
    }
};

// nodebuffer to ?
transform["nodebuffer"] = {
    "string": arrayLikeToString,
    "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function(input) {
        return transform["nodebuffer"]["uint8array"](input).buffer;
    },
    "uint8array": function(input) {
        return arrayLikeToArrayLike(input, new Uint8Array(input.length));
    },
    "nodebuffer": identity
};

/**
 * Transform an input into any type.
 * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
 * If no output type is specified, the unmodified input will be returned.
 * @param {String} outputType the output type.
 * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.
 * @throws {Error} an Error if the browser doesn't support the requested output type.
 */
exports.transformTo = function(outputType, input) {
    if (!input) {
        // undefined, null, etc
        // an empty string won't harm.
        input = "";
    }
    if (!outputType) {
        return input;
    }
    exports.checkSupport(outputType);
    var inputType = exports.getTypeOf(input);
    var result = transform[inputType][outputType](input);
    return result;
};

/**
 * Return the type of the input.
 * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
 * @param {Object} input the input to identify.
 * @return {String} the (lowercase) type of the input.
 */
exports.getTypeOf = function(input) {
    if (typeof input === "string") {
        return "string";
    }
    if (Object.prototype.toString.call(input) === "[object Array]") {
        return "array";
    }
    if (support.nodebuffer && nodeBuffer.test(input)) {
        return "nodebuffer";
    }
    if (support.uint8array && input instanceof Uint8Array) {
        return "uint8array";
    }
    if (support.arraybuffer && input instanceof ArrayBuffer) {
        return "arraybuffer";
    }
};

/**
 * Throw an exception if the type is not supported.
 * @param {String} type the type to check.
 * @throws {Error} an Error if the browser doesn't support the requested type.
 */
exports.checkSupport = function(type) {
    var supported = support[type.toLowerCase()];
    if (!supported) {
        throw new Error(type + " is not supported by this browser");
    }
};
exports.MAX_VALUE_16BITS = 65535;
exports.MAX_VALUE_32BITS = -1; // well, "\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF" is parsed as -1

/**
 * Prettify a string read as binary.
 * @param {string} str the string to prettify.
 * @return {string} a pretty string.
 */
exports.pretty = function(str) {
    var res = '',
        code, i;
    for (i = 0; i < (str || "").length; i++) {
        code = str.charCodeAt(i);
        res += '\\x' + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
    }
    return res;
};

/**
 * Find a compression registered in JSZip.
 * @param {string} compressionMethod the method magic to find.
 * @return {Object|null} the JSZip compression object, null if none found.
 */
exports.findCompression = function(compressionMethod) {
    for (var method in compressions) {
        if (!compressions.hasOwnProperty(method)) {
            continue;
        }
        if (compressions[method].magic === compressionMethod) {
            return compressions[method];
        }
    }
    return null;
};
/**
* Cross-window, cross-Node-context regular expression detection
* @param  {Object}  object Anything
* @return {Boolean}        true if the object is a regular expression,
* false otherwise
*/
exports.isRegExp = function (object) {
    return Object.prototype.toString.call(object) === "[object RegExp]";
};


},{"./compressions":3,"./nodeBuffer":39,"./support":16}],21:[function(require,module,exports){
'use strict';
var StringReader = require('./stringReader');
var NodeBufferReader = require('./nodeBufferReader');
var Uint8ArrayReader = require('./uint8ArrayReader');
var utils = require('./utils');
var sig = require('./signature');
var ZipEntry = require('./zipEntry');
var support = require('./support');
var jszipProto = require('./object');
//  class ZipEntries {{{
/**
 * All the entries in the zip file.
 * @constructor
 * @param {String|ArrayBuffer|Uint8Array} data the binary stream to load.
 * @param {Object} loadOptions Options for loading the stream.
 */
function ZipEntries(data, loadOptions) {
    this.files = [];
    this.loadOptions = loadOptions;
    if (data) {
        this.load(data);
    }
}
ZipEntries.prototype = {
    /**
     * Check that the reader is on the speficied signature.
     * @param {string} expectedSignature the expected signature.
     * @throws {Error} if it is an other signature.
     */
    checkSignature: function(expectedSignature) {
        var signature = this.reader.readString(4);
        if (signature !== expectedSignature) {
            throw new Error("Corrupted zip or bug : unexpected signature " + "(" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
        }
    },
    /**
     * Read the end of the central directory.
     */
    readBlockEndOfCentral: function() {
        this.diskNumber = this.reader.readInt(2);
        this.diskWithCentralDirStart = this.reader.readInt(2);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
        this.centralDirRecords = this.reader.readInt(2);
        this.centralDirSize = this.reader.readInt(4);
        this.centralDirOffset = this.reader.readInt(4);

        this.zipCommentLength = this.reader.readInt(2);
        // warning : the encoding depends of the system locale
        // On a linux machine with LANG=en_US.utf8, this field is utf8 encoded.
        // On a windows machine, this field is encoded with the localized windows code page.
        this.zipComment = this.reader.readString(this.zipCommentLength);
        // To get consistent behavior with the generation part, we will assume that
        // this is utf8 encoded.
        this.zipComment = jszipProto.utf8decode(this.zipComment);
    },
    /**
     * Read the end of the Zip 64 central directory.
     * Not merged with the method readEndOfCentral :
     * The end of central can coexist with its Zip64 brother,
     * I don't want to read the wrong number of bytes !
     */
    readBlockZip64EndOfCentral: function() {
        this.zip64EndOfCentralSize = this.reader.readInt(8);
        this.versionMadeBy = this.reader.readString(2);
        this.versionNeeded = this.reader.readInt(2);
        this.diskNumber = this.reader.readInt(4);
        this.diskWithCentralDirStart = this.reader.readInt(4);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
        this.centralDirRecords = this.reader.readInt(8);
        this.centralDirSize = this.reader.readInt(8);
        this.centralDirOffset = this.reader.readInt(8);

        this.zip64ExtensibleData = {};
        var extraDataSize = this.zip64EndOfCentralSize - 44,
            index = 0,
            extraFieldId,
            extraFieldLength,
            extraFieldValue;
        while (index < extraDataSize) {
            extraFieldId = this.reader.readInt(2);
            extraFieldLength = this.reader.readInt(4);
            extraFieldValue = this.reader.readString(extraFieldLength);
            this.zip64ExtensibleData[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue
            };
        }
    },
    /**
     * Read the end of the Zip 64 central directory locator.
     */
    readBlockZip64EndOfCentralLocator: function() {
        this.diskWithZip64CentralDirStart = this.reader.readInt(4);
        this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
        this.disksCount = this.reader.readInt(4);
        if (this.disksCount > 1) {
            throw new Error("Multi-volumes zip are not supported");
        }
    },
    /**
     * Read the local files, based on the offset read in the central part.
     */
    readLocalFiles: function() {
        var i, file;
        for (i = 0; i < this.files.length; i++) {
            file = this.files[i];
            this.reader.setIndex(file.localHeaderOffset);
            this.checkSignature(sig.LOCAL_FILE_HEADER);
            file.readLocalPart(this.reader);
            file.handleUTF8();
        }
    },
    /**
     * Read the central directory.
     */
    readCentralDir: function() {
        var file;

        this.reader.setIndex(this.centralDirOffset);
        while (this.reader.readString(4) === sig.CENTRAL_FILE_HEADER) {
            file = new ZipEntry({
                zip64: this.zip64
            }, this.loadOptions);
            file.readCentralPart(this.reader);
            this.files.push(file);
        }
    },
    /**
     * Read the end of central directory.
     */
    readEndOfCentral: function() {
        var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
        if (offset === -1) {
            throw new Error("Corrupted zip : can't find end of central directory");
        }
        this.reader.setIndex(offset);
        this.checkSignature(sig.CENTRAL_DIRECTORY_END);
        this.readBlockEndOfCentral();


        /* extract from the zip spec :
            4)  If one of the fields in the end of central directory
                record is too small to hold required data, the field
                should be set to -1 (0xFFFF or 0xFFFFFFFF) and the
                ZIP64 format record should be created.
            5)  The end of central directory record and the
                Zip64 end of central directory locator record must
                reside on the same disk when splitting or spanning
                an archive.
         */
        if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
            this.zip64 = true;

            /*
            Warning : the zip64 extension is supported, but ONLY if the 64bits integer read from
            the zip file can fit into a 32bits integer. This cannot be solved : Javascript represents
            all numbers as 64-bit double precision IEEE 754 floating point numbers.
            So, we have 53bits for integers and bitwise operations treat everything as 32bits.
            see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators
            and http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf section 8.5
            */

            // should look for a zip64 EOCD locator
            offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            if (offset === -1) {
                throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");
            }
            this.reader.setIndex(offset);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            this.readBlockZip64EndOfCentralLocator();

            // now the zip64 EOCD record
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
            this.readBlockZip64EndOfCentral();
        }
    },
    prepareReader: function(data) {
        var type = utils.getTypeOf(data);
        if (type === "string" && !support.uint8array) {
            this.reader = new StringReader(data, this.loadOptions.optimizedBinaryString);
        }
        else if (type === "nodebuffer") {
            this.reader = new NodeBufferReader(data);
        }
        else {
            this.reader = new Uint8ArrayReader(utils.transformTo("uint8array", data));
        }
    },
    /**
     * Read a zip file and create ZipEntries.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
     */
    load: function(data) {
        this.prepareReader(data);
        this.readEndOfCentral();
        this.readCentralDir();
        this.readLocalFiles();
    }
};
// }}} end of ZipEntries
module.exports = ZipEntries;

},{"./nodeBufferReader":39,"./object":12,"./signature":13,"./stringReader":14,"./support":16,"./uint8ArrayReader":17,"./utils":20,"./zipEntry":22}],22:[function(require,module,exports){
'use strict';
var StringReader = require('./stringReader');
var utils = require('./utils');
var CompressedObject = require('./compressedObject');
var jszipProto = require('./object');
// class ZipEntry {{{
/**
 * An entry in the zip file.
 * @constructor
 * @param {Object} options Options of the current file.
 * @param {Object} loadOptions Options for loading the stream.
 */
function ZipEntry(options, loadOptions) {
    this.options = options;
    this.loadOptions = loadOptions;
}
ZipEntry.prototype = {
    /**
     * say if the file is encrypted.
     * @return {boolean} true if the file is encrypted, false otherwise.
     */
    isEncrypted: function() {
        // bit 1 is set
        return (this.bitFlag & 0x0001) === 0x0001;
    },
    /**
     * say if the file has utf-8 filename/comment.
     * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
     */
    useUTF8: function() {
        // bit 11 is set
        return (this.bitFlag & 0x0800) === 0x0800;
    },
    /**
     * Prepare the function used to generate the compressed content from this ZipFile.
     * @param {DataReader} reader the reader to use.
     * @param {number} from the offset from where we should read the data.
     * @param {number} length the length of the data to read.
     * @return {Function} the callback to get the compressed content (the type depends of the DataReader class).
     */
    prepareCompressedContent: function(reader, from, length) {
        return function() {
            var previousIndex = reader.index;
            reader.setIndex(from);
            var compressedFileData = reader.readData(length);
            reader.setIndex(previousIndex);

            return compressedFileData;
        };
    },
    /**
     * Prepare the function used to generate the uncompressed content from this ZipFile.
     * @param {DataReader} reader the reader to use.
     * @param {number} from the offset from where we should read the data.
     * @param {number} length the length of the data to read.
     * @param {JSZip.compression} compression the compression used on this file.
     * @param {number} uncompressedSize the uncompressed size to expect.
     * @return {Function} the callback to get the uncompressed content (the type depends of the DataReader class).
     */
    prepareContent: function(reader, from, length, compression, uncompressedSize) {
        return function() {

            var compressedFileData = utils.transformTo(compression.uncompressInputType, this.getCompressedContent());
            var uncompressedFileData = compression.uncompress(compressedFileData);

            if (uncompressedFileData.length !== uncompressedSize) {
                throw new Error("Bug : uncompressed data size mismatch");
            }

            return uncompressedFileData;
        };
    },
    /**
     * Read the local part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readLocalPart: function(reader) {
        var compression, localExtraFieldsLength;

        // we already know everything from the central dir !
        // If the central dir data are false, we are doomed.
        // On the bright side, the local part is scary  : zip64, data descriptors, both, etc.
        // The less data we get here, the more reliable this should be.
        // Let's skip the whole header and dash to the data !
        reader.skip(22);
        // in some zip created on windows, the filename stored in the central dir contains \ instead of /.
        // Strangely, the filename here is OK.
        // I would love to treat these zip files as corrupted (see http://www.info-zip.org/FAQ.html#backslashes
        // or APPNOTE#4.4.17.1, "All slashes MUST be forward slashes '/'") but there are a lot of bad zip generators...
        // Search "unzip mismatching "local" filename continuing with "central" filename version" on
        // the internet.
        //
        // I think I see the logic here : the central directory is used to display
        // content and the local directory is used to extract the files. Mixing / and \
        // may be used to display \ to windows users and use / when extracting the files.
        // Unfortunately, this lead also to some issues : http://seclists.org/fulldisclosure/2009/Sep/394
        this.fileNameLength = reader.readInt(2);
        localExtraFieldsLength = reader.readInt(2); // can't be sure this will be the same as the central dir
        this.fileName = reader.readString(this.fileNameLength);
        reader.skip(localExtraFieldsLength);

        if (this.compressedSize == -1 || this.uncompressedSize == -1) {
            throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory " + "(compressedSize == -1 || uncompressedSize == -1)");
        }

        compression = utils.findCompression(this.compressionMethod);
        if (compression === null) { // no compression found
            throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + this.fileName + ")");
        }
        this.decompressed = new CompressedObject();
        this.decompressed.compressedSize = this.compressedSize;
        this.decompressed.uncompressedSize = this.uncompressedSize;
        this.decompressed.crc32 = this.crc32;
        this.decompressed.compressionMethod = this.compressionMethod;
        this.decompressed.getCompressedContent = this.prepareCompressedContent(reader, reader.index, this.compressedSize, compression);
        this.decompressed.getContent = this.prepareContent(reader, reader.index, this.compressedSize, compression, this.uncompressedSize);

        // we need to compute the crc32...
        if (this.loadOptions.checkCRC32) {
            this.decompressed = utils.transformTo("string", this.decompressed.getContent());
            if (jszipProto.crc32(this.decompressed) !== this.crc32) {
                throw new Error("Corrupted zip : CRC32 mismatch");
            }
        }
    },

    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readCentralPart: function(reader) {
        this.versionMadeBy = reader.readString(2);
        this.versionNeeded = reader.readInt(2);
        this.bitFlag = reader.readInt(2);
        this.compressionMethod = reader.readString(2);
        this.date = reader.readDate();
        this.crc32 = reader.readInt(4);
        this.compressedSize = reader.readInt(4);
        this.uncompressedSize = reader.readInt(4);
        this.fileNameLength = reader.readInt(2);
        this.extraFieldsLength = reader.readInt(2);
        this.fileCommentLength = reader.readInt(2);
        this.diskNumberStart = reader.readInt(2);
        this.internalFileAttributes = reader.readInt(2);
        this.externalFileAttributes = reader.readInt(4);
        this.localHeaderOffset = reader.readInt(4);

        if (this.isEncrypted()) {
            throw new Error("Encrypted zip are not supported");
        }

        this.fileName = reader.readString(this.fileNameLength);
        this.readExtraFields(reader);
        this.parseZIP64ExtraField(reader);
        this.fileComment = reader.readString(this.fileCommentLength);

        // warning, this is true only for zip with madeBy == DOS (plateform dependent feature)
        this.dir = this.externalFileAttributes & 0x00000010 ? true : false;
    },
    /**
     * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
     * @param {DataReader} reader the reader to use.
     */
    parseZIP64ExtraField: function(reader) {

        if (!this.extraFields[0x0001]) {
            return;
        }

        // should be something, preparing the extra reader
        var extraReader = new StringReader(this.extraFields[0x0001].value);

        // I really hope that these 64bits integer can fit in 32 bits integer, because js
        // won't let us have more.
        if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
            this.uncompressedSize = extraReader.readInt(8);
        }
        if (this.compressedSize === utils.MAX_VALUE_32BITS) {
            this.compressedSize = extraReader.readInt(8);
        }
        if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
            this.localHeaderOffset = extraReader.readInt(8);
        }
        if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
            this.diskNumberStart = extraReader.readInt(4);
        }
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readExtraFields: function(reader) {
        var start = reader.index,
            extraFieldId,
            extraFieldLength,
            extraFieldValue;

        this.extraFields = this.extraFields || {};

        while (reader.index < start + this.extraFieldsLength) {
            extraFieldId = reader.readInt(2);
            extraFieldLength = reader.readInt(2);
            extraFieldValue = reader.readString(extraFieldLength);

            this.extraFields[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue
            };
        }
    },
    /**
     * Apply an UTF8 transformation if needed.
     */
    handleUTF8: function() {
        if (this.useUTF8()) {
            this.fileName = jszipProto.utf8decode(this.fileName);
            this.fileComment = jszipProto.utf8decode(this.fileComment);
        } else {
            var upath = this.findExtraFieldUnicodePath();
            if (upath !== null) {
                this.fileName = upath;
            }
            var ucomment = this.findExtraFieldUnicodeComment();
            if (ucomment !== null) {
                this.fileComment = ucomment;
            }
        }
    },

    /**
     * Find the unicode path declared in the extra field, if any.
     * @return {String} the unicode path, null otherwise.
     */
    findExtraFieldUnicodePath: function() {
        var upathField = this.extraFields[0x7075];
        if (upathField) {
            var extraReader = new StringReader(upathField.value);

            // wrong version
            if (extraReader.readInt(1) !== 1) {
                return null;
            }

            // the crc of the filename changed, this field is out of date.
            if (jszipProto.crc32(this.fileName) !== extraReader.readInt(4)) {
                return null;
            }

            return jszipProto.utf8decode(extraReader.readString(upathField.length - 5));
        }
        return null;
    },

    /**
     * Find the unicode comment declared in the extra field, if any.
     * @return {String} the unicode comment, null otherwise.
     */
    findExtraFieldUnicodeComment: function() {
        var ucommentField = this.extraFields[0x6375];
        if (ucommentField) {
            var extraReader = new StringReader(ucommentField.value);

            // wrong version
            if (extraReader.readInt(1) !== 1) {
                return null;
            }

            // the crc of the comment changed, this field is out of date.
            if (jszipProto.crc32(this.fileComment) !== extraReader.readInt(4)) {
                return null;
            }

            return jszipProto.utf8decode(extraReader.readString(ucommentField.length - 5));
        }
        return null;
    }
};
module.exports = ZipEntry;

},{"./compressedObject":2,"./object":12,"./stringReader":14,"./utils":20}],23:[function(require,module,exports){
// Top level file is just a mixin of submodules & constants
'use strict';

var assign    = require('./lib/utils/common').assign;

var deflate   = require('./lib/deflate');
var inflate   = require('./lib/inflate');
var constants = require('./lib/zlib/constants');

var pako = {};

assign(pako, deflate, inflate, constants);

module.exports = pako;
},{"./lib/deflate":24,"./lib/inflate":25,"./lib/utils/common":26,"./lib/zlib/constants":29}],24:[function(require,module,exports){
'use strict';


var zlib_deflate = require('./zlib/deflate.js');
var utils = require('./utils/common');
var strings = require('./utils/strings');
var msg = require('./zlib/messages');
var zstream = require('./zlib/zstream');


/* Public constants ==========================================================*/
/* ===========================================================================*/

var Z_NO_FLUSH      = 0;
var Z_FINISH        = 4;

var Z_OK            = 0;
var Z_STREAM_END    = 1;

var Z_DEFAULT_COMPRESSION = -1;

var Z_DEFAULT_STRATEGY    = 0;

var Z_DEFLATED  = 8;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overriden.
 **/

/**
 * Deflate.result -> Uint8Array|Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
var Deflate = function(options) {

  this.options = utils.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY,
    to: ''
  }, options || {});

  var opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new zstream();
  this.strm.avail_out = 0;

  var status = zlib_deflate.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK) {
    throw new Error(msg[status]);
  }

  if (opt.header) {
    zlib_deflate.deflateSetHeader(this.strm, opt.header);
  }
};

/**
 * Deflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|String): input data. Strings will be converted to
 *   utf8 byte sequence.
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That flush internal pending buffers and call
 * [[Deflate#onEnd]].
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * array format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate.prototype.push = function(data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;

  if (this.ended) { return false; }

  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = zlib_deflate.deflate(strm, _mode);    /* no bad return value */

    if (status !== Z_STREAM_END && status !== Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }
    if (strm.avail_out === 0 || (strm.avail_in === 0 && _mode === Z_FINISH)) {
      if (this.options.to === 'string') {
        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
      } else {
        this.onData(utils.shrinkBuf(strm.output, strm.next_out));
      }
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

  // Finalize on the last chunk.
  if (_mode === Z_FINISH) {
    status = zlib_deflate.deflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === Z_OK;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that input stream complete
 * or error happenned. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate.prototype.onEnd = function(status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate alrorythm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate(input, options) {
  var deflator = new Deflate(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate(input, options);
}


exports.Deflate = Deflate;
exports.deflate = deflate;
exports.deflateRaw = deflateRaw;
exports.gzip = gzip;
},{"./utils/common":26,"./utils/strings":27,"./zlib/deflate.js":31,"./zlib/messages":36,"./zlib/zstream":38}],25:[function(require,module,exports){
'use strict';


var zlib_inflate = require('./zlib/inflate.js');
var utils = require('./utils/common');
var strings = require('./utils/strings');
var c = require('./zlib/constants');
var msg = require('./zlib/messages');
var zstream = require('./zlib/zstream');
var gzheader = require('./zlib/gzheader');


/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overriden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
var Inflate = function(options) {

  this.options = utils.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  var status  = zlib_inflate.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== c.Z_OK) {
    throw new Error(msg[status]);
  }

  this.header = new gzheader();

  zlib_inflate.inflateGetHeader(this.strm, this.header);
};

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That flush internal pending buffers and call
 * [[Inflate#onEnd]].
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function(data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;
  var next_out_utf8, tail, utf8str;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */

    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && _mode === c.Z_FINISH)) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }
  } while ((strm.avail_in > 0) && status !== c.Z_STREAM_END);

  if (status === c.Z_STREAM_END) {
    _mode = c.Z_FINISH;
  }
  // Finalize on the last chunk.
  if (_mode === c.Z_FINISH) {
    status = zlib_inflate.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === c.Z_OK;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell inflate that input stream complete
 * or error happenned. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function(status) {
  // On success - join
  if (status === c.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 alligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip  = inflate;

},{"./utils/common":26,"./utils/strings":27,"./zlib/constants":29,"./zlib/gzheader":32,"./zlib/inflate.js":34,"./zlib/messages":36,"./zlib/zstream":38}],26:[function(require,module,exports){
'use strict';


var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');


exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof(source) !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (source.hasOwnProperty(p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs+len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for(var i=0; i<len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function(chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i=0, l=chunks.length; i<l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i=0, l=chunks.length; i<l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for(var i=0; i<len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function(chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);
},{}],27:[function(require,module,exports){
// String encode/decode helpers
'use strict';


var utils = require('./common');


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safary
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [0]); } catch(__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch(__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new utils.Buf8(256);
for (var i=0; i<256; i++) {
  _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
}
_utf8len[254]=_utf8len[254]=1; // Invalid sequence start


// convert string to array (typed, when possible)
exports.string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
      c2 = str.charCodeAt(m_pos+1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new utils.Buf8(buf_len);

  // convert
  for (i=0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
      c2 = str.charCodeAt(m_pos+1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // use fallback for big arrays to avoid stack overflow
  if (len < 65537) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for(var i=0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
exports.buf2binstring = function(buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
exports.binstring2buf = function(str) {
  var buf = new utils.Buf8(str.length);
  for(var i=0, len=buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
exports.buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len*2);

  for (out=0, i=0; i<len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len-1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
exports.utf8border = function(buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max-1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Fuckup - very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means vuffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

},{"./common":26}],28:[function(require,module,exports){
'use strict';

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It doesn't worth to make additional optimizationa as in original.
// Small size is preferable.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0
    , s2 = ((adler >>> 16) & 0xffff) |0
    , n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;
},{}],29:[function(require,module,exports){
module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
},{}],30:[function(require,module,exports){
'use strict';

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.


// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for(var n =0; n < 256; n++){
    c = n;
    for(var k =0; k < 8; k++){
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable
    , end = pos + len;

  crc = crc ^ (-1);

  for (var i = pos; i < end; i++ ) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;
},{}],31:[function(require,module,exports){
'use strict';

var utils   = require('../utils/common');
var trees   = require('./trees');
var adler32 = require('./adler32');
var crc32   = require('./crc32');
var msg   = require('./messages');

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS      = 256;
/* number of literal bytes 0..255 */
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES       = 30;
/* number of distance codes */
var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE     = 2*L_CODES + 1;
/* maximum heap size */
var MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only (s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH-1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH-1)) ? s.strstart : MIN_MATCH-1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH-1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size-MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH-1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1- s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length-1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH-1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart-1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart-1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH-1 ? s.strstart : MIN_MATCH-1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
var Config = function (good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
};

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree  = new utils.Buf16((2*D_CODES+1) * 2);
  this.bl_tree    = new utils.Buf16((2*BL_CODES+1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS+1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2*L_CODES+1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2*L_CODES+1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  s.d_buf = s.lit_bufsize >> 1;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg){
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}

/* =========================================================================
 * Copy the source state to the destination state
 */
//function deflateCopy(dest, source) {
//
//}

exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/
},{"../utils/common":26,"./adler32":28,"./crc32":30,"./messages":36,"./trees":37}],32:[function(require,module,exports){
'use strict';


function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory 
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

module.exports = GZheader;
},{}],33:[function(require,module,exports){
'use strict';

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  var window;                 /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

},{}],34:[function(require,module,exports){
'use strict';


var utils = require('../utils/common');
var adler32 = require('./adler32');
var crc32   = require('./crc32');
var inflate_fast = require('./inffast');
var inflate_table = require('./inftrees');

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function ZSWAP32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, {bits: 9});

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, {bits: 5});

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window,src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window,src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window,src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
    case HEAD:
      if (state.wrap === 0) {
        state.mode = TYPEDO;
        break;
      }
      //=== NEEDBITS(16);
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
        state.check = 0/*crc32(0L, Z_NULL, 0)*/;
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//

        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = FLAGS;
        break;
      }
      state.flags = 0;           /* expect zlib header */
      if (state.head) {
        state.head.done = false;
      }
      if (!(state.wrap & 1) ||   /* check if zlib header allowed */
        (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
        strm.msg = 'incorrect header check';
        state.mode = BAD;
        break;
      }
      if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
      len = (hold & 0x0f)/*BITS(4)*/ + 8;
      if (state.wbits === 0) {
        state.wbits = len;
      }
      else if (len > state.wbits) {
        strm.msg = 'invalid window size';
        state.mode = BAD;
        break;
      }
      state.dmax = 1 << len;
      //Tracev((stderr, "inflate:   zlib header ok\n"));
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = hold & 0x200 ? DICTID : TYPE;
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      break;
    case FLAGS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.flags = hold;
      if ((state.flags & 0xff) !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      if (state.flags & 0xe000) {
        strm.msg = 'unknown header flags set';
        state.mode = BAD;
        break;
      }
      if (state.head) {
        state.head.text = ((hold >> 8) & 1);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = TIME;
      /* falls through */
    case TIME:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.time = hold;
      }
      if (state.flags & 0x0200) {
        //=== CRC4(state.check, hold)
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        hbuf[2] = (hold >>> 16) & 0xff;
        hbuf[3] = (hold >>> 24) & 0xff;
        state.check = crc32(state.check, hbuf, 4, 0);
        //===
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = OS;
      /* falls through */
    case OS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.xflags = (hold & 0xff);
        state.head.os = (hold >> 8);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = EXLEN;
      /* falls through */
    case EXLEN:
      if (state.flags & 0x0400) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length = hold;
        if (state.head) {
          state.head.extra_len = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      else if (state.head) {
        state.head.extra = null/*Z_NULL*/;
      }
      state.mode = EXTRA;
      /* falls through */
    case EXTRA:
      if (state.flags & 0x0400) {
        copy = state.length;
        if (copy > have) { copy = have; }
        if (copy) {
          if (state.head) {
            len = state.head.extra_len - state.length;
            if (!state.head.extra) {
              // Use untyped array for more conveniend processing later
              state.head.extra = new Array(state.head.extra_len);
            }
            utils.arraySet(
              state.head.extra,
              input,
              next,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              copy,
              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
              len
            );
            //zmemcpy(state.head.extra + len, next,
            //        len + copy > state.head.extra_max ?
            //        state.head.extra_max - len : copy);
          }
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          state.length -= copy;
        }
        if (state.length) { break inf_leave; }
      }
      state.length = 0;
      state.mode = NAME;
      /* falls through */
    case NAME:
      if (state.flags & 0x0800) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          // TODO: 2 or 1 bytes?
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.name_max*/)) {
            state.head.name += String.fromCharCode(len);
          }
        } while (len && copy < have);

        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.name = null;
      }
      state.length = 0;
      state.mode = COMMENT;
      /* falls through */
    case COMMENT:
      if (state.flags & 0x1000) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.comm_max*/)) {
            state.head.comment += String.fromCharCode(len);
          }
        } while (len && copy < have);
        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.comment = null;
      }
      state.mode = HCRC;
      /* falls through */
    case HCRC:
      if (state.flags & 0x0200) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.check & 0xffff)) {
          strm.msg = 'header crc mismatch';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      if (state.head) {
        state.head.hcrc = ((state.flags >> 9) & 1);
        state.head.done = true;
      }
      strm.adler = state.check = 0 /*crc32(0L, Z_NULL, 0)*/;
      state.mode = TYPE;
      break;
    case DICTID:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      strm.adler = state.check = ZSWAP32(hold);
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = DICT;
      /* falls through */
    case DICT:
      if (state.havedict === 0) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        return Z_NEED_DICT;
      }
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = TYPE;
      /* falls through */
    case TYPE:
      if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case TYPEDO:
      if (state.last) {
        //--- BYTEBITS() ---//
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        state.mode = CHECK;
        break;
      }
      //=== NEEDBITS(3); */
      while (bits < 3) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.last = (hold & 0x01)/*BITS(1)*/;
      //--- DROPBITS(1) ---//
      hold >>>= 1;
      bits -= 1;
      //---//

      switch ((hold & 0x03)/*BITS(2)*/) {
      case 0:                             /* stored block */
        //Tracev((stderr, "inflate:     stored block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = STORED;
        break;
      case 1:                             /* fixed block */
        fixedtables(state);
        //Tracev((stderr, "inflate:     fixed codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = LEN_;             /* decode codes */
        if (flush === Z_TREES) {
          //--- DROPBITS(2) ---//
          hold >>>= 2;
          bits -= 2;
          //---//
          break inf_leave;
        }
        break;
      case 2:                             /* dynamic block */
        //Tracev((stderr, "inflate:     dynamic codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = TABLE;
        break;
      case 3:
        strm.msg = 'invalid block type';
        state.mode = BAD;
      }
      //--- DROPBITS(2) ---//
      hold >>>= 2;
      bits -= 2;
      //---//
      break;
    case STORED:
      //--- BYTEBITS() ---// /* go to byte boundary */
      hold >>>= bits & 7;
      bits -= bits & 7;
      //---//
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
        strm.msg = 'invalid stored block lengths';
        state.mode = BAD;
        break;
      }
      state.length = hold & 0xffff;
      //Tracev((stderr, "inflate:       stored length %u\n",
      //        state.length));
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = COPY_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case COPY_:
      state.mode = COPY;
      /* falls through */
    case COPY:
      copy = state.length;
      if (copy) {
        if (copy > have) { copy = have; }
        if (copy > left) { copy = left; }
        if (copy === 0) { break inf_leave; }
        //--- zmemcpy(put, next, copy); ---
        utils.arraySet(output, input, next, copy, put);
        //---//
        have -= copy;
        next += copy;
        left -= copy;
        put += copy;
        state.length -= copy;
        break;
      }
      //Tracev((stderr, "inflate:       stored end\n"));
      state.mode = TYPE;
      break;
    case TABLE:
      //=== NEEDBITS(14); */
      while (bits < 14) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
//#ifndef PKZIP_BUG_WORKAROUND
      if (state.nlen > 286 || state.ndist > 30) {
        strm.msg = 'too many length or distance symbols';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracev((stderr, "inflate:       table sizes ok\n"));
      state.have = 0;
      state.mode = LENLENS;
      /* falls through */
    case LENLENS:
      while (state.have < state.ncode) {
        //=== NEEDBITS(3);
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
        //--- DROPBITS(3) ---//
        hold >>>= 3;
        bits -= 3;
        //---//
      }
      while (state.have < 19) {
        state.lens[order[state.have++]] = 0;
      }
      // We have separate tables & no pointers. 2 commented lines below not needed.
      //state.next = state.codes;
      //state.lencode = state.next;
      // Switch to use dynamic table
      state.lencode = state.lendyn;
      state.lenbits = 7;

      opts = {bits: state.lenbits};
      ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
      state.lenbits = opts.bits;

      if (ret) {
        strm.msg = 'invalid code lengths set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, "inflate:       code lengths ok\n"));
      state.have = 0;
      state.mode = CODELENS;
      /* falls through */
    case CODELENS:
      while (state.have < state.nlen + state.ndist) {
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_val < 16) {
          //--- DROPBITS(here.bits) ---//
          hold >>>= here_bits;
          bits -= here_bits;
          //---//
          state.lens[state.have++] = here_val;
        }
        else {
          if (here_val === 16) {
            //=== NEEDBITS(here.bits + 2);
            n = here_bits + 2;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            if (state.have === 0) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            len = state.lens[state.have - 1];
            copy = 3 + (hold & 0x03);//BITS(2);
            //--- DROPBITS(2) ---//
            hold >>>= 2;
            bits -= 2;
            //---//
          }
          else if (here_val === 17) {
            //=== NEEDBITS(here.bits + 3);
            n = here_bits + 3;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 3 + (hold & 0x07);//BITS(3);
            //--- DROPBITS(3) ---//
            hold >>>= 3;
            bits -= 3;
            //---//
          }
          else {
            //=== NEEDBITS(here.bits + 7);
            n = here_bits + 7;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 11 + (hold & 0x7f);//BITS(7);
            //--- DROPBITS(7) ---//
            hold >>>= 7;
            bits -= 7;
            //---//
          }
          if (state.have + copy > state.nlen + state.ndist) {
            strm.msg = 'invalid bit length repeat';
            state.mode = BAD;
            break;
          }
          while (copy--) {
            state.lens[state.have++] = len;
          }
        }
      }

      /* handle error breaks in while */
      if (state.mode === BAD) { break; }

      /* check for end-of-block code (better have one) */
      if (state.lens[256] === 0) {
        strm.msg = 'invalid code -- missing end-of-block';
        state.mode = BAD;
        break;
      }

      /* build code tables -- note: do not change the lenbits or distbits
         values here (9 and 6) without reading the comments in inftrees.h
         concerning the ENOUGH constants, which depend on those values */
      state.lenbits = 9;

      opts = {bits: state.lenbits};
      ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.lenbits = opts.bits;
      // state.lencode = state.next;

      if (ret) {
        strm.msg = 'invalid literal/lengths set';
        state.mode = BAD;
        break;
      }

      state.distbits = 6;
      //state.distcode.copy(state.codes);
      // Switch to use dynamic table
      state.distcode = state.distdyn;
      opts = {bits: state.distbits};
      ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.distbits = opts.bits;
      // state.distcode = state.next;

      if (ret) {
        strm.msg = 'invalid distances set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, 'inflate:       codes ok\n'));
      state.mode = LEN_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case LEN_:
      state.mode = LEN;
      /* falls through */
    case LEN:
      if (have >= 6 && left >= 258) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        inflate_fast(strm, _out);
        //--- LOAD() ---
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        //---

        if (state.mode === TYPE) {
          state.back = -1;
        }
        break;
      }
      state.back = 0;
      for (;;) {
        here = state.lencode[hold & ((1 << state.lenbits) -1)];  /*BITS(state.lenbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if (here_bits <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if (here_op && (here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.lencode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) -1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      state.length = here_val;
      if (here_op === 0) {
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        state.mode = LIT;
        break;
      }
      if (here_op & 32) {
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.back = -1;
        state.mode = TYPE;
        break;
      }
      if (here_op & 64) {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break;
      }
      state.extra = here_op & 15;
      state.mode = LENEXT;
      /* falls through */
    case LENEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length += hold & ((1 << state.extra) -1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
      //Tracevv((stderr, "inflate:         length %u\n", state.length));
      state.was = state.length;
      state.mode = DIST;
      /* falls through */
    case DIST:
      for (;;) {
        here = state.distcode[hold & ((1 << state.distbits) -1)];/*BITS(state.distbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if ((here_bits) <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if ((here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.distcode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) -1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      if (here_op & 64) {
        strm.msg = 'invalid distance code';
        state.mode = BAD;
        break;
      }
      state.offset = here_val;
      state.extra = (here_op) & 15;
      state.mode = DISTEXT;
      /* falls through */
    case DISTEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.offset += hold & ((1 << state.extra) -1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
//#ifdef INFLATE_STRICT
      if (state.offset > state.dmax) {
        strm.msg = 'invalid distance too far back';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
      state.mode = MATCH;
      /* falls through */
    case MATCH:
      if (left === 0) { break inf_leave; }
      copy = _out - left;
      if (state.offset > copy) {         /* copy from window */
        copy = state.offset - copy;
        if (copy > state.whave) {
          if (state.sane) {
            strm.msg = 'invalid distance too far back';
            state.mode = BAD;
            break;
          }
// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
        }
        if (copy > state.wnext) {
          copy -= state.wnext;
          from = state.wsize - copy;
        }
        else {
          from = state.wnext - copy;
        }
        if (copy > state.length) { copy = state.length; }
        from_source = state.window;
      }
      else {                              /* copy from output */
        from_source = output;
        from = put - state.offset;
        copy = state.length;
      }
      if (copy > left) { copy = left; }
      left -= copy;
      state.length -= copy;
      do {
        output[put++] = from_source[from++];
      } while (--copy);
      if (state.length === 0) { state.mode = LEN; }
      break;
    case LIT:
      if (left === 0) { break inf_leave; }
      output[put++] = state.length;
      left--;
      state.mode = LEN;
      break;
    case CHECK:
      if (state.wrap) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          // Use '|' insdead of '+' to make sure that result is signed
          hold |= input[next++] << bits;
          bits += 8;
        }
        //===//
        _out -= left;
        strm.total_out += _out;
        state.total += _out;
        if (_out) {
          strm.adler = state.check =
              /*UPDATE(state.check, put - _out, _out);*/
              (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

        }
        _out = left;
        // NB: crc32 stored as signed 32-bit int, ZSWAP32 returns signed too
        if ((state.flags ? hold : ZSWAP32(hold)) !== state.check) {
          strm.msg = 'incorrect data check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   check matches trailer\n"));
      }
      state.mode = LENGTH;
      /* falls through */
    case LENGTH:
      if (state.wrap && state.flags) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.total & 0xffffffff)) {
          strm.msg = 'incorrect length check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   length matches trailer\n"));
      }
      state.mode = DONE;
      /* falls through */
    case DONE:
      ret = Z_STREAM_END;
      break inf_leave;
    case BAD:
      ret = Z_DATA_ERROR;
      break inf_leave;
    case MEM:
      return Z_MEM_ERROR;
    case SYNC:
      /* falls through */
    default:
      return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}


exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/
},{"../utils/common":26,"./adler32":28,"./crc32":30,"./inffast":33,"./inftrees":35}],35:[function(require,module,exports){
'use strict';


var utils = require('../utils/common');

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS+1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS+1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
      base = extra = work;    /* dummy value--not used */
      end = 19;
  } else if (type === LENS) {
      base = lbase;
      base_index -= 257;
      extra = lext;
      extra_index -= 257;
      end = 256;
  } else {                    /* DISTS */
      base = dbase;
      extra = dext;
      end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  var i=0;
  /* process all codes and make table entries */
  for (;;) {
    i++;
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--(count[len]) === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

},{"../utils/common":26}],36:[function(require,module,exports){
'use strict';

module.exports = {
  '2':    'need dictionary',     /* Z_NEED_DICT       2  */
  '1':    'stream end',          /* Z_STREAM_END      1  */
  '0':    '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};
},{}],37:[function(require,module,exports){
'use strict';


var utils = require('../utils/common');

/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2*L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES+2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH-MIN_MATCH+1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


var StaticTreeDesc = function (static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
};


var static_l_desc;
var static_d_desc;
var static_bl_desc;


var TreeDesc = function(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
};



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short (s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c*2]/*.Code*/, tree[c*2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max]*2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max+1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n*2 +1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n*2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n-base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n*2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length-1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits+1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m*2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m*2 + 1]/*.Len*/)*tree[m*2]/*.Freq*/;
        tree[m*2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS+1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits-1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n*2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n*2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS+1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES-1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1<<extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length-1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0 ; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1<<extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for ( ; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1<<(extra_dbits[code]-7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n*2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n*2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n*2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n*2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES+1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n*2 + 1]/*.Len*/ = 5;
    static_dtree[n*2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS+1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc =new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n*2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n*2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n*2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK*2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n*2;
  var _m2 = m*2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j+1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx*2] << 8) | (s.pending_buf[s.d_buf + lx*2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code+LITERALS+1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n*2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node*2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n*2 + 1]/*.Dad*/ = tree[m*2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0*2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code+1)*2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n+1)*2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6*2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10*2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138*2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0*2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n+1)*2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count-3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count-3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count-11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES-1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex]*2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3*(max_blindex+1) + 5+5+4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes-257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes-1,   5);
  send_bits(s, blcodes-4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank]*2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes-1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes-1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n*2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK<<1)+(last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES<<1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len+3+7) >>> 3;
    static_lenb = (s.static_len+3+7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len+4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES<<1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES<<1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code+1, s.d_desc.max_code+1, max_blindex+1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc*2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc]+LITERALS+1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize-1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;
},{"../utils/common":26}],38:[function(require,module,exports){
'use strict';


function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;
},{}],39:[function(require,module,exports){

},{}],40:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi9iYXNlNjQuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbGliL2NvbXByZXNzZWRPYmplY3QuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbGliL2NvbXByZXNzaW9ucy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9saWIvY3JjMzIuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbGliL2RhdGFSZWFkZXIuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbGliL2RlZmF1bHRzLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi9kZXByZWNhdGVkUHVibGljVXRpbHMuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbGliL2ZsYXRlLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi9pbmRleC5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9saWIvbG9hZC5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9saWIvb2JqZWN0LmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi9zaWduYXR1cmUuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbGliL3N0cmluZ1JlYWRlci5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9saWIvc3RyaW5nV3JpdGVyLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi9zdXBwb3J0LmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi91aW50OEFycmF5UmVhZGVyLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi91aW50OEFycmF5V3JpdGVyLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi91dGY4LmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL2xpYi91dGlscy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9saWIvemlwRW50cmllcy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9saWIvemlwRW50cnkuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbm9kZV9tb2R1bGVzL3Bha28vaW5kZXguanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbm9kZV9tb2R1bGVzL3Bha28vbGliL2RlZmxhdGUuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbm9kZV9tb2R1bGVzL3Bha28vbGliL2luZmxhdGUuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbm9kZV9tb2R1bGVzL3Bha28vbGliL3V0aWxzL2NvbW1vbi5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvdXRpbHMvc3RyaW5ncy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvemxpYi9hZGxlcjMyLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL25vZGVfbW9kdWxlcy9wYWtvL2xpYi96bGliL2NvbnN0YW50cy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvemxpYi9jcmMzMi5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvemxpYi9kZWZsYXRlLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL25vZGVfbW9kdWxlcy9wYWtvL2xpYi96bGliL2d6aGVhZGVyLmpzIiwiL1VzZXJzL2NsYWtlbmVuL3dvcmtzcGFjZS9sYWtlbmVuL2N1dHRsZWZpc2gvbm9kZV9tb2R1bGVzL2pzemlwL25vZGVfbW9kdWxlcy9wYWtvL2xpYi96bGliL2luZmZhc3QuanMiLCIvVXNlcnMvY2xha2VuZW4vd29ya3NwYWNlL2xha2VuZW4vY3V0dGxlZmlzaC9ub2RlX21vZHVsZXMvanN6aXAvbm9kZV9tb2R1bGVzL3Bha28vbGliL3psaWIvaW5mbGF0ZS5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvemxpYi9pbmZ0cmVlcy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvemxpYi9tZXNzYWdlcy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvemxpYi90cmVlcy5qcyIsIi9Vc2Vycy9jbGFrZW5lbi93b3Jrc3BhY2UvbGFrZW5lbi9jdXR0bGVmaXNoL25vZGVfbW9kdWxlcy9qc3ppcC9ub2RlX21vZHVsZXMvcGFrby9saWIvemxpYi96c3RyZWFtLmpzIiwiL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNodkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwdURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOTlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8vIHByaXZhdGUgcHJvcGVydHlcbnZhciBfa2V5U3RyID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiO1xuXG5cbi8vIHB1YmxpYyBtZXRob2QgZm9yIGVuY29kaW5nXG5leHBvcnRzLmVuY29kZSA9IGZ1bmN0aW9uKGlucHV0LCB1dGY4KSB7XG4gICAgdmFyIG91dHB1dCA9IFwiXCI7XG4gICAgdmFyIGNocjEsIGNocjIsIGNocjMsIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQ7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCBpbnB1dC5sZW5ndGgpIHtcblxuICAgICAgICBjaHIxID0gaW5wdXQuY2hhckNvZGVBdChpKyspO1xuICAgICAgICBjaHIyID0gaW5wdXQuY2hhckNvZGVBdChpKyspO1xuICAgICAgICBjaHIzID0gaW5wdXQuY2hhckNvZGVBdChpKyspO1xuXG4gICAgICAgIGVuYzEgPSBjaHIxID4+IDI7XG4gICAgICAgIGVuYzIgPSAoKGNocjEgJiAzKSA8PCA0KSB8IChjaHIyID4+IDQpO1xuICAgICAgICBlbmMzID0gKChjaHIyICYgMTUpIDw8IDIpIHwgKGNocjMgPj4gNik7XG4gICAgICAgIGVuYzQgPSBjaHIzICYgNjM7XG5cbiAgICAgICAgaWYgKGlzTmFOKGNocjIpKSB7XG4gICAgICAgICAgICBlbmMzID0gZW5jNCA9IDY0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzTmFOKGNocjMpKSB7XG4gICAgICAgICAgICBlbmM0ID0gNjQ7XG4gICAgICAgIH1cblxuICAgICAgICBvdXRwdXQgPSBvdXRwdXQgKyBfa2V5U3RyLmNoYXJBdChlbmMxKSArIF9rZXlTdHIuY2hhckF0KGVuYzIpICsgX2tleVN0ci5jaGFyQXQoZW5jMykgKyBfa2V5U3RyLmNoYXJBdChlbmM0KTtcblxuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vLyBwdWJsaWMgbWV0aG9kIGZvciBkZWNvZGluZ1xuZXhwb3J0cy5kZWNvZGUgPSBmdW5jdGlvbihpbnB1dCwgdXRmOCkge1xuICAgIHZhciBvdXRwdXQgPSBcIlwiO1xuICAgIHZhciBjaHIxLCBjaHIyLCBjaHIzO1xuICAgIHZhciBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0O1xuICAgIHZhciBpID0gMDtcblxuICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csIFwiXCIpO1xuXG4gICAgd2hpbGUgKGkgPCBpbnB1dC5sZW5ndGgpIHtcblxuICAgICAgICBlbmMxID0gX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgZW5jMiA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7XG4gICAgICAgIGVuYzMgPSBfa2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGkrKykpO1xuICAgICAgICBlbmM0ID0gX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcblxuICAgICAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICAgICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgICAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xuXG4gICAgICAgIG91dHB1dCA9IG91dHB1dCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hyMSk7XG5cbiAgICAgICAgaWYgKGVuYzMgIT0gNjQpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hyMik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuYzQgIT0gNjQpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hyMyk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBDb21wcmVzc2VkT2JqZWN0KCkge1xuICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSAwO1xuICAgIHRoaXMudW5jb21wcmVzc2VkU2l6ZSA9IDA7XG4gICAgdGhpcy5jcmMzMiA9IDA7XG4gICAgdGhpcy5jb21wcmVzc2lvbk1ldGhvZCA9IG51bGw7XG4gICAgdGhpcy5jb21wcmVzc2VkQ29udGVudCA9IG51bGw7XG59XG5cbkNvbXByZXNzZWRPYmplY3QucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgZGVjb21wcmVzc2VkIGNvbnRlbnQgaW4gYW4gdW5zcGVjaWZpZWQgZm9ybWF0LlxuICAgICAqIFRoZSBmb3JtYXQgd2lsbCBkZXBlbmQgb24gdGhlIGRlY29tcHJlc3Nvci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBkZWNvbXByZXNzZWQgY29udGVudC5cbiAgICAgKi9cbiAgICBnZXRDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIHNlZSBpbXBsZW1lbnRhdGlvblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBjb21wcmVzc2VkIGNvbnRlbnQgaW4gYW4gdW5zcGVjaWZpZWQgZm9ybWF0LlxuICAgICAqIFRoZSBmb3JtYXQgd2lsbCBkZXBlbmQgb24gdGhlIGNvbXByZXNzZWQgY29udGVuIHNvdXJjZS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBjb21wcmVzc2VkIGNvbnRlbnQuXG4gICAgICovXG4gICAgZ2V0Q29tcHJlc3NlZENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbnVsbDsgLy8gc2VlIGltcGxlbWVudGF0aW9uXG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gQ29tcHJlc3NlZE9iamVjdDtcbiIsIid1c2Ugc3RyaWN0JztcbmV4cG9ydHMuU1RPUkUgPSB7XG4gICAgbWFnaWM6IFwiXFx4MDBcXHgwMFwiLFxuICAgIGNvbXByZXNzOiBmdW5jdGlvbihjb250ZW50KSB7XG4gICAgICAgIHJldHVybiBjb250ZW50OyAvLyBubyBjb21wcmVzc2lvblxuICAgIH0sXG4gICAgdW5jb21wcmVzczogZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgICByZXR1cm4gY29udGVudDsgLy8gbm8gY29tcHJlc3Npb25cbiAgICB9LFxuICAgIGNvbXByZXNzSW5wdXRUeXBlOiBudWxsLFxuICAgIHVuY29tcHJlc3NJbnB1dFR5cGU6IG51bGxcbn07XG5leHBvcnRzLkRFRkxBVEUgPSByZXF1aXJlKCcuL2ZsYXRlJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIHRhYmxlID0gW1xuICAgIDB4MDAwMDAwMDAsIDB4NzcwNzMwOTYsIDB4RUUwRTYxMkMsIDB4OTkwOTUxQkEsXG4gICAgMHgwNzZEQzQxOSwgMHg3MDZBRjQ4RiwgMHhFOTYzQTUzNSwgMHg5RTY0OTVBMyxcbiAgICAweDBFREI4ODMyLCAweDc5RENCOEE0LCAweEUwRDVFOTFFLCAweDk3RDJEOTg4LFxuICAgIDB4MDlCNjRDMkIsIDB4N0VCMTdDQkQsIDB4RTdCODJEMDcsIDB4OTBCRjFEOTEsXG4gICAgMHgxREI3MTA2NCwgMHg2QUIwMjBGMiwgMHhGM0I5NzE0OCwgMHg4NEJFNDFERSxcbiAgICAweDFBREFENDdELCAweDZERERFNEVCLCAweEY0RDRCNTUxLCAweDgzRDM4NUM3LFxuICAgIDB4MTM2Qzk4NTYsIDB4NjQ2QkE4QzAsIDB4RkQ2MkY5N0EsIDB4OEE2NUM5RUMsXG4gICAgMHgxNDAxNUM0RiwgMHg2MzA2NkNEOSwgMHhGQTBGM0Q2MywgMHg4RDA4MERGNSxcbiAgICAweDNCNkUyMEM4LCAweDRDNjkxMDVFLCAweEQ1NjA0MUU0LCAweEEyNjc3MTcyLFxuICAgIDB4M0MwM0U0RDEsIDB4NEIwNEQ0NDcsIDB4RDIwRDg1RkQsIDB4QTUwQUI1NkIsXG4gICAgMHgzNUI1QThGQSwgMHg0MkIyOTg2QywgMHhEQkJCQzlENiwgMHhBQ0JDRjk0MCxcbiAgICAweDMyRDg2Q0UzLCAweDQ1REY1Qzc1LCAweERDRDYwRENGLCAweEFCRDEzRDU5LFxuICAgIDB4MjZEOTMwQUMsIDB4NTFERTAwM0EsIDB4QzhENzUxODAsIDB4QkZEMDYxMTYsXG4gICAgMHgyMUI0RjRCNSwgMHg1NkIzQzQyMywgMHhDRkJBOTU5OSwgMHhCOEJEQTUwRixcbiAgICAweDI4MDJCODlFLCAweDVGMDU4ODA4LCAweEM2MENEOUIyLCAweEIxMEJFOTI0LFxuICAgIDB4MkY2RjdDODcsIDB4NTg2ODRDMTEsIDB4QzE2MTFEQUIsIDB4QjY2NjJEM0QsXG4gICAgMHg3NkRDNDE5MCwgMHgwMURCNzEwNiwgMHg5OEQyMjBCQywgMHhFRkQ1MTAyQSxcbiAgICAweDcxQjE4NTg5LCAweDA2QjZCNTFGLCAweDlGQkZFNEE1LCAweEU4QjhENDMzLFxuICAgIDB4NzgwN0M5QTIsIDB4MEYwMEY5MzQsIDB4OTYwOUE4OEUsIDB4RTEwRTk4MTgsXG4gICAgMHg3RjZBMERCQiwgMHgwODZEM0QyRCwgMHg5MTY0NkM5NywgMHhFNjYzNUMwMSxcbiAgICAweDZCNkI1MUY0LCAweDFDNkM2MTYyLCAweDg1NjUzMEQ4LCAweEYyNjIwMDRFLFxuICAgIDB4NkMwNjk1RUQsIDB4MUIwMUE1N0IsIDB4ODIwOEY0QzEsIDB4RjUwRkM0NTcsXG4gICAgMHg2NUIwRDlDNiwgMHgxMkI3RTk1MCwgMHg4QkJFQjhFQSwgMHhGQ0I5ODg3QyxcbiAgICAweDYyREQxRERGLCAweDE1REEyRDQ5LCAweDhDRDM3Q0YzLCAweEZCRDQ0QzY1LFxuICAgIDB4NERCMjYxNTgsIDB4M0FCNTUxQ0UsIDB4QTNCQzAwNzQsIDB4RDRCQjMwRTIsXG4gICAgMHg0QURGQTU0MSwgMHgzREQ4OTVENywgMHhBNEQxQzQ2RCwgMHhEM0Q2RjRGQixcbiAgICAweDQzNjlFOTZBLCAweDM0NkVEOUZDLCAweEFENjc4ODQ2LCAweERBNjBCOEQwLFxuICAgIDB4NDQwNDJENzMsIDB4MzMwMzFERTUsIDB4QUEwQTRDNUYsIDB4REQwRDdDQzksXG4gICAgMHg1MDA1NzEzQywgMHgyNzAyNDFBQSwgMHhCRTBCMTAxMCwgMHhDOTBDMjA4NixcbiAgICAweDU3NjhCNTI1LCAweDIwNkY4NUIzLCAweEI5NjZENDA5LCAweENFNjFFNDlGLFxuICAgIDB4NUVERUY5MEUsIDB4MjlEOUM5OTgsIDB4QjBEMDk4MjIsIDB4QzdEN0E4QjQsXG4gICAgMHg1OUIzM0QxNywgMHgyRUI0MEQ4MSwgMHhCN0JENUMzQiwgMHhDMEJBNkNBRCxcbiAgICAweEVEQjg4MzIwLCAweDlBQkZCM0I2LCAweDAzQjZFMjBDLCAweDc0QjFEMjlBLFxuICAgIDB4RUFENTQ3MzksIDB4OUREMjc3QUYsIDB4MDREQjI2MTUsIDB4NzNEQzE2ODMsXG4gICAgMHhFMzYzMEIxMiwgMHg5NDY0M0I4NCwgMHgwRDZENkEzRSwgMHg3QTZBNUFBOCxcbiAgICAweEU0MEVDRjBCLCAweDkzMDlGRjlELCAweDBBMDBBRTI3LCAweDdEMDc5RUIxLFxuICAgIDB4RjAwRjkzNDQsIDB4ODcwOEEzRDIsIDB4MUUwMUYyNjgsIDB4NjkwNkMyRkUsXG4gICAgMHhGNzYyNTc1RCwgMHg4MDY1NjdDQiwgMHgxOTZDMzY3MSwgMHg2RTZCMDZFNyxcbiAgICAweEZFRDQxQjc2LCAweDg5RDMyQkUwLCAweDEwREE3QTVBLCAweDY3REQ0QUNDLFxuICAgIDB4RjlCOURGNkYsIDB4OEVCRUVGRjksIDB4MTdCN0JFNDMsIDB4NjBCMDhFRDUsXG4gICAgMHhENkQ2QTNFOCwgMHhBMUQxOTM3RSwgMHgzOEQ4QzJDNCwgMHg0RkRGRjI1MixcbiAgICAweEQxQkI2N0YxLCAweEE2QkM1NzY3LCAweDNGQjUwNkRELCAweDQ4QjIzNjRCLFxuICAgIDB4RDgwRDJCREEsIDB4QUYwQTFCNEMsIDB4MzYwMzRBRjYsIDB4NDEwNDdBNjAsXG4gICAgMHhERjYwRUZDMywgMHhBODY3REY1NSwgMHgzMTZFOEVFRiwgMHg0NjY5QkU3OSxcbiAgICAweENCNjFCMzhDLCAweEJDNjY4MzFBLCAweDI1NkZEMkEwLCAweDUyNjhFMjM2LFxuICAgIDB4Q0MwQzc3OTUsIDB4QkIwQjQ3MDMsIDB4MjIwMjE2QjksIDB4NTUwNTI2MkYsXG4gICAgMHhDNUJBM0JCRSwgMHhCMkJEMEIyOCwgMHgyQkI0NUE5MiwgMHg1Q0IzNkEwNCxcbiAgICAweEMyRDdGRkE3LCAweEI1RDBDRjMxLCAweDJDRDk5RThCLCAweDVCREVBRTFELFxuICAgIDB4OUI2NEMyQjAsIDB4RUM2M0YyMjYsIDB4NzU2QUEzOUMsIDB4MDI2RDkzMEEsXG4gICAgMHg5QzA5MDZBOSwgMHhFQjBFMzYzRiwgMHg3MjA3Njc4NSwgMHgwNTAwNTcxMyxcbiAgICAweDk1QkY0QTgyLCAweEUyQjg3QTE0LCAweDdCQjEyQkFFLCAweDBDQjYxQjM4LFxuICAgIDB4OTJEMjhFOUIsIDB4RTVENUJFMEQsIDB4N0NEQ0VGQjcsIDB4MEJEQkRGMjEsXG4gICAgMHg4NkQzRDJENCwgMHhGMUQ0RTI0MiwgMHg2OEREQjNGOCwgMHgxRkRBODM2RSxcbiAgICAweDgxQkUxNkNELCAweEY2QjkyNjVCLCAweDZGQjA3N0UxLCAweDE4Qjc0Nzc3LFxuICAgIDB4ODgwODVBRTYsIDB4RkYwRjZBNzAsIDB4NjYwNjNCQ0EsIDB4MTEwMTBCNUMsXG4gICAgMHg4RjY1OUVGRiwgMHhGODYyQUU2OSwgMHg2MTZCRkZEMywgMHgxNjZDQ0Y0NSxcbiAgICAweEEwMEFFMjc4LCAweEQ3MEREMkVFLCAweDRFMDQ4MzU0LCAweDM5MDNCM0MyLFxuICAgIDB4QTc2NzI2NjEsIDB4RDA2MDE2RjcsIDB4NDk2OTQ3NEQsIDB4M0U2RTc3REIsXG4gICAgMHhBRUQxNkE0QSwgMHhEOUQ2NUFEQywgMHg0MERGMEI2NiwgMHgzN0Q4M0JGMCxcbiAgICAweEE5QkNBRTUzLCAweERFQkI5RUM1LCAweDQ3QjJDRjdGLCAweDMwQjVGRkU5LFxuICAgIDB4QkRCREYyMUMsIDB4Q0FCQUMyOEEsIDB4NTNCMzkzMzAsIDB4MjRCNEEzQTYsXG4gICAgMHhCQUQwMzYwNSwgMHhDREQ3MDY5MywgMHg1NERFNTcyOSwgMHgyM0Q5NjdCRixcbiAgICAweEIzNjY3QTJFLCAweEM0NjE0QUI4LCAweDVENjgxQjAyLCAweDJBNkYyQjk0LFxuICAgIDB4QjQwQkJFMzcsIDB4QzMwQzhFQTEsIDB4NUEwNURGMUIsIDB4MkQwMkVGOERcbl07XG5cbi8qKlxuICpcbiAqICBKYXZhc2NyaXB0IGNyYzMyXG4gKiAgaHR0cDovL3d3dy53ZWJ0b29sa2l0LmluZm8vXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyYzMyKGlucHV0LCBjcmMpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgdmFyIGlzQXJyYXkgPSB1dGlscy5nZXRUeXBlT2YoaW5wdXQpICE9PSBcInN0cmluZ1wiO1xuXG4gICAgaWYgKHR5cGVvZihjcmMpID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgY3JjID0gMDtcbiAgICB9XG4gICAgdmFyIHggPSAwO1xuICAgIHZhciB5ID0gMDtcbiAgICB2YXIgYiA9IDA7XG5cbiAgICBjcmMgPSBjcmMgXiAoLTEpO1xuICAgIGZvciAodmFyIGkgPSAwLCBpVG9wID0gaW5wdXQubGVuZ3RoOyBpIDwgaVRvcDsgaSsrKSB7XG4gICAgICAgIGIgPSBpc0FycmF5ID8gaW5wdXRbaV0gOiBpbnB1dC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB5ID0gKGNyYyBeIGIpICYgMHhGRjtcbiAgICAgICAgeCA9IHRhYmxlW3ldO1xuICAgICAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHg7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyYyBeICgtMSk7XG59O1xuLy8gdmltOiBzZXQgc2hpZnR3aWR0aD00IHNvZnR0YWJzdG9wPTQ6XG4iLCIndXNlIHN0cmljdCc7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIERhdGFSZWFkZXIoZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IG51bGw7IC8vIHR5cGUgOiBzZWUgaW1wbGVtZW50YXRpb25cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5pbmRleCA9IDA7XG59XG5EYXRhUmVhZGVyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBDaGVjayB0aGF0IHRoZSBvZmZzZXQgd2lsbCBub3QgZ28gdG9vIGZhci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb2Zmc2V0IHRoZSBhZGRpdGlvbmFsIG9mZnNldCB0byBjaGVjay5cbiAgICAgKiBAdGhyb3dzIHtFcnJvcn0gYW4gRXJyb3IgaWYgdGhlIG9mZnNldCBpcyBvdXQgb2YgYm91bmRzLlxuICAgICAqL1xuICAgIGNoZWNrT2Zmc2V0OiBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICAgICAgdGhpcy5jaGVja0luZGV4KHRoaXMuaW5kZXggKyBvZmZzZXQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdGhhdCB0aGUgc3BlY2lmZWQgaW5kZXggd2lsbCBub3QgYmUgdG9vIGZhci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3SW5kZXggdGhlIGluZGV4IHRvIGNoZWNrLlxuICAgICAqIEB0aHJvd3Mge0Vycm9yfSBhbiBFcnJvciBpZiB0aGUgaW5kZXggaXMgb3V0IG9mIGJvdW5kcy5cbiAgICAgKi9cbiAgICBjaGVja0luZGV4OiBmdW5jdGlvbihuZXdJbmRleCkge1xuICAgICAgICBpZiAodGhpcy5sZW5ndGggPCBuZXdJbmRleCB8fCBuZXdJbmRleCA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVuZCBvZiBkYXRhIHJlYWNoZWQgKGRhdGEgbGVuZ3RoID0gXCIgKyB0aGlzLmxlbmd0aCArIFwiLCBhc2tlZCBpbmRleCA9IFwiICsgKG5ld0luZGV4KSArIFwiKS4gQ29ycnVwdGVkIHppcCA/XCIpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGhlIGluZGV4LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuZXdJbmRleCBUaGUgbmV3IGluZGV4LlxuICAgICAqIEB0aHJvd3Mge0Vycm9yfSBpZiB0aGUgbmV3IGluZGV4IGlzIG91dCBvZiB0aGUgZGF0YS5cbiAgICAgKi9cbiAgICBzZXRJbmRleDogZnVuY3Rpb24obmV3SW5kZXgpIHtcbiAgICAgICAgdGhpcy5jaGVja0luZGV4KG5ld0luZGV4KTtcbiAgICAgICAgdGhpcy5pbmRleCA9IG5ld0luZGV4O1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2tpcCB0aGUgbmV4dCBuIGJ5dGVzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuIHRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gc2tpcC5cbiAgICAgKiBAdGhyb3dzIHtFcnJvcn0gaWYgdGhlIG5ldyBpbmRleCBpcyBvdXQgb2YgdGhlIGRhdGEuXG4gICAgICovXG4gICAgc2tpcDogZnVuY3Rpb24obikge1xuICAgICAgICB0aGlzLnNldEluZGV4KHRoaXMuaW5kZXggKyBuKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYnl0ZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpIHRoZSBpbmRleCB0byB1c2UuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBhIGJ5dGUuXG4gICAgICovXG4gICAgYnl0ZUF0OiBmdW5jdGlvbihpKSB7XG4gICAgICAgIC8vIHNlZSBpbXBsZW1lbnRhdGlvbnNcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmV4dCBudW1iZXIgd2l0aCBhIGdpdmVuIGJ5dGUgc2l6ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSB0aGUgbnVtYmVyIG9mIGJ5dGVzIHRvIHJlYWQuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgY29ycmVzcG9uZGluZyBudW1iZXIuXG4gICAgICovXG4gICAgcmVhZEludDogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gMCxcbiAgICAgICAgICAgIGk7XG4gICAgICAgIHRoaXMuY2hlY2tPZmZzZXQoc2l6ZSk7XG4gICAgICAgIGZvciAoaSA9IHRoaXMuaW5kZXggKyBzaXplIC0gMTsgaSA+PSB0aGlzLmluZGV4OyBpLS0pIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IChyZXN1bHQgPDwgOCkgKyB0aGlzLmJ5dGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4ICs9IHNpemU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5leHQgc3RyaW5nIHdpdGggYSBnaXZlbiBieXRlIHNpemUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgdGhlIG51bWJlciBvZiBieXRlcyB0byByZWFkLlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIGNvcnJlc3BvbmRpbmcgc3RyaW5nLlxuICAgICAqL1xuICAgIHJlYWRTdHJpbmc6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnRyYW5zZm9ybVRvKFwic3RyaW5nXCIsIHRoaXMucmVhZERhdGEoc2l6ZSkpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJhdyBkYXRhIHdpdGhvdXQgY29udmVyc2lvbiwgPHNpemU+IGJ5dGVzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIHRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gcmVhZC5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoZSByYXcgZGF0YSwgaW1wbGVtZW50YXRpb24gc3BlY2lmaWMuXG4gICAgICovXG4gICAgcmVhZERhdGE6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgLy8gc2VlIGltcGxlbWVudGF0aW9uc1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgbGFzdCBvY2N1cmVuY2Ugb2YgYSB6aXAgc2lnbmF0dXJlICg0IGJ5dGVzKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2lnIHRoZSBzaWduYXR1cmUgdG8gZmluZC5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBpbmRleCBvZiB0aGUgbGFzdCBvY2N1cmVuY2UsIC0xIGlmIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBsYXN0SW5kZXhPZlNpZ25hdHVyZTogZnVuY3Rpb24oc2lnKSB7XG4gICAgICAgIC8vIHNlZSBpbXBsZW1lbnRhdGlvbnNcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmV4dCBkYXRlLlxuICAgICAqIEByZXR1cm4ge0RhdGV9IHRoZSBkYXRlLlxuICAgICAqL1xuICAgIHJlYWREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRvc3RpbWUgPSB0aGlzLnJlYWRJbnQoNCk7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShcbiAgICAgICAgKChkb3N0aW1lID4+IDI1KSAmIDB4N2YpICsgMTk4MCwgLy8geWVhclxuICAgICAgICAoKGRvc3RpbWUgPj4gMjEpICYgMHgwZikgLSAxLCAvLyBtb250aFxuICAgICAgICAoZG9zdGltZSA+PiAxNikgJiAweDFmLCAvLyBkYXlcbiAgICAgICAgKGRvc3RpbWUgPj4gMTEpICYgMHgxZiwgLy8gaG91clxuICAgICAgICAoZG9zdGltZSA+PiA1KSAmIDB4M2YsIC8vIG1pbnV0ZVxuICAgICAgICAoZG9zdGltZSAmIDB4MWYpIDw8IDEpOyAvLyBzZWNvbmRcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBEYXRhUmVhZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuZXhwb3J0cy5iYXNlNjQgPSBmYWxzZTtcbmV4cG9ydHMuYmluYXJ5ID0gZmFsc2U7XG5leHBvcnRzLmRpciA9IGZhbHNlO1xuZXhwb3J0cy5kYXRlID0gbnVsbDtcbmV4cG9ydHMuY29tcHJlc3Npb24gPSBudWxsO1xuZXhwb3J0cy5jb21tZW50ID0gbnVsbDtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLnN0cmluZzJiaW5hcnkgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gdXRpbHMuc3RyaW5nMmJpbmFyeShzdHIpO1xufTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLnN0cmluZzJVaW50OEFycmF5ID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHV0aWxzLnRyYW5zZm9ybVRvKFwidWludDhhcnJheVwiLCBzdHIpO1xufTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLnVpbnQ4QXJyYXkyU3RyaW5nID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gdXRpbHMudHJhbnNmb3JtVG8oXCJzdHJpbmdcIiwgYXJyYXkpO1xufTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLnN0cmluZzJCbG9iID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgdmFyIGJ1ZmZlciA9IHV0aWxzLnRyYW5zZm9ybVRvKFwiYXJyYXlidWZmZXJcIiwgc3RyKTtcbiAgICByZXR1cm4gdXRpbHMuYXJyYXlCdWZmZXIyQmxvYihidWZmZXIpO1xufTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLmFycmF5QnVmZmVyMkJsb2IgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICByZXR1cm4gdXRpbHMuYXJyYXlCdWZmZXIyQmxvYihidWZmZXIpO1xufTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLnRyYW5zZm9ybVRvID0gZnVuY3Rpb24ob3V0cHV0VHlwZSwgaW5wdXQpIHtcbiAgICByZXR1cm4gdXRpbHMudHJhbnNmb3JtVG8ob3V0cHV0VHlwZSwgaW5wdXQpO1xufTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLmdldFR5cGVPZiA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuIHV0aWxzLmdldFR5cGVPZihpbnB1dCk7XG59O1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uIHdpdGhvdXQgcmVwbGFjZW1lbnQuXG4gKi9cbmV4cG9ydHMuY2hlY2tTdXBwb3J0ID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiB1dGlscy5jaGVja1N1cHBvcnQodHlwZSk7XG59O1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKiBUaGlzIHZhbHVlIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uIHdpdGhvdXQgcmVwbGFjZW1lbnQuXG4gKi9cbmV4cG9ydHMuTUFYX1ZBTFVFXzE2QklUUyA9IHV0aWxzLk1BWF9WQUxVRV8xNkJJVFM7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqIFRoaXMgdmFsdWUgd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24gd2l0aG91dCByZXBsYWNlbWVudC5cbiAqL1xuZXhwb3J0cy5NQVhfVkFMVUVfMzJCSVRTID0gdXRpbHMuTUFYX1ZBTFVFXzMyQklUUztcblxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uIHdpdGhvdXQgcmVwbGFjZW1lbnQuXG4gKi9cbmV4cG9ydHMucHJldHR5ID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHV0aWxzLnByZXR0eShzdHIpO1xufTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICovXG5leHBvcnRzLmZpbmRDb21wcmVzc2lvbiA9IGZ1bmN0aW9uKGNvbXByZXNzaW9uTWV0aG9kKSB7XG4gICAgcmV0dXJuIHV0aWxzLmZpbmRDb21wcmVzc2lvbihjb21wcmVzc2lvbk1ldGhvZCk7XG59O1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uIHdpdGhvdXQgcmVwbGFjZW1lbnQuXG4gKi9cbmV4cG9ydHMuaXNSZWdFeHAgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIHV0aWxzLmlzUmVnRXhwKG9iamVjdCk7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG52YXIgVVNFX1RZUEVEQVJSQVkgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSAmJiAodHlwZW9mIFVpbnQxNkFycmF5ICE9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZiBVaW50MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpO1xuXG52YXIgcGFrbyA9IHJlcXVpcmUoXCJwYWtvXCIpO1xuZXhwb3J0cy51bmNvbXByZXNzSW5wdXRUeXBlID0gVVNFX1RZUEVEQVJSQVkgPyBcInVpbnQ4YXJyYXlcIiA6IFwiYXJyYXlcIjtcbmV4cG9ydHMuY29tcHJlc3NJbnB1dFR5cGUgPSBVU0VfVFlQRURBUlJBWSA/IFwidWludDhhcnJheVwiIDogXCJhcnJheVwiO1xuXG5leHBvcnRzLm1hZ2ljID0gXCJcXHgwOFxceDAwXCI7XG5leHBvcnRzLmNvbXByZXNzID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gcGFrby5kZWZsYXRlUmF3KGlucHV0KTtcbn07XG5leHBvcnRzLnVuY29tcHJlc3MgPSAgZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gcGFrby5pbmZsYXRlUmF3KGlucHV0KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCcuL2Jhc2U2NCcpO1xuXG4vKipcblVzYWdlOlxuICAgemlwID0gbmV3IEpTWmlwKCk7XG4gICB6aXAuZmlsZShcImhlbGxvLnR4dFwiLCBcIkhlbGxvLCBXb3JsZCFcIikuZmlsZShcInRlbXBmaWxlXCIsIFwibm90aGluZ1wiKTtcbiAgIHppcC5mb2xkZXIoXCJpbWFnZXNcIikuZmlsZShcInNtaWxlLmdpZlwiLCBiYXNlNjREYXRhLCB7YmFzZTY0OiB0cnVlfSk7XG4gICB6aXAuZmlsZShcIlhtYXMudHh0XCIsIFwiSG8gaG8gaG8gIVwiLCB7ZGF0ZSA6IG5ldyBEYXRlKFwiRGVjZW1iZXIgMjUsIDIwMDcgMDA6MDA6MDFcIil9KTtcbiAgIHppcC5yZW1vdmUoXCJ0ZW1wZmlsZVwiKTtcblxuICAgYmFzZTY0emlwID0gemlwLmdlbmVyYXRlKCk7XG5cbioqL1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIGEgb2YgemlwIGZpbGUgaW4ganNcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmc9fEFycmF5QnVmZmVyPXxVaW50OEFycmF5PX0gZGF0YSB0aGUgZGF0YSB0byBsb2FkLCBpZiBhbnkgKG9wdGlvbmFsKS5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0aW9ucyB0aGUgb3B0aW9ucyBmb3IgY3JlYXRpbmcgdGhpcyBvYmplY3RzIChvcHRpb25hbCkuXG4gKi9cbmZ1bmN0aW9uIEpTWmlwKGRhdGEsIG9wdGlvbnMpIHtcbiAgICAvLyBpZiB0aGlzIGNvbnN0cnVjdG9yIGlzwqB1c2VkIHdpdGhvdXTCoGBuZXdgLCBpdMKgYWRkcyBgbmV3YCBiZWZvcmXCoGl0c2VsZjpcbiAgICBpZighKHRoaXMgaW5zdGFuY2VvZiBKU1ppcCkpIHJldHVybiBuZXcgSlNaaXAoZGF0YSwgb3B0aW9ucyk7XG4gICAgXG4gICAgLy8gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZpbGVzIDpcbiAgICAvLyB7XG4gICAgLy8gICBcImZvbGRlci9cIiA6IHsuLi59LFxuICAgIC8vICAgXCJmb2xkZXIvZGF0YS50eHRcIiA6IHsuLi59XG4gICAgLy8gfVxuICAgIHRoaXMuZmlsZXMgPSB7fTtcblxuICAgIHRoaXMuY29tbWVudCA9IG51bGw7XG5cbiAgICAvLyBXaGVyZSB3ZSBhcmUgaW4gdGhlIGhpZXJhcmNoeVxuICAgIHRoaXMucm9vdCA9IFwiXCI7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgICAgdGhpcy5sb2FkKGRhdGEsIG9wdGlvbnMpO1xuICAgIH1cbiAgICB0aGlzLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXdPYmogPSBuZXcgSlNaaXAoKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXNbaV0gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIG5ld09ialtpXSA9IHRoaXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld09iajtcbiAgICB9O1xufVxuSlNaaXAucHJvdG90eXBlID0gcmVxdWlyZSgnLi9vYmplY3QnKTtcbkpTWmlwLnByb3RvdHlwZS5sb2FkID0gcmVxdWlyZSgnLi9sb2FkJyk7XG5KU1ppcC5zdXBwb3J0ID0gcmVxdWlyZSgnLi9zdXBwb3J0Jyk7XG5KU1ppcC5kZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogVGhpcyBuYW1lc3BhY2Ugd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24gd2l0aG91dCByZXBsYWNlbWVudC5cbiAqL1xuSlNaaXAudXRpbHMgPSByZXF1aXJlKCcuL2RlcHJlY2F0ZWRQdWJsaWNVdGlscycpO1xuXG5KU1ppcC5iYXNlNjQgPSB7XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICAgICAqL1xuICAgIGVuY29kZSA6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBiYXNlNjQuZW5jb2RlKGlucHV0KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogVGhpcyBtZXRob2Qgd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24gd2l0aG91dCByZXBsYWNlbWVudC5cbiAgICAgKi9cbiAgICBkZWNvZGUgOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gYmFzZTY0LmRlY29kZShpbnB1dCk7XG4gICAgfVxufTtcbkpTWmlwLmNvbXByZXNzaW9ucyA9IHJlcXVpcmUoJy4vY29tcHJlc3Npb25zJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEpTWmlwO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGJhc2U2NCA9IHJlcXVpcmUoJy4vYmFzZTY0Jyk7XG52YXIgWmlwRW50cmllcyA9IHJlcXVpcmUoJy4vemlwRW50cmllcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhLCBvcHRpb25zKSB7XG4gICAgdmFyIGZpbGVzLCB6aXBFbnRyaWVzLCBpLCBpbnB1dDtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAob3B0aW9ucy5iYXNlNjQpIHtcbiAgICAgICAgZGF0YSA9IGJhc2U2NC5kZWNvZGUoZGF0YSk7XG4gICAgfVxuXG4gICAgemlwRW50cmllcyA9IG5ldyBaaXBFbnRyaWVzKGRhdGEsIG9wdGlvbnMpO1xuICAgIGZpbGVzID0gemlwRW50cmllcy5maWxlcztcbiAgICBmb3IgKGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaW5wdXQgPSBmaWxlc1tpXTtcbiAgICAgICAgdGhpcy5maWxlKGlucHV0LmZpbGVOYW1lLCBpbnB1dC5kZWNvbXByZXNzZWQsIHtcbiAgICAgICAgICAgIGJpbmFyeTogdHJ1ZSxcbiAgICAgICAgICAgIG9wdGltaXplZEJpbmFyeVN0cmluZzogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGU6IGlucHV0LmRhdGUsXG4gICAgICAgICAgICBkaXI6IGlucHV0LmRpcixcbiAgICAgICAgICAgIGNvbW1lbnQgOiBpbnB1dC5maWxlQ29tbWVudC5sZW5ndGggPyBpbnB1dC5maWxlQ29tbWVudCA6IG51bGxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh6aXBFbnRyaWVzLnppcENvbW1lbnQubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuY29tbWVudCA9IHppcEVudHJpZXMuemlwQ29tbWVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgc3VwcG9ydCA9IHJlcXVpcmUoJy4vc3VwcG9ydCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGNyYzMyID0gcmVxdWlyZSgnLi9jcmMzMicpO1xudmFyIHNpZ25hdHVyZSA9IHJlcXVpcmUoJy4vc2lnbmF0dXJlJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnLi9iYXNlNjQnKTtcbnZhciBjb21wcmVzc2lvbnMgPSByZXF1aXJlKCcuL2NvbXByZXNzaW9ucycpO1xudmFyIENvbXByZXNzZWRPYmplY3QgPSByZXF1aXJlKCcuL2NvbXByZXNzZWRPYmplY3QnKTtcbnZhciBub2RlQnVmZmVyID0gcmVxdWlyZSgnLi9ub2RlQnVmZmVyJyk7XG52YXIgdXRmOCA9IHJlcXVpcmUoJy4vdXRmOCcpO1xudmFyIFN0cmluZ1dyaXRlciA9IHJlcXVpcmUoJy4vc3RyaW5nV3JpdGVyJyk7XG52YXIgVWludDhBcnJheVdyaXRlciA9IHJlcXVpcmUoJy4vdWludDhBcnJheVdyaXRlcicpO1xuXG52YXIgdGV4dEVuY29kZXI7XG5pZiAoc3VwcG9ydC51aW50OGFycmF5ICYmIHR5cGVvZiBUZXh0RW5jb2RlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoXCJ1dGYtOFwiKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSByYXcgZGF0YSBvZiBhIFppcE9iamVjdCwgZGVjb21wcmVzcyB0aGUgY29udGVudCBpZiBuZWNlc3NhcnkuXG4gKiBAcGFyYW0ge1ppcE9iamVjdH0gZmlsZSB0aGUgZmlsZSB0byB1c2UuXG4gKiBAcmV0dXJuIHtTdHJpbmd8QXJyYXlCdWZmZXJ8VWludDhBcnJheXxCdWZmZXJ9IHRoZSBkYXRhLlxuICovXG52YXIgZ2V0UmF3RGF0YSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICBpZiAoZmlsZS5fZGF0YSBpbnN0YW5jZW9mIENvbXByZXNzZWRPYmplY3QpIHtcbiAgICAgICAgZmlsZS5fZGF0YSA9IGZpbGUuX2RhdGEuZ2V0Q29udGVudCgpO1xuICAgICAgICBmaWxlLm9wdGlvbnMuYmluYXJ5ID0gdHJ1ZTtcbiAgICAgICAgZmlsZS5vcHRpb25zLmJhc2U2NCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh1dGlscy5nZXRUeXBlT2YoZmlsZS5fZGF0YSkgPT09IFwidWludDhhcnJheVwiKSB7XG4gICAgICAgICAgICB2YXIgY29weSA9IGZpbGUuX2RhdGE7XG4gICAgICAgICAgICAvLyB3aGVuIHJlYWRpbmcgYW4gYXJyYXlidWZmZXIsIHRoZSBDb21wcmVzc2VkT2JqZWN0IG1lY2hhbmlzbSB3aWxsIGtlZXAgaXQgYW5kIHN1YmFycmF5KCkgYSBVaW50OEFycmF5LlxuICAgICAgICAgICAgLy8gaWYgd2UgcmVxdWVzdCBhIGZpbGUgaW4gdGhlIHNhbWUgZm9ybWF0LCB3ZSBtaWdodCBnZXQgdGhlIHNhbWUgVWludDhBcnJheSBvciBpdHMgQXJyYXlCdWZmZXIgKHRoZSBvcmlnaW5hbCB6aXAgZmlsZSkuXG4gICAgICAgICAgICBmaWxlLl9kYXRhID0gbmV3IFVpbnQ4QXJyYXkoY29weS5sZW5ndGgpO1xuICAgICAgICAgICAgLy8gd2l0aCBhbiBlbXB0eSBVaW50OEFycmF5LCBPcGVyYSBmYWlscyB3aXRoIGEgXCJPZmZzZXQgbGFyZ2VyIHRoYW4gYXJyYXkgc2l6ZVwiXG4gICAgICAgICAgICBpZiAoY29weS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICBmaWxlLl9kYXRhLnNldChjb3B5LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmlsZS5fZGF0YTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGF0YSBvZiBhIFppcE9iamVjdCBpbiBhIGJpbmFyeSBmb3JtLiBJZiB0aGUgY29udGVudCBpcyBhbiB1bmljb2RlIHN0cmluZywgZW5jb2RlIGl0LlxuICogQHBhcmFtIHtaaXBPYmplY3R9IGZpbGUgdGhlIGZpbGUgdG8gdXNlLlxuICogQHJldHVybiB7U3RyaW5nfEFycmF5QnVmZmVyfFVpbnQ4QXJyYXl8QnVmZmVyfSB0aGUgZGF0YS5cbiAqL1xudmFyIGdldEJpbmFyeURhdGEgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGdldFJhd0RhdGEoZmlsZSksXG4gICAgICAgIHR5cGUgPSB1dGlscy5nZXRUeXBlT2YocmVzdWx0KTtcbiAgICBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAoIWZpbGUub3B0aW9ucy5iaW5hcnkpIHtcbiAgICAgICAgICAgIC8vIHVuaWNvZGUgdGV4dCAhXG4gICAgICAgICAgICAvLyB1bmljb2RlIHN0cmluZyA9PiBiaW5hcnkgc3RyaW5nIGlzIGEgcGFpbmZ1bCBwcm9jZXNzLCBjaGVjayBpZiB3ZSBjYW4gYXZvaWQgaXQuXG4gICAgICAgICAgICBpZiAodGV4dEVuY29kZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dEVuY29kZXIuZW5jb2RlKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3VwcG9ydC5ub2RlYnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVCdWZmZXIocmVzdWx0LCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlLmFzQmluYXJ5KCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGlzLl9kYXRhIGludG8gYSBzdHJpbmcuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmaWx0ZXIgYSBmdW5jdGlvbiBTdHJpbmcgLT4gU3RyaW5nLCBhcHBsaWVkIGlmIG5vdCBudWxsIG9uIHRoZSByZXN1bHQuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoaXMuX2RhdGEuXG4gKi9cbnZhciBkYXRhVG9TdHJpbmcgPSBmdW5jdGlvbihhc1VURjgpIHtcbiAgICB2YXIgcmVzdWx0ID0gZ2V0UmF3RGF0YSh0aGlzKTtcbiAgICBpZiAocmVzdWx0ID09PSBudWxsIHx8IHR5cGVvZiByZXN1bHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIC8vIGlmIHRoZSBkYXRhIGlzIGEgYmFzZTY0IHN0cmluZywgd2UgZGVjb2RlIGl0IGJlZm9yZSBjaGVja2luZyB0aGUgZW5jb2RpbmcgIVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYmFzZTY0KSB7XG4gICAgICAgIHJlc3VsdCA9IGJhc2U2NC5kZWNvZGUocmVzdWx0KTtcbiAgICB9XG4gICAgaWYgKGFzVVRGOCAmJiB0aGlzLm9wdGlvbnMuYmluYXJ5KSB7XG4gICAgICAgIC8vIEpTWmlwLnByb3RvdHlwZS51dGY4ZGVjb2RlIHN1cHBvcnRzIGFycmF5cyBhcyBpbnB1dFxuICAgICAgICAvLyBza2lwIHRvIGFycmF5ID0+IHN0cmluZyBzdGVwLCB1dGY4ZGVjb2RlIHdpbGwgZG8gaXQuXG4gICAgICAgIHJlc3VsdCA9IG91dC51dGY4ZGVjb2RlKHJlc3VsdCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBubyB1dGY4IHRyYW5zZm9ybWF0aW9uLCBkbyB0aGUgYXJyYXkgPT4gc3RyaW5nIHN0ZXAuXG4gICAgICAgIHJlc3VsdCA9IHV0aWxzLnRyYW5zZm9ybVRvKFwic3RyaW5nXCIsIHJlc3VsdCk7XG4gICAgfVxuXG4gICAgaWYgKCFhc1VURjggJiYgIXRoaXMub3B0aW9ucy5iaW5hcnkpIHtcbiAgICAgICAgcmVzdWx0ID0gdXRpbHMudHJhbnNmb3JtVG8oXCJzdHJpbmdcIiwgb3V0LnV0ZjhlbmNvZGUocmVzdWx0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuLyoqXG4gKiBBIHNpbXBsZSBvYmplY3QgcmVwcmVzZW50aW5nIGEgZmlsZSBpbiB0aGUgemlwIGZpbGUuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheUJ1ZmZlcnxVaW50OEFycmF5fEJ1ZmZlcn0gZGF0YSB0aGUgZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgdGhlIG9wdGlvbnMgb2YgdGhlIGZpbGVcbiAqL1xudmFyIFppcE9iamVjdCA9IGZ1bmN0aW9uKG5hbWUsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuZGlyID0gb3B0aW9ucy5kaXI7XG4gICAgdGhpcy5kYXRlID0gb3B0aW9ucy5kYXRlO1xuICAgIHRoaXMuY29tbWVudCA9IG9wdGlvbnMuY29tbWVudDtcblxuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAvKlxuICAgICAqIFRoaXMgb2JqZWN0IGNvbnRhaW5zIGluaXRpYWwgdmFsdWVzIGZvciBkaXIgYW5kIGRhdGUuXG4gICAgICogV2l0aCB0aGVtLCB3ZSBjYW4gY2hlY2sgaWYgdGhlIHVzZXIgY2hhbmdlZCB0aGUgZGVwcmVjYXRlZCBtZXRhZGF0YSBpblxuICAgICAqIGBaaXBPYmplY3Qjb3B0aW9uc2Agb3Igbm90LlxuICAgICAqL1xuICAgIHRoaXMuX2luaXRpYWxNZXRhZGF0YSA9IHtcbiAgICAgIGRpciA6IG9wdGlvbnMuZGlyLFxuICAgICAgZGF0ZSA6IG9wdGlvbnMuZGF0ZVxuICAgIH07XG59O1xuXG5aaXBPYmplY3QucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgY29udGVudCBhcyBVVEY4IHN0cmluZy5cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBVVEY4IHN0cmluZy5cbiAgICAgKi9cbiAgICBhc1RleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YVRvU3RyaW5nLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiaW5hcnkgY29udGVudC5cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBjb250ZW50IGFzIGJpbmFyeS5cbiAgICAgKi9cbiAgICBhc0JpbmFyeTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhVG9TdHJpbmcuY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb250ZW50IGFzIGEgbm9kZWpzIEJ1ZmZlci5cbiAgICAgKiBAcmV0dXJuIHtCdWZmZXJ9IHRoZSBjb250ZW50IGFzIGEgQnVmZmVyLlxuICAgICAqL1xuICAgIGFzTm9kZUJ1ZmZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBnZXRCaW5hcnlEYXRhKHRoaXMpO1xuICAgICAgICByZXR1cm4gdXRpbHMudHJhbnNmb3JtVG8oXCJub2RlYnVmZmVyXCIsIHJlc3VsdCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb250ZW50IGFzIGFuIFVpbnQ4QXJyYXkuXG4gICAgICogQHJldHVybiB7VWludDhBcnJheX0gdGhlIGNvbnRlbnQgYXMgYW4gVWludDhBcnJheS5cbiAgICAgKi9cbiAgICBhc1VpbnQ4QXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZ2V0QmluYXJ5RGF0YSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnRyYW5zZm9ybVRvKFwidWludDhhcnJheVwiLCByZXN1bHQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29udGVudCBhcyBhbiBBcnJheUJ1ZmZlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheUJ1ZmZlcn0gdGhlIGNvbnRlbnQgYXMgYW4gQXJyYXlCdWZlci5cbiAgICAgKi9cbiAgICBhc0FycmF5QnVmZmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNVaW50OEFycmF5KCkuYnVmZmVyO1xuICAgIH1cbn07XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGludGVnZXIgaW50byBhIHN0cmluZyBpbiBoZXhhZGVjaW1hbC5cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gZGVjIHRoZSBudW1iZXIgdG8gY29udmVydC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBieXRlcyB0aGUgbnVtYmVyIG9mIGJ5dGVzIHRvIGdlbmVyYXRlLlxuICogQHJldHVybnMge3N0cmluZ30gdGhlIHJlc3VsdC5cbiAqL1xudmFyIGRlY1RvSGV4ID0gZnVuY3Rpb24oZGVjLCBieXRlcykge1xuICAgIHZhciBoZXggPSBcIlwiLFxuICAgICAgICBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBieXRlczsgaSsrKSB7XG4gICAgICAgIGhleCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGRlYyAmIDB4ZmYpO1xuICAgICAgICBkZWMgPSBkZWMgPj4+IDg7XG4gICAgfVxuICAgIHJldHVybiBoZXg7XG59O1xuXG4vKipcbiAqIE1lcmdlIHRoZSBvYmplY3RzIHBhc3NlZCBhcyBwYXJhbWV0ZXJzIGludG8gYSBuZXcgb25lLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSB2YXJfYXJncyBBbGwgb2JqZWN0cyB0byBtZXJnZS5cbiAqIEByZXR1cm4ge09iamVjdH0gYSBuZXcgb2JqZWN0IHdpdGggdGhlIGRhdGEgb2YgdGhlIG90aGVycy5cbiAqL1xudmFyIGV4dGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB7fSwgaSwgYXR0cjtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IC8vIGFyZ3VtZW50cyBpcyBub3QgZW51bWVyYWJsZSBpbiBzb21lIGJyb3dzZXJzXG4gICAgICAgIGZvciAoYXR0ciBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoYXR0cikgJiYgdHlwZW9mIHJlc3VsdFthdHRyXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdFthdHRyXSA9IGFyZ3VtZW50c1tpXVthdHRyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSAoaW5jb21wbGV0ZSkgb3B0aW9ucyBmcm9tIHRoZSB1c2VyIGludG8gdGhlIGNvbXBsZXRlXG4gKiBzZXQgb2Ygb3B0aW9ucyB0byBjcmVhdGUgYSBmaWxlLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvIHRoZSBvcHRpb25zIGZyb20gdGhlIHVzZXIuXG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBjb21wbGV0ZSBzZXQgb2Ygb3B0aW9ucy5cbiAqL1xudmFyIHByZXBhcmVGaWxlQXR0cnMgPSBmdW5jdGlvbihvKSB7XG4gICAgbyA9IG8gfHwge307XG4gICAgaWYgKG8uYmFzZTY0ID09PSB0cnVlICYmIChvLmJpbmFyeSA9PT0gbnVsbCB8fCBvLmJpbmFyeSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICBvLmJpbmFyeSA9IHRydWU7XG4gICAgfVxuICAgIG8gPSBleHRlbmQobywgZGVmYXVsdHMpO1xuICAgIG8uZGF0ZSA9IG8uZGF0ZSB8fCBuZXcgRGF0ZSgpO1xuICAgIGlmIChvLmNvbXByZXNzaW9uICE9PSBudWxsKSBvLmNvbXByZXNzaW9uID0gby5jb21wcmVzc2lvbi50b1VwcGVyQ2FzZSgpO1xuXG4gICAgcmV0dXJuIG87XG59O1xuXG4vKipcbiAqIEFkZCBhIGZpbGUgaW4gdGhlIGN1cnJlbnQgZm9sZGVyLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheUJ1ZmZlcnxVaW50OEFycmF5fEJ1ZmZlcn0gZGF0YSB0aGUgZGF0YSBvZiB0aGUgZmlsZVxuICogQHBhcmFtIHtPYmplY3R9IG8gdGhlIG9wdGlvbnMgb2YgdGhlIGZpbGVcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIG5ldyBmaWxlLlxuICovXG52YXIgZmlsZUFkZCA9IGZ1bmN0aW9uKG5hbWUsIGRhdGEsIG8pIHtcbiAgICAvLyBiZSBzdXJlIHN1YiBmb2xkZXJzIGV4aXN0XG4gICAgdmFyIGRhdGFUeXBlID0gdXRpbHMuZ2V0VHlwZU9mKGRhdGEpO1xuXG4gICAgbyA9IHByZXBhcmVGaWxlQXR0cnMobyk7XG5cbiAgICBpZiAoby5kaXIgfHwgZGF0YSA9PT0gbnVsbCB8fCB0eXBlb2YgZGF0YSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBvLmJhc2U2NCA9IGZhbHNlO1xuICAgICAgICBvLmJpbmFyeSA9IGZhbHNlO1xuICAgICAgICBkYXRhID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoZGF0YVR5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgaWYgKG8uYmluYXJ5ICYmICFvLmJhc2U2NCkge1xuICAgICAgICAgICAgLy8gb3B0aW1pemVkQmluYXJ5U3RyaW5nID09IHRydWUgbWVhbnMgdGhhdCB0aGUgZmlsZSBoYXMgYWxyZWFkeSBiZWVuIGZpbHRlcmVkIHdpdGggYSAweEZGIG1hc2tcbiAgICAgICAgICAgIGlmIChvLm9wdGltaXplZEJpbmFyeVN0cmluZyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBzdHJpbmcsIG5vdCBpbiBhIGJhc2U2NCBmb3JtYXQuXG4gICAgICAgICAgICAgICAgLy8gQmUgc3VyZSB0aGF0IHRoaXMgaXMgYSBjb3JyZWN0IFwiYmluYXJ5IHN0cmluZ1wiXG4gICAgICAgICAgICAgICAgZGF0YSA9IHV0aWxzLnN0cmluZzJiaW5hcnkoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7IC8vIGFycmF5YnVmZmVyLCB1aW50OGFycmF5LCAuLi5cbiAgICAgICAgby5iYXNlNjQgPSBmYWxzZTtcbiAgICAgICAgby5iaW5hcnkgPSB0cnVlO1xuXG4gICAgICAgIGlmICghZGF0YVR5cGUgJiYgIShkYXRhIGluc3RhbmNlb2YgQ29tcHJlc3NlZE9iamVjdCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBkYXRhIG9mICdcIiArIG5hbWUgKyBcIicgaXMgaW4gYW4gdW5zdXBwb3J0ZWQgZm9ybWF0ICFcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgOiBpdCdzIHdheSBlYXNpZXIgdG8gd29yayB3aXRoIFVpbnQ4QXJyYXkgdGhhbiB3aXRoIEFycmF5QnVmZmVyXG4gICAgICAgIGlmIChkYXRhVHlwZSA9PT0gXCJhcnJheWJ1ZmZlclwiKSB7XG4gICAgICAgICAgICBkYXRhID0gdXRpbHMudHJhbnNmb3JtVG8oXCJ1aW50OGFycmF5XCIsIGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG9iamVjdCA9IG5ldyBaaXBPYmplY3QobmFtZSwgZGF0YSwgbyk7XG4gICAgdGhpcy5maWxlc1tuYW1lXSA9IG9iamVjdDtcbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuLyoqXG4gKiBBZGQgYSAoc3ViKSBmb2xkZXIgaW4gdGhlIGN1cnJlbnQgZm9sZGVyLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBmb2xkZXIncyBuYW1lXG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBuZXcgZm9sZGVyLlxuICovXG52YXIgZm9sZGVyQWRkID0gZnVuY3Rpb24obmFtZSkge1xuICAgIC8vIENoZWNrIHRoZSBuYW1lIGVuZHMgd2l0aCBhIC9cbiAgICBpZiAobmFtZS5zbGljZSgtMSkgIT0gXCIvXCIpIHtcbiAgICAgICAgbmFtZSArPSBcIi9cIjsgLy8gSUUgZG9lc24ndCBsaWtlIHN1YnN0cigtMSlcbiAgICB9XG5cbiAgICAvLyBEb2VzIHRoaXMgZm9sZGVyIGFscmVhZHkgZXhpc3Q/XG4gICAgaWYgKCF0aGlzLmZpbGVzW25hbWVdKSB7XG4gICAgICAgIGZpbGVBZGQuY2FsbCh0aGlzLCBuYW1lLCBudWxsLCB7XG4gICAgICAgICAgICBkaXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbGVzW25hbWVdO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIEpTWmlwLkNvbXByZXNzZWRPYmplY3QgZm9yIGEgZ2l2ZW4gemlwT2plY3QuXG4gKiBAcGFyYW0ge1ppcE9iamVjdH0gZmlsZSB0aGUgb2JqZWN0IHRvIHJlYWQuXG4gKiBAcGFyYW0ge0pTWmlwLmNvbXByZXNzaW9ufSBjb21wcmVzc2lvbiB0aGUgY29tcHJlc3Npb24gdG8gdXNlLlxuICogQHJldHVybiB7SlNaaXAuQ29tcHJlc3NlZE9iamVjdH0gdGhlIGNvbXByZXNzZWQgcmVzdWx0LlxuICovXG52YXIgZ2VuZXJhdGVDb21wcmVzc2VkT2JqZWN0RnJvbSA9IGZ1bmN0aW9uKGZpbGUsIGNvbXByZXNzaW9uKSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBDb21wcmVzc2VkT2JqZWN0KCksXG4gICAgICAgIGNvbnRlbnQ7XG5cbiAgICAvLyB0aGUgZGF0YSBoYXMgbm90IGJlZW4gZGVjb21wcmVzc2VkLCB3ZSBtaWdodCByZXVzZSB0aGluZ3MgIVxuICAgIGlmIChmaWxlLl9kYXRhIGluc3RhbmNlb2YgQ29tcHJlc3NlZE9iamVjdCkge1xuICAgICAgICByZXN1bHQudW5jb21wcmVzc2VkU2l6ZSA9IGZpbGUuX2RhdGEudW5jb21wcmVzc2VkU2l6ZTtcbiAgICAgICAgcmVzdWx0LmNyYzMyID0gZmlsZS5fZGF0YS5jcmMzMjtcblxuICAgICAgICBpZiAocmVzdWx0LnVuY29tcHJlc3NlZFNpemUgPT09IDAgfHwgZmlsZS5kaXIpIHtcbiAgICAgICAgICAgIGNvbXByZXNzaW9uID0gY29tcHJlc3Npb25zWydTVE9SRSddO1xuICAgICAgICAgICAgcmVzdWx0LmNvbXByZXNzZWRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgIHJlc3VsdC5jcmMzMiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmlsZS5fZGF0YS5jb21wcmVzc2lvbk1ldGhvZCA9PT0gY29tcHJlc3Npb24ubWFnaWMpIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb21wcmVzc2VkQ29udGVudCA9IGZpbGUuX2RhdGEuZ2V0Q29tcHJlc3NlZENvbnRlbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBmaWxlLl9kYXRhLmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZGVjb21wcmVzcyAvIHJlY29tcHJlc3NcbiAgICAgICAgICAgIHJlc3VsdC5jb21wcmVzc2VkQ29udGVudCA9IGNvbXByZXNzaW9uLmNvbXByZXNzKHV0aWxzLnRyYW5zZm9ybVRvKGNvbXByZXNzaW9uLmNvbXByZXNzSW5wdXRUeXBlLCBjb250ZW50KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIGhhdmUgdW5jb21wcmVzc2VkIGRhdGFcbiAgICAgICAgY29udGVudCA9IGdldEJpbmFyeURhdGEoZmlsZSk7XG4gICAgICAgIGlmICghY29udGVudCB8fCBjb250ZW50Lmxlbmd0aCA9PT0gMCB8fCBmaWxlLmRpcikge1xuICAgICAgICAgICAgY29tcHJlc3Npb24gPSBjb21wcmVzc2lvbnNbJ1NUT1JFJ107XG4gICAgICAgICAgICBjb250ZW50ID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQudW5jb21wcmVzc2VkU2l6ZSA9IGNvbnRlbnQubGVuZ3RoO1xuICAgICAgICByZXN1bHQuY3JjMzIgPSBjcmMzMihjb250ZW50KTtcbiAgICAgICAgcmVzdWx0LmNvbXByZXNzZWRDb250ZW50ID0gY29tcHJlc3Npb24uY29tcHJlc3ModXRpbHMudHJhbnNmb3JtVG8oY29tcHJlc3Npb24uY29tcHJlc3NJbnB1dFR5cGUsIGNvbnRlbnQpKTtcbiAgICB9XG5cbiAgICByZXN1bHQuY29tcHJlc3NlZFNpemUgPSByZXN1bHQuY29tcHJlc3NlZENvbnRlbnQubGVuZ3RoO1xuICAgIHJlc3VsdC5jb21wcmVzc2lvbk1ldGhvZCA9IGNvbXByZXNzaW9uLm1hZ2ljO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIHZhcmlvdXMgcGFydHMgdXNlZCBpbiB0aGUgY29uc3RydWN0aW9uIG9mIHRoZSBmaW5hbCB6aXAgZmlsZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBmaWxlIG5hbWUuXG4gKiBAcGFyYW0ge1ppcE9iamVjdH0gZmlsZSB0aGUgZmlsZSBjb250ZW50LlxuICogQHBhcmFtIHtKU1ppcC5Db21wcmVzc2VkT2JqZWN0fSBjb21wcmVzc2VkT2JqZWN0IHRoZSBjb21wcmVzc2VkIG9iamVjdC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXQgdGhlIGN1cnJlbnQgb2Zmc2V0IGZyb20gdGhlIHN0YXJ0IG9mIHRoZSB6aXAgZmlsZS5cbiAqIEByZXR1cm4ge29iamVjdH0gdGhlIHppcCBwYXJ0cy5cbiAqL1xudmFyIGdlbmVyYXRlWmlwUGFydHMgPSBmdW5jdGlvbihuYW1lLCBmaWxlLCBjb21wcmVzc2VkT2JqZWN0LCBvZmZzZXQpIHtcbiAgICB2YXIgZGF0YSA9IGNvbXByZXNzZWRPYmplY3QuY29tcHJlc3NlZENvbnRlbnQsXG4gICAgICAgIHV0ZkVuY29kZWRGaWxlTmFtZSA9IHV0aWxzLnRyYW5zZm9ybVRvKFwic3RyaW5nXCIsIHV0ZjgudXRmOGVuY29kZShmaWxlLm5hbWUpKSxcbiAgICAgICAgY29tbWVudCA9IGZpbGUuY29tbWVudCB8fCBcIlwiLFxuICAgICAgICB1dGZFbmNvZGVkQ29tbWVudCA9IHV0aWxzLnRyYW5zZm9ybVRvKFwic3RyaW5nXCIsIHV0ZjgudXRmOGVuY29kZShjb21tZW50KSksXG4gICAgICAgIHVzZVVURjhGb3JGaWxlTmFtZSA9IHV0ZkVuY29kZWRGaWxlTmFtZS5sZW5ndGggIT09IGZpbGUubmFtZS5sZW5ndGgsXG4gICAgICAgIHVzZVVURjhGb3JDb21tZW50ID0gdXRmRW5jb2RlZENvbW1lbnQubGVuZ3RoICE9PSBjb21tZW50Lmxlbmd0aCxcbiAgICAgICAgbyA9IGZpbGUub3B0aW9ucyxcbiAgICAgICAgZG9zVGltZSxcbiAgICAgICAgZG9zRGF0ZSxcbiAgICAgICAgZXh0cmFGaWVsZHMgPSBcIlwiLFxuICAgICAgICB1bmljb2RlUGF0aEV4dHJhRmllbGQgPSBcIlwiLFxuICAgICAgICB1bmljb2RlQ29tbWVudEV4dHJhRmllbGQgPSBcIlwiLFxuICAgICAgICBkaXIsIGRhdGU7XG5cblxuICAgIC8vIGhhbmRsZSB0aGUgZGVwcmVjYXRlZCBvcHRpb25zLmRpclxuICAgIGlmIChmaWxlLl9pbml0aWFsTWV0YWRhdGEuZGlyICE9PSBmaWxlLmRpcikge1xuICAgICAgICBkaXIgPSBmaWxlLmRpcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkaXIgPSBvLmRpcjtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgdGhlIGRlcHJlY2F0ZWQgb3B0aW9ucy5kYXRlXG4gICAgaWYoZmlsZS5faW5pdGlhbE1ldGFkYXRhLmRhdGUgIT09IGZpbGUuZGF0ZSkge1xuICAgICAgICBkYXRlID0gZmlsZS5kYXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGUgPSBvLmRhdGU7XG4gICAgfVxuXG4gICAgLy8gZGF0ZVxuICAgIC8vIEBzZWUgaHR0cDovL3d3dy5kZWxvcmllLmNvbS9kamdwcC9kb2MvcmJpbnRlci9pdC81Mi8xMy5odG1sXG4gICAgLy8gQHNlZSBodHRwOi8vd3d3LmRlbG9yaWUuY29tL2RqZ3BwL2RvYy9yYmludGVyL2l0LzY1LzE2Lmh0bWxcbiAgICAvLyBAc2VlIGh0dHA6Ly93d3cuZGVsb3JpZS5jb20vZGpncHAvZG9jL3JiaW50ZXIvaXQvNjYvMTYuaHRtbFxuXG4gICAgZG9zVGltZSA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICBkb3NUaW1lID0gZG9zVGltZSA8PCA2O1xuICAgIGRvc1RpbWUgPSBkb3NUaW1lIHwgZGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgZG9zVGltZSA9IGRvc1RpbWUgPDwgNTtcbiAgICBkb3NUaW1lID0gZG9zVGltZSB8IGRhdGUuZ2V0U2Vjb25kcygpIC8gMjtcblxuICAgIGRvc0RhdGUgPSBkYXRlLmdldEZ1bGxZZWFyKCkgLSAxOTgwO1xuICAgIGRvc0RhdGUgPSBkb3NEYXRlIDw8IDQ7XG4gICAgZG9zRGF0ZSA9IGRvc0RhdGUgfCAoZGF0ZS5nZXRNb250aCgpICsgMSk7XG4gICAgZG9zRGF0ZSA9IGRvc0RhdGUgPDwgNTtcbiAgICBkb3NEYXRlID0gZG9zRGF0ZSB8IGRhdGUuZ2V0RGF0ZSgpO1xuXG4gICAgaWYgKHVzZVVURjhGb3JGaWxlTmFtZSkge1xuICAgICAgICAvLyBzZXQgdGhlIHVuaWNvZGUgcGF0aCBleHRyYSBmaWVsZC4gdW56aXAgbmVlZHMgYXQgbGVhc3Qgb25lIGV4dHJhXG4gICAgICAgIC8vIGZpZWxkIHRvIGNvcnJlY3RseSBoYW5kbGUgdW5pY29kZSBwYXRoLCBzbyB1c2luZyB0aGUgcGF0aCBpcyBhcyBnb29kXG4gICAgICAgIC8vIGFzIGFueSBvdGhlciBpbmZvcm1hdGlvbi4gVGhpcyBjb3VsZCBpbXByb3ZlIHRoZSBzaXR1YXRpb24gd2l0aFxuICAgICAgICAvLyBvdGhlciBhcmNoaXZlIG1hbmFnZXJzIHRvby5cbiAgICAgICAgLy8gVGhpcyBmaWVsZCBpcyB1c3VhbGx5IHVzZWQgd2l0aG91dCB0aGUgdXRmOCBmbGFnLCB3aXRoIGEgbm9uXG4gICAgICAgIC8vIHVuaWNvZGUgcGF0aCBpbiB0aGUgaGVhZGVyICh3aW5yYXIsIHdpbnppcCkuIFRoaXMgaGVscHMgKGEgYml0KVxuICAgICAgICAvLyB3aXRoIHRoZSBtZXNzeSBXaW5kb3dzJyBkZWZhdWx0IGNvbXByZXNzZWQgZm9sZGVycyBmZWF0dXJlIGJ1dFxuICAgICAgICAvLyBicmVha3Mgb24gcDd6aXAgd2hpY2ggZG9lc24ndCBzZWVrIHRoZSB1bmljb2RlIHBhdGggZXh0cmEgZmllbGQuXG4gICAgICAgIC8vIFNvIGZvciBub3csIFVURi04IGV2ZXJ5d2hlcmUgIVxuICAgICAgICB1bmljb2RlUGF0aEV4dHJhRmllbGQgPVxuICAgICAgICAgICAgLy8gVmVyc2lvblxuICAgICAgICAgICAgZGVjVG9IZXgoMSwgMSkgK1xuICAgICAgICAgICAgLy8gTmFtZUNSQzMyXG4gICAgICAgICAgICBkZWNUb0hleChjcmMzMih1dGZFbmNvZGVkRmlsZU5hbWUpLCA0KSArXG4gICAgICAgICAgICAvLyBVbmljb2RlTmFtZVxuICAgICAgICAgICAgdXRmRW5jb2RlZEZpbGVOYW1lO1xuXG4gICAgICAgIGV4dHJhRmllbGRzICs9XG4gICAgICAgICAgICAvLyBJbmZvLVpJUCBVbmljb2RlIFBhdGggRXh0cmEgRmllbGRcbiAgICAgICAgICAgIFwiXFx4NzVcXHg3MFwiICtcbiAgICAgICAgICAgIC8vIHNpemVcbiAgICAgICAgICAgIGRlY1RvSGV4KHVuaWNvZGVQYXRoRXh0cmFGaWVsZC5sZW5ndGgsIDIpICtcbiAgICAgICAgICAgIC8vIGNvbnRlbnRcbiAgICAgICAgICAgIHVuaWNvZGVQYXRoRXh0cmFGaWVsZDtcbiAgICB9XG5cbiAgICBpZih1c2VVVEY4Rm9yQ29tbWVudCkge1xuXG4gICAgICAgIHVuaWNvZGVDb21tZW50RXh0cmFGaWVsZCA9XG4gICAgICAgICAgICAvLyBWZXJzaW9uXG4gICAgICAgICAgICBkZWNUb0hleCgxLCAxKSArXG4gICAgICAgICAgICAvLyBDb21tZW50Q1JDMzJcbiAgICAgICAgICAgIGRlY1RvSGV4KHRoaXMuY3JjMzIodXRmRW5jb2RlZENvbW1lbnQpLCA0KSArXG4gICAgICAgICAgICAvLyBVbmljb2RlTmFtZVxuICAgICAgICAgICAgdXRmRW5jb2RlZENvbW1lbnQ7XG5cbiAgICAgICAgZXh0cmFGaWVsZHMgKz1cbiAgICAgICAgICAgIC8vIEluZm8tWklQIFVuaWNvZGUgUGF0aCBFeHRyYSBGaWVsZFxuICAgICAgICAgICAgXCJcXHg3NVxceDYzXCIgK1xuICAgICAgICAgICAgLy8gc2l6ZVxuICAgICAgICAgICAgZGVjVG9IZXgodW5pY29kZUNvbW1lbnRFeHRyYUZpZWxkLmxlbmd0aCwgMikgK1xuICAgICAgICAgICAgLy8gY29udGVudFxuICAgICAgICAgICAgdW5pY29kZUNvbW1lbnRFeHRyYUZpZWxkO1xuICAgIH1cblxuICAgIHZhciBoZWFkZXIgPSBcIlwiO1xuXG4gICAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgIGhlYWRlciArPSBcIlxceDBBXFx4MDBcIjtcbiAgICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcbiAgICAvLyBzZXQgYml0IDExIGlmIHV0ZjhcbiAgICBoZWFkZXIgKz0gKHVzZVVURjhGb3JGaWxlTmFtZSB8fCB1c2VVVEY4Rm9yQ29tbWVudCkgPyBcIlxceDAwXFx4MDhcIiA6IFwiXFx4MDBcXHgwMFwiO1xuICAgIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgIGhlYWRlciArPSBjb21wcmVzc2VkT2JqZWN0LmNvbXByZXNzaW9uTWV0aG9kO1xuICAgIC8vIGxhc3QgbW9kIGZpbGUgdGltZVxuICAgIGhlYWRlciArPSBkZWNUb0hleChkb3NUaW1lLCAyKTtcbiAgICAvLyBsYXN0IG1vZCBmaWxlIGRhdGVcbiAgICBoZWFkZXIgKz0gZGVjVG9IZXgoZG9zRGF0ZSwgMik7XG4gICAgLy8gY3JjLTMyXG4gICAgaGVhZGVyICs9IGRlY1RvSGV4KGNvbXByZXNzZWRPYmplY3QuY3JjMzIsIDQpO1xuICAgIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIGhlYWRlciArPSBkZWNUb0hleChjb21wcmVzc2VkT2JqZWN0LmNvbXByZXNzZWRTaXplLCA0KTtcbiAgICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgIGhlYWRlciArPSBkZWNUb0hleChjb21wcmVzc2VkT2JqZWN0LnVuY29tcHJlc3NlZFNpemUsIDQpO1xuICAgIC8vIGZpbGUgbmFtZSBsZW5ndGhcbiAgICBoZWFkZXIgKz0gZGVjVG9IZXgodXRmRW5jb2RlZEZpbGVOYW1lLmxlbmd0aCwgMik7XG4gICAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gICAgaGVhZGVyICs9IGRlY1RvSGV4KGV4dHJhRmllbGRzLmxlbmd0aCwgMik7XG5cblxuICAgIHZhciBmaWxlUmVjb3JkID0gc2lnbmF0dXJlLkxPQ0FMX0ZJTEVfSEVBREVSICsgaGVhZGVyICsgdXRmRW5jb2RlZEZpbGVOYW1lICsgZXh0cmFGaWVsZHM7XG5cbiAgICB2YXIgZGlyUmVjb3JkID0gc2lnbmF0dXJlLkNFTlRSQUxfRklMRV9IRUFERVIgK1xuICAgIC8vIHZlcnNpb24gbWFkZSBieSAoMDA6IERPUylcbiAgICBcIlxceDE0XFx4MDBcIiArXG4gICAgLy8gZmlsZSBoZWFkZXIgKGNvbW1vbiB0byBmaWxlIGFuZCBjZW50cmFsIGRpcmVjdG9yeSlcbiAgICBoZWFkZXIgK1xuICAgIC8vIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICBkZWNUb0hleCh1dGZFbmNvZGVkQ29tbWVudC5sZW5ndGgsIDIpICtcbiAgICAvLyBkaXNrIG51bWJlciBzdGFydFxuICAgIFwiXFx4MDBcXHgwMFwiICtcbiAgICAvLyBpbnRlcm5hbCBmaWxlIGF0dHJpYnV0ZXMgVE9ET1xuICAgIFwiXFx4MDBcXHgwMFwiICtcbiAgICAvLyBleHRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcbiAgICAoZGlyID09PSB0cnVlID8gXCJcXHgxMFxceDAwXFx4MDBcXHgwMFwiIDogXCJcXHgwMFxceDAwXFx4MDBcXHgwMFwiKSArXG4gICAgLy8gcmVsYXRpdmUgb2Zmc2V0IG9mIGxvY2FsIGhlYWRlclxuICAgIGRlY1RvSGV4KG9mZnNldCwgNCkgK1xuICAgIC8vIGZpbGUgbmFtZVxuICAgIHV0ZkVuY29kZWRGaWxlTmFtZSArXG4gICAgLy8gZXh0cmEgZmllbGRcbiAgICBleHRyYUZpZWxkcyArXG4gICAgLy8gZmlsZSBjb21tZW50XG4gICAgdXRmRW5jb2RlZENvbW1lbnQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBmaWxlUmVjb3JkOiBmaWxlUmVjb3JkLFxuICAgICAgICBkaXJSZWNvcmQ6IGRpclJlY29yZCxcbiAgICAgICAgY29tcHJlc3NlZE9iamVjdDogY29tcHJlc3NlZE9iamVjdFxuICAgIH07XG59O1xuXG5cbi8vIHJldHVybiB0aGUgYWN0dWFsIHByb3RvdHlwZSBvZiBKU1ppcFxudmFyIG91dCA9IHtcbiAgICAvKipcbiAgICAgKiBSZWFkIGFuIGV4aXN0aW5nIHppcCBhbmQgbWVyZ2UgdGhlIGRhdGEgaW4gdGhlIGN1cnJlbnQgSlNaaXAgb2JqZWN0LlxuICAgICAqIFRoZSBpbXBsZW1lbnRhdGlvbiBpcyBpbiBqc3ppcC1sb2FkLmpzLCBkb24ndCBmb3JnZXQgdG8gaW5jbHVkZSBpdC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheUJ1ZmZlcnxVaW50OEFycmF5fEJ1ZmZlcn0gc3RyZWFtICBUaGUgc3RyZWFtIHRvIGxvYWRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIGZvciBsb2FkaW5nIHRoZSBzdHJlYW0uXG4gICAgICogIG9wdGlvbnMuYmFzZTY0IDogaXMgdGhlIHN0cmVhbSBpbiBiYXNlNjQgPyBkZWZhdWx0IDogZmFsc2VcbiAgICAgKiBAcmV0dXJuIHtKU1ppcH0gdGhlIGN1cnJlbnQgSlNaaXAgb2JqZWN0XG4gICAgICovXG4gICAgbG9hZDogZnVuY3Rpb24oc3RyZWFtLCBvcHRpb25zKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgbWV0aG9kIGlzIG5vdCBkZWZpbmVkLiBJcyB0aGUgZmlsZSBqc3ppcC1sb2FkLmpzIGluY2x1ZGVkID9cIik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbHRlciBuZXN0ZWQgZmlsZXMvZm9sZGVycyB3aXRoIHRoZSBzcGVjaWZpZWQgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc2VhcmNoIHRoZSBwcmVkaWNhdGUgdG8gdXNlIDpcbiAgICAgKiBmdW5jdGlvbiAocmVsYXRpdmVQYXRoLCBmaWxlKSB7Li4ufVxuICAgICAqIEl0IHRha2VzIDIgYXJndW1lbnRzIDogdGhlIHJlbGF0aXZlIHBhdGggYW5kIHRoZSBmaWxlLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiBtYXRjaGluZyBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBmaWx0ZXI6IGZ1bmN0aW9uKHNlYXJjaCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICBmaWxlbmFtZSwgcmVsYXRpdmVQYXRoLCBmaWxlLCBmaWxlQ2xvbmU7XG4gICAgICAgIGZvciAoZmlsZW5hbWUgaW4gdGhpcy5maWxlcykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmZpbGVzLmhhc093blByb3BlcnR5KGZpbGVuYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZSA9IHRoaXMuZmlsZXNbZmlsZW5hbWVdO1xuICAgICAgICAgICAgLy8gcmV0dXJuIGEgbmV3IG9iamVjdCwgZG9uJ3QgbGV0IHRoZSB1c2VyIG1lc3Mgd2l0aCBvdXIgaW50ZXJuYWwgb2JqZWN0cyA6KVxuICAgICAgICAgICAgZmlsZUNsb25lID0gbmV3IFppcE9iamVjdChmaWxlLm5hbWUsIGZpbGUuX2RhdGEsIGV4dGVuZChmaWxlLm9wdGlvbnMpKTtcbiAgICAgICAgICAgIHJlbGF0aXZlUGF0aCA9IGZpbGVuYW1lLnNsaWNlKHRoaXMucm9vdC5sZW5ndGgsIGZpbGVuYW1lLmxlbmd0aCk7XG4gICAgICAgICAgICBpZiAoZmlsZW5hbWUuc2xpY2UoMCwgdGhpcy5yb290Lmxlbmd0aCkgPT09IHRoaXMucm9vdCAmJiAvLyB0aGUgZmlsZSBpcyBpbiB0aGUgY3VycmVudCByb290XG4gICAgICAgICAgICBzZWFyY2gocmVsYXRpdmVQYXRoLCBmaWxlQ2xvbmUpKSB7IC8vIGFuZCB0aGUgZmlsZSBtYXRjaGVzIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGZpbGVDbG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgZmlsZSB0byB0aGUgemlwIGZpbGUsIG9yIHNlYXJjaCBhIGZpbGUuXG4gICAgICogQHBhcmFtICAge3N0cmluZ3xSZWdFeHB9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gYWRkIChpZiBkYXRhIGlzIGRlZmluZWQpLFxuICAgICAqIHRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGZpbmQgKGlmIG5vIGRhdGEpIG9yIGEgcmVnZXggdG8gbWF0Y2ggZmlsZXMuXG4gICAgICogQHBhcmFtICAge1N0cmluZ3xBcnJheUJ1ZmZlcnxVaW50OEFycmF5fEJ1ZmZlcn0gZGF0YSAgVGhlIGZpbGUgZGF0YSwgZWl0aGVyIHJhdyBvciBiYXNlNjQgZW5jb2RlZFxuICAgICAqIEBwYXJhbSAgIHtPYmplY3R9IG8gICAgIEZpbGUgb3B0aW9uc1xuICAgICAqIEByZXR1cm4gIHtKU1ppcHxPYmplY3R8QXJyYXl9IHRoaXMgSlNaaXAgb2JqZWN0ICh3aGVuIGFkZGluZyBhIGZpbGUpLFxuICAgICAqIGEgZmlsZSAod2hlbiBzZWFyY2hpbmcgYnkgc3RyaW5nKSBvciBhbiBhcnJheSBvZiBmaWxlcyAod2hlbiBzZWFyY2hpbmcgYnkgcmVnZXgpLlxuICAgICAqL1xuICAgIGZpbGU6IGZ1bmN0aW9uKG5hbWUsIGRhdGEsIG8pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGlmICh1dGlscy5pc1JlZ0V4cChuYW1lKSkge1xuICAgICAgICAgICAgICAgIHZhciByZWdleHAgPSBuYW1lO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbihyZWxhdGl2ZVBhdGgsIGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFmaWxlLmRpciAmJiByZWdleHAudGVzdChyZWxhdGl2ZVBhdGgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7IC8vIHRleHRcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXIoZnVuY3Rpb24ocmVsYXRpdmVQYXRoLCBmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhZmlsZS5kaXIgJiYgcmVsYXRpdmVQYXRoID09PSBuYW1lO1xuICAgICAgICAgICAgICAgIH0pWzBdIHx8IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIG1vcmUgdGhhbiBvbmUgYXJndW1lbnQgOiB3ZSBoYXZlIGRhdGEgIVxuICAgICAgICAgICAgbmFtZSA9IHRoaXMucm9vdCArIG5hbWU7XG4gICAgICAgICAgICBmaWxlQWRkLmNhbGwodGhpcywgbmFtZSwgZGF0YSwgbyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIGRpcmVjdG9yeSB0byB0aGUgemlwIGZpbGUsIG9yIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0gICB7U3RyaW5nfFJlZ0V4cH0gYXJnIFRoZSBuYW1lIG9mIHRoZSBkaXJlY3RvcnkgdG8gYWRkLCBvciBhIHJlZ2V4IHRvIHNlYXJjaCBmb2xkZXJzLlxuICAgICAqIEByZXR1cm4gIHtKU1ppcH0gYW4gb2JqZWN0IHdpdGggdGhlIG5ldyBkaXJlY3RvcnkgYXMgdGhlIHJvb3QsIG9yIGFuIGFycmF5IGNvbnRhaW5pbmcgbWF0Y2hpbmcgZm9sZGVycy5cbiAgICAgKi9cbiAgICBmb2xkZXI6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICBpZiAoIWFyZykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXRpbHMuaXNSZWdFeHAoYXJnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKGZ1bmN0aW9uKHJlbGF0aXZlUGF0aCwgZmlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlLmRpciAmJiBhcmcudGVzdChyZWxhdGl2ZVBhdGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlbHNlLCBuYW1lIGlzIGEgbmV3IGZvbGRlclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMucm9vdCArIGFyZztcbiAgICAgICAgdmFyIG5ld0ZvbGRlciA9IGZvbGRlckFkZC5jYWxsKHRoaXMsIG5hbWUpO1xuXG4gICAgICAgIC8vIEFsbG93IGNoYWluaW5nIGJ5IHJldHVybmluZyBhIG5ldyBvYmplY3Qgd2l0aCB0aGlzIGZvbGRlciBhcyB0aGUgcm9vdFxuICAgICAgICB2YXIgcmV0ID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICByZXQucm9vdCA9IG5ld0ZvbGRlci5uYW1lO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBmaWxlLCBvciBhIGRpcmVjdG9yeSBhbmQgYWxsIHN1Yi1maWxlcywgZnJvbSB0aGUgemlwXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gZGVsZXRlXG4gICAgICogQHJldHVybiB7SlNaaXB9IHRoaXMgSlNaaXAgb2JqZWN0XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIG5hbWUgPSB0aGlzLnJvb3QgKyBuYW1lO1xuICAgICAgICB2YXIgZmlsZSA9IHRoaXMuZmlsZXNbbmFtZV07XG4gICAgICAgIGlmICghZmlsZSkge1xuICAgICAgICAgICAgLy8gTG9vayBmb3IgYW55IGZvbGRlcnNcbiAgICAgICAgICAgIGlmIChuYW1lLnNsaWNlKC0xKSAhPSBcIi9cIikge1xuICAgICAgICAgICAgICAgIG5hbWUgKz0gXCIvXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlID0gdGhpcy5maWxlc1tuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlICYmICFmaWxlLmRpcikge1xuICAgICAgICAgICAgLy8gZmlsZVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZmlsZXNbbmFtZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBtYXliZSBhIGZvbGRlciwgZGVsZXRlIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICB2YXIga2lkcyA9IHRoaXMuZmlsdGVyKGZ1bmN0aW9uKHJlbGF0aXZlUGF0aCwgZmlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlLm5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGgpID09PSBuYW1lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5maWxlc1traWRzW2ldLm5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHRoZSBjb21wbGV0ZSB6aXAgZmlsZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHRoZSBvcHRpb25zIHRvIGdlbmVyYXRlIHRoZSB6aXAgZmlsZSA6XG4gICAgICogLSBiYXNlNjQsIChkZXByZWNhdGVkLCB1c2UgdHlwZSBpbnN0ZWFkKSB0cnVlIHRvIGdlbmVyYXRlIGJhc2U2NC5cbiAgICAgKiAtIGNvbXByZXNzaW9uLCBcIlNUT1JFXCIgYnkgZGVmYXVsdC5cbiAgICAgKiAtIHR5cGUsIFwiYmFzZTY0XCIgYnkgZGVmYXVsdC4gVmFsdWVzIGFyZSA6IHN0cmluZywgYmFzZTY0LCB1aW50OGFycmF5LCBhcnJheWJ1ZmZlciwgYmxvYi5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd8VWludDhBcnJheXxBcnJheUJ1ZmZlcnxCdWZmZXJ8QmxvYn0gdGhlIHppcCBmaWxlXG4gICAgICovXG4gICAgZ2VuZXJhdGU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zIHx8IHt9LCB7XG4gICAgICAgICAgICBiYXNlNjQ6IHRydWUsXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogXCJTVE9SRVwiLFxuICAgICAgICAgICAgdHlwZTogXCJiYXNlNjRcIixcbiAgICAgICAgICAgIGNvbW1lbnQ6IG51bGxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbHMuY2hlY2tTdXBwb3J0KG9wdGlvbnMudHlwZSk7XG5cbiAgICAgICAgdmFyIHppcERhdGEgPSBbXSxcbiAgICAgICAgICAgIGxvY2FsRGlyTGVuZ3RoID0gMCxcbiAgICAgICAgICAgIGNlbnRyYWxEaXJMZW5ndGggPSAwLFxuICAgICAgICAgICAgd3JpdGVyLCBpLFxuICAgICAgICAgICAgdXRmRW5jb2RlZENvbW1lbnQgPSB1dGlscy50cmFuc2Zvcm1UbyhcInN0cmluZ1wiLCB0aGlzLnV0ZjhlbmNvZGUob3B0aW9ucy5jb21tZW50IHx8IHRoaXMuY29tbWVudCB8fCBcIlwiKSk7XG5cbiAgICAgICAgLy8gZmlyc3QsIGdlbmVyYXRlIGFsbCB0aGUgemlwIHBhcnRzLlxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMuZmlsZXMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5maWxlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZpbGUgPSB0aGlzLmZpbGVzW25hbWVdO1xuXG4gICAgICAgICAgICB2YXIgY29tcHJlc3Npb25OYW1lID0gZmlsZS5vcHRpb25zLmNvbXByZXNzaW9uIHx8IG9wdGlvbnMuY29tcHJlc3Npb24udG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIHZhciBjb21wcmVzc2lvbiA9IGNvbXByZXNzaW9uc1tjb21wcmVzc2lvbk5hbWVdO1xuICAgICAgICAgICAgaWYgKCFjb21wcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihjb21wcmVzc2lvbk5hbWUgKyBcIiBpcyBub3QgYSB2YWxpZCBjb21wcmVzc2lvbiBtZXRob2QgIVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNvbXByZXNzZWRPYmplY3QgPSBnZW5lcmF0ZUNvbXByZXNzZWRPYmplY3RGcm9tLmNhbGwodGhpcywgZmlsZSwgY29tcHJlc3Npb24pO1xuXG4gICAgICAgICAgICB2YXIgemlwUGFydCA9IGdlbmVyYXRlWmlwUGFydHMuY2FsbCh0aGlzLCBuYW1lLCBmaWxlLCBjb21wcmVzc2VkT2JqZWN0LCBsb2NhbERpckxlbmd0aCk7XG4gICAgICAgICAgICBsb2NhbERpckxlbmd0aCArPSB6aXBQYXJ0LmZpbGVSZWNvcmQubGVuZ3RoICsgY29tcHJlc3NlZE9iamVjdC5jb21wcmVzc2VkU2l6ZTtcbiAgICAgICAgICAgIGNlbnRyYWxEaXJMZW5ndGggKz0gemlwUGFydC5kaXJSZWNvcmQubGVuZ3RoO1xuICAgICAgICAgICAgemlwRGF0YS5wdXNoKHppcFBhcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRpckVuZCA9IFwiXCI7XG5cbiAgICAgICAgLy8gZW5kIG9mIGNlbnRyYWwgZGlyIHNpZ25hdHVyZVxuICAgICAgICBkaXJFbmQgPSBzaWduYXR1cmUuQ0VOVFJBTF9ESVJFQ1RPUllfRU5EICtcbiAgICAgICAgLy8gbnVtYmVyIG9mIHRoaXMgZGlza1xuICAgICAgICBcIlxceDAwXFx4MDBcIiArXG4gICAgICAgIC8vIG51bWJlciBvZiB0aGUgZGlzayB3aXRoIHRoZSBzdGFydCBvZiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcbiAgICAgICAgXCJcXHgwMFxceDAwXCIgK1xuICAgICAgICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2VudHJhbCBkaXJlY3Rvcnkgb24gdGhpcyBkaXNrXG4gICAgICAgIGRlY1RvSGV4KHppcERhdGEubGVuZ3RoLCAyKSArXG4gICAgICAgIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxuICAgICAgICBkZWNUb0hleCh6aXBEYXRhLmxlbmd0aCwgMikgK1xuICAgICAgICAvLyBzaXplIG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeSAgIDQgYnl0ZXNcbiAgICAgICAgZGVjVG9IZXgoY2VudHJhbERpckxlbmd0aCwgNCkgK1xuICAgICAgICAvLyBvZmZzZXQgb2Ygc3RhcnQgb2YgY2VudHJhbCBkaXJlY3Rvcnkgd2l0aCByZXNwZWN0IHRvIHRoZSBzdGFydGluZyBkaXNrIG51bWJlclxuICAgICAgICBkZWNUb0hleChsb2NhbERpckxlbmd0aCwgNCkgK1xuICAgICAgICAvLyAuWklQIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICAgICAgZGVjVG9IZXgodXRmRW5jb2RlZENvbW1lbnQubGVuZ3RoLCAyKSArXG4gICAgICAgIC8vIC5aSVAgZmlsZSBjb21tZW50XG4gICAgICAgIHV0ZkVuY29kZWRDb21tZW50O1xuXG5cbiAgICAgICAgLy8gd2UgaGF2ZSBhbGwgdGhlIHBhcnRzIChhbmQgdGhlIHRvdGFsIGxlbmd0aClcbiAgICAgICAgLy8gdGltZSB0byBjcmVhdGUgYSB3cml0ZXIgIVxuICAgICAgICB2YXIgdHlwZU5hbWUgPSBvcHRpb25zLnR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYodHlwZU5hbWU9PT1cInVpbnQ4YXJyYXlcInx8dHlwZU5hbWU9PT1cImFycmF5YnVmZmVyXCJ8fHR5cGVOYW1lPT09XCJibG9iXCJ8fHR5cGVOYW1lPT09XCJub2RlYnVmZmVyXCIpIHtcbiAgICAgICAgICAgIHdyaXRlciA9IG5ldyBVaW50OEFycmF5V3JpdGVyKGxvY2FsRGlyTGVuZ3RoICsgY2VudHJhbERpckxlbmd0aCArIGRpckVuZC5sZW5ndGgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHdyaXRlciA9IG5ldyBTdHJpbmdXcml0ZXIobG9jYWxEaXJMZW5ndGggKyBjZW50cmFsRGlyTGVuZ3RoICsgZGlyRW5kLmxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgemlwRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgd3JpdGVyLmFwcGVuZCh6aXBEYXRhW2ldLmZpbGVSZWNvcmQpO1xuICAgICAgICAgICAgd3JpdGVyLmFwcGVuZCh6aXBEYXRhW2ldLmNvbXByZXNzZWRPYmplY3QuY29tcHJlc3NlZENvbnRlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB6aXBEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB3cml0ZXIuYXBwZW5kKHppcERhdGFbaV0uZGlyUmVjb3JkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyaXRlci5hcHBlbmQoZGlyRW5kKTtcblxuICAgICAgICB2YXIgemlwID0gd3JpdGVyLmZpbmFsaXplKCk7XG5cblxuXG4gICAgICAgIHN3aXRjaChvcHRpb25zLnR5cGUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgLy8gY2FzZSBcInppcCBpcyBhbiBVaW50OEFycmF5XCJcbiAgICAgICAgICAgIGNhc2UgXCJ1aW50OGFycmF5XCIgOlxuICAgICAgICAgICAgY2FzZSBcImFycmF5YnVmZmVyXCIgOlxuICAgICAgICAgICAgY2FzZSBcIm5vZGVidWZmZXJcIiA6XG4gICAgICAgICAgICAgICByZXR1cm4gdXRpbHMudHJhbnNmb3JtVG8ob3B0aW9ucy50eXBlLnRvTG93ZXJDYXNlKCksIHppcCk7XG4gICAgICAgICAgICBjYXNlIFwiYmxvYlwiIDpcbiAgICAgICAgICAgICAgIHJldHVybiB1dGlscy5hcnJheUJ1ZmZlcjJCbG9iKHV0aWxzLnRyYW5zZm9ybVRvKFwiYXJyYXlidWZmZXJcIiwgemlwKSk7XG4gICAgICAgICAgICAvLyBjYXNlIFwiemlwIGlzIGEgc3RyaW5nXCJcbiAgICAgICAgICAgIGNhc2UgXCJiYXNlNjRcIiA6XG4gICAgICAgICAgICAgICByZXR1cm4gKG9wdGlvbnMuYmFzZTY0KSA/IGJhc2U2NC5lbmNvZGUoemlwKSA6IHppcDtcbiAgICAgICAgICAgIGRlZmF1bHQgOiAvLyBjYXNlIFwic3RyaW5nXCIgOlxuICAgICAgICAgICAgICAgcmV0dXJuIHppcDtcbiAgICAgICAgIH1cbiAgICAgIFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIFRoaXMgbWV0aG9kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uIHdpdGhvdXQgcmVwbGFjZW1lbnQuXG4gICAgICovXG4gICAgY3JjMzI6IGZ1bmN0aW9uIChpbnB1dCwgY3JjKSB7XG4gICAgICAgIHJldHVybiBjcmMzMihpbnB1dCwgY3JjKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICAgICAqL1xuICAgIHV0ZjhlbmNvZGU6IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnRyYW5zZm9ybVRvKFwic3RyaW5nXCIsIHV0ZjgudXRmOGVuY29kZShzdHJpbmcpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiB3aXRob3V0IHJlcGxhY2VtZW50LlxuICAgICAqL1xuICAgIHV0ZjhkZWNvZGU6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gdXRmOC51dGY4ZGVjb2RlKGlucHV0KTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBvdXQ7XG4iLCIndXNlIHN0cmljdCc7XG5leHBvcnRzLkxPQ0FMX0ZJTEVfSEVBREVSID0gXCJQS1xceDAzXFx4MDRcIjtcbmV4cG9ydHMuQ0VOVFJBTF9GSUxFX0hFQURFUiA9IFwiUEtcXHgwMVxceDAyXCI7XG5leHBvcnRzLkNFTlRSQUxfRElSRUNUT1JZX0VORCA9IFwiUEtcXHgwNVxceDA2XCI7XG5leHBvcnRzLlpJUDY0X0NFTlRSQUxfRElSRUNUT1JZX0xPQ0FUT1IgPSBcIlBLXFx4MDZcXHgwN1wiO1xuZXhwb3J0cy5aSVA2NF9DRU5UUkFMX0RJUkVDVE9SWV9FTkQgPSBcIlBLXFx4MDZcXHgwNlwiO1xuZXhwb3J0cy5EQVRBX0RFU0NSSVBUT1IgPSBcIlBLXFx4MDdcXHgwOFwiO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIERhdGFSZWFkZXIgPSByZXF1aXJlKCcuL2RhdGFSZWFkZXInKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuZnVuY3Rpb24gU3RyaW5nUmVhZGVyKGRhdGEsIG9wdGltaXplZEJpbmFyeVN0cmluZykge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgaWYgKCFvcHRpbWl6ZWRCaW5hcnlTdHJpbmcpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gdXRpbHMuc3RyaW5nMmJpbmFyeSh0aGlzLmRhdGEpO1xuICAgIH1cbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMuZGF0YS5sZW5ndGg7XG4gICAgdGhpcy5pbmRleCA9IDA7XG59XG5TdHJpbmdSZWFkZXIucHJvdG90eXBlID0gbmV3IERhdGFSZWFkZXIoKTtcbi8qKlxuICogQHNlZSBEYXRhUmVhZGVyLmJ5dGVBdFxuICovXG5TdHJpbmdSZWFkZXIucHJvdG90eXBlLmJ5dGVBdCA9IGZ1bmN0aW9uKGkpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmNoYXJDb2RlQXQoaSk7XG59O1xuLyoqXG4gKiBAc2VlIERhdGFSZWFkZXIubGFzdEluZGV4T2ZTaWduYXR1cmVcbiAqL1xuU3RyaW5nUmVhZGVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZlNpZ25hdHVyZSA9IGZ1bmN0aW9uKHNpZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEubGFzdEluZGV4T2Yoc2lnKTtcbn07XG4vKipcbiAqIEBzZWUgRGF0YVJlYWRlci5yZWFkRGF0YVxuICovXG5TdHJpbmdSZWFkZXIucHJvdG90eXBlLnJlYWREYXRhID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgIHRoaXMuY2hlY2tPZmZzZXQoc2l6ZSk7XG4gICAgLy8gdGhpcyB3aWxsIHdvcmsgYmVjYXVzZSB0aGUgY29uc3RydWN0b3IgYXBwbGllZCB0aGUgXCImIDB4ZmZcIiBtYXNrLlxuICAgIHZhciByZXN1bHQgPSB0aGlzLmRhdGEuc2xpY2UodGhpcy5pbmRleCwgdGhpcy5pbmRleCArIHNpemUpO1xuICAgIHRoaXMuaW5kZXggKz0gc2l6ZTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbm1vZHVsZS5leHBvcnRzID0gU3RyaW5nUmVhZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRvIHdyaXRlIGFueSBjb250ZW50IHRvIGEgc3RyaW5nLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBTdHJpbmdXcml0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRhdGEgPSBbXTtcbn07XG5TdHJpbmdXcml0ZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEFwcGVuZCBhbnkgY29udGVudCB0byB0aGUgY3VycmVudCBzdHJpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0IHRoZSBjb250ZW50IHRvIGFkZC5cbiAgICAgKi9cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlucHV0ID0gdXRpbHMudHJhbnNmb3JtVG8oXCJzdHJpbmdcIiwgaW5wdXQpO1xuICAgICAgICB0aGlzLmRhdGEucHVzaChpbnB1dCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBGaW5hbGl6ZSB0aGUgY29uc3RydWN0aW9uIGFuIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIGdlbmVyYXRlZCBzdHJpbmcuXG4gICAgICovXG4gICAgZmluYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmpvaW4oXCJcIik7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdHJpbmdXcml0ZXI7XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuJ3VzZSBzdHJpY3QnO1xuZXhwb3J0cy5iYXNlNjQgPSB0cnVlO1xuZXhwb3J0cy5hcnJheSA9IHRydWU7XG5leHBvcnRzLnN0cmluZyA9IHRydWU7XG5leHBvcnRzLmFycmF5YnVmZmVyID0gdHlwZW9mIEFycmF5QnVmZmVyICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBVaW50OEFycmF5ICE9PSBcInVuZGVmaW5lZFwiO1xuLy8gY29udGFpbnMgdHJ1ZSBpZiBKU1ppcCBjYW4gcmVhZC9nZW5lcmF0ZSBub2RlanMgQnVmZmVyLCBmYWxzZSBvdGhlcndpc2UsIGFrYSBjaGVja3MgaWYgd2UgYXJuJ3QgaW4gYSBicm93c2VyLlxuZXhwb3J0cy5ub2RlYnVmZmVyID0gIXByb2Nlc3MuYnJvd3Nlcjtcbi8vIGNvbnRhaW5zIHRydWUgaWYgSlNaaXAgY2FuIHJlYWQvZ2VuZXJhdGUgVWludDhBcnJheSwgZmFsc2Ugb3RoZXJ3aXNlLlxuZXhwb3J0cy51aW50OGFycmF5ID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09IFwidW5kZWZpbmVkXCI7XG5cbmlmICh0eXBlb2YgQXJyYXlCdWZmZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBleHBvcnRzLmJsb2IgPSBmYWxzZTtcbn1cbmVsc2Uge1xuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoMCk7XG4gICAgdHJ5IHtcbiAgICAgICAgZXhwb3J0cy5ibG9iID0gbmV3IEJsb2IoW2J1ZmZlcl0sIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24vemlwXCJcbiAgICAgICAgfSkuc2l6ZSA9PT0gMDtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBCdWlsZGVyID0gd2luZG93LkJsb2JCdWlsZGVyIHx8IHdpbmRvdy5XZWJLaXRCbG9iQnVpbGRlciB8fCB3aW5kb3cuTW96QmxvYkJ1aWxkZXIgfHwgd2luZG93Lk1TQmxvYkJ1aWxkZXI7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gICAgICAgICAgICBidWlsZGVyLmFwcGVuZChidWZmZXIpO1xuICAgICAgICAgICAgZXhwb3J0cy5ibG9iID0gYnVpbGRlci5nZXRCbG9iKCdhcHBsaWNhdGlvbi96aXAnKS5zaXplID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBleHBvcnRzLmJsb2IgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJxKzY0ZndcIikpIiwiJ3VzZSBzdHJpY3QnO1xudmFyIERhdGFSZWFkZXIgPSByZXF1aXJlKCcuL2RhdGFSZWFkZXInKTtcblxuZnVuY3Rpb24gVWludDhBcnJheVJlYWRlcihkYXRhKSB7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmRhdGEubGVuZ3RoO1xuICAgICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICB9XG59XG5VaW50OEFycmF5UmVhZGVyLnByb3RvdHlwZSA9IG5ldyBEYXRhUmVhZGVyKCk7XG4vKipcbiAqIEBzZWUgRGF0YVJlYWRlci5ieXRlQXRcbiAqL1xuVWludDhBcnJheVJlYWRlci5wcm90b3R5cGUuYnl0ZUF0ID0gZnVuY3Rpb24oaSkge1xuICAgIHJldHVybiB0aGlzLmRhdGFbaV07XG59O1xuLyoqXG4gKiBAc2VlIERhdGFSZWFkZXIubGFzdEluZGV4T2ZTaWduYXR1cmVcbiAqL1xuVWludDhBcnJheVJlYWRlci5wcm90b3R5cGUubGFzdEluZGV4T2ZTaWduYXR1cmUgPSBmdW5jdGlvbihzaWcpIHtcbiAgICB2YXIgc2lnMCA9IHNpZy5jaGFyQ29kZUF0KDApLFxuICAgICAgICBzaWcxID0gc2lnLmNoYXJDb2RlQXQoMSksXG4gICAgICAgIHNpZzIgPSBzaWcuY2hhckNvZGVBdCgyKSxcbiAgICAgICAgc2lnMyA9IHNpZy5jaGFyQ29kZUF0KDMpO1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDQ7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFbaV0gPT09IHNpZzAgJiYgdGhpcy5kYXRhW2kgKyAxXSA9PT0gc2lnMSAmJiB0aGlzLmRhdGFbaSArIDJdID09PSBzaWcyICYmIHRoaXMuZGF0YVtpICsgM10gPT09IHNpZzMpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufTtcbi8qKlxuICogQHNlZSBEYXRhUmVhZGVyLnJlYWREYXRhXG4gKi9cblVpbnQ4QXJyYXlSZWFkZXIucHJvdG90eXBlLnJlYWREYXRhID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgIHRoaXMuY2hlY2tPZmZzZXQoc2l6ZSk7XG4gICAgaWYoc2l6ZSA9PT0gMCkge1xuICAgICAgICAvLyBpbiBJRTEwLCB3aGVuIHVzaW5nIHN1YmFycmF5KGlkeCwgaWR4KSwgd2UgZ2V0IHRoZSBhcnJheSBbMHgwMF0gaW5zdGVhZCBvZiBbXS5cbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KDApO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5kYXRhLnN1YmFycmF5KHRoaXMuaW5kZXgsIHRoaXMuaW5kZXggKyBzaXplKTtcbiAgICB0aGlzLmluZGV4ICs9IHNpemU7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXlSZWFkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuLyoqXG4gKiBBbiBvYmplY3QgdG8gd3JpdGUgYW55IGNvbnRlbnQgdG8gYW4gVWludDhBcnJheS5cbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSBhcnJheS5cbiAqL1xudmFyIFVpbnQ4QXJyYXlXcml0ZXIgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xuICAgIHRoaXMuaW5kZXggPSAwO1xufTtcblVpbnQ4QXJyYXlXcml0ZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEFwcGVuZCBhbnkgY29udGVudCB0byB0aGUgY3VycmVudCBhcnJheS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXQgdGhlIGNvbnRlbnQgdG8gYWRkLlxuICAgICAqL1xuICAgIGFwcGVuZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLy8gd2l0aCBhbiBlbXB0eSBVaW50OEFycmF5LCBPcGVyYSBmYWlscyB3aXRoIGEgXCJPZmZzZXQgbGFyZ2VyIHRoYW4gYXJyYXkgc2l6ZVwiXG4gICAgICAgICAgICBpbnB1dCA9IHV0aWxzLnRyYW5zZm9ybVRvKFwidWludDhhcnJheVwiLCBpbnB1dCk7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0KGlucHV0LCB0aGlzLmluZGV4KTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggKz0gaW5wdXQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBGaW5hbGl6ZSB0aGUgY29uc3RydWN0aW9uIGFuIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9IHRoZSBnZW5lcmF0ZWQgYXJyYXkuXG4gICAgICovXG4gICAgZmluYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVWludDhBcnJheVdyaXRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIHN1cHBvcnQgPSByZXF1aXJlKCcuL3N1cHBvcnQnKTtcbnZhciBub2RlQnVmZmVyID0gcmVxdWlyZSgnLi9ub2RlQnVmZmVyJyk7XG5cbnZhciB0ZXh0RW5jb2RlciwgdGV4dERlY29kZXI7XG5pZiAoXG4gICAgc3VwcG9ydC51aW50OGFycmF5ICYmXG4gICAgdHlwZW9mIFRleHRFbmNvZGVyID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICB0eXBlb2YgVGV4dERlY29kZXIgPT09IFwiZnVuY3Rpb25cIlxuKSB7XG4gICAgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoXCJ1dGYtOFwiKTtcbiAgICB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcihcInV0Zi04XCIpO1xufVxuXG4vKipcbiAqIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIGNvbWUgZnJvbSBwYWtvLCBmcm9tIHBha28vbGliL3V0aWxzL3N0cmluZ3NcbiAqIHJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSwgc2VlIHBha28gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9wYWtvL1xuICovXG5cbi8vIFRhYmxlIHdpdGggdXRmOCBsZW5ndGhzIChjYWxjdWxhdGVkIGJ5IGZpcnN0IGJ5dGUgb2Ygc2VxdWVuY2UpXG4vLyBOb3RlLCB0aGF0IDUgJiA2LWJ5dGUgdmFsdWVzIGFuZCBzb21lIDQtYnl0ZSB2YWx1ZXMgY2FuIG5vdCBiZSByZXByZXNlbnRlZCBpbiBKUyxcbi8vIGJlY2F1c2UgbWF4IHBvc3NpYmxlIGNvZGVwb2ludCBpcyAweDEwZmZmZlxudmFyIF91dGY4bGVuID0gbmV3IEFycmF5KDI1Nik7XG5mb3IgKHZhciBpPTA7IGk8MjU2OyBpKyspIHtcbiAgX3V0ZjhsZW5baV0gPSAoaSA+PSAyNTIgPyA2IDogaSA+PSAyNDggPyA1IDogaSA+PSAyNDAgPyA0IDogaSA+PSAyMjQgPyAzIDogaSA+PSAxOTIgPyAyIDogMSk7XG59XG5fdXRmOGxlblsyNTRdPV91dGY4bGVuWzI1NF09MTsgLy8gSW52YWxpZCBzZXF1ZW5jZSBzdGFydFxuXG4vLyBjb252ZXJ0IHN0cmluZyB0byBhcnJheSAodHlwZWQsIHdoZW4gcG9zc2libGUpXG52YXIgc3RyaW5nMmJ1ZiA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICB2YXIgYnVmLCBjLCBjMiwgbV9wb3MsIGksIHN0cl9sZW4gPSBzdHIubGVuZ3RoLCBidWZfbGVuID0gMDtcblxuICAgIC8vIGNvdW50IGJpbmFyeSBzaXplXG4gICAgZm9yIChtX3BvcyA9IDA7IG1fcG9zIDwgc3RyX2xlbjsgbV9wb3MrKykge1xuICAgICAgICBjID0gc3RyLmNoYXJDb2RlQXQobV9wb3MpO1xuICAgICAgICBpZiAoKGMgJiAweGZjMDApID09PSAweGQ4MDAgJiYgKG1fcG9zKzEgPCBzdHJfbGVuKSkge1xuICAgICAgICAgICAgYzIgPSBzdHIuY2hhckNvZGVBdChtX3BvcysxKTtcbiAgICAgICAgICAgIGlmICgoYzIgJiAweGZjMDApID09PSAweGRjMDApIHtcbiAgICAgICAgICAgICAgICBjID0gMHgxMDAwMCArICgoYyAtIDB4ZDgwMCkgPDwgMTApICsgKGMyIC0gMHhkYzAwKTtcbiAgICAgICAgICAgICAgICBtX3BvcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJ1Zl9sZW4gKz0gYyA8IDB4ODAgPyAxIDogYyA8IDB4ODAwID8gMiA6IGMgPCAweDEwMDAwID8gMyA6IDQ7XG4gICAgfVxuXG4gICAgLy8gYWxsb2NhdGUgYnVmZmVyXG4gICAgaWYgKHN1cHBvcnQudWludDhhcnJheSkge1xuICAgICAgICBidWYgPSBuZXcgVWludDhBcnJheShidWZfbGVuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBidWYgPSBuZXcgQXJyYXkoYnVmX2xlbik7XG4gICAgfVxuXG4gICAgLy8gY29udmVydFxuICAgIGZvciAoaT0wLCBtX3BvcyA9IDA7IGkgPCBidWZfbGVuOyBtX3BvcysrKSB7XG4gICAgICAgIGMgPSBzdHIuY2hhckNvZGVBdChtX3Bvcyk7XG4gICAgICAgIGlmICgoYyAmIDB4ZmMwMCkgPT09IDB4ZDgwMCAmJiAobV9wb3MrMSA8IHN0cl9sZW4pKSB7XG4gICAgICAgICAgICBjMiA9IHN0ci5jaGFyQ29kZUF0KG1fcG9zKzEpO1xuICAgICAgICAgICAgaWYgKChjMiAmIDB4ZmMwMCkgPT09IDB4ZGMwMCkge1xuICAgICAgICAgICAgICAgIGMgPSAweDEwMDAwICsgKChjIC0gMHhkODAwKSA8PCAxMCkgKyAoYzIgLSAweGRjMDApO1xuICAgICAgICAgICAgICAgIG1fcG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMgPCAweDgwKSB7XG4gICAgICAgICAgICAvKiBvbmUgYnl0ZSAqL1xuICAgICAgICAgICAgYnVmW2krK10gPSBjO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPCAweDgwMCkge1xuICAgICAgICAgICAgLyogdHdvIGJ5dGVzICovXG4gICAgICAgICAgICBidWZbaSsrXSA9IDB4QzAgfCAoYyA+Pj4gNik7XG4gICAgICAgICAgICBidWZbaSsrXSA9IDB4ODAgfCAoYyAmIDB4M2YpO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPCAweDEwMDAwKSB7XG4gICAgICAgICAgICAvKiB0aHJlZSBieXRlcyAqL1xuICAgICAgICAgICAgYnVmW2krK10gPSAweEUwIHwgKGMgPj4+IDEyKTtcbiAgICAgICAgICAgIGJ1ZltpKytdID0gMHg4MCB8IChjID4+PiA2ICYgMHgzZik7XG4gICAgICAgICAgICBidWZbaSsrXSA9IDB4ODAgfCAoYyAmIDB4M2YpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyogZm91ciBieXRlcyAqL1xuICAgICAgICAgICAgYnVmW2krK10gPSAweGYwIHwgKGMgPj4+IDE4KTtcbiAgICAgICAgICAgIGJ1ZltpKytdID0gMHg4MCB8IChjID4+PiAxMiAmIDB4M2YpO1xuICAgICAgICAgICAgYnVmW2krK10gPSAweDgwIHwgKGMgPj4+IDYgJiAweDNmKTtcbiAgICAgICAgICAgIGJ1ZltpKytdID0gMHg4MCB8IChjICYgMHgzZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xufTtcblxuLy8gQ2FsY3VsYXRlIG1heCBwb3NzaWJsZSBwb3NpdGlvbiBpbiB1dGY4IGJ1ZmZlcixcbi8vIHRoYXQgd2lsbCBub3QgYnJlYWsgc2VxdWVuY2UuIElmIHRoYXQncyBub3QgcG9zc2libGVcbi8vIC0gKHZlcnkgc21hbGwgbGltaXRzKSByZXR1cm4gbWF4IHNpemUgYXMgaXMuXG4vL1xuLy8gYnVmW10gLSB1dGY4IGJ5dGVzIGFycmF5XG4vLyBtYXggICAtIGxlbmd0aCBsaW1pdCAobWFuZGF0b3J5KTtcbnZhciB1dGY4Ym9yZGVyID0gZnVuY3Rpb24oYnVmLCBtYXgpIHtcbiAgICB2YXIgcG9zO1xuXG4gICAgbWF4ID0gbWF4IHx8IGJ1Zi5sZW5ndGg7XG4gICAgaWYgKG1heCA+IGJ1Zi5sZW5ndGgpIHsgbWF4ID0gYnVmLmxlbmd0aDsgfVxuXG4gICAgLy8gZ28gYmFjayBmcm9tIGxhc3QgcG9zaXRpb24sIHVudGlsIHN0YXJ0IG9mIHNlcXVlbmNlIGZvdW5kXG4gICAgcG9zID0gbWF4LTE7XG4gICAgd2hpbGUgKHBvcyA+PSAwICYmIChidWZbcG9zXSAmIDB4QzApID09PSAweDgwKSB7IHBvcy0tOyB9XG5cbiAgICAvLyBGdWNrdXAgLSB2ZXJ5IHNtYWxsIGFuZCBicm9rZW4gc2VxdWVuY2UsXG4gICAgLy8gcmV0dXJuIG1heCwgYmVjYXVzZSB3ZSBzaG91bGQgcmV0dXJuIHNvbWV0aGluZyBhbnl3YXkuXG4gICAgaWYgKHBvcyA8IDApIHsgcmV0dXJuIG1heDsgfVxuXG4gICAgLy8gSWYgd2UgY2FtZSB0byBzdGFydCBvZiBidWZmZXIgLSB0aGF0IG1lYW5zIHZ1ZmZlciBpcyB0b28gc21hbGwsXG4gICAgLy8gcmV0dXJuIG1heCB0b28uXG4gICAgaWYgKHBvcyA9PT0gMCkgeyByZXR1cm4gbWF4OyB9XG5cbiAgICByZXR1cm4gKHBvcyArIF91dGY4bGVuW2J1Zltwb3NdXSA+IG1heCkgPyBwb3MgOiBtYXg7XG59O1xuXG4vLyBjb252ZXJ0IGFycmF5IHRvIHN0cmluZ1xudmFyIGJ1ZjJzdHJpbmcgPSBmdW5jdGlvbiAoYnVmKSB7XG4gICAgdmFyIHN0ciwgaSwgb3V0LCBjLCBjX2xlbjtcbiAgICB2YXIgbGVuID0gYnVmLmxlbmd0aDtcblxuICAgIC8vIFJlc2VydmUgbWF4IHBvc3NpYmxlIGxlbmd0aCAoMiB3b3JkcyBwZXIgY2hhcilcbiAgICAvLyBOQjogYnkgdW5rbm93biByZWFzb25zLCBBcnJheSBpcyBzaWduaWZpY2FudGx5IGZhc3RlciBmb3JcbiAgICAvLyAgICAgU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSB0aGFuIFVpbnQxNkFycmF5LlxuICAgIHZhciB1dGYxNmJ1ZiA9IG5ldyBBcnJheShsZW4qMik7XG5cbiAgICBmb3IgKG91dD0wLCBpPTA7IGk8bGVuOykge1xuICAgICAgICBjID0gYnVmW2krK107XG4gICAgICAgIC8vIHF1aWNrIHByb2Nlc3MgYXNjaWlcbiAgICAgICAgaWYgKGMgPCAweDgwKSB7IHV0ZjE2YnVmW291dCsrXSA9IGM7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgY19sZW4gPSBfdXRmOGxlbltjXTtcbiAgICAgICAgLy8gc2tpcCA1ICYgNiBieXRlIGNvZGVzXG4gICAgICAgIGlmIChjX2xlbiA+IDQpIHsgdXRmMTZidWZbb3V0KytdID0gMHhmZmZkOyBpICs9IGNfbGVuLTE7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgLy8gYXBwbHkgbWFzayBvbiBmaXJzdCBieXRlXG4gICAgICAgIGMgJj0gY19sZW4gPT09IDIgPyAweDFmIDogY19sZW4gPT09IDMgPyAweDBmIDogMHgwNztcbiAgICAgICAgLy8gam9pbiB0aGUgcmVzdFxuICAgICAgICB3aGlsZSAoY19sZW4gPiAxICYmIGkgPCBsZW4pIHtcbiAgICAgICAgICAgIGMgPSAoYyA8PCA2KSB8IChidWZbaSsrXSAmIDB4M2YpO1xuICAgICAgICAgICAgY19sZW4tLTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRlcm1pbmF0ZWQgYnkgZW5kIG9mIHN0cmluZz9cbiAgICAgICAgaWYgKGNfbGVuID4gMSkgeyB1dGYxNmJ1ZltvdXQrK10gPSAweGZmZmQ7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgaWYgKGMgPCAweDEwMDAwKSB7XG4gICAgICAgICAgICB1dGYxNmJ1ZltvdXQrK10gPSBjO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYyAtPSAweDEwMDAwO1xuICAgICAgICAgICAgdXRmMTZidWZbb3V0KytdID0gMHhkODAwIHwgKChjID4+IDEwKSAmIDB4M2ZmKTtcbiAgICAgICAgICAgIHV0ZjE2YnVmW291dCsrXSA9IDB4ZGMwMCB8IChjICYgMHgzZmYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2hyaW5rQnVmKHV0ZjE2YnVmLCBvdXQpXG4gICAgaWYgKHV0ZjE2YnVmLmxlbmd0aCAhPT0gb3V0KSB7XG4gICAgICAgIGlmKHV0ZjE2YnVmLnN1YmFycmF5KSB7XG4gICAgICAgICAgICB1dGYxNmJ1ZiA9IHV0ZjE2YnVmLnN1YmFycmF5KDAsIG91dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1dGYxNmJ1Zi5sZW5ndGggPSBvdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB1dGYxNmJ1Zik7XG4gICAgcmV0dXJuIHV0aWxzLmFwcGx5RnJvbUNoYXJDb2RlKHV0ZjE2YnVmKTtcbn07XG5cblxuLy8gVGhhdCdzIGFsbCBmb3IgdGhlIHBha28gZnVuY3Rpb25zLlxuXG5cbi8qKlxuICogVHJhbnNmb3JtIGEgamF2YXNjcmlwdCBzdHJpbmcgaW50byBhbiBhcnJheSAodHlwZWQgaWYgcG9zc2libGUpIG9mIGJ5dGVzLFxuICogVVRGLTggZW5jb2RlZC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgdGhlIHN0cmluZyB0byBlbmNvZGVcbiAqIEByZXR1cm4ge0FycmF5fFVpbnQ4QXJyYXl8QnVmZmVyfSB0aGUgVVRGLTggZW5jb2RlZCBzdHJpbmcuXG4gKi9cbmV4cG9ydHMudXRmOGVuY29kZSA9IGZ1bmN0aW9uIHV0ZjhlbmNvZGUoc3RyKSB7XG4gICAgLy8gVGV4dEVuY29kZXIgKyBVaW50OEFycmF5IHRvIGJpbmFyeSBzdHJpbmcgaXMgZmFzdGVyIHRoYW4gY2hlY2tpbmcgZXZlcnkgYnl0ZXMgb24gbG9uZyBzdHJpbmdzLlxuICAgIC8vIGh0dHA6Ly9qc3BlcmYuY29tL3V0ZjhlbmNvZGUtdnMtdGV4dGVuY29kZXJcbiAgICAvLyBPbiBzaG9ydCBzdHJpbmdzIChmaWxlIG5hbWVzIGZvciBleGFtcGxlKSwgdGhlIFRleHRFbmNvZGVyIEFQSSBpcyAoY3VycmVudGx5KSBzbG93ZXIuXG4gICAgaWYgKHRleHRFbmNvZGVyKSB7XG4gICAgICAgIHJldHVybiB0ZXh0RW5jb2Rlci5lbmNvZGUoc3RyKTtcbiAgICB9XG4gICAgaWYgKHN1cHBvcnQubm9kZWJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gbm9kZUJ1ZmZlcihzdHIsIFwidXRmLThcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZzJidWYoc3RyKTtcbn07XG5cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYSBieXRlcyBhcnJheSAob3IgYSByZXByZXNlbnRhdGlvbikgcmVwcmVzZW50aW5nIGFuIFVURi04IGVuY29kZWRcbiAqIHN0cmluZyBpbnRvIGEgamF2YXNjcmlwdCBzdHJpbmcuXG4gKiBAcGFyYW0ge0FycmF5fFVpbnQ4QXJyYXl8QnVmZmVyfSBidWYgdGhlIGRhdGEgZGUgZGVjb2RlXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBkZWNvZGVkIHN0cmluZy5cbiAqL1xuZXhwb3J0cy51dGY4ZGVjb2RlID0gZnVuY3Rpb24gdXRmOGRlY29kZShidWYpIHtcbiAgICAvLyBjaGVjayBpZiB3ZSBjYW4gdXNlIHRoZSBUZXh0RGVjb2RlciBBUElcbiAgICAvLyBzZWUgaHR0cDovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jYXBpXG4gICAgaWYgKHRleHREZWNvZGVyKSB7XG4gICAgICAgIHJldHVybiB0ZXh0RGVjb2Rlci5kZWNvZGUoXG4gICAgICAgICAgICB1dGlscy50cmFuc2Zvcm1UbyhcInVpbnQ4YXJyYXlcIiwgYnVmKVxuICAgICAgICApO1xuICAgIH1cbiAgICBpZiAoc3VwcG9ydC5ub2RlYnVmZmVyKSB7XG4gICAgICAgIHJldHVybiB1dGlscy50cmFuc2Zvcm1UbyhcIm5vZGVidWZmZXJcIiwgYnVmKS50b1N0cmluZyhcInV0Zi04XCIpO1xuICAgIH1cblxuICAgIGJ1ZiA9IHV0aWxzLnRyYW5zZm9ybVRvKHN1cHBvcnQudWludDhhcnJheSA/IFwidWludDhhcnJheVwiIDogXCJhcnJheVwiLCBidWYpO1xuXG4gICAgLy8gcmV0dXJuIGJ1ZjJzdHJpbmcoYnVmKTtcbiAgICAvLyBDaHJvbWUgcHJlZmVycyB0byB3b3JrIHdpdGggXCJzbWFsbFwiIGNodW5rcyBvZiBkYXRhXG4gICAgLy8gZm9yIHRoZSBtZXRob2QgYnVmMnN0cmluZy5cbiAgICAvLyBGaXJlZm94IGFuZCBDaHJvbWUgaGFzIHRoZWlyIG93biBzaG9ydGN1dCwgSUUgZG9lc24ndCBzZWVtIHRvIHJlYWxseSBjYXJlLlxuICAgIHZhciByZXN1bHQgPSBbXSwgayA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGgsIGNodW5rID0gNjU1MzY7XG4gICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgICAgdmFyIG5leHRCb3VuZGFyeSA9IHV0Zjhib3JkZXIoYnVmLCBNYXRoLm1pbihrICsgY2h1bmssIGxlbikpO1xuICAgICAgICBpZiAoc3VwcG9ydC51aW50OGFycmF5KSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChidWYyc3RyaW5nKGJ1Zi5zdWJhcnJheShrLCBuZXh0Qm91bmRhcnkpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChidWYyc3RyaW5nKGJ1Zi5zbGljZShrLCBuZXh0Qm91bmRhcnkpKSk7XG4gICAgICAgIH1cbiAgICAgICAgayA9IG5leHRCb3VuZGFyeTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKFwiXCIpO1xuXG59O1xuLy8gdmltOiBzZXQgc2hpZnR3aWR0aD00IHNvZnR0YWJzdG9wPTQ6XG4iLCIndXNlIHN0cmljdCc7XG52YXIgc3VwcG9ydCA9IHJlcXVpcmUoJy4vc3VwcG9ydCcpO1xudmFyIGNvbXByZXNzaW9ucyA9IHJlcXVpcmUoJy4vY29tcHJlc3Npb25zJyk7XG52YXIgbm9kZUJ1ZmZlciA9IHJlcXVpcmUoJy4vbm9kZUJ1ZmZlcicpO1xuLyoqXG4gKiBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgXCJiaW5hcnkgc3RyaW5nXCIgOiBhIHN0cmluZyBjb250YWluaW5nIG9ubHkgY2hhciBjb2RlcyBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgdGhlIHN0cmluZyB0byB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBiaW5hcnkgc3RyaW5nLlxuICovXG5leHBvcnRzLnN0cmluZzJiaW5hcnkgPSBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShzdHIuY2hhckNvZGVBdChpKSAmIDB4ZmYpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbmV4cG9ydHMuYXJyYXlCdWZmZXIyQmxvYiA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgIGV4cG9ydHMuY2hlY2tTdXBwb3J0KFwiYmxvYlwiKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIEJsb2IgY29uc3RydWN0b3JcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKFtidWZmZXJdLCB7XG4gICAgICAgICAgICB0eXBlOiBcImFwcGxpY2F0aW9uL3ppcFwiXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBkZXByZWNhdGVkLCBicm93c2VyIG9ubHksIG9sZCB3YXlcbiAgICAgICAgICAgIHZhciBCdWlsZGVyID0gd2luZG93LkJsb2JCdWlsZGVyIHx8IHdpbmRvdy5XZWJLaXRCbG9iQnVpbGRlciB8fCB3aW5kb3cuTW96QmxvYkJ1aWxkZXIgfHwgd2luZG93Lk1TQmxvYkJ1aWxkZXI7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gICAgICAgICAgICBidWlsZGVyLmFwcGVuZChidWZmZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0QmxvYignYXBwbGljYXRpb24vemlwJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcblxuICAgICAgICAgICAgLy8gd2VsbCwgZnVjayA/IVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnVnIDogY2FuJ3QgY29uc3RydWN0IHRoZSBCbG9iLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59O1xuLyoqXG4gKiBUaGUgaWRlbnRpdHkgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXQgdGhlIGlucHV0LlxuICogQHJldHVybiB7T2JqZWN0fSB0aGUgc2FtZSBpbnB1dC5cbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXQ7XG59XG5cbi8qKlxuICogRmlsbCBpbiBhbiBhcnJheSB3aXRoIGEgc3RyaW5nLlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciB0aGUgc3RyaW5nIHRvIHVzZS5cbiAqIEBwYXJhbSB7QXJyYXl8QXJyYXlCdWZmZXJ8VWludDhBcnJheXxCdWZmZXJ9IGFycmF5IHRoZSBhcnJheSB0byBmaWxsIGluICh3aWxsIGJlIG11dGF0ZWQpLlxuICogQHJldHVybiB7QXJyYXl8QXJyYXlCdWZmZXJ8VWludDhBcnJheXxCdWZmZXJ9IHRoZSB1cGRhdGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBzdHJpbmdUb0FycmF5TGlrZShzdHIsIGFycmF5KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgYXJyYXlbaV0gPSBzdHIuY2hhckNvZGVBdChpKSAmIDB4RkY7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYW4gYXJyYXktbGlrZSBvYmplY3QgdG8gYSBzdHJpbmcuXG4gKiBAcGFyYW0ge0FycmF5fEFycmF5QnVmZmVyfFVpbnQ4QXJyYXl8QnVmZmVyfSBhcnJheSB0aGUgYXJyYXkgdG8gdHJhbnNmb3JtLlxuICogQHJldHVybiB7U3RyaW5nfSB0aGUgcmVzdWx0LlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VUb1N0cmluZyhhcnJheSkge1xuICAgIC8vIFBlcmZvcm1hbmNlcyBub3RlcyA6XG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGFycmF5KSBpcyB0aGUgZmFzdGVzdCwgc2VlXG4gICAgLy8gc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2NvbnZlcnRpbmctYS11aW50OGFycmF5LXRvLWEtc3RyaW5nLzJcbiAgICAvLyBidXQgdGhlIHN0YWNrIGlzIGxpbWl0ZWQgKGFuZCB3ZSBjYW4gZ2V0IGh1Z2UgYXJyYXlzICEpLlxuICAgIC8vXG4gICAgLy8gcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyYXlbaV0pOyBnZW5lcmF0ZSB0b28gbWFueSBzdHJpbmdzICFcbiAgICAvL1xuICAgIC8vIFRoaXMgY29kZSBpcyBpbnNwaXJlZCBieSBodHRwOi8vanNwZXJmLmNvbS9hcnJheWJ1ZmZlci10by1zdHJpbmctYXBwbHktcGVyZm9ybWFuY2UvMlxuICAgIHZhciBjaHVuayA9IDY1NTM2O1xuICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgbGVuID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICB0eXBlID0gZXhwb3J0cy5nZXRUeXBlT2YoYXJyYXkpLFxuICAgICAgICBrID0gMCxcbiAgICAgICAgY2FuVXNlQXBwbHkgPSB0cnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidWludDhhcnJheVwiOlxuICAgICAgICAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheSgwKSk7XG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJub2RlYnVmZmVyXCI6XG4gICAgICAgICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5vZGVCdWZmZXIoMCkpO1xuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICB9XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgIGNhblVzZUFwcGx5ID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIG5vIGFwcGx5IDogc2xvdyBhbmQgcGFpbmZ1bCBhbGdvcml0aG1cbiAgICAgIC8vIGRlZmF1bHQgYnJvd3NlciBvbiBhbmRyb2lkIDQuKlxuICAgICAgaWYgKCFjYW5Vc2VBcHBseSkge1xuICAgICAgICAgdmFyIHJlc3VsdFN0ciA9IFwiXCI7XG4gICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgcmVzdWx0U3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyYXlbaV0pO1xuICAgICAgICAgfVxuICAgIHJldHVybiByZXN1bHRTdHI7XG4gICAgfVxuICAgIHdoaWxlIChrIDwgbGVuICYmIGNodW5rID4gMSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwiYXJyYXlcIiB8fCB0eXBlID09PSBcIm5vZGVidWZmZXJcIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgYXJyYXkuc2xpY2UoaywgTWF0aC5taW4oayArIGNodW5rLCBsZW4pKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBhcnJheS5zdWJhcnJheShrLCBNYXRoLm1pbihrICsgY2h1bmssIGxlbikpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrICs9IGNodW5rO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjaHVuayA9IE1hdGguZmxvb3IoY2h1bmsgLyAyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LmpvaW4oXCJcIik7XG59XG5cbmV4cG9ydHMuYXBwbHlGcm9tQ2hhckNvZGUgPSBhcnJheUxpa2VUb1N0cmluZztcblxuXG4vKipcbiAqIENvcHkgdGhlIGRhdGEgZnJvbSBhbiBhcnJheS1saWtlIHRvIGFuIG90aGVyIGFycmF5LWxpa2UuXG4gKiBAcGFyYW0ge0FycmF5fEFycmF5QnVmZmVyfFVpbnQ4QXJyYXl8QnVmZmVyfSBhcnJheUZyb20gdGhlIG9yaWdpbiBhcnJheS5cbiAqIEBwYXJhbSB7QXJyYXl8QXJyYXlCdWZmZXJ8VWludDhBcnJheXxCdWZmZXJ9IGFycmF5VG8gdGhlIGRlc3RpbmF0aW9uIGFycmF5IHdoaWNoIHdpbGwgYmUgbXV0YXRlZC5cbiAqIEByZXR1cm4ge0FycmF5fEFycmF5QnVmZmVyfFVpbnQ4QXJyYXl8QnVmZmVyfSB0aGUgdXBkYXRlZCBkZXN0aW5hdGlvbiBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlVG9BcnJheUxpa2UoYXJyYXlGcm9tLCBhcnJheVRvKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheUZyb20ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXlUb1tpXSA9IGFycmF5RnJvbVtpXTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5VG87XG59XG5cbi8vIGEgbWF0cml4IGNvbnRhaW5pbmcgZnVuY3Rpb25zIHRvIHRyYW5zZm9ybSBldmVyeXRoaW5nIGludG8gZXZlcnl0aGluZy5cbnZhciB0cmFuc2Zvcm0gPSB7fTtcblxuLy8gc3RyaW5nIHRvID9cbnRyYW5zZm9ybVtcInN0cmluZ1wiXSA9IHtcbiAgICBcInN0cmluZ1wiOiBpZGVudGl0eSxcbiAgICBcImFycmF5XCI6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdUb0FycmF5TGlrZShpbnB1dCwgbmV3IEFycmF5KGlucHV0Lmxlbmd0aCkpO1xuICAgIH0sXG4gICAgXCJhcnJheWJ1ZmZlclwiOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtW1wic3RyaW5nXCJdW1widWludDhhcnJheVwiXShpbnB1dCkuYnVmZmVyO1xuICAgIH0sXG4gICAgXCJ1aW50OGFycmF5XCI6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdUb0FycmF5TGlrZShpbnB1dCwgbmV3IFVpbnQ4QXJyYXkoaW5wdXQubGVuZ3RoKSk7XG4gICAgfSxcbiAgICBcIm5vZGVidWZmZXJcIjogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZ1RvQXJyYXlMaWtlKGlucHV0LCBub2RlQnVmZmVyKGlucHV0Lmxlbmd0aCkpO1xuICAgIH1cbn07XG5cbi8vIGFycmF5IHRvID9cbnRyYW5zZm9ybVtcImFycmF5XCJdID0ge1xuICAgIFwic3RyaW5nXCI6IGFycmF5TGlrZVRvU3RyaW5nLFxuICAgIFwiYXJyYXlcIjogaWRlbnRpdHksXG4gICAgXCJhcnJheWJ1ZmZlclwiOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gKG5ldyBVaW50OEFycmF5KGlucHV0KSkuYnVmZmVyO1xuICAgIH0sXG4gICAgXCJ1aW50OGFycmF5XCI6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShpbnB1dCk7XG4gICAgfSxcbiAgICBcIm5vZGVidWZmZXJcIjogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVCdWZmZXIoaW5wdXQpO1xuICAgIH1cbn07XG5cbi8vIGFycmF5YnVmZmVyIHRvID9cbnRyYW5zZm9ybVtcImFycmF5YnVmZmVyXCJdID0ge1xuICAgIFwic3RyaW5nXCI6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBhcnJheUxpa2VUb1N0cmluZyhuZXcgVWludDhBcnJheShpbnB1dCkpO1xuICAgIH0sXG4gICAgXCJhcnJheVwiOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gYXJyYXlMaWtlVG9BcnJheUxpa2UobmV3IFVpbnQ4QXJyYXkoaW5wdXQpLCBuZXcgQXJyYXkoaW5wdXQuYnl0ZUxlbmd0aCkpO1xuICAgIH0sXG4gICAgXCJhcnJheWJ1ZmZlclwiOiBpZGVudGl0eSxcbiAgICBcInVpbnQ4YXJyYXlcIjogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGlucHV0KTtcbiAgICB9LFxuICAgIFwibm9kZWJ1ZmZlclwiOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gbm9kZUJ1ZmZlcihuZXcgVWludDhBcnJheShpbnB1dCkpO1xuICAgIH1cbn07XG5cbi8vIHVpbnQ4YXJyYXkgdG8gP1xudHJhbnNmb3JtW1widWludDhhcnJheVwiXSA9IHtcbiAgICBcInN0cmluZ1wiOiBhcnJheUxpa2VUb1N0cmluZyxcbiAgICBcImFycmF5XCI6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBhcnJheUxpa2VUb0FycmF5TGlrZShpbnB1dCwgbmV3IEFycmF5KGlucHV0Lmxlbmd0aCkpO1xuICAgIH0sXG4gICAgXCJhcnJheWJ1ZmZlclwiOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gaW5wdXQuYnVmZmVyO1xuICAgIH0sXG4gICAgXCJ1aW50OGFycmF5XCI6IGlkZW50aXR5LFxuICAgIFwibm9kZWJ1ZmZlclwiOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gbm9kZUJ1ZmZlcihpbnB1dCk7XG4gICAgfVxufTtcblxuLy8gbm9kZWJ1ZmZlciB0byA/XG50cmFuc2Zvcm1bXCJub2RlYnVmZmVyXCJdID0ge1xuICAgIFwic3RyaW5nXCI6IGFycmF5TGlrZVRvU3RyaW5nLFxuICAgIFwiYXJyYXlcIjogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5TGlrZVRvQXJyYXlMaWtlKGlucHV0LCBuZXcgQXJyYXkoaW5wdXQubGVuZ3RoKSk7XG4gICAgfSxcbiAgICBcImFycmF5YnVmZmVyXCI6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1bXCJub2RlYnVmZmVyXCJdW1widWludDhhcnJheVwiXShpbnB1dCkuYnVmZmVyO1xuICAgIH0sXG4gICAgXCJ1aW50OGFycmF5XCI6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBhcnJheUxpa2VUb0FycmF5TGlrZShpbnB1dCwgbmV3IFVpbnQ4QXJyYXkoaW5wdXQubGVuZ3RoKSk7XG4gICAgfSxcbiAgICBcIm5vZGVidWZmZXJcIjogaWRlbnRpdHlcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGlucHV0IGludG8gYW55IHR5cGUuXG4gKiBUaGUgc3VwcG9ydGVkIG91dHB1dCB0eXBlIGFyZSA6IHN0cmluZywgYXJyYXksIHVpbnQ4YXJyYXksIGFycmF5YnVmZmVyLCBub2RlYnVmZmVyLlxuICogSWYgbm8gb3V0cHV0IHR5cGUgaXMgc3BlY2lmaWVkLCB0aGUgdW5tb2RpZmllZCBpbnB1dCB3aWxsIGJlIHJldHVybmVkLlxuICogQHBhcmFtIHtTdHJpbmd9IG91dHB1dFR5cGUgdGhlIG91dHB1dCB0eXBlLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl8QXJyYXlCdWZmZXJ8VWludDhBcnJheXxCdWZmZXJ9IGlucHV0IHRoZSBpbnB1dCB0byBjb252ZXJ0LlxuICogQHRocm93cyB7RXJyb3J9IGFuIEVycm9yIGlmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGUgcmVxdWVzdGVkIG91dHB1dCB0eXBlLlxuICovXG5leHBvcnRzLnRyYW5zZm9ybVRvID0gZnVuY3Rpb24ob3V0cHV0VHlwZSwgaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgIC8vIHVuZGVmaW5lZCwgbnVsbCwgZXRjXG4gICAgICAgIC8vIGFuIGVtcHR5IHN0cmluZyB3b24ndCBoYXJtLlxuICAgICAgICBpbnB1dCA9IFwiXCI7XG4gICAgfVxuICAgIGlmICghb3V0cHV0VHlwZSkge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuICAgIGV4cG9ydHMuY2hlY2tTdXBwb3J0KG91dHB1dFR5cGUpO1xuICAgIHZhciBpbnB1dFR5cGUgPSBleHBvcnRzLmdldFR5cGVPZihpbnB1dCk7XG4gICAgdmFyIHJlc3VsdCA9IHRyYW5zZm9ybVtpbnB1dFR5cGVdW291dHB1dFR5cGVdKGlucHV0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgdGhlIGlucHV0LlxuICogVGhlIHR5cGUgd2lsbCBiZSBpbiBhIGZvcm1hdCB2YWxpZCBmb3IgSlNaaXAudXRpbHMudHJhbnNmb3JtVG8gOiBzdHJpbmcsIGFycmF5LCB1aW50OGFycmF5LCBhcnJheWJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dCB0aGUgaW5wdXQgdG8gaWRlbnRpZnkuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSAobG93ZXJjYXNlKSB0eXBlIG9mIHRoZSBpbnB1dC5cbiAqL1xuZXhwb3J0cy5nZXRUeXBlT2YgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIFwic3RyaW5nXCI7XG4gICAgfVxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaW5wdXQpID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiYXJyYXlcIjtcbiAgICB9XG4gICAgaWYgKHN1cHBvcnQubm9kZWJ1ZmZlciAmJiBub2RlQnVmZmVyLnRlc3QoaW5wdXQpKSB7XG4gICAgICAgIHJldHVybiBcIm5vZGVidWZmZXJcIjtcbiAgICB9XG4gICAgaWYgKHN1cHBvcnQudWludDhhcnJheSAmJiBpbnB1dCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFwidWludDhhcnJheVwiO1xuICAgIH1cbiAgICBpZiAoc3VwcG9ydC5hcnJheWJ1ZmZlciAmJiBpbnB1dCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBcImFycmF5YnVmZmVyXCI7XG4gICAgfVxufTtcblxuLyoqXG4gKiBUaHJvdyBhbiBleGNlcHRpb24gaWYgdGhlIHR5cGUgaXMgbm90IHN1cHBvcnRlZC5cbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIHRoZSB0eXBlIHRvIGNoZWNrLlxuICogQHRocm93cyB7RXJyb3J9IGFuIEVycm9yIGlmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGUgcmVxdWVzdGVkIHR5cGUuXG4gKi9cbmV4cG9ydHMuY2hlY2tTdXBwb3J0ID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciBzdXBwb3J0ZWQgPSBzdXBwb3J0W3R5cGUudG9Mb3dlckNhc2UoKV07XG4gICAgaWYgKCFzdXBwb3J0ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHR5cGUgKyBcIiBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3NlclwiKTtcbiAgICB9XG59O1xuZXhwb3J0cy5NQVhfVkFMVUVfMTZCSVRTID0gNjU1MzU7XG5leHBvcnRzLk1BWF9WQUxVRV8zMkJJVFMgPSAtMTsgLy8gd2VsbCwgXCJcXHhGRlxceEZGXFx4RkZcXHhGRlxceEZGXFx4RkZcXHhGRlxceEZGXCIgaXMgcGFyc2VkIGFzIC0xXG5cbi8qKlxuICogUHJldHRpZnkgYSBzdHJpbmcgcmVhZCBhcyBiaW5hcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIHRoZSBzdHJpbmcgdG8gcHJldHRpZnkuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGEgcHJldHR5IHN0cmluZy5cbiAqL1xuZXhwb3J0cy5wcmV0dHkgPSBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgcmVzID0gJycsXG4gICAgICAgIGNvZGUsIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IChzdHIgfHwgXCJcIikubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29kZSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICByZXMgKz0gJ1xcXFx4JyArIChjb2RlIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgY29kZS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogRmluZCBhIGNvbXByZXNzaW9uIHJlZ2lzdGVyZWQgaW4gSlNaaXAuXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tcHJlc3Npb25NZXRob2QgdGhlIG1ldGhvZCBtYWdpYyB0byBmaW5kLlxuICogQHJldHVybiB7T2JqZWN0fG51bGx9IHRoZSBKU1ppcCBjb21wcmVzc2lvbiBvYmplY3QsIG51bGwgaWYgbm9uZSBmb3VuZC5cbiAqL1xuZXhwb3J0cy5maW5kQ29tcHJlc3Npb24gPSBmdW5jdGlvbihjb21wcmVzc2lvbk1ldGhvZCkge1xuICAgIGZvciAodmFyIG1ldGhvZCBpbiBjb21wcmVzc2lvbnMpIHtcbiAgICAgICAgaWYgKCFjb21wcmVzc2lvbnMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbXByZXNzaW9uc1ttZXRob2RdLm1hZ2ljID09PSBjb21wcmVzc2lvbk1ldGhvZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXByZXNzaW9uc1ttZXRob2RdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcbi8qKlxuKiBDcm9zcy13aW5kb3csIGNyb3NzLU5vZGUtY29udGV4dCByZWd1bGFyIGV4cHJlc3Npb24gZGV0ZWN0aW9uXG4qIEBwYXJhbSAge09iamVjdH0gIG9iamVjdCBBbnl0aGluZ1xuKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgdHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIGEgcmVndWxhciBleHByZXNzaW9uLFxuKiBmYWxzZSBvdGhlcndpc2VcbiovXG5leHBvcnRzLmlzUmVnRXhwID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IFJlZ0V4cF1cIjtcbn07XG5cbiIsIid1c2Ugc3RyaWN0JztcbnZhciBTdHJpbmdSZWFkZXIgPSByZXF1aXJlKCcuL3N0cmluZ1JlYWRlcicpO1xudmFyIE5vZGVCdWZmZXJSZWFkZXIgPSByZXF1aXJlKCcuL25vZGVCdWZmZXJSZWFkZXInKTtcbnZhciBVaW50OEFycmF5UmVhZGVyID0gcmVxdWlyZSgnLi91aW50OEFycmF5UmVhZGVyJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgc2lnID0gcmVxdWlyZSgnLi9zaWduYXR1cmUnKTtcbnZhciBaaXBFbnRyeSA9IHJlcXVpcmUoJy4vemlwRW50cnknKTtcbnZhciBzdXBwb3J0ID0gcmVxdWlyZSgnLi9zdXBwb3J0Jyk7XG52YXIganN6aXBQcm90byA9IHJlcXVpcmUoJy4vb2JqZWN0Jyk7XG4vLyAgY2xhc3MgWmlwRW50cmllcyB7e3tcbi8qKlxuICogQWxsIHRoZSBlbnRyaWVzIGluIHRoZSB6aXAgZmlsZS5cbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXlCdWZmZXJ8VWludDhBcnJheX0gZGF0YSB0aGUgYmluYXJ5IHN0cmVhbSB0byBsb2FkLlxuICogQHBhcmFtIHtPYmplY3R9IGxvYWRPcHRpb25zIE9wdGlvbnMgZm9yIGxvYWRpbmcgdGhlIHN0cmVhbS5cbiAqL1xuZnVuY3Rpb24gWmlwRW50cmllcyhkYXRhLCBsb2FkT3B0aW9ucykge1xuICAgIHRoaXMuZmlsZXMgPSBbXTtcbiAgICB0aGlzLmxvYWRPcHRpb25zID0gbG9hZE9wdGlvbnM7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgICAgdGhpcy5sb2FkKGRhdGEpO1xuICAgIH1cbn1cblppcEVudHJpZXMucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIENoZWNrIHRoYXQgdGhlIHJlYWRlciBpcyBvbiB0aGUgc3BlZmljaWVkIHNpZ25hdHVyZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwZWN0ZWRTaWduYXR1cmUgdGhlIGV4cGVjdGVkIHNpZ25hdHVyZS5cbiAgICAgKiBAdGhyb3dzIHtFcnJvcn0gaWYgaXQgaXMgYW4gb3RoZXIgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIGNoZWNrU2lnbmF0dXJlOiBmdW5jdGlvbihleHBlY3RlZFNpZ25hdHVyZSkge1xuICAgICAgICB2YXIgc2lnbmF0dXJlID0gdGhpcy5yZWFkZXIucmVhZFN0cmluZyg0KTtcbiAgICAgICAgaWYgKHNpZ25hdHVyZSAhPT0gZXhwZWN0ZWRTaWduYXR1cmUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvcnJ1cHRlZCB6aXAgb3IgYnVnIDogdW5leHBlY3RlZCBzaWduYXR1cmUgXCIgKyBcIihcIiArIHV0aWxzLnByZXR0eShzaWduYXR1cmUpICsgXCIsIGV4cGVjdGVkIFwiICsgdXRpbHMucHJldHR5KGV4cGVjdGVkU2lnbmF0dXJlKSArIFwiKVwiKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVhZCB0aGUgZW5kIG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeS5cbiAgICAgKi9cbiAgICByZWFkQmxvY2tFbmRPZkNlbnRyYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRpc2tOdW1iZXIgPSB0aGlzLnJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICB0aGlzLmRpc2tXaXRoQ2VudHJhbERpclN0YXJ0ID0gdGhpcy5yZWFkZXIucmVhZEludCgyKTtcbiAgICAgICAgdGhpcy5jZW50cmFsRGlyUmVjb3Jkc09uVGhpc0Rpc2sgPSB0aGlzLnJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICB0aGlzLmNlbnRyYWxEaXJSZWNvcmRzID0gdGhpcy5yZWFkZXIucmVhZEludCgyKTtcbiAgICAgICAgdGhpcy5jZW50cmFsRGlyU2l6ZSA9IHRoaXMucmVhZGVyLnJlYWRJbnQoNCk7XG4gICAgICAgIHRoaXMuY2VudHJhbERpck9mZnNldCA9IHRoaXMucmVhZGVyLnJlYWRJbnQoNCk7XG5cbiAgICAgICAgdGhpcy56aXBDb21tZW50TGVuZ3RoID0gdGhpcy5yZWFkZXIucmVhZEludCgyKTtcbiAgICAgICAgLy8gd2FybmluZyA6IHRoZSBlbmNvZGluZyBkZXBlbmRzIG9mIHRoZSBzeXN0ZW0gbG9jYWxlXG4gICAgICAgIC8vIE9uIGEgbGludXggbWFjaGluZSB3aXRoIExBTkc9ZW5fVVMudXRmOCwgdGhpcyBmaWVsZCBpcyB1dGY4IGVuY29kZWQuXG4gICAgICAgIC8vIE9uIGEgd2luZG93cyBtYWNoaW5lLCB0aGlzIGZpZWxkIGlzIGVuY29kZWQgd2l0aCB0aGUgbG9jYWxpemVkIHdpbmRvd3MgY29kZSBwYWdlLlxuICAgICAgICB0aGlzLnppcENvbW1lbnQgPSB0aGlzLnJlYWRlci5yZWFkU3RyaW5nKHRoaXMuemlwQ29tbWVudExlbmd0aCk7XG4gICAgICAgIC8vIFRvIGdldCBjb25zaXN0ZW50IGJlaGF2aW9yIHdpdGggdGhlIGdlbmVyYXRpb24gcGFydCwgd2Ugd2lsbCBhc3N1bWUgdGhhdFxuICAgICAgICAvLyB0aGlzIGlzIHV0ZjggZW5jb2RlZC5cbiAgICAgICAgdGhpcy56aXBDb21tZW50ID0ganN6aXBQcm90by51dGY4ZGVjb2RlKHRoaXMuemlwQ29tbWVudCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZWFkIHRoZSBlbmQgb2YgdGhlIFppcCA2NCBjZW50cmFsIGRpcmVjdG9yeS5cbiAgICAgKiBOb3QgbWVyZ2VkIHdpdGggdGhlIG1ldGhvZCByZWFkRW5kT2ZDZW50cmFsIDpcbiAgICAgKiBUaGUgZW5kIG9mIGNlbnRyYWwgY2FuIGNvZXhpc3Qgd2l0aCBpdHMgWmlwNjQgYnJvdGhlcixcbiAgICAgKiBJIGRvbid0IHdhbnQgdG8gcmVhZCB0aGUgd3JvbmcgbnVtYmVyIG9mIGJ5dGVzICFcbiAgICAgKi9cbiAgICByZWFkQmxvY2taaXA2NEVuZE9mQ2VudHJhbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuemlwNjRFbmRPZkNlbnRyYWxTaXplID0gdGhpcy5yZWFkZXIucmVhZEludCg4KTtcbiAgICAgICAgdGhpcy52ZXJzaW9uTWFkZUJ5ID0gdGhpcy5yZWFkZXIucmVhZFN0cmluZygyKTtcbiAgICAgICAgdGhpcy52ZXJzaW9uTmVlZGVkID0gdGhpcy5yZWFkZXIucmVhZEludCgyKTtcbiAgICAgICAgdGhpcy5kaXNrTnVtYmVyID0gdGhpcy5yZWFkZXIucmVhZEludCg0KTtcbiAgICAgICAgdGhpcy5kaXNrV2l0aENlbnRyYWxEaXJTdGFydCA9IHRoaXMucmVhZGVyLnJlYWRJbnQoNCk7XG4gICAgICAgIHRoaXMuY2VudHJhbERpclJlY29yZHNPblRoaXNEaXNrID0gdGhpcy5yZWFkZXIucmVhZEludCg4KTtcbiAgICAgICAgdGhpcy5jZW50cmFsRGlyUmVjb3JkcyA9IHRoaXMucmVhZGVyLnJlYWRJbnQoOCk7XG4gICAgICAgIHRoaXMuY2VudHJhbERpclNpemUgPSB0aGlzLnJlYWRlci5yZWFkSW50KDgpO1xuICAgICAgICB0aGlzLmNlbnRyYWxEaXJPZmZzZXQgPSB0aGlzLnJlYWRlci5yZWFkSW50KDgpO1xuXG4gICAgICAgIHRoaXMuemlwNjRFeHRlbnNpYmxlRGF0YSA9IHt9O1xuICAgICAgICB2YXIgZXh0cmFEYXRhU2l6ZSA9IHRoaXMuemlwNjRFbmRPZkNlbnRyYWxTaXplIC0gNDQsXG4gICAgICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgICAgICBleHRyYUZpZWxkSWQsXG4gICAgICAgICAgICBleHRyYUZpZWxkTGVuZ3RoLFxuICAgICAgICAgICAgZXh0cmFGaWVsZFZhbHVlO1xuICAgICAgICB3aGlsZSAoaW5kZXggPCBleHRyYURhdGFTaXplKSB7XG4gICAgICAgICAgICBleHRyYUZpZWxkSWQgPSB0aGlzLnJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICAgICAgZXh0cmFGaWVsZExlbmd0aCA9IHRoaXMucmVhZGVyLnJlYWRJbnQoNCk7XG4gICAgICAgICAgICBleHRyYUZpZWxkVmFsdWUgPSB0aGlzLnJlYWRlci5yZWFkU3RyaW5nKGV4dHJhRmllbGRMZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy56aXA2NEV4dGVuc2libGVEYXRhW2V4dHJhRmllbGRJZF0gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGV4dHJhRmllbGRJZCxcbiAgICAgICAgICAgICAgICBsZW5ndGg6IGV4dHJhRmllbGRMZW5ndGgsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGV4dHJhRmllbGRWYWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVhZCB0aGUgZW5kIG9mIHRoZSBaaXAgNjQgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvci5cbiAgICAgKi9cbiAgICByZWFkQmxvY2taaXA2NEVuZE9mQ2VudHJhbExvY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRpc2tXaXRoWmlwNjRDZW50cmFsRGlyU3RhcnQgPSB0aGlzLnJlYWRlci5yZWFkSW50KDQpO1xuICAgICAgICB0aGlzLnJlbGF0aXZlT2Zmc2V0RW5kT2ZaaXA2NENlbnRyYWxEaXIgPSB0aGlzLnJlYWRlci5yZWFkSW50KDgpO1xuICAgICAgICB0aGlzLmRpc2tzQ291bnQgPSB0aGlzLnJlYWRlci5yZWFkSW50KDQpO1xuICAgICAgICBpZiAodGhpcy5kaXNrc0NvdW50ID4gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTXVsdGktdm9sdW1lcyB6aXAgYXJlIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlYWQgdGhlIGxvY2FsIGZpbGVzLCBiYXNlZCBvbiB0aGUgb2Zmc2V0IHJlYWQgaW4gdGhlIGNlbnRyYWwgcGFydC5cbiAgICAgKi9cbiAgICByZWFkTG9jYWxGaWxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpLCBmaWxlO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZmlsZSA9IHRoaXMuZmlsZXNbaV07XG4gICAgICAgICAgICB0aGlzLnJlYWRlci5zZXRJbmRleChmaWxlLmxvY2FsSGVhZGVyT2Zmc2V0KTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tTaWduYXR1cmUoc2lnLkxPQ0FMX0ZJTEVfSEVBREVSKTtcbiAgICAgICAgICAgIGZpbGUucmVhZExvY2FsUGFydCh0aGlzLnJlYWRlcik7XG4gICAgICAgICAgICBmaWxlLmhhbmRsZVVURjgoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVhZCB0aGUgY2VudHJhbCBkaXJlY3RvcnkuXG4gICAgICovXG4gICAgcmVhZENlbnRyYWxEaXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsZTtcblxuICAgICAgICB0aGlzLnJlYWRlci5zZXRJbmRleCh0aGlzLmNlbnRyYWxEaXJPZmZzZXQpO1xuICAgICAgICB3aGlsZSAodGhpcy5yZWFkZXIucmVhZFN0cmluZyg0KSA9PT0gc2lnLkNFTlRSQUxfRklMRV9IRUFERVIpIHtcbiAgICAgICAgICAgIGZpbGUgPSBuZXcgWmlwRW50cnkoe1xuICAgICAgICAgICAgICAgIHppcDY0OiB0aGlzLnppcDY0XG4gICAgICAgICAgICB9LCB0aGlzLmxvYWRPcHRpb25zKTtcbiAgICAgICAgICAgIGZpbGUucmVhZENlbnRyYWxQYXJ0KHRoaXMucmVhZGVyKTtcbiAgICAgICAgICAgIHRoaXMuZmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVhZCB0aGUgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5LlxuICAgICAqL1xuICAgIHJlYWRFbmRPZkNlbnRyYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5yZWFkZXIubGFzdEluZGV4T2ZTaWduYXR1cmUoc2lnLkNFTlRSQUxfRElSRUNUT1JZX0VORCk7XG4gICAgICAgIGlmIChvZmZzZXQgPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3JydXB0ZWQgemlwIDogY2FuJ3QgZmluZCBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnlcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWFkZXIuc2V0SW5kZXgob2Zmc2V0KTtcbiAgICAgICAgdGhpcy5jaGVja1NpZ25hdHVyZShzaWcuQ0VOVFJBTF9ESVJFQ1RPUllfRU5EKTtcbiAgICAgICAgdGhpcy5yZWFkQmxvY2tFbmRPZkNlbnRyYWwoKTtcblxuXG4gICAgICAgIC8qIGV4dHJhY3QgZnJvbSB0aGUgemlwIHNwZWMgOlxuICAgICAgICAgICAgNCkgIElmIG9uZSBvZiB0aGUgZmllbGRzIGluIHRoZSBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICByZWNvcmQgaXMgdG9vIHNtYWxsIHRvIGhvbGQgcmVxdWlyZWQgZGF0YSwgdGhlIGZpZWxkXG4gICAgICAgICAgICAgICAgc2hvdWxkIGJlIHNldCB0byAtMSAoMHhGRkZGIG9yIDB4RkZGRkZGRkYpIGFuZCB0aGVcbiAgICAgICAgICAgICAgICBaSVA2NCBmb3JtYXQgcmVjb3JkIHNob3VsZCBiZSBjcmVhdGVkLlxuICAgICAgICAgICAgNSkgIFRoZSBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgcmVjb3JkIGFuZCB0aGVcbiAgICAgICAgICAgICAgICBaaXA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvciByZWNvcmQgbXVzdFxuICAgICAgICAgICAgICAgIHJlc2lkZSBvbiB0aGUgc2FtZSBkaXNrIHdoZW4gc3BsaXR0aW5nIG9yIHNwYW5uaW5nXG4gICAgICAgICAgICAgICAgYW4gYXJjaGl2ZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmICh0aGlzLmRpc2tOdW1iZXIgPT09IHV0aWxzLk1BWF9WQUxVRV8xNkJJVFMgfHwgdGhpcy5kaXNrV2l0aENlbnRyYWxEaXJTdGFydCA9PT0gdXRpbHMuTUFYX1ZBTFVFXzE2QklUUyB8fCB0aGlzLmNlbnRyYWxEaXJSZWNvcmRzT25UaGlzRGlzayA9PT0gdXRpbHMuTUFYX1ZBTFVFXzE2QklUUyB8fCB0aGlzLmNlbnRyYWxEaXJSZWNvcmRzID09PSB1dGlscy5NQVhfVkFMVUVfMTZCSVRTIHx8IHRoaXMuY2VudHJhbERpclNpemUgPT09IHV0aWxzLk1BWF9WQUxVRV8zMkJJVFMgfHwgdGhpcy5jZW50cmFsRGlyT2Zmc2V0ID09PSB1dGlscy5NQVhfVkFMVUVfMzJCSVRTKSB7XG4gICAgICAgICAgICB0aGlzLnppcDY0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIFdhcm5pbmcgOiB0aGUgemlwNjQgZXh0ZW5zaW9uIGlzIHN1cHBvcnRlZCwgYnV0IE9OTFkgaWYgdGhlIDY0Yml0cyBpbnRlZ2VyIHJlYWQgZnJvbVxuICAgICAgICAgICAgdGhlIHppcCBmaWxlIGNhbiBmaXQgaW50byBhIDMyYml0cyBpbnRlZ2VyLiBUaGlzIGNhbm5vdCBiZSBzb2x2ZWQgOiBKYXZhc2NyaXB0IHJlcHJlc2VudHNcbiAgICAgICAgICAgIGFsbCBudW1iZXJzIGFzIDY0LWJpdCBkb3VibGUgcHJlY2lzaW9uIElFRUUgNzU0IGZsb2F0aW5nIHBvaW50IG51bWJlcnMuXG4gICAgICAgICAgICBTbywgd2UgaGF2ZSA1M2JpdHMgZm9yIGludGVnZXJzIGFuZCBiaXR3aXNlIG9wZXJhdGlvbnMgdHJlYXQgZXZlcnl0aGluZyBhcyAzMmJpdHMuXG4gICAgICAgICAgICBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvQml0d2lzZV9PcGVyYXRvcnNcbiAgICAgICAgICAgIGFuZCBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvcHVibGljYXRpb25zL2ZpbGVzL0VDTUEtU1QvRUNNQS0yNjIucGRmIHNlY3Rpb24gOC41XG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAvLyBzaG91bGQgbG9vayBmb3IgYSB6aXA2NCBFT0NEIGxvY2F0b3JcbiAgICAgICAgICAgIG9mZnNldCA9IHRoaXMucmVhZGVyLmxhc3RJbmRleE9mU2lnbmF0dXJlKHNpZy5aSVA2NF9DRU5UUkFMX0RJUkVDVE9SWV9MT0NBVE9SKTtcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29ycnVwdGVkIHppcCA6IGNhbid0IGZpbmQgdGhlIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZWFkZXIuc2V0SW5kZXgob2Zmc2V0KTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tTaWduYXR1cmUoc2lnLlpJUDY0X0NFTlRSQUxfRElSRUNUT1JZX0xPQ0FUT1IpO1xuICAgICAgICAgICAgdGhpcy5yZWFkQmxvY2taaXA2NEVuZE9mQ2VudHJhbExvY2F0b3IoKTtcblxuICAgICAgICAgICAgLy8gbm93IHRoZSB6aXA2NCBFT0NEIHJlY29yZFxuICAgICAgICAgICAgdGhpcy5yZWFkZXIuc2V0SW5kZXgodGhpcy5yZWxhdGl2ZU9mZnNldEVuZE9mWmlwNjRDZW50cmFsRGlyKTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tTaWduYXR1cmUoc2lnLlpJUDY0X0NFTlRSQUxfRElSRUNUT1JZX0VORCk7XG4gICAgICAgICAgICB0aGlzLnJlYWRCbG9ja1ppcDY0RW5kT2ZDZW50cmFsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHByZXBhcmVSZWFkZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB1dGlscy5nZXRUeXBlT2YoZGF0YSk7XG4gICAgICAgIGlmICh0eXBlID09PSBcInN0cmluZ1wiICYmICFzdXBwb3J0LnVpbnQ4YXJyYXkpIHtcbiAgICAgICAgICAgIHRoaXMucmVhZGVyID0gbmV3IFN0cmluZ1JlYWRlcihkYXRhLCB0aGlzLmxvYWRPcHRpb25zLm9wdGltaXplZEJpbmFyeVN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gXCJub2RlYnVmZmVyXCIpIHtcbiAgICAgICAgICAgIHRoaXMucmVhZGVyID0gbmV3IE5vZGVCdWZmZXJSZWFkZXIoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlYWRlciA9IG5ldyBVaW50OEFycmF5UmVhZGVyKHV0aWxzLnRyYW5zZm9ybVRvKFwidWludDhhcnJheVwiLCBkYXRhKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlYWQgYSB6aXAgZmlsZSBhbmQgY3JlYXRlIFppcEVudHJpZXMuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXlCdWZmZXJ8VWludDhBcnJheXxCdWZmZXJ9IGRhdGEgdGhlIGJpbmFyeSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgemlwIGZpbGUuXG4gICAgICovXG4gICAgbG9hZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB0aGlzLnByZXBhcmVSZWFkZXIoZGF0YSk7XG4gICAgICAgIHRoaXMucmVhZEVuZE9mQ2VudHJhbCgpO1xuICAgICAgICB0aGlzLnJlYWRDZW50cmFsRGlyKCk7XG4gICAgICAgIHRoaXMucmVhZExvY2FsRmlsZXMoKTtcbiAgICB9XG59O1xuLy8gfX19IGVuZCBvZiBaaXBFbnRyaWVzXG5tb2R1bGUuZXhwb3J0cyA9IFppcEVudHJpZXM7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgU3RyaW5nUmVhZGVyID0gcmVxdWlyZSgnLi9zdHJpbmdSZWFkZXInKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBDb21wcmVzc2VkT2JqZWN0ID0gcmVxdWlyZSgnLi9jb21wcmVzc2VkT2JqZWN0Jyk7XG52YXIganN6aXBQcm90byA9IHJlcXVpcmUoJy4vb2JqZWN0Jyk7XG4vLyBjbGFzcyBaaXBFbnRyeSB7e3tcbi8qKlxuICogQW4gZW50cnkgaW4gdGhlIHppcCBmaWxlLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9mIHRoZSBjdXJyZW50IGZpbGUuXG4gKiBAcGFyYW0ge09iamVjdH0gbG9hZE9wdGlvbnMgT3B0aW9ucyBmb3IgbG9hZGluZyB0aGUgc3RyZWFtLlxuICovXG5mdW5jdGlvbiBaaXBFbnRyeShvcHRpb25zLCBsb2FkT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5sb2FkT3B0aW9ucyA9IGxvYWRPcHRpb25zO1xufVxuWmlwRW50cnkucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIHNheSBpZiB0aGUgZmlsZSBpcyBlbmNyeXB0ZWQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZmlsZSBpcyBlbmNyeXB0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBpc0VuY3J5cHRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGJpdCAxIGlzIHNldFxuICAgICAgICByZXR1cm4gKHRoaXMuYml0RmxhZyAmIDB4MDAwMSkgPT09IDB4MDAwMTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIHNheSBpZiB0aGUgZmlsZSBoYXMgdXRmLTggZmlsZW5hbWUvY29tbWVudC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBmaWxlbmFtZS9jb21tZW50IGlzIGluIHV0Zi04LCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgdXNlVVRGODogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGJpdCAxMSBpcyBzZXRcbiAgICAgICAgcmV0dXJuICh0aGlzLmJpdEZsYWcgJiAweDA4MDApID09PSAweDA4MDA7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQcmVwYXJlIHRoZSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIHRoZSBjb21wcmVzc2VkIGNvbnRlbnQgZnJvbSB0aGlzIFppcEZpbGUuXG4gICAgICogQHBhcmFtIHtEYXRhUmVhZGVyfSByZWFkZXIgdGhlIHJlYWRlciB0byB1c2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZyb20gdGhlIG9mZnNldCBmcm9tIHdoZXJlIHdlIHNob3VsZCByZWFkIHRoZSBkYXRhLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggdGhlIGxlbmd0aCBvZiB0aGUgZGF0YSB0byByZWFkLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSB0aGUgY2FsbGJhY2sgdG8gZ2V0IHRoZSBjb21wcmVzc2VkIGNvbnRlbnQgKHRoZSB0eXBlIGRlcGVuZHMgb2YgdGhlIERhdGFSZWFkZXIgY2xhc3MpLlxuICAgICAqL1xuICAgIHByZXBhcmVDb21wcmVzc2VkQ29udGVudDogZnVuY3Rpb24ocmVhZGVyLCBmcm9tLCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzSW5kZXggPSByZWFkZXIuaW5kZXg7XG4gICAgICAgICAgICByZWFkZXIuc2V0SW5kZXgoZnJvbSk7XG4gICAgICAgICAgICB2YXIgY29tcHJlc3NlZEZpbGVEYXRhID0gcmVhZGVyLnJlYWREYXRhKGxlbmd0aCk7XG4gICAgICAgICAgICByZWFkZXIuc2V0SW5kZXgocHJldmlvdXNJbmRleCk7XG5cbiAgICAgICAgICAgIHJldHVybiBjb21wcmVzc2VkRmlsZURhdGE7XG4gICAgICAgIH07XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQcmVwYXJlIHRoZSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIHRoZSB1bmNvbXByZXNzZWQgY29udGVudCBmcm9tIHRoaXMgWmlwRmlsZS5cbiAgICAgKiBAcGFyYW0ge0RhdGFSZWFkZXJ9IHJlYWRlciB0aGUgcmVhZGVyIHRvIHVzZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZnJvbSB0aGUgb2Zmc2V0IGZyb20gd2hlcmUgd2Ugc2hvdWxkIHJlYWQgdGhlIGRhdGEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCB0aGUgbGVuZ3RoIG9mIHRoZSBkYXRhIHRvIHJlYWQuXG4gICAgICogQHBhcmFtIHtKU1ppcC5jb21wcmVzc2lvbn0gY29tcHJlc3Npb24gdGhlIGNvbXByZXNzaW9uIHVzZWQgb24gdGhpcyBmaWxlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB1bmNvbXByZXNzZWRTaXplIHRoZSB1bmNvbXByZXNzZWQgc2l6ZSB0byBleHBlY3QuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IHRoZSBjYWxsYmFjayB0byBnZXQgdGhlIHVuY29tcHJlc3NlZCBjb250ZW50ICh0aGUgdHlwZSBkZXBlbmRzIG9mIHRoZSBEYXRhUmVhZGVyIGNsYXNzKS5cbiAgICAgKi9cbiAgICBwcmVwYXJlQ29udGVudDogZnVuY3Rpb24ocmVhZGVyLCBmcm9tLCBsZW5ndGgsIGNvbXByZXNzaW9uLCB1bmNvbXByZXNzZWRTaXplKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGNvbXByZXNzZWRGaWxlRGF0YSA9IHV0aWxzLnRyYW5zZm9ybVRvKGNvbXByZXNzaW9uLnVuY29tcHJlc3NJbnB1dFR5cGUsIHRoaXMuZ2V0Q29tcHJlc3NlZENvbnRlbnQoKSk7XG4gICAgICAgICAgICB2YXIgdW5jb21wcmVzc2VkRmlsZURhdGEgPSBjb21wcmVzc2lvbi51bmNvbXByZXNzKGNvbXByZXNzZWRGaWxlRGF0YSk7XG5cbiAgICAgICAgICAgIGlmICh1bmNvbXByZXNzZWRGaWxlRGF0YS5sZW5ndGggIT09IHVuY29tcHJlc3NlZFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCdWcgOiB1bmNvbXByZXNzZWQgZGF0YSBzaXplIG1pc21hdGNoXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdW5jb21wcmVzc2VkRmlsZURhdGE7XG4gICAgICAgIH07XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZWFkIHRoZSBsb2NhbCBwYXJ0IG9mIGEgemlwIGZpbGUgYW5kIGFkZCB0aGUgaW5mbyBpbiB0aGlzIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0RhdGFSZWFkZXJ9IHJlYWRlciB0aGUgcmVhZGVyIHRvIHVzZS5cbiAgICAgKi9cbiAgICByZWFkTG9jYWxQYXJ0OiBmdW5jdGlvbihyZWFkZXIpIHtcbiAgICAgICAgdmFyIGNvbXByZXNzaW9uLCBsb2NhbEV4dHJhRmllbGRzTGVuZ3RoO1xuXG4gICAgICAgIC8vIHdlIGFscmVhZHkga25vdyBldmVyeXRoaW5nIGZyb20gdGhlIGNlbnRyYWwgZGlyICFcbiAgICAgICAgLy8gSWYgdGhlIGNlbnRyYWwgZGlyIGRhdGEgYXJlIGZhbHNlLCB3ZSBhcmUgZG9vbWVkLlxuICAgICAgICAvLyBPbiB0aGUgYnJpZ2h0IHNpZGUsIHRoZSBsb2NhbCBwYXJ0IGlzIHNjYXJ5ICA6IHppcDY0LCBkYXRhIGRlc2NyaXB0b3JzLCBib3RoLCBldGMuXG4gICAgICAgIC8vIFRoZSBsZXNzIGRhdGEgd2UgZ2V0IGhlcmUsIHRoZSBtb3JlIHJlbGlhYmxlIHRoaXMgc2hvdWxkIGJlLlxuICAgICAgICAvLyBMZXQncyBza2lwIHRoZSB3aG9sZSBoZWFkZXIgYW5kIGRhc2ggdG8gdGhlIGRhdGEgIVxuICAgICAgICByZWFkZXIuc2tpcCgyMik7XG4gICAgICAgIC8vIGluIHNvbWUgemlwIGNyZWF0ZWQgb24gd2luZG93cywgdGhlIGZpbGVuYW1lIHN0b3JlZCBpbiB0aGUgY2VudHJhbCBkaXIgY29udGFpbnMgXFwgaW5zdGVhZCBvZiAvLlxuICAgICAgICAvLyBTdHJhbmdlbHksIHRoZSBmaWxlbmFtZSBoZXJlIGlzIE9LLlxuICAgICAgICAvLyBJIHdvdWxkIGxvdmUgdG8gdHJlYXQgdGhlc2UgemlwIGZpbGVzIGFzIGNvcnJ1cHRlZCAoc2VlIGh0dHA6Ly93d3cuaW5mby16aXAub3JnL0ZBUS5odG1sI2JhY2tzbGFzaGVzXG4gICAgICAgIC8vIG9yIEFQUE5PVEUjNC40LjE3LjEsIFwiQWxsIHNsYXNoZXMgTVVTVCBiZSBmb3J3YXJkIHNsYXNoZXMgJy8nXCIpIGJ1dCB0aGVyZSBhcmUgYSBsb3Qgb2YgYmFkIHppcCBnZW5lcmF0b3JzLi4uXG4gICAgICAgIC8vIFNlYXJjaCBcInVuemlwIG1pc21hdGNoaW5nIFwibG9jYWxcIiBmaWxlbmFtZSBjb250aW51aW5nIHdpdGggXCJjZW50cmFsXCIgZmlsZW5hbWUgdmVyc2lvblwiIG9uXG4gICAgICAgIC8vIHRoZSBpbnRlcm5ldC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSSB0aGluayBJIHNlZSB0aGUgbG9naWMgaGVyZSA6IHRoZSBjZW50cmFsIGRpcmVjdG9yeSBpcyB1c2VkIHRvIGRpc3BsYXlcbiAgICAgICAgLy8gY29udGVudCBhbmQgdGhlIGxvY2FsIGRpcmVjdG9yeSBpcyB1c2VkIHRvIGV4dHJhY3QgdGhlIGZpbGVzLiBNaXhpbmcgLyBhbmQgXFxcbiAgICAgICAgLy8gbWF5IGJlIHVzZWQgdG8gZGlzcGxheSBcXCB0byB3aW5kb3dzIHVzZXJzIGFuZCB1c2UgLyB3aGVuIGV4dHJhY3RpbmcgdGhlIGZpbGVzLlxuICAgICAgICAvLyBVbmZvcnR1bmF0ZWx5LCB0aGlzIGxlYWQgYWxzbyB0byBzb21lIGlzc3VlcyA6IGh0dHA6Ly9zZWNsaXN0cy5vcmcvZnVsbGRpc2Nsb3N1cmUvMjAwOS9TZXAvMzk0XG4gICAgICAgIHRoaXMuZmlsZU5hbWVMZW5ndGggPSByZWFkZXIucmVhZEludCgyKTtcbiAgICAgICAgbG9jYWxFeHRyYUZpZWxkc0xlbmd0aCA9IHJlYWRlci5yZWFkSW50KDIpOyAvLyBjYW4ndCBiZSBzdXJlIHRoaXMgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgY2VudHJhbCBkaXJcbiAgICAgICAgdGhpcy5maWxlTmFtZSA9IHJlYWRlci5yZWFkU3RyaW5nKHRoaXMuZmlsZU5hbWVMZW5ndGgpO1xuICAgICAgICByZWFkZXIuc2tpcChsb2NhbEV4dHJhRmllbGRzTGVuZ3RoKTtcblxuICAgICAgICBpZiAodGhpcy5jb21wcmVzc2VkU2l6ZSA9PSAtMSB8fCB0aGlzLnVuY29tcHJlc3NlZFNpemUgPT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJ1ZyBvciBjb3JydXB0ZWQgemlwIDogZGlkbid0IGdldCBlbm91Z2ggaW5mb3JtYXRpb25zIGZyb20gdGhlIGNlbnRyYWwgZGlyZWN0b3J5IFwiICsgXCIoY29tcHJlc3NlZFNpemUgPT0gLTEgfHwgdW5jb21wcmVzc2VkU2l6ZSA9PSAtMSlcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb21wcmVzc2lvbiA9IHV0aWxzLmZpbmRDb21wcmVzc2lvbih0aGlzLmNvbXByZXNzaW9uTWV0aG9kKTtcbiAgICAgICAgaWYgKGNvbXByZXNzaW9uID09PSBudWxsKSB7IC8vIG5vIGNvbXByZXNzaW9uIGZvdW5kXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3JydXB0ZWQgemlwIDogY29tcHJlc3Npb24gXCIgKyB1dGlscy5wcmV0dHkodGhpcy5jb21wcmVzc2lvbk1ldGhvZCkgKyBcIiB1bmtub3duIChpbm5lciBmaWxlIDogXCIgKyB0aGlzLmZpbGVOYW1lICsgXCIpXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVjb21wcmVzc2VkID0gbmV3IENvbXByZXNzZWRPYmplY3QoKTtcbiAgICAgICAgdGhpcy5kZWNvbXByZXNzZWQuY29tcHJlc3NlZFNpemUgPSB0aGlzLmNvbXByZXNzZWRTaXplO1xuICAgICAgICB0aGlzLmRlY29tcHJlc3NlZC51bmNvbXByZXNzZWRTaXplID0gdGhpcy51bmNvbXByZXNzZWRTaXplO1xuICAgICAgICB0aGlzLmRlY29tcHJlc3NlZC5jcmMzMiA9IHRoaXMuY3JjMzI7XG4gICAgICAgIHRoaXMuZGVjb21wcmVzc2VkLmNvbXByZXNzaW9uTWV0aG9kID0gdGhpcy5jb21wcmVzc2lvbk1ldGhvZDtcbiAgICAgICAgdGhpcy5kZWNvbXByZXNzZWQuZ2V0Q29tcHJlc3NlZENvbnRlbnQgPSB0aGlzLnByZXBhcmVDb21wcmVzc2VkQ29udGVudChyZWFkZXIsIHJlYWRlci5pbmRleCwgdGhpcy5jb21wcmVzc2VkU2l6ZSwgY29tcHJlc3Npb24pO1xuICAgICAgICB0aGlzLmRlY29tcHJlc3NlZC5nZXRDb250ZW50ID0gdGhpcy5wcmVwYXJlQ29udGVudChyZWFkZXIsIHJlYWRlci5pbmRleCwgdGhpcy5jb21wcmVzc2VkU2l6ZSwgY29tcHJlc3Npb24sIHRoaXMudW5jb21wcmVzc2VkU2l6ZSk7XG5cbiAgICAgICAgLy8gd2UgbmVlZCB0byBjb21wdXRlIHRoZSBjcmMzMi4uLlxuICAgICAgICBpZiAodGhpcy5sb2FkT3B0aW9ucy5jaGVja0NSQzMyKSB7XG4gICAgICAgICAgICB0aGlzLmRlY29tcHJlc3NlZCA9IHV0aWxzLnRyYW5zZm9ybVRvKFwic3RyaW5nXCIsIHRoaXMuZGVjb21wcmVzc2VkLmdldENvbnRlbnQoKSk7XG4gICAgICAgICAgICBpZiAoanN6aXBQcm90by5jcmMzMih0aGlzLmRlY29tcHJlc3NlZCkgIT09IHRoaXMuY3JjMzIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3JydXB0ZWQgemlwIDogQ1JDMzIgbWlzbWF0Y2hcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVhZCB0aGUgY2VudHJhbCBwYXJ0IG9mIGEgemlwIGZpbGUgYW5kIGFkZCB0aGUgaW5mbyBpbiB0aGlzIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0RhdGFSZWFkZXJ9IHJlYWRlciB0aGUgcmVhZGVyIHRvIHVzZS5cbiAgICAgKi9cbiAgICByZWFkQ2VudHJhbFBhcnQ6IGZ1bmN0aW9uKHJlYWRlcikge1xuICAgICAgICB0aGlzLnZlcnNpb25NYWRlQnkgPSByZWFkZXIucmVhZFN0cmluZygyKTtcbiAgICAgICAgdGhpcy52ZXJzaW9uTmVlZGVkID0gcmVhZGVyLnJlYWRJbnQoMik7XG4gICAgICAgIHRoaXMuYml0RmxhZyA9IHJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uTWV0aG9kID0gcmVhZGVyLnJlYWRTdHJpbmcoMik7XG4gICAgICAgIHRoaXMuZGF0ZSA9IHJlYWRlci5yZWFkRGF0ZSgpO1xuICAgICAgICB0aGlzLmNyYzMyID0gcmVhZGVyLnJlYWRJbnQoNCk7XG4gICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSByZWFkZXIucmVhZEludCg0KTtcbiAgICAgICAgdGhpcy51bmNvbXByZXNzZWRTaXplID0gcmVhZGVyLnJlYWRJbnQoNCk7XG4gICAgICAgIHRoaXMuZmlsZU5hbWVMZW5ndGggPSByZWFkZXIucmVhZEludCgyKTtcbiAgICAgICAgdGhpcy5leHRyYUZpZWxkc0xlbmd0aCA9IHJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICB0aGlzLmZpbGVDb21tZW50TGVuZ3RoID0gcmVhZGVyLnJlYWRJbnQoMik7XG4gICAgICAgIHRoaXMuZGlza051bWJlclN0YXJ0ID0gcmVhZGVyLnJlYWRJbnQoMik7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxGaWxlQXR0cmlidXRlcyA9IHJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICB0aGlzLmV4dGVybmFsRmlsZUF0dHJpYnV0ZXMgPSByZWFkZXIucmVhZEludCg0KTtcbiAgICAgICAgdGhpcy5sb2NhbEhlYWRlck9mZnNldCA9IHJlYWRlci5yZWFkSW50KDQpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzRW5jcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVuY3J5cHRlZCB6aXAgYXJlIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZpbGVOYW1lID0gcmVhZGVyLnJlYWRTdHJpbmcodGhpcy5maWxlTmFtZUxlbmd0aCk7XG4gICAgICAgIHRoaXMucmVhZEV4dHJhRmllbGRzKHJlYWRlcik7XG4gICAgICAgIHRoaXMucGFyc2VaSVA2NEV4dHJhRmllbGQocmVhZGVyKTtcbiAgICAgICAgdGhpcy5maWxlQ29tbWVudCA9IHJlYWRlci5yZWFkU3RyaW5nKHRoaXMuZmlsZUNvbW1lbnRMZW5ndGgpO1xuXG4gICAgICAgIC8vIHdhcm5pbmcsIHRoaXMgaXMgdHJ1ZSBvbmx5IGZvciB6aXAgd2l0aCBtYWRlQnkgPT0gRE9TIChwbGF0ZWZvcm0gZGVwZW5kZW50IGZlYXR1cmUpXG4gICAgICAgIHRoaXMuZGlyID0gdGhpcy5leHRlcm5hbEZpbGVBdHRyaWJ1dGVzICYgMHgwMDAwMDAxMCA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFBhcnNlIHRoZSBaSVA2NCBleHRyYSBmaWVsZCBhbmQgbWVyZ2UgdGhlIGluZm8gaW4gdGhlIGN1cnJlbnQgWmlwRW50cnkuXG4gICAgICogQHBhcmFtIHtEYXRhUmVhZGVyfSByZWFkZXIgdGhlIHJlYWRlciB0byB1c2UuXG4gICAgICovXG4gICAgcGFyc2VaSVA2NEV4dHJhRmllbGQ6IGZ1bmN0aW9uKHJlYWRlcikge1xuXG4gICAgICAgIGlmICghdGhpcy5leHRyYUZpZWxkc1sweDAwMDFdKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzaG91bGQgYmUgc29tZXRoaW5nLCBwcmVwYXJpbmcgdGhlIGV4dHJhIHJlYWRlclxuICAgICAgICB2YXIgZXh0cmFSZWFkZXIgPSBuZXcgU3RyaW5nUmVhZGVyKHRoaXMuZXh0cmFGaWVsZHNbMHgwMDAxXS52YWx1ZSk7XG5cbiAgICAgICAgLy8gSSByZWFsbHkgaG9wZSB0aGF0IHRoZXNlIDY0Yml0cyBpbnRlZ2VyIGNhbiBmaXQgaW4gMzIgYml0cyBpbnRlZ2VyLCBiZWNhdXNlIGpzXG4gICAgICAgIC8vIHdvbid0IGxldCB1cyBoYXZlIG1vcmUuXG4gICAgICAgIGlmICh0aGlzLnVuY29tcHJlc3NlZFNpemUgPT09IHV0aWxzLk1BWF9WQUxVRV8zMkJJVFMpIHtcbiAgICAgICAgICAgIHRoaXMudW5jb21wcmVzc2VkU2l6ZSA9IGV4dHJhUmVhZGVyLnJlYWRJbnQoOCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29tcHJlc3NlZFNpemUgPT09IHV0aWxzLk1BWF9WQUxVRV8zMkJJVFMpIHtcbiAgICAgICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSBleHRyYVJlYWRlci5yZWFkSW50KDgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxvY2FsSGVhZGVyT2Zmc2V0ID09PSB1dGlscy5NQVhfVkFMVUVfMzJCSVRTKSB7XG4gICAgICAgICAgICB0aGlzLmxvY2FsSGVhZGVyT2Zmc2V0ID0gZXh0cmFSZWFkZXIucmVhZEludCg4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kaXNrTnVtYmVyU3RhcnQgPT09IHV0aWxzLk1BWF9WQUxVRV8zMkJJVFMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlza051bWJlclN0YXJ0ID0gZXh0cmFSZWFkZXIucmVhZEludCg0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVhZCB0aGUgY2VudHJhbCBwYXJ0IG9mIGEgemlwIGZpbGUgYW5kIGFkZCB0aGUgaW5mbyBpbiB0aGlzIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0RhdGFSZWFkZXJ9IHJlYWRlciB0aGUgcmVhZGVyIHRvIHVzZS5cbiAgICAgKi9cbiAgICByZWFkRXh0cmFGaWVsZHM6IGZ1bmN0aW9uKHJlYWRlcikge1xuICAgICAgICB2YXIgc3RhcnQgPSByZWFkZXIuaW5kZXgsXG4gICAgICAgICAgICBleHRyYUZpZWxkSWQsXG4gICAgICAgICAgICBleHRyYUZpZWxkTGVuZ3RoLFxuICAgICAgICAgICAgZXh0cmFGaWVsZFZhbHVlO1xuXG4gICAgICAgIHRoaXMuZXh0cmFGaWVsZHMgPSB0aGlzLmV4dHJhRmllbGRzIHx8IHt9O1xuXG4gICAgICAgIHdoaWxlIChyZWFkZXIuaW5kZXggPCBzdGFydCArIHRoaXMuZXh0cmFGaWVsZHNMZW5ndGgpIHtcbiAgICAgICAgICAgIGV4dHJhRmllbGRJZCA9IHJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICAgICAgZXh0cmFGaWVsZExlbmd0aCA9IHJlYWRlci5yZWFkSW50KDIpO1xuICAgICAgICAgICAgZXh0cmFGaWVsZFZhbHVlID0gcmVhZGVyLnJlYWRTdHJpbmcoZXh0cmFGaWVsZExlbmd0aCk7XG5cbiAgICAgICAgICAgIHRoaXMuZXh0cmFGaWVsZHNbZXh0cmFGaWVsZElkXSA9IHtcbiAgICAgICAgICAgICAgICBpZDogZXh0cmFGaWVsZElkLFxuICAgICAgICAgICAgICAgIGxlbmd0aDogZXh0cmFGaWVsZExlbmd0aCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZXh0cmFGaWVsZFZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBcHBseSBhbiBVVEY4IHRyYW5zZm9ybWF0aW9uIGlmIG5lZWRlZC5cbiAgICAgKi9cbiAgICBoYW5kbGVVVEY4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudXNlVVRGOCgpKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGVOYW1lID0ganN6aXBQcm90by51dGY4ZGVjb2RlKHRoaXMuZmlsZU5hbWUpO1xuICAgICAgICAgICAgdGhpcy5maWxlQ29tbWVudCA9IGpzemlwUHJvdG8udXRmOGRlY29kZSh0aGlzLmZpbGVDb21tZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB1cGF0aCA9IHRoaXMuZmluZEV4dHJhRmllbGRVbmljb2RlUGF0aCgpO1xuICAgICAgICAgICAgaWYgKHVwYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maWxlTmFtZSA9IHVwYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHVjb21tZW50ID0gdGhpcy5maW5kRXh0cmFGaWVsZFVuaWNvZGVDb21tZW50KCk7XG4gICAgICAgICAgICBpZiAodWNvbW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVDb21tZW50ID0gdWNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgdW5pY29kZSBwYXRoIGRlY2xhcmVkIGluIHRoZSBleHRyYSBmaWVsZCwgaWYgYW55LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gdGhlIHVuaWNvZGUgcGF0aCwgbnVsbCBvdGhlcndpc2UuXG4gICAgICovXG4gICAgZmluZEV4dHJhRmllbGRVbmljb2RlUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB1cGF0aEZpZWxkID0gdGhpcy5leHRyYUZpZWxkc1sweDcwNzVdO1xuICAgICAgICBpZiAodXBhdGhGaWVsZCkge1xuICAgICAgICAgICAgdmFyIGV4dHJhUmVhZGVyID0gbmV3IFN0cmluZ1JlYWRlcih1cGF0aEZpZWxkLnZhbHVlKTtcblxuICAgICAgICAgICAgLy8gd3JvbmcgdmVyc2lvblxuICAgICAgICAgICAgaWYgKGV4dHJhUmVhZGVyLnJlYWRJbnQoMSkgIT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhlIGNyYyBvZiB0aGUgZmlsZW5hbWUgY2hhbmdlZCwgdGhpcyBmaWVsZCBpcyBvdXQgb2YgZGF0ZS5cbiAgICAgICAgICAgIGlmIChqc3ppcFByb3RvLmNyYzMyKHRoaXMuZmlsZU5hbWUpICE9PSBleHRyYVJlYWRlci5yZWFkSW50KDQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBqc3ppcFByb3RvLnV0ZjhkZWNvZGUoZXh0cmFSZWFkZXIucmVhZFN0cmluZyh1cGF0aEZpZWxkLmxlbmd0aCAtIDUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgdW5pY29kZSBjb21tZW50IGRlY2xhcmVkIGluIHRoZSBleHRyYSBmaWVsZCwgaWYgYW55LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gdGhlIHVuaWNvZGUgY29tbWVudCwgbnVsbCBvdGhlcndpc2UuXG4gICAgICovXG4gICAgZmluZEV4dHJhRmllbGRVbmljb2RlQ29tbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB1Y29tbWVudEZpZWxkID0gdGhpcy5leHRyYUZpZWxkc1sweDYzNzVdO1xuICAgICAgICBpZiAodWNvbW1lbnRGaWVsZCkge1xuICAgICAgICAgICAgdmFyIGV4dHJhUmVhZGVyID0gbmV3IFN0cmluZ1JlYWRlcih1Y29tbWVudEZpZWxkLnZhbHVlKTtcblxuICAgICAgICAgICAgLy8gd3JvbmcgdmVyc2lvblxuICAgICAgICAgICAgaWYgKGV4dHJhUmVhZGVyLnJlYWRJbnQoMSkgIT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhlIGNyYyBvZiB0aGUgY29tbWVudCBjaGFuZ2VkLCB0aGlzIGZpZWxkIGlzIG91dCBvZiBkYXRlLlxuICAgICAgICAgICAgaWYgKGpzemlwUHJvdG8uY3JjMzIodGhpcy5maWxlQ29tbWVudCkgIT09IGV4dHJhUmVhZGVyLnJlYWRJbnQoNCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpzemlwUHJvdG8udXRmOGRlY29kZShleHRyYVJlYWRlci5yZWFkU3RyaW5nKHVjb21tZW50RmllbGQubGVuZ3RoIC0gNSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IFppcEVudHJ5O1xuIiwiLy8gVG9wIGxldmVsIGZpbGUgaXMganVzdCBhIG1peGluIG9mIHN1Ym1vZHVsZXMgJiBjb25zdGFudHNcbid1c2Ugc3RyaWN0JztcblxudmFyIGFzc2lnbiAgICA9IHJlcXVpcmUoJy4vbGliL3V0aWxzL2NvbW1vbicpLmFzc2lnbjtcblxudmFyIGRlZmxhdGUgICA9IHJlcXVpcmUoJy4vbGliL2RlZmxhdGUnKTtcbnZhciBpbmZsYXRlICAgPSByZXF1aXJlKCcuL2xpYi9pbmZsYXRlJyk7XG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9saWIvemxpYi9jb25zdGFudHMnKTtcblxudmFyIHBha28gPSB7fTtcblxuYXNzaWduKHBha28sIGRlZmxhdGUsIGluZmxhdGUsIGNvbnN0YW50cyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcGFrbzsiLCIndXNlIHN0cmljdCc7XG5cblxudmFyIHpsaWJfZGVmbGF0ZSA9IHJlcXVpcmUoJy4vemxpYi9kZWZsYXRlLmpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL2NvbW1vbicpO1xudmFyIHN0cmluZ3MgPSByZXF1aXJlKCcuL3V0aWxzL3N0cmluZ3MnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL3psaWIvbWVzc2FnZXMnKTtcbnZhciB6c3RyZWFtID0gcmVxdWlyZSgnLi96bGliL3pzdHJlYW0nKTtcblxuXG4vKiBQdWJsaWMgY29uc3RhbnRzID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cblxudmFyIFpfTk9fRkxVU0ggICAgICA9IDA7XG52YXIgWl9GSU5JU0ggICAgICAgID0gNDtcblxudmFyIFpfT0sgICAgICAgICAgICA9IDA7XG52YXIgWl9TVFJFQU1fRU5EICAgID0gMTtcblxudmFyIFpfREVGQVVMVF9DT01QUkVTU0lPTiA9IC0xO1xuXG52YXIgWl9ERUZBVUxUX1NUUkFURUdZICAgID0gMDtcblxudmFyIFpfREVGTEFURUQgID0gODtcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cblxuXG4vKipcbiAqIGNsYXNzIERlZmxhdGVcbiAqXG4gKiBHZW5lcmljIEpTLXN0eWxlIHdyYXBwZXIgZm9yIHpsaWIgY2FsbHMuIElmIHlvdSBkb24ndCBuZWVkXG4gKiBzdHJlYW1pbmcgYmVoYXZpb3VyIC0gdXNlIG1vcmUgc2ltcGxlIGZ1bmN0aW9uczogW1tkZWZsYXRlXV0sXG4gKiBbW2RlZmxhdGVSYXddXSBhbmQgW1tnemlwXV0uXG4gKiovXG5cbi8qIGludGVybmFsXG4gKiBEZWZsYXRlLmNodW5rcyAtPiBBcnJheVxuICpcbiAqIENodW5rcyBvZiBvdXRwdXQgZGF0YSwgaWYgW1tEZWZsYXRlI29uRGF0YV1dIG5vdCBvdmVycmlkZW4uXG4gKiovXG5cbi8qKlxuICogRGVmbGF0ZS5yZXN1bHQgLT4gVWludDhBcnJheXxBcnJheVxuICpcbiAqIENvbXByZXNzZWQgcmVzdWx0LCBnZW5lcmF0ZWQgYnkgZGVmYXVsdCBbW0RlZmxhdGUjb25EYXRhXV1cbiAqIGFuZCBbW0RlZmxhdGUjb25FbmRdXSBoYW5kbGVycy4gRmlsbGVkIGFmdGVyIHlvdSBwdXNoIGxhc3QgY2h1bmtcbiAqIChjYWxsIFtbRGVmbGF0ZSNwdXNoXV0gd2l0aCBgWl9GSU5JU0hgIC8gYHRydWVgIHBhcmFtKS5cbiAqKi9cblxuLyoqXG4gKiBEZWZsYXRlLmVyciAtPiBOdW1iZXJcbiAqXG4gKiBFcnJvciBjb2RlIGFmdGVyIGRlZmxhdGUgZmluaXNoZWQuIDAgKFpfT0spIG9uIHN1Y2Nlc3MuXG4gKiBZb3Ugd2lsbCBub3QgbmVlZCBpdCBpbiByZWFsIGxpZmUsIGJlY2F1c2UgZGVmbGF0ZSBlcnJvcnNcbiAqIGFyZSBwb3NzaWJsZSBvbmx5IG9uIHdyb25nIG9wdGlvbnMgb3IgYmFkIGBvbkRhdGFgIC8gYG9uRW5kYFxuICogY3VzdG9tIGhhbmRsZXJzLlxuICoqL1xuXG4vKipcbiAqIERlZmxhdGUubXNnIC0+IFN0cmluZ1xuICpcbiAqIEVycm9yIG1lc3NhZ2UsIGlmIFtbRGVmbGF0ZS5lcnJdXSAhPSAwXG4gKiovXG5cblxuLyoqXG4gKiBuZXcgRGVmbGF0ZShvcHRpb25zKVxuICogLSBvcHRpb25zIChPYmplY3QpOiB6bGliIGRlZmxhdGUgb3B0aW9ucy5cbiAqXG4gKiBDcmVhdGVzIG5ldyBkZWZsYXRvciBpbnN0YW5jZSB3aXRoIHNwZWNpZmllZCBwYXJhbXMuIFRocm93cyBleGNlcHRpb25cbiAqIG9uIGJhZCBwYXJhbXMuIFN1cHBvcnRlZCBvcHRpb25zOlxuICpcbiAqIC0gYGxldmVsYFxuICogLSBgd2luZG93Qml0c2BcbiAqIC0gYG1lbUxldmVsYFxuICogLSBgc3RyYXRlZ3lgXG4gKlxuICogW2h0dHA6Ly96bGliLm5ldC9tYW51YWwuaHRtbCNBZHZhbmNlZF0oaHR0cDovL3psaWIubmV0L21hbnVhbC5odG1sI0FkdmFuY2VkKVxuICogZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlc2UuXG4gKlxuICogQWRkaXRpb25hbCBvcHRpb25zLCBmb3IgaW50ZXJuYWwgbmVlZHM6XG4gKlxuICogLSBgY2h1bmtTaXplYCAtIHNpemUgb2YgZ2VuZXJhdGVkIGRhdGEgY2h1bmtzICgxNksgYnkgZGVmYXVsdClcbiAqIC0gYHJhd2AgKEJvb2xlYW4pIC0gZG8gcmF3IGRlZmxhdGVcbiAqIC0gYGd6aXBgIChCb29sZWFuKSAtIGNyZWF0ZSBnemlwIHdyYXBwZXJcbiAqIC0gYHRvYCAoU3RyaW5nKSAtIGlmIGVxdWFsIHRvICdzdHJpbmcnLCB0aGVuIHJlc3VsdCB3aWxsIGJlIFwiYmluYXJ5IHN0cmluZ1wiXG4gKiAgICAoZWFjaCBjaGFyIGNvZGUgWzAuLjI1NV0pXG4gKiAtIGBoZWFkZXJgIChPYmplY3QpIC0gY3VzdG9tIGhlYWRlciBmb3IgZ3ppcFxuICogICAtIGB0ZXh0YCAoQm9vbGVhbikgLSB0cnVlIGlmIGNvbXByZXNzZWQgZGF0YSBiZWxpZXZlZCB0byBiZSB0ZXh0XG4gKiAgIC0gYHRpbWVgIChOdW1iZXIpIC0gbW9kaWZpY2F0aW9uIHRpbWUsIHVuaXggdGltZXN0YW1wXG4gKiAgIC0gYG9zYCAoTnVtYmVyKSAtIG9wZXJhdGlvbiBzeXN0ZW0gY29kZVxuICogICAtIGBleHRyYWAgKEFycmF5KSAtIGFycmF5IG9mIGJ5dGVzIHdpdGggZXh0cmEgZGF0YSAobWF4IDY1NTM2KVxuICogICAtIGBuYW1lYCAoU3RyaW5nKSAtIGZpbGUgbmFtZSAoYmluYXJ5IHN0cmluZylcbiAqICAgLSBgY29tbWVudGAgKFN0cmluZykgLSBjb21tZW50IChiaW5hcnkgc3RyaW5nKVxuICogICAtIGBoY3JjYCAoQm9vbGVhbikgLSB0cnVlIGlmIGhlYWRlciBjcmMgc2hvdWxkIGJlIGFkZGVkXG4gKlxuICogIyMjIyMgRXhhbXBsZTpcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgcGFrbyA9IHJlcXVpcmUoJ3Bha28nKVxuICogICAsIGNodW5rMSA9IFVpbnQ4QXJyYXkoWzEsMiwzLDQsNSw2LDcsOCw5XSlcbiAqICAgLCBjaHVuazIgPSBVaW50OEFycmF5KFsxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOV0pO1xuICpcbiAqIHZhciBkZWZsYXRlID0gbmV3IHBha28uRGVmbGF0ZSh7IGxldmVsOiAzfSk7XG4gKlxuICogZGVmbGF0ZS5wdXNoKGNodW5rMSwgZmFsc2UpO1xuICogZGVmbGF0ZS5wdXNoKGNodW5rMiwgdHJ1ZSk7ICAvLyB0cnVlIC0+IGxhc3QgY2h1bmtcbiAqXG4gKiBpZiAoZGVmbGF0ZS5lcnIpIHsgdGhyb3cgbmV3IEVycm9yKGRlZmxhdGUuZXJyKTsgfVxuICpcbiAqIGNvbnNvbGUubG9nKGRlZmxhdGUucmVzdWx0KTtcbiAqIGBgYFxuICoqL1xudmFyIERlZmxhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgdGhpcy5vcHRpb25zID0gdXRpbHMuYXNzaWduKHtcbiAgICBsZXZlbDogWl9ERUZBVUxUX0NPTVBSRVNTSU9OLFxuICAgIG1ldGhvZDogWl9ERUZMQVRFRCxcbiAgICBjaHVua1NpemU6IDE2Mzg0LFxuICAgIHdpbmRvd0JpdHM6IDE1LFxuICAgIG1lbUxldmVsOiA4LFxuICAgIHN0cmF0ZWd5OiBaX0RFRkFVTFRfU1RSQVRFR1ksXG4gICAgdG86ICcnXG4gIH0sIG9wdGlvbnMgfHwge30pO1xuXG4gIHZhciBvcHQgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKG9wdC5yYXcgJiYgKG9wdC53aW5kb3dCaXRzID4gMCkpIHtcbiAgICBvcHQud2luZG93Qml0cyA9IC1vcHQud2luZG93Qml0cztcbiAgfVxuXG4gIGVsc2UgaWYgKG9wdC5nemlwICYmIChvcHQud2luZG93Qml0cyA+IDApICYmIChvcHQud2luZG93Qml0cyA8IDE2KSkge1xuICAgIG9wdC53aW5kb3dCaXRzICs9IDE2O1xuICB9XG5cbiAgdGhpcy5lcnIgICAgPSAwOyAgICAgIC8vIGVycm9yIGNvZGUsIGlmIGhhcHBlbnMgKDAgPSBaX09LKVxuICB0aGlzLm1zZyAgICA9ICcnOyAgICAgLy8gZXJyb3IgbWVzc2FnZVxuICB0aGlzLmVuZGVkICA9IGZhbHNlOyAgLy8gdXNlZCB0byBhdm9pZCBtdWx0aXBsZSBvbkVuZCgpIGNhbGxzXG4gIHRoaXMuY2h1bmtzID0gW107ICAgICAvLyBjaHVua3Mgb2YgY29tcHJlc3NlZCBkYXRhXG5cbiAgdGhpcy5zdHJtID0gbmV3IHpzdHJlYW0oKTtcbiAgdGhpcy5zdHJtLmF2YWlsX291dCA9IDA7XG5cbiAgdmFyIHN0YXR1cyA9IHpsaWJfZGVmbGF0ZS5kZWZsYXRlSW5pdDIoXG4gICAgdGhpcy5zdHJtLFxuICAgIG9wdC5sZXZlbCxcbiAgICBvcHQubWV0aG9kLFxuICAgIG9wdC53aW5kb3dCaXRzLFxuICAgIG9wdC5tZW1MZXZlbCxcbiAgICBvcHQuc3RyYXRlZ3lcbiAgKTtcblxuICBpZiAoc3RhdHVzICE9PSBaX09LKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1zZ1tzdGF0dXNdKTtcbiAgfVxuXG4gIGlmIChvcHQuaGVhZGVyKSB7XG4gICAgemxpYl9kZWZsYXRlLmRlZmxhdGVTZXRIZWFkZXIodGhpcy5zdHJtLCBvcHQuaGVhZGVyKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEZWZsYXRlI3B1c2goZGF0YVssIG1vZGVdKSAtPiBCb29sZWFuXG4gKiAtIGRhdGEgKFVpbnQ4QXJyYXl8QXJyYXl8U3RyaW5nKTogaW5wdXQgZGF0YS4gU3RyaW5ncyB3aWxsIGJlIGNvbnZlcnRlZCB0b1xuICogICB1dGY4IGJ5dGUgc2VxdWVuY2UuXG4gKiAtIG1vZGUgKE51bWJlcnxCb29sZWFuKTogMC4uNiBmb3IgY29ycmVzcG9uZGluZyBaX05PX0ZMVVNILi5aX1RSRUUgbW9kZXMuXG4gKiAgIFNlZSBjb25zdGFudHMuIFNraXBwZWQgb3IgYGZhbHNlYCBtZWFucyBaX05PX0ZMVVNILCBgdHJ1ZWAgbWVhbnNoIFpfRklOSVNILlxuICpcbiAqIFNlbmRzIGlucHV0IGRhdGEgdG8gZGVmbGF0ZSBwaXBlLCBnZW5lcmF0aW5nIFtbRGVmbGF0ZSNvbkRhdGFdXSBjYWxscyB3aXRoXG4gKiBuZXcgY29tcHJlc3NlZCBjaHVua3MuIFJldHVybnMgYHRydWVgIG9uIHN1Y2Nlc3MuIFRoZSBsYXN0IGRhdGEgYmxvY2sgbXVzdCBoYXZlXG4gKiBtb2RlIFpfRklOSVNIIChvciBgdHJ1ZWApLiBUaGF0IGZsdXNoIGludGVybmFsIHBlbmRpbmcgYnVmZmVycyBhbmQgY2FsbFxuICogW1tEZWZsYXRlI29uRW5kXV0uXG4gKlxuICogT24gZmFpbCBjYWxsIFtbRGVmbGF0ZSNvbkVuZF1dIHdpdGggZXJyb3IgY29kZSBhbmQgcmV0dXJuIGZhbHNlLlxuICpcbiAqIFdlIHN0cm9uZ2x5IHJlY29tbWVuZCB0byB1c2UgYFVpbnQ4QXJyYXlgIG9uIGlucHV0IGZvciBiZXN0IHNwZWVkIChvdXRwdXRcbiAqIGFycmF5IGZvcm1hdCBpcyBkZXRlY3RlZCBhdXRvbWF0aWNhbGx5KS4gQWxzbywgZG9uJ3Qgc2tpcCBsYXN0IHBhcmFtIGFuZCBhbHdheXNcbiAqIHVzZSB0aGUgc2FtZSB0eXBlIGluIHlvdXIgY29kZSAoYm9vbGVhbiBvciBudW1iZXIpLiBUaGF0IHdpbGwgaW1wcm92ZSBKUyBzcGVlZC5cbiAqXG4gKiBGb3IgcmVndWxhciBgQXJyYXlgLXMgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgWzAuLjI1NV0uXG4gKlxuICogIyMjIyMgRXhhbXBsZVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHB1c2goY2h1bmssIGZhbHNlKTsgLy8gcHVzaCBvbmUgb2YgZGF0YSBjaHVua3NcbiAqIC4uLlxuICogcHVzaChjaHVuaywgdHJ1ZSk7ICAvLyBwdXNoIGxhc3QgY2h1bmtcbiAqIGBgYFxuICoqL1xuRGVmbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKGRhdGEsIG1vZGUpIHtcbiAgdmFyIHN0cm0gPSB0aGlzLnN0cm07XG4gIHZhciBjaHVua1NpemUgPSB0aGlzLm9wdGlvbnMuY2h1bmtTaXplO1xuICB2YXIgc3RhdHVzLCBfbW9kZTtcblxuICBpZiAodGhpcy5lbmRlZCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBfbW9kZSA9IChtb2RlID09PSB+fm1vZGUpID8gbW9kZSA6ICgobW9kZSA9PT0gdHJ1ZSkgPyBaX0ZJTklTSCA6IFpfTk9fRkxVU0gpO1xuXG4gIC8vIENvbnZlcnQgZGF0YSBpZiBuZWVkZWRcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgIC8vIElmIHdlIG5lZWQgdG8gY29tcHJlc3MgdGV4dCwgY2hhbmdlIGVuY29kaW5nIHRvIHV0ZjguXG4gICAgc3RybS5pbnB1dCA9IHN0cmluZ3Muc3RyaW5nMmJ1ZihkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHJtLmlucHV0ID0gZGF0YTtcbiAgfVxuXG4gIHN0cm0ubmV4dF9pbiA9IDA7XG4gIHN0cm0uYXZhaWxfaW4gPSBzdHJtLmlucHV0Lmxlbmd0aDtcblxuICBkbyB7XG4gICAgaWYgKHN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICBzdHJtLm91dHB1dCA9IG5ldyB1dGlscy5CdWY4KGNodW5rU2l6ZSk7XG4gICAgICBzdHJtLm5leHRfb3V0ID0gMDtcbiAgICAgIHN0cm0uYXZhaWxfb3V0ID0gY2h1bmtTaXplO1xuICAgIH1cbiAgICBzdGF0dXMgPSB6bGliX2RlZmxhdGUuZGVmbGF0ZShzdHJtLCBfbW9kZSk7ICAgIC8qIG5vIGJhZCByZXR1cm4gdmFsdWUgKi9cblxuICAgIGlmIChzdGF0dXMgIT09IFpfU1RSRUFNX0VORCAmJiBzdGF0dXMgIT09IFpfT0spIHtcbiAgICAgIHRoaXMub25FbmQoc3RhdHVzKTtcbiAgICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoc3RybS5hdmFpbF9vdXQgPT09IDAgfHwgKHN0cm0uYXZhaWxfaW4gPT09IDAgJiYgX21vZGUgPT09IFpfRklOSVNIKSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy50byA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5vbkRhdGEoc3RyaW5ncy5idWYyYmluc3RyaW5nKHV0aWxzLnNocmlua0J1ZihzdHJtLm91dHB1dCwgc3RybS5uZXh0X291dCkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub25EYXRhKHV0aWxzLnNocmlua0J1ZihzdHJtLm91dHB1dCwgc3RybS5uZXh0X291dCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSB3aGlsZSAoKHN0cm0uYXZhaWxfaW4gPiAwIHx8IHN0cm0uYXZhaWxfb3V0ID09PSAwKSAmJiBzdGF0dXMgIT09IFpfU1RSRUFNX0VORCk7XG5cbiAgLy8gRmluYWxpemUgb24gdGhlIGxhc3QgY2h1bmsuXG4gIGlmIChfbW9kZSA9PT0gWl9GSU5JU0gpIHtcbiAgICBzdGF0dXMgPSB6bGliX2RlZmxhdGUuZGVmbGF0ZUVuZCh0aGlzLnN0cm0pO1xuICAgIHRoaXMub25FbmQoc3RhdHVzKTtcbiAgICB0aGlzLmVuZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gc3RhdHVzID09PSBaX09LO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5cbi8qKlxuICogRGVmbGF0ZSNvbkRhdGEoY2h1bmspIC0+IFZvaWRcbiAqIC0gY2h1bmsgKFVpbnQ4QXJyYXl8QXJyYXl8U3RyaW5nKTogb3VwdXQgZGF0YS4gVHlwZSBvZiBhcnJheSBkZXBlbmRzXG4gKiAgIG9uIGpzIGVuZ2luZSBzdXBwb3J0LiBXaGVuIHN0cmluZyBvdXRwdXQgcmVxdWVzdGVkLCBlYWNoIGNodW5rXG4gKiAgIHdpbGwgYmUgc3RyaW5nLlxuICpcbiAqIEJ5IGRlZmF1bHQsIHN0b3JlcyBkYXRhIGJsb2NrcyBpbiBgY2h1bmtzW11gIHByb3BlcnR5IGFuZCBnbHVlXG4gKiB0aG9zZSBpbiBgb25FbmRgLiBPdmVycmlkZSB0aGlzIGhhbmRsZXIsIGlmIHlvdSBuZWVkIGFub3RoZXIgYmVoYXZpb3VyLlxuICoqL1xuRGVmbGF0ZS5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24oY2h1bmspIHtcbiAgdGhpcy5jaHVua3MucHVzaChjaHVuayk7XG59O1xuXG5cbi8qKlxuICogRGVmbGF0ZSNvbkVuZChzdGF0dXMpIC0+IFZvaWRcbiAqIC0gc3RhdHVzIChOdW1iZXIpOiBkZWZsYXRlIHN0YXR1cy4gMCAoWl9PSykgb24gc3VjY2VzcyxcbiAqICAgb3RoZXIgaWYgbm90LlxuICpcbiAqIENhbGxlZCBvbmNlIGFmdGVyIHlvdSB0ZWxsIGRlZmxhdGUgdGhhdCBpbnB1dCBzdHJlYW0gY29tcGxldGVcbiAqIG9yIGVycm9yIGhhcHBlbm5lZC4gQnkgZGVmYXVsdCAtIGpvaW4gY29sbGVjdGVkIGNodW5rcyxcbiAqIGZyZWUgbWVtb3J5IGFuZCBmaWxsIGByZXN1bHRzYCAvIGBlcnJgIHByb3BlcnRpZXMuXG4gKiovXG5EZWZsYXRlLnByb3RvdHlwZS5vbkVuZCA9IGZ1bmN0aW9uKHN0YXR1cykge1xuICAvLyBPbiBzdWNjZXNzIC0gam9pblxuICBpZiAoc3RhdHVzID09PSBaX09LKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50byA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMucmVzdWx0ID0gdGhpcy5jaHVua3Muam9pbignJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzdWx0ID0gdXRpbHMuZmxhdHRlbkNodW5rcyh0aGlzLmNodW5rcyk7XG4gICAgfVxuICB9XG4gIHRoaXMuY2h1bmtzID0gW107XG4gIHRoaXMuZXJyID0gc3RhdHVzO1xuICB0aGlzLm1zZyA9IHRoaXMuc3RybS5tc2c7XG59O1xuXG5cbi8qKlxuICogZGVmbGF0ZShkYXRhWywgb3B0aW9uc10pIC0+IFVpbnQ4QXJyYXl8QXJyYXl8U3RyaW5nXG4gKiAtIGRhdGEgKFVpbnQ4QXJyYXl8QXJyYXl8U3RyaW5nKTogaW5wdXQgZGF0YSB0byBjb21wcmVzcy5cbiAqIC0gb3B0aW9ucyAoT2JqZWN0KTogemxpYiBkZWZsYXRlIG9wdGlvbnMuXG4gKlxuICogQ29tcHJlc3MgYGRhdGFgIHdpdGggZGVmbGF0ZSBhbHJvcnl0aG0gYW5kIGBvcHRpb25zYC5cbiAqXG4gKiBTdXBwb3J0ZWQgb3B0aW9ucyBhcmU6XG4gKlxuICogLSBsZXZlbFxuICogLSB3aW5kb3dCaXRzXG4gKiAtIG1lbUxldmVsXG4gKiAtIHN0cmF0ZWd5XG4gKlxuICogW2h0dHA6Ly96bGliLm5ldC9tYW51YWwuaHRtbCNBZHZhbmNlZF0oaHR0cDovL3psaWIubmV0L21hbnVhbC5odG1sI0FkdmFuY2VkKVxuICogZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlc2UuXG4gKlxuICogU3VnYXIgKG9wdGlvbnMpOlxuICpcbiAqIC0gYHJhd2AgKEJvb2xlYW4pIC0gc2F5IHRoYXQgd2Ugd29yayB3aXRoIHJhdyBzdHJlYW0sIGlmIHlvdSBkb24ndCB3aXNoIHRvIHNwZWNpZnlcbiAqICAgbmVnYXRpdmUgd2luZG93Qml0cyBpbXBsaWNpdGx5LlxuICogLSBgdG9gIChTdHJpbmcpIC0gaWYgZXF1YWwgdG8gJ3N0cmluZycsIHRoZW4gcmVzdWx0IHdpbGwgYmUgXCJiaW5hcnkgc3RyaW5nXCJcbiAqICAgIChlYWNoIGNoYXIgY29kZSBbMC4uMjU1XSlcbiAqXG4gKiAjIyMjIyBFeGFtcGxlOlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBwYWtvID0gcmVxdWlyZSgncGFrbycpXG4gKiAgICwgZGF0YSA9IFVpbnQ4QXJyYXkoWzEsMiwzLDQsNSw2LDcsOCw5XSk7XG4gKlxuICogY29uc29sZS5sb2cocGFrby5kZWZsYXRlKGRhdGEpKTtcbiAqIGBgYFxuICoqL1xuZnVuY3Rpb24gZGVmbGF0ZShpbnB1dCwgb3B0aW9ucykge1xuICB2YXIgZGVmbGF0b3IgPSBuZXcgRGVmbGF0ZShvcHRpb25zKTtcblxuICBkZWZsYXRvci5wdXNoKGlucHV0LCB0cnVlKTtcblxuICAvLyBUaGF0IHdpbGwgbmV2ZXIgaGFwcGVucywgaWYgeW91IGRvbid0IGNoZWF0IHdpdGggb3B0aW9ucyA6KVxuICBpZiAoZGVmbGF0b3IuZXJyKSB7IHRocm93IGRlZmxhdG9yLm1zZzsgfVxuXG4gIHJldHVybiBkZWZsYXRvci5yZXN1bHQ7XG59XG5cblxuLyoqXG4gKiBkZWZsYXRlUmF3KGRhdGFbLCBvcHRpb25zXSkgLT4gVWludDhBcnJheXxBcnJheXxTdHJpbmdcbiAqIC0gZGF0YSAoVWludDhBcnJheXxBcnJheXxTdHJpbmcpOiBpbnB1dCBkYXRhIHRvIGNvbXByZXNzLlxuICogLSBvcHRpb25zIChPYmplY3QpOiB6bGliIGRlZmxhdGUgb3B0aW9ucy5cbiAqXG4gKiBUaGUgc2FtZSBhcyBbW2RlZmxhdGVdXSwgYnV0IGNyZWF0ZXMgcmF3IGRhdGEsIHdpdGhvdXQgd3JhcHBlclxuICogKGhlYWRlciBhbmQgYWRsZXIzMiBjcmMpLlxuICoqL1xuZnVuY3Rpb24gZGVmbGF0ZVJhdyhpbnB1dCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgb3B0aW9ucy5yYXcgPSB0cnVlO1xuICByZXR1cm4gZGVmbGF0ZShpbnB1dCwgb3B0aW9ucyk7XG59XG5cblxuLyoqXG4gKiBnemlwKGRhdGFbLCBvcHRpb25zXSkgLT4gVWludDhBcnJheXxBcnJheXxTdHJpbmdcbiAqIC0gZGF0YSAoVWludDhBcnJheXxBcnJheXxTdHJpbmcpOiBpbnB1dCBkYXRhIHRvIGNvbXByZXNzLlxuICogLSBvcHRpb25zIChPYmplY3QpOiB6bGliIGRlZmxhdGUgb3B0aW9ucy5cbiAqXG4gKiBUaGUgc2FtZSBhcyBbW2RlZmxhdGVdXSwgYnV0IGNyZWF0ZSBnemlwIHdyYXBwZXIgaW5zdGVhZCBvZlxuICogZGVmbGF0ZSBvbmUuXG4gKiovXG5mdW5jdGlvbiBnemlwKGlucHV0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBvcHRpb25zLmd6aXAgPSB0cnVlO1xuICByZXR1cm4gZGVmbGF0ZShpbnB1dCwgb3B0aW9ucyk7XG59XG5cblxuZXhwb3J0cy5EZWZsYXRlID0gRGVmbGF0ZTtcbmV4cG9ydHMuZGVmbGF0ZSA9IGRlZmxhdGU7XG5leHBvcnRzLmRlZmxhdGVSYXcgPSBkZWZsYXRlUmF3O1xuZXhwb3J0cy5nemlwID0gZ3ppcDsiLCIndXNlIHN0cmljdCc7XG5cblxudmFyIHpsaWJfaW5mbGF0ZSA9IHJlcXVpcmUoJy4vemxpYi9pbmZsYXRlLmpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL2NvbW1vbicpO1xudmFyIHN0cmluZ3MgPSByZXF1aXJlKCcuL3V0aWxzL3N0cmluZ3MnKTtcbnZhciBjID0gcmVxdWlyZSgnLi96bGliL2NvbnN0YW50cycpO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vemxpYi9tZXNzYWdlcycpO1xudmFyIHpzdHJlYW0gPSByZXF1aXJlKCcuL3psaWIvenN0cmVhbScpO1xudmFyIGd6aGVhZGVyID0gcmVxdWlyZSgnLi96bGliL2d6aGVhZGVyJyk7XG5cblxuLyoqXG4gKiBjbGFzcyBJbmZsYXRlXG4gKlxuICogR2VuZXJpYyBKUy1zdHlsZSB3cmFwcGVyIGZvciB6bGliIGNhbGxzLiBJZiB5b3UgZG9uJ3QgbmVlZFxuICogc3RyZWFtaW5nIGJlaGF2aW91ciAtIHVzZSBtb3JlIHNpbXBsZSBmdW5jdGlvbnM6IFtbaW5mbGF0ZV1dXG4gKiBhbmQgW1tpbmZsYXRlUmF3XV0uXG4gKiovXG5cbi8qIGludGVybmFsXG4gKiBpbmZsYXRlLmNodW5rcyAtPiBBcnJheVxuICpcbiAqIENodW5rcyBvZiBvdXRwdXQgZGF0YSwgaWYgW1tJbmZsYXRlI29uRGF0YV1dIG5vdCBvdmVycmlkZW4uXG4gKiovXG5cbi8qKlxuICogSW5mbGF0ZS5yZXN1bHQgLT4gVWludDhBcnJheXxBcnJheXxTdHJpbmdcbiAqXG4gKiBVbmNvbXByZXNzZWQgcmVzdWx0LCBnZW5lcmF0ZWQgYnkgZGVmYXVsdCBbW0luZmxhdGUjb25EYXRhXV1cbiAqIGFuZCBbW0luZmxhdGUjb25FbmRdXSBoYW5kbGVycy4gRmlsbGVkIGFmdGVyIHlvdSBwdXNoIGxhc3QgY2h1bmtcbiAqIChjYWxsIFtbSW5mbGF0ZSNwdXNoXV0gd2l0aCBgWl9GSU5JU0hgIC8gYHRydWVgIHBhcmFtKS5cbiAqKi9cblxuLyoqXG4gKiBJbmZsYXRlLmVyciAtPiBOdW1iZXJcbiAqXG4gKiBFcnJvciBjb2RlIGFmdGVyIGluZmxhdGUgZmluaXNoZWQuIDAgKFpfT0spIG9uIHN1Y2Nlc3MuXG4gKiBTaG91bGQgYmUgY2hlY2tlZCBpZiBicm9rZW4gZGF0YSBwb3NzaWJsZS5cbiAqKi9cblxuLyoqXG4gKiBJbmZsYXRlLm1zZyAtPiBTdHJpbmdcbiAqXG4gKiBFcnJvciBtZXNzYWdlLCBpZiBbW0luZmxhdGUuZXJyXV0gIT0gMFxuICoqL1xuXG5cbi8qKlxuICogbmV3IEluZmxhdGUob3B0aW9ucylcbiAqIC0gb3B0aW9ucyAoT2JqZWN0KTogemxpYiBpbmZsYXRlIG9wdGlvbnMuXG4gKlxuICogQ3JlYXRlcyBuZXcgaW5mbGF0b3IgaW5zdGFuY2Ugd2l0aCBzcGVjaWZpZWQgcGFyYW1zLiBUaHJvd3MgZXhjZXB0aW9uXG4gKiBvbiBiYWQgcGFyYW1zLiBTdXBwb3J0ZWQgb3B0aW9uczpcbiAqXG4gKiAtIGB3aW5kb3dCaXRzYFxuICpcbiAqIFtodHRwOi8vemxpYi5uZXQvbWFudWFsLmh0bWwjQWR2YW5jZWRdKGh0dHA6Ly96bGliLm5ldC9tYW51YWwuaHRtbCNBZHZhbmNlZClcbiAqIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZXNlLlxuICpcbiAqIEFkZGl0aW9uYWwgb3B0aW9ucywgZm9yIGludGVybmFsIG5lZWRzOlxuICpcbiAqIC0gYGNodW5rU2l6ZWAgLSBzaXplIG9mIGdlbmVyYXRlZCBkYXRhIGNodW5rcyAoMTZLIGJ5IGRlZmF1bHQpXG4gKiAtIGByYXdgIChCb29sZWFuKSAtIGRvIHJhdyBpbmZsYXRlXG4gKiAtIGB0b2AgKFN0cmluZykgLSBpZiBlcXVhbCB0byAnc3RyaW5nJywgdGhlbiByZXN1bHQgd2lsbCBiZSBjb252ZXJ0ZWRcbiAqICAgZnJvbSB1dGY4IHRvIHV0ZjE2IChqYXZhc2NyaXB0KSBzdHJpbmcuIFdoZW4gc3RyaW5nIG91dHB1dCByZXF1ZXN0ZWQsXG4gKiAgIGNodW5rIGxlbmd0aCBjYW4gZGlmZmVyIGZyb20gYGNodW5rU2l6ZWAsIGRlcGVuZGluZyBvbiBjb250ZW50LlxuICpcbiAqIEJ5IGRlZmF1bHQsIHdoZW4gbm8gb3B0aW9ucyBzZXQsIGF1dG9kZXRlY3QgZGVmbGF0ZS9nemlwIGRhdGEgZm9ybWF0IHZpYVxuICogd3JhcHBlciBoZWFkZXIuXG4gKlxuICogIyMjIyMgRXhhbXBsZTpcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgcGFrbyA9IHJlcXVpcmUoJ3Bha28nKVxuICogICAsIGNodW5rMSA9IFVpbnQ4QXJyYXkoWzEsMiwzLDQsNSw2LDcsOCw5XSlcbiAqICAgLCBjaHVuazIgPSBVaW50OEFycmF5KFsxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOV0pO1xuICpcbiAqIHZhciBpbmZsYXRlID0gbmV3IHBha28uSW5mbGF0ZSh7IGxldmVsOiAzfSk7XG4gKlxuICogaW5mbGF0ZS5wdXNoKGNodW5rMSwgZmFsc2UpO1xuICogaW5mbGF0ZS5wdXNoKGNodW5rMiwgdHJ1ZSk7ICAvLyB0cnVlIC0+IGxhc3QgY2h1bmtcbiAqXG4gKiBpZiAoaW5mbGF0ZS5lcnIpIHsgdGhyb3cgbmV3IEVycm9yKGluZmxhdGUuZXJyKTsgfVxuICpcbiAqIGNvbnNvbGUubG9nKGluZmxhdGUucmVzdWx0KTtcbiAqIGBgYFxuICoqL1xudmFyIEluZmxhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgdGhpcy5vcHRpb25zID0gdXRpbHMuYXNzaWduKHtcbiAgICBjaHVua1NpemU6IDE2Mzg0LFxuICAgIHdpbmRvd0JpdHM6IDAsXG4gICAgdG86ICcnXG4gIH0sIG9wdGlvbnMgfHwge30pO1xuXG4gIHZhciBvcHQgPSB0aGlzLm9wdGlvbnM7XG5cbiAgLy8gRm9yY2Ugd2luZG93IHNpemUgZm9yIGByYXdgIGRhdGEsIGlmIG5vdCBzZXQgZGlyZWN0bHksXG4gIC8vIGJlY2F1c2Ugd2UgaGF2ZSBubyBoZWFkZXIgZm9yIGF1dG9kZXRlY3QuXG4gIGlmIChvcHQucmF3ICYmIChvcHQud2luZG93Qml0cyA+PSAwKSAmJiAob3B0LndpbmRvd0JpdHMgPCAxNikpIHtcbiAgICBvcHQud2luZG93Qml0cyA9IC1vcHQud2luZG93Qml0cztcbiAgICBpZiAob3B0LndpbmRvd0JpdHMgPT09IDApIHsgb3B0LndpbmRvd0JpdHMgPSAtMTU7IH1cbiAgfVxuXG4gIC8vIElmIGB3aW5kb3dCaXRzYCBub3QgZGVmaW5lZCAoYW5kIG1vZGUgbm90IHJhdykgLSBzZXQgYXV0b2RldGVjdCBmbGFnIGZvciBnemlwL2RlZmxhdGVcbiAgaWYgKChvcHQud2luZG93Qml0cyA+PSAwKSAmJiAob3B0LndpbmRvd0JpdHMgPCAxNikgJiZcbiAgICAgICEob3B0aW9ucyAmJiBvcHRpb25zLndpbmRvd0JpdHMpKSB7XG4gICAgb3B0LndpbmRvd0JpdHMgKz0gMzI7XG4gIH1cblxuICAvLyBHemlwIGhlYWRlciBoYXMgbm8gaW5mbyBhYm91dCB3aW5kb3dzIHNpemUsIHdlIGNhbiBkbyBhdXRvZGV0ZWN0IG9ubHlcbiAgLy8gZm9yIGRlZmxhdGUuIFNvLCBpZiB3aW5kb3cgc2l6ZSBub3Qgc2V0LCBmb3JjZSBpdCB0byBtYXggd2hlbiBnemlwIHBvc3NpYmxlXG4gIGlmICgob3B0LndpbmRvd0JpdHMgPiAxNSkgJiYgKG9wdC53aW5kb3dCaXRzIDwgNDgpKSB7XG4gICAgLy8gYml0IDMgKDE2KSAtPiBnemlwcGVkIGRhdGFcbiAgICAvLyBiaXQgNCAoMzIpIC0+IGF1dG9kZXRlY3QgZ3ppcC9kZWZsYXRlXG4gICAgaWYgKChvcHQud2luZG93Qml0cyAmIDE1KSA9PT0gMCkge1xuICAgICAgb3B0LndpbmRvd0JpdHMgfD0gMTU7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5lcnIgICAgPSAwOyAgICAgIC8vIGVycm9yIGNvZGUsIGlmIGhhcHBlbnMgKDAgPSBaX09LKVxuICB0aGlzLm1zZyAgICA9ICcnOyAgICAgLy8gZXJyb3IgbWVzc2FnZVxuICB0aGlzLmVuZGVkICA9IGZhbHNlOyAgLy8gdXNlZCB0byBhdm9pZCBtdWx0aXBsZSBvbkVuZCgpIGNhbGxzXG4gIHRoaXMuY2h1bmtzID0gW107ICAgICAvLyBjaHVua3Mgb2YgY29tcHJlc3NlZCBkYXRhXG5cbiAgdGhpcy5zdHJtICAgPSBuZXcgenN0cmVhbSgpO1xuICB0aGlzLnN0cm0uYXZhaWxfb3V0ID0gMDtcblxuICB2YXIgc3RhdHVzICA9IHpsaWJfaW5mbGF0ZS5pbmZsYXRlSW5pdDIoXG4gICAgdGhpcy5zdHJtLFxuICAgIG9wdC53aW5kb3dCaXRzXG4gICk7XG5cbiAgaWYgKHN0YXR1cyAhPT0gYy5aX09LKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1zZ1tzdGF0dXNdKTtcbiAgfVxuXG4gIHRoaXMuaGVhZGVyID0gbmV3IGd6aGVhZGVyKCk7XG5cbiAgemxpYl9pbmZsYXRlLmluZmxhdGVHZXRIZWFkZXIodGhpcy5zdHJtLCB0aGlzLmhlYWRlcik7XG59O1xuXG4vKipcbiAqIEluZmxhdGUjcHVzaChkYXRhWywgbW9kZV0pIC0+IEJvb2xlYW5cbiAqIC0gZGF0YSAoVWludDhBcnJheXxBcnJheXxTdHJpbmcpOiBpbnB1dCBkYXRhXG4gKiAtIG1vZGUgKE51bWJlcnxCb29sZWFuKTogMC4uNiBmb3IgY29ycmVzcG9uZGluZyBaX05PX0ZMVVNILi5aX1RSRUUgbW9kZXMuXG4gKiAgIFNlZSBjb25zdGFudHMuIFNraXBwZWQgb3IgYGZhbHNlYCBtZWFucyBaX05PX0ZMVVNILCBgdHJ1ZWAgbWVhbnNoIFpfRklOSVNILlxuICpcbiAqIFNlbmRzIGlucHV0IGRhdGEgdG8gaW5mbGF0ZSBwaXBlLCBnZW5lcmF0aW5nIFtbSW5mbGF0ZSNvbkRhdGFdXSBjYWxscyB3aXRoXG4gKiBuZXcgb3V0cHV0IGNodW5rcy4gUmV0dXJucyBgdHJ1ZWAgb24gc3VjY2Vzcy4gVGhlIGxhc3QgZGF0YSBibG9jayBtdXN0IGhhdmVcbiAqIG1vZGUgWl9GSU5JU0ggKG9yIGB0cnVlYCkuIFRoYXQgZmx1c2ggaW50ZXJuYWwgcGVuZGluZyBidWZmZXJzIGFuZCBjYWxsXG4gKiBbW0luZmxhdGUjb25FbmRdXS5cbiAqXG4gKiBPbiBmYWlsIGNhbGwgW1tJbmZsYXRlI29uRW5kXV0gd2l0aCBlcnJvciBjb2RlIGFuZCByZXR1cm4gZmFsc2UuXG4gKlxuICogV2Ugc3Ryb25nbHkgcmVjb21tZW5kIHRvIHVzZSBgVWludDhBcnJheWAgb24gaW5wdXQgZm9yIGJlc3Qgc3BlZWQgKG91dHB1dFxuICogZm9ybWF0IGlzIGRldGVjdGVkIGF1dG9tYXRpY2FsbHkpLiBBbHNvLCBkb24ndCBza2lwIGxhc3QgcGFyYW0gYW5kIGFsd2F5c1xuICogdXNlIHRoZSBzYW1lIHR5cGUgaW4geW91ciBjb2RlIChib29sZWFuIG9yIG51bWJlcikuIFRoYXQgd2lsbCBpbXByb3ZlIEpTIHNwZWVkLlxuICpcbiAqIEZvciByZWd1bGFyIGBBcnJheWAtcyBtYWtlIHN1cmUgYWxsIGVsZW1lbnRzIGFyZSBbMC4uMjU1XS5cbiAqXG4gKiAjIyMjIyBFeGFtcGxlXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogcHVzaChjaHVuaywgZmFsc2UpOyAvLyBwdXNoIG9uZSBvZiBkYXRhIGNodW5rc1xuICogLi4uXG4gKiBwdXNoKGNodW5rLCB0cnVlKTsgIC8vIHB1c2ggbGFzdCBjaHVua1xuICogYGBgXG4gKiovXG5JbmZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oZGF0YSwgbW9kZSkge1xuICB2YXIgc3RybSA9IHRoaXMuc3RybTtcbiAgdmFyIGNodW5rU2l6ZSA9IHRoaXMub3B0aW9ucy5jaHVua1NpemU7XG4gIHZhciBzdGF0dXMsIF9tb2RlO1xuICB2YXIgbmV4dF9vdXRfdXRmOCwgdGFpbCwgdXRmOHN0cjtcblxuICBpZiAodGhpcy5lbmRlZCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgX21vZGUgPSAobW9kZSA9PT0gfn5tb2RlKSA/IG1vZGUgOiAoKG1vZGUgPT09IHRydWUpID8gYy5aX0ZJTklTSCA6IGMuWl9OT19GTFVTSCk7XG5cbiAgLy8gQ29udmVydCBkYXRhIGlmIG5lZWRlZFxuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gT25seSBiaW5hcnkgc3RyaW5ncyBjYW4gYmUgZGVjb21wcmVzc2VkIG9uIHByYWN0aWNlXG4gICAgc3RybS5pbnB1dCA9IHN0cmluZ3MuYmluc3RyaW5nMmJ1ZihkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHJtLmlucHV0ID0gZGF0YTtcbiAgfVxuXG4gIHN0cm0ubmV4dF9pbiA9IDA7XG4gIHN0cm0uYXZhaWxfaW4gPSBzdHJtLmlucHV0Lmxlbmd0aDtcblxuICBkbyB7XG4gICAgaWYgKHN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICBzdHJtLm91dHB1dCA9IG5ldyB1dGlscy5CdWY4KGNodW5rU2l6ZSk7XG4gICAgICBzdHJtLm5leHRfb3V0ID0gMDtcbiAgICAgIHN0cm0uYXZhaWxfb3V0ID0gY2h1bmtTaXplO1xuICAgIH1cblxuICAgIHN0YXR1cyA9IHpsaWJfaW5mbGF0ZS5pbmZsYXRlKHN0cm0sIGMuWl9OT19GTFVTSCk7ICAgIC8qIG5vIGJhZCByZXR1cm4gdmFsdWUgKi9cblxuICAgIGlmIChzdGF0dXMgIT09IGMuWl9TVFJFQU1fRU5EICYmIHN0YXR1cyAhPT0gYy5aX09LKSB7XG4gICAgICB0aGlzLm9uRW5kKHN0YXR1cyk7XG4gICAgICB0aGlzLmVuZGVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc3RybS5uZXh0X291dCkge1xuICAgICAgaWYgKHN0cm0uYXZhaWxfb3V0ID09PSAwIHx8IHN0YXR1cyA9PT0gYy5aX1NUUkVBTV9FTkQgfHwgKHN0cm0uYXZhaWxfaW4gPT09IDAgJiYgX21vZGUgPT09IGMuWl9GSU5JU0gpKSB7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50byA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICAgIG5leHRfb3V0X3V0ZjggPSBzdHJpbmdzLnV0Zjhib3JkZXIoc3RybS5vdXRwdXQsIHN0cm0ubmV4dF9vdXQpO1xuXG4gICAgICAgICAgdGFpbCA9IHN0cm0ubmV4dF9vdXQgLSBuZXh0X291dF91dGY4O1xuICAgICAgICAgIHV0ZjhzdHIgPSBzdHJpbmdzLmJ1ZjJzdHJpbmcoc3RybS5vdXRwdXQsIG5leHRfb3V0X3V0ZjgpO1xuXG4gICAgICAgICAgLy8gbW92ZSB0YWlsXG4gICAgICAgICAgc3RybS5uZXh0X291dCA9IHRhaWw7XG4gICAgICAgICAgc3RybS5hdmFpbF9vdXQgPSBjaHVua1NpemUgLSB0YWlsO1xuICAgICAgICAgIGlmICh0YWlsKSB7IHV0aWxzLmFycmF5U2V0KHN0cm0ub3V0cHV0LCBzdHJtLm91dHB1dCwgbmV4dF9vdXRfdXRmOCwgdGFpbCwgMCk7IH1cblxuICAgICAgICAgIHRoaXMub25EYXRhKHV0ZjhzdHIpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vbkRhdGEodXRpbHMuc2hyaW5rQnVmKHN0cm0ub3V0cHV0LCBzdHJtLm5leHRfb3V0KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gd2hpbGUgKChzdHJtLmF2YWlsX2luID4gMCkgJiYgc3RhdHVzICE9PSBjLlpfU1RSRUFNX0VORCk7XG5cbiAgaWYgKHN0YXR1cyA9PT0gYy5aX1NUUkVBTV9FTkQpIHtcbiAgICBfbW9kZSA9IGMuWl9GSU5JU0g7XG4gIH1cbiAgLy8gRmluYWxpemUgb24gdGhlIGxhc3QgY2h1bmsuXG4gIGlmIChfbW9kZSA9PT0gYy5aX0ZJTklTSCkge1xuICAgIHN0YXR1cyA9IHpsaWJfaW5mbGF0ZS5pbmZsYXRlRW5kKHRoaXMuc3RybSk7XG4gICAgdGhpcy5vbkVuZChzdGF0dXMpO1xuICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgIHJldHVybiBzdGF0dXMgPT09IGMuWl9PSztcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuXG4vKipcbiAqIEluZmxhdGUjb25EYXRhKGNodW5rKSAtPiBWb2lkXG4gKiAtIGNodW5rIChVaW50OEFycmF5fEFycmF5fFN0cmluZyk6IG91cHV0IGRhdGEuIFR5cGUgb2YgYXJyYXkgZGVwZW5kc1xuICogICBvbiBqcyBlbmdpbmUgc3VwcG9ydC4gV2hlbiBzdHJpbmcgb3V0cHV0IHJlcXVlc3RlZCwgZWFjaCBjaHVua1xuICogICB3aWxsIGJlIHN0cmluZy5cbiAqXG4gKiBCeSBkZWZhdWx0LCBzdG9yZXMgZGF0YSBibG9ja3MgaW4gYGNodW5rc1tdYCBwcm9wZXJ0eSBhbmQgZ2x1ZVxuICogdGhvc2UgaW4gYG9uRW5kYC4gT3ZlcnJpZGUgdGhpcyBoYW5kbGVyLCBpZiB5b3UgbmVlZCBhbm90aGVyIGJlaGF2aW91ci5cbiAqKi9cbkluZmxhdGUucHJvdG90eXBlLm9uRGF0YSA9IGZ1bmN0aW9uKGNodW5rKSB7XG4gIHRoaXMuY2h1bmtzLnB1c2goY2h1bmspO1xufTtcblxuXG4vKipcbiAqIEluZmxhdGUjb25FbmQoc3RhdHVzKSAtPiBWb2lkXG4gKiAtIHN0YXR1cyAoTnVtYmVyKTogaW5mbGF0ZSBzdGF0dXMuIDAgKFpfT0spIG9uIHN1Y2Nlc3MsXG4gKiAgIG90aGVyIGlmIG5vdC5cbiAqXG4gKiBDYWxsZWQgb25jZSBhZnRlciB5b3UgdGVsbCBpbmZsYXRlIHRoYXQgaW5wdXQgc3RyZWFtIGNvbXBsZXRlXG4gKiBvciBlcnJvciBoYXBwZW5uZWQuIEJ5IGRlZmF1bHQgLSBqb2luIGNvbGxlY3RlZCBjaHVua3MsXG4gKiBmcmVlIG1lbW9yeSBhbmQgZmlsbCBgcmVzdWx0c2AgLyBgZXJyYCBwcm9wZXJ0aWVzLlxuICoqL1xuSW5mbGF0ZS5wcm90b3R5cGUub25FbmQgPSBmdW5jdGlvbihzdGF0dXMpIHtcbiAgLy8gT24gc3VjY2VzcyAtIGpvaW5cbiAgaWYgKHN0YXR1cyA9PT0gYy5aX09LKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50byA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIEdsdWUgJiBjb252ZXJ0IGhlcmUsIHVudGlsIHdlIHRlYWNoIHBha28gdG8gc2VuZFxuICAgICAgLy8gdXRmOCBhbGxpZ25lZCBzdHJpbmdzIHRvIG9uRGF0YVxuICAgICAgdGhpcy5yZXN1bHQgPSB0aGlzLmNodW5rcy5qb2luKCcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZXN1bHQgPSB1dGlscy5mbGF0dGVuQ2h1bmtzKHRoaXMuY2h1bmtzKTtcbiAgICB9XG4gIH1cbiAgdGhpcy5jaHVua3MgPSBbXTtcbiAgdGhpcy5lcnIgPSBzdGF0dXM7XG4gIHRoaXMubXNnID0gdGhpcy5zdHJtLm1zZztcbn07XG5cblxuLyoqXG4gKiBpbmZsYXRlKGRhdGFbLCBvcHRpb25zXSkgLT4gVWludDhBcnJheXxBcnJheXxTdHJpbmdcbiAqIC0gZGF0YSAoVWludDhBcnJheXxBcnJheXxTdHJpbmcpOiBpbnB1dCBkYXRhIHRvIGRlY29tcHJlc3MuXG4gKiAtIG9wdGlvbnMgKE9iamVjdCk6IHpsaWIgaW5mbGF0ZSBvcHRpb25zLlxuICpcbiAqIERlY29tcHJlc3MgYGRhdGFgIHdpdGggaW5mbGF0ZS91bmd6aXAgYW5kIGBvcHRpb25zYC4gQXV0b2RldGVjdFxuICogZm9ybWF0IHZpYSB3cmFwcGVyIGhlYWRlciBieSBkZWZhdWx0LiBUaGF0J3Mgd2h5IHdlIGRvbid0IHByb3ZpZGVcbiAqIHNlcGFyYXRlIGB1bmd6aXBgIG1ldGhvZC5cbiAqXG4gKiBTdXBwb3J0ZWQgb3B0aW9ucyBhcmU6XG4gKlxuICogLSB3aW5kb3dCaXRzXG4gKlxuICogW2h0dHA6Ly96bGliLm5ldC9tYW51YWwuaHRtbCNBZHZhbmNlZF0oaHR0cDovL3psaWIubmV0L21hbnVhbC5odG1sI0FkdmFuY2VkKVxuICogZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogU3VnYXIgKG9wdGlvbnMpOlxuICpcbiAqIC0gYHJhd2AgKEJvb2xlYW4pIC0gc2F5IHRoYXQgd2Ugd29yayB3aXRoIHJhdyBzdHJlYW0sIGlmIHlvdSBkb24ndCB3aXNoIHRvIHNwZWNpZnlcbiAqICAgbmVnYXRpdmUgd2luZG93Qml0cyBpbXBsaWNpdGx5LlxuICogLSBgdG9gIChTdHJpbmcpIC0gaWYgZXF1YWwgdG8gJ3N0cmluZycsIHRoZW4gcmVzdWx0IHdpbGwgYmUgY29udmVydGVkXG4gKiAgIGZyb20gdXRmOCB0byB1dGYxNiAoamF2YXNjcmlwdCkgc3RyaW5nLiBXaGVuIHN0cmluZyBvdXRwdXQgcmVxdWVzdGVkLFxuICogICBjaHVuayBsZW5ndGggY2FuIGRpZmZlciBmcm9tIGBjaHVua1NpemVgLCBkZXBlbmRpbmcgb24gY29udGVudC5cbiAqXG4gKlxuICogIyMjIyMgRXhhbXBsZTpcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgcGFrbyA9IHJlcXVpcmUoJ3Bha28nKVxuICogICAsIGlucHV0ID0gcGFrby5kZWZsYXRlKFsxLDIsMyw0LDUsNiw3LDgsOV0pXG4gKiAgICwgb3V0cHV0O1xuICpcbiAqIHRyeSB7XG4gKiAgIG91dHB1dCA9IHBha28uaW5mbGF0ZShpbnB1dCk7XG4gKiB9IGNhdGNoIChlcnIpXG4gKiAgIGNvbnNvbGUubG9nKGVycik7XG4gKiB9XG4gKiBgYGBcbiAqKi9cbmZ1bmN0aW9uIGluZmxhdGUoaW5wdXQsIG9wdGlvbnMpIHtcbiAgdmFyIGluZmxhdG9yID0gbmV3IEluZmxhdGUob3B0aW9ucyk7XG5cbiAgaW5mbGF0b3IucHVzaChpbnB1dCwgdHJ1ZSk7XG5cbiAgLy8gVGhhdCB3aWxsIG5ldmVyIGhhcHBlbnMsIGlmIHlvdSBkb24ndCBjaGVhdCB3aXRoIG9wdGlvbnMgOilcbiAgaWYgKGluZmxhdG9yLmVycikgeyB0aHJvdyBpbmZsYXRvci5tc2c7IH1cblxuICByZXR1cm4gaW5mbGF0b3IucmVzdWx0O1xufVxuXG5cbi8qKlxuICogaW5mbGF0ZVJhdyhkYXRhWywgb3B0aW9uc10pIC0+IFVpbnQ4QXJyYXl8QXJyYXl8U3RyaW5nXG4gKiAtIGRhdGEgKFVpbnQ4QXJyYXl8QXJyYXl8U3RyaW5nKTogaW5wdXQgZGF0YSB0byBkZWNvbXByZXNzLlxuICogLSBvcHRpb25zIChPYmplY3QpOiB6bGliIGluZmxhdGUgb3B0aW9ucy5cbiAqXG4gKiBUaGUgc2FtZSBhcyBbW2luZmxhdGVdXSwgYnV0IGNyZWF0ZXMgcmF3IGRhdGEsIHdpdGhvdXQgd3JhcHBlclxuICogKGhlYWRlciBhbmQgYWRsZXIzMiBjcmMpLlxuICoqL1xuZnVuY3Rpb24gaW5mbGF0ZVJhdyhpbnB1dCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgb3B0aW9ucy5yYXcgPSB0cnVlO1xuICByZXR1cm4gaW5mbGF0ZShpbnB1dCwgb3B0aW9ucyk7XG59XG5cblxuLyoqXG4gKiB1bmd6aXAoZGF0YVssIG9wdGlvbnNdKSAtPiBVaW50OEFycmF5fEFycmF5fFN0cmluZ1xuICogLSBkYXRhIChVaW50OEFycmF5fEFycmF5fFN0cmluZyk6IGlucHV0IGRhdGEgdG8gZGVjb21wcmVzcy5cbiAqIC0gb3B0aW9ucyAoT2JqZWN0KTogemxpYiBpbmZsYXRlIG9wdGlvbnMuXG4gKlxuICogSnVzdCBzaG9ydGN1dCB0byBbW2luZmxhdGVdXSwgYmVjYXVzZSBpdCBhdXRvZGV0ZWN0cyBmb3JtYXRcbiAqIGJ5IGhlYWRlci5jb250ZW50LiBEb25lIGZvciBjb252ZW5pZW5jZS5cbiAqKi9cblxuXG5leHBvcnRzLkluZmxhdGUgPSBJbmZsYXRlO1xuZXhwb3J0cy5pbmZsYXRlID0gaW5mbGF0ZTtcbmV4cG9ydHMuaW5mbGF0ZVJhdyA9IGluZmxhdGVSYXc7XG5leHBvcnRzLnVuZ3ppcCAgPSBpbmZsYXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBUWVBFRF9PSyA9ICAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAgICAgICAgICh0eXBlb2YgVWludDE2QXJyYXkgIT09ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAgICAgICAgICh0eXBlb2YgSW50MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpO1xuXG5cbmV4cG9ydHMuYXNzaWduID0gZnVuY3Rpb24gKG9iaiAvKmZyb20xLCBmcm9tMiwgZnJvbTMsIC4uLiovKSB7XG4gIHZhciBzb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgd2hpbGUgKHNvdXJjZXMubGVuZ3RoKSB7XG4gICAgdmFyIHNvdXJjZSA9IHNvdXJjZXMuc2hpZnQoKTtcbiAgICBpZiAoIXNvdXJjZSkgeyBjb250aW51ZTsgfVxuXG4gICAgaWYgKHR5cGVvZihzb3VyY2UpICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzb3VyY2UgKyAnbXVzdCBiZSBub24tb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocCkpIHtcbiAgICAgICAgb2JqW3BdID0gc291cmNlW3BdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5cbi8vIHJlZHVjZSBidWZmZXIgc2l6ZSwgYXZvaWRpbmcgbWVtIGNvcHlcbmV4cG9ydHMuc2hyaW5rQnVmID0gZnVuY3Rpb24gKGJ1Ziwgc2l6ZSkge1xuICBpZiAoYnVmLmxlbmd0aCA9PT0gc2l6ZSkgeyByZXR1cm4gYnVmOyB9XG4gIGlmIChidWYuc3ViYXJyYXkpIHsgcmV0dXJuIGJ1Zi5zdWJhcnJheSgwLCBzaXplKTsgfVxuICBidWYubGVuZ3RoID0gc2l6ZTtcbiAgcmV0dXJuIGJ1Zjtcbn07XG5cblxudmFyIGZuVHlwZWQgPSB7XG4gIGFycmF5U2V0OiBmdW5jdGlvbiAoZGVzdCwgc3JjLCBzcmNfb2ZmcywgbGVuLCBkZXN0X29mZnMpIHtcbiAgICBpZiAoc3JjLnN1YmFycmF5ICYmIGRlc3Quc3ViYXJyYXkpIHtcbiAgICAgIGRlc3Quc2V0KHNyYy5zdWJhcnJheShzcmNfb2Zmcywgc3JjX29mZnMrbGVuKSwgZGVzdF9vZmZzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gRmFsbGJhY2sgdG8gb3JkaW5hcnkgYXJyYXlcbiAgICBmb3IodmFyIGk9MDsgaTxsZW47IGkrKykge1xuICAgICAgZGVzdFtkZXN0X29mZnMgKyBpXSA9IHNyY1tzcmNfb2ZmcyArIGldO1xuICAgIH1cbiAgfSxcbiAgLy8gSm9pbiBhcnJheSBvZiBjaHVua3MgdG8gc2luZ2xlIGFycmF5LlxuICBmbGF0dGVuQ2h1bmtzOiBmdW5jdGlvbihjaHVua3MpIHtcbiAgICB2YXIgaSwgbCwgbGVuLCBwb3MsIGNodW5rLCByZXN1bHQ7XG5cbiAgICAvLyBjYWxjdWxhdGUgZGF0YSBsZW5ndGhcbiAgICBsZW4gPSAwO1xuICAgIGZvciAoaT0wLCBsPWNodW5rcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICBsZW4gKz0gY2h1bmtzW2ldLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBqb2luIGNodW5rc1xuICAgIHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGxlbik7XG4gICAgcG9zID0gMDtcbiAgICBmb3IgKGk9MCwgbD1jaHVua3MubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgY2h1bmsgPSBjaHVua3NbaV07XG4gICAgICByZXN1bHQuc2V0KGNodW5rLCBwb3MpO1xuICAgICAgcG9zICs9IGNodW5rLmxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuXG52YXIgZm5VbnR5cGVkID0ge1xuICBhcnJheVNldDogZnVuY3Rpb24gKGRlc3QsIHNyYywgc3JjX29mZnMsIGxlbiwgZGVzdF9vZmZzKSB7XG4gICAgZm9yKHZhciBpPTA7IGk8bGVuOyBpKyspIHtcbiAgICAgIGRlc3RbZGVzdF9vZmZzICsgaV0gPSBzcmNbc3JjX29mZnMgKyBpXTtcbiAgICB9XG4gIH0sXG4gIC8vIEpvaW4gYXJyYXkgb2YgY2h1bmtzIHRvIHNpbmdsZSBhcnJheS5cbiAgZmxhdHRlbkNodW5rczogZnVuY3Rpb24oY2h1bmtzKSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgY2h1bmtzKTtcbiAgfVxufTtcblxuXG4vLyBFbmFibGUvRGlzYWJsZSB0eXBlZCBhcnJheXMgdXNlLCBmb3IgdGVzdGluZ1xuLy9cbmV4cG9ydHMuc2V0VHlwZWQgPSBmdW5jdGlvbiAob24pIHtcbiAgaWYgKG9uKSB7XG4gICAgZXhwb3J0cy5CdWY4ICA9IFVpbnQ4QXJyYXk7XG4gICAgZXhwb3J0cy5CdWYxNiA9IFVpbnQxNkFycmF5O1xuICAgIGV4cG9ydHMuQnVmMzIgPSBJbnQzMkFycmF5O1xuICAgIGV4cG9ydHMuYXNzaWduKGV4cG9ydHMsIGZuVHlwZWQpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuQnVmOCAgPSBBcnJheTtcbiAgICBleHBvcnRzLkJ1ZjE2ID0gQXJyYXk7XG4gICAgZXhwb3J0cy5CdWYzMiA9IEFycmF5O1xuICAgIGV4cG9ydHMuYXNzaWduKGV4cG9ydHMsIGZuVW50eXBlZCk7XG4gIH1cbn07XG5cbmV4cG9ydHMuc2V0VHlwZWQoVFlQRURfT0spOyIsIi8vIFN0cmluZyBlbmNvZGUvZGVjb2RlIGhlbHBlcnNcbid1c2Ugc3RyaWN0JztcblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL2NvbW1vbicpO1xuXG5cbi8vIFF1aWNrIGNoZWNrIGlmIHdlIGNhbiB1c2UgZmFzdCBhcnJheSB0byBiaW4gc3RyaW5nIGNvbnZlcnNpb25cbi8vXG4vLyAtIGFwcGx5KEFycmF5KSBjYW4gZmFpbCBvbiBBbmRyb2lkIDIuMlxuLy8gLSBhcHBseShVaW50OEFycmF5KSBjYW4gZmFpbCBvbiBpT1MgNS4xIFNhZmFyeVxuLy9cbnZhciBTVFJfQVBQTFlfT0sgPSB0cnVlO1xudmFyIFNUUl9BUFBMWV9VSUFfT0sgPSB0cnVlO1xuXG50cnkgeyBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIFswXSk7IH0gY2F0Y2goX18pIHsgU1RSX0FQUExZX09LID0gZmFsc2U7IH1cbnRyeSB7IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoMSkpOyB9IGNhdGNoKF9fKSB7IFNUUl9BUFBMWV9VSUFfT0sgPSBmYWxzZTsgfVxuXG5cbi8vIFRhYmxlIHdpdGggdXRmOCBsZW5ndGhzIChjYWxjdWxhdGVkIGJ5IGZpcnN0IGJ5dGUgb2Ygc2VxdWVuY2UpXG4vLyBOb3RlLCB0aGF0IDUgJiA2LWJ5dGUgdmFsdWVzIGFuZCBzb21lIDQtYnl0ZSB2YWx1ZXMgY2FuIG5vdCBiZSByZXByZXNlbnRlZCBpbiBKUyxcbi8vIGJlY2F1c2UgbWF4IHBvc3NpYmxlIGNvZGVwb2ludCBpcyAweDEwZmZmZlxudmFyIF91dGY4bGVuID0gbmV3IHV0aWxzLkJ1ZjgoMjU2KTtcbmZvciAodmFyIGk9MDsgaTwyNTY7IGkrKykge1xuICBfdXRmOGxlbltpXSA9IChpID49IDI1MiA/IDYgOiBpID49IDI0OCA/IDUgOiBpID49IDI0MCA/IDQgOiBpID49IDIyNCA/IDMgOiBpID49IDE5MiA/IDIgOiAxKTtcbn1cbl91dGY4bGVuWzI1NF09X3V0ZjhsZW5bMjU0XT0xOyAvLyBJbnZhbGlkIHNlcXVlbmNlIHN0YXJ0XG5cblxuLy8gY29udmVydCBzdHJpbmcgdG8gYXJyYXkgKHR5cGVkLCB3aGVuIHBvc3NpYmxlKVxuZXhwb3J0cy5zdHJpbmcyYnVmID0gZnVuY3Rpb24gKHN0cikge1xuICB2YXIgYnVmLCBjLCBjMiwgbV9wb3MsIGksIHN0cl9sZW4gPSBzdHIubGVuZ3RoLCBidWZfbGVuID0gMDtcblxuICAvLyBjb3VudCBiaW5hcnkgc2l6ZVxuICBmb3IgKG1fcG9zID0gMDsgbV9wb3MgPCBzdHJfbGVuOyBtX3BvcysrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KG1fcG9zKTtcbiAgICBpZiAoKGMgJiAweGZjMDApID09PSAweGQ4MDAgJiYgKG1fcG9zKzEgPCBzdHJfbGVuKSkge1xuICAgICAgYzIgPSBzdHIuY2hhckNvZGVBdChtX3BvcysxKTtcbiAgICAgIGlmICgoYzIgJiAweGZjMDApID09PSAweGRjMDApIHtcbiAgICAgICAgYyA9IDB4MTAwMDAgKyAoKGMgLSAweGQ4MDApIDw8IDEwKSArIChjMiAtIDB4ZGMwMCk7XG4gICAgICAgIG1fcG9zKys7XG4gICAgICB9XG4gICAgfVxuICAgIGJ1Zl9sZW4gKz0gYyA8IDB4ODAgPyAxIDogYyA8IDB4ODAwID8gMiA6IGMgPCAweDEwMDAwID8gMyA6IDQ7XG4gIH1cblxuICAvLyBhbGxvY2F0ZSBidWZmZXJcbiAgYnVmID0gbmV3IHV0aWxzLkJ1ZjgoYnVmX2xlbik7XG5cbiAgLy8gY29udmVydFxuICBmb3IgKGk9MCwgbV9wb3MgPSAwOyBpIDwgYnVmX2xlbjsgbV9wb3MrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChtX3Bvcyk7XG4gICAgaWYgKChjICYgMHhmYzAwKSA9PT0gMHhkODAwICYmIChtX3BvcysxIDwgc3RyX2xlbikpIHtcbiAgICAgIGMyID0gc3RyLmNoYXJDb2RlQXQobV9wb3MrMSk7XG4gICAgICBpZiAoKGMyICYgMHhmYzAwKSA9PT0gMHhkYzAwKSB7XG4gICAgICAgIGMgPSAweDEwMDAwICsgKChjIC0gMHhkODAwKSA8PCAxMCkgKyAoYzIgLSAweGRjMDApO1xuICAgICAgICBtX3BvcysrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYyA8IDB4ODApIHtcbiAgICAgIC8qIG9uZSBieXRlICovXG4gICAgICBidWZbaSsrXSA9IGM7XG4gICAgfSBlbHNlIGlmIChjIDwgMHg4MDApIHtcbiAgICAgIC8qIHR3byBieXRlcyAqL1xuICAgICAgYnVmW2krK10gPSAweEMwIHwgKGMgPj4+IDYpO1xuICAgICAgYnVmW2krK10gPSAweDgwIHwgKGMgJiAweDNmKTtcbiAgICB9IGVsc2UgaWYgKGMgPCAweDEwMDAwKSB7XG4gICAgICAvKiB0aHJlZSBieXRlcyAqL1xuICAgICAgYnVmW2krK10gPSAweEUwIHwgKGMgPj4+IDEyKTtcbiAgICAgIGJ1ZltpKytdID0gMHg4MCB8IChjID4+PiA2ICYgMHgzZik7XG4gICAgICBidWZbaSsrXSA9IDB4ODAgfCAoYyAmIDB4M2YpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKiBmb3VyIGJ5dGVzICovXG4gICAgICBidWZbaSsrXSA9IDB4ZjAgfCAoYyA+Pj4gMTgpO1xuICAgICAgYnVmW2krK10gPSAweDgwIHwgKGMgPj4+IDEyICYgMHgzZik7XG4gICAgICBidWZbaSsrXSA9IDB4ODAgfCAoYyA+Pj4gNiAmIDB4M2YpO1xuICAgICAgYnVmW2krK10gPSAweDgwIHwgKGMgJiAweDNmKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmO1xufTtcblxuLy8gSGVscGVyICh1c2VkIGluIDIgcGxhY2VzKVxuZnVuY3Rpb24gYnVmMmJpbnN0cmluZyhidWYsIGxlbikge1xuICAvLyB1c2UgZmFsbGJhY2sgZm9yIGJpZyBhcnJheXMgdG8gYXZvaWQgc3RhY2sgb3ZlcmZsb3dcbiAgaWYgKGxlbiA8IDY1NTM3KSB7XG4gICAgaWYgKChidWYuc3ViYXJyYXkgJiYgU1RSX0FQUExZX1VJQV9PSykgfHwgKCFidWYuc3ViYXJyYXkgJiYgU1RSX0FQUExZX09LKSkge1xuICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdXRpbHMuc2hyaW5rQnVmKGJ1ZiwgbGVuKSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHJlc3VsdCA9ICcnO1xuICBmb3IodmFyIGk9MDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbi8vIENvbnZlcnQgYnl0ZSBhcnJheSB0byBiaW5hcnkgc3RyaW5nXG5leHBvcnRzLmJ1ZjJiaW5zdHJpbmcgPSBmdW5jdGlvbihidWYpIHtcbiAgcmV0dXJuIGJ1ZjJiaW5zdHJpbmcoYnVmLCBidWYubGVuZ3RoKTtcbn07XG5cblxuLy8gQ29udmVydCBiaW5hcnkgc3RyaW5nICh0eXBlZCwgd2hlbiBwb3NzaWJsZSlcbmV4cG9ydHMuYmluc3RyaW5nMmJ1ZiA9IGZ1bmN0aW9uKHN0cikge1xuICB2YXIgYnVmID0gbmV3IHV0aWxzLkJ1Zjgoc3RyLmxlbmd0aCk7XG4gIGZvcih2YXIgaT0wLCBsZW49YnVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgYnVmW2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gIH1cbiAgcmV0dXJuIGJ1Zjtcbn07XG5cblxuLy8gY29udmVydCBhcnJheSB0byBzdHJpbmdcbmV4cG9ydHMuYnVmMnN0cmluZyA9IGZ1bmN0aW9uIChidWYsIG1heCkge1xuICB2YXIgaSwgb3V0LCBjLCBjX2xlbjtcbiAgdmFyIGxlbiA9IG1heCB8fCBidWYubGVuZ3RoO1xuXG4gIC8vIFJlc2VydmUgbWF4IHBvc3NpYmxlIGxlbmd0aCAoMiB3b3JkcyBwZXIgY2hhcilcbiAgLy8gTkI6IGJ5IHVua25vd24gcmVhc29ucywgQXJyYXkgaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXIgZm9yXG4gIC8vICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5IHRoYW4gVWludDE2QXJyYXkuXG4gIHZhciB1dGYxNmJ1ZiA9IG5ldyBBcnJheShsZW4qMik7XG5cbiAgZm9yIChvdXQ9MCwgaT0wOyBpPGxlbjspIHtcbiAgICBjID0gYnVmW2krK107XG4gICAgLy8gcXVpY2sgcHJvY2VzcyBhc2NpaVxuICAgIGlmIChjIDwgMHg4MCkgeyB1dGYxNmJ1ZltvdXQrK10gPSBjOyBjb250aW51ZTsgfVxuXG4gICAgY19sZW4gPSBfdXRmOGxlbltjXTtcbiAgICAvLyBza2lwIDUgJiA2IGJ5dGUgY29kZXNcbiAgICBpZiAoY19sZW4gPiA0KSB7IHV0ZjE2YnVmW291dCsrXSA9IDB4ZmZmZDsgaSArPSBjX2xlbi0xOyBjb250aW51ZTsgfVxuXG4gICAgLy8gYXBwbHkgbWFzayBvbiBmaXJzdCBieXRlXG4gICAgYyAmPSBjX2xlbiA9PT0gMiA/IDB4MWYgOiBjX2xlbiA9PT0gMyA/IDB4MGYgOiAweDA3O1xuICAgIC8vIGpvaW4gdGhlIHJlc3RcbiAgICB3aGlsZSAoY19sZW4gPiAxICYmIGkgPCBsZW4pIHtcbiAgICAgIGMgPSAoYyA8PCA2KSB8IChidWZbaSsrXSAmIDB4M2YpO1xuICAgICAgY19sZW4tLTtcbiAgICB9XG5cbiAgICAvLyB0ZXJtaW5hdGVkIGJ5IGVuZCBvZiBzdHJpbmc/XG4gICAgaWYgKGNfbGVuID4gMSkgeyB1dGYxNmJ1ZltvdXQrK10gPSAweGZmZmQ7IGNvbnRpbnVlOyB9XG5cbiAgICBpZiAoYyA8IDB4MTAwMDApIHtcbiAgICAgIHV0ZjE2YnVmW291dCsrXSA9IGM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGMgLT0gMHgxMDAwMDtcbiAgICAgIHV0ZjE2YnVmW291dCsrXSA9IDB4ZDgwMCB8ICgoYyA+PiAxMCkgJiAweDNmZik7XG4gICAgICB1dGYxNmJ1ZltvdXQrK10gPSAweGRjMDAgfCAoYyAmIDB4M2ZmKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmMmJpbnN0cmluZyh1dGYxNmJ1Ziwgb3V0KTtcbn07XG5cblxuLy8gQ2FsY3VsYXRlIG1heCBwb3NzaWJsZSBwb3NpdGlvbiBpbiB1dGY4IGJ1ZmZlcixcbi8vIHRoYXQgd2lsbCBub3QgYnJlYWsgc2VxdWVuY2UuIElmIHRoYXQncyBub3QgcG9zc2libGVcbi8vIC0gKHZlcnkgc21hbGwgbGltaXRzKSByZXR1cm4gbWF4IHNpemUgYXMgaXMuXG4vL1xuLy8gYnVmW10gLSB1dGY4IGJ5dGVzIGFycmF5XG4vLyBtYXggICAtIGxlbmd0aCBsaW1pdCAobWFuZGF0b3J5KTtcbmV4cG9ydHMudXRmOGJvcmRlciA9IGZ1bmN0aW9uKGJ1ZiwgbWF4KSB7XG4gIHZhciBwb3M7XG5cbiAgbWF4ID0gbWF4IHx8IGJ1Zi5sZW5ndGg7XG4gIGlmIChtYXggPiBidWYubGVuZ3RoKSB7IG1heCA9IGJ1Zi5sZW5ndGg7IH1cblxuICAvLyBnbyBiYWNrIGZyb20gbGFzdCBwb3NpdGlvbiwgdW50aWwgc3RhcnQgb2Ygc2VxdWVuY2UgZm91bmRcbiAgcG9zID0gbWF4LTE7XG4gIHdoaWxlIChwb3MgPj0gMCAmJiAoYnVmW3Bvc10gJiAweEMwKSA9PT0gMHg4MCkgeyBwb3MtLTsgfVxuXG4gIC8vIEZ1Y2t1cCAtIHZlcnkgc21hbGwgYW5kIGJyb2tlbiBzZXF1ZW5jZSxcbiAgLy8gcmV0dXJuIG1heCwgYmVjYXVzZSB3ZSBzaG91bGQgcmV0dXJuIHNvbWV0aGluZyBhbnl3YXkuXG4gIGlmIChwb3MgPCAwKSB7IHJldHVybiBtYXg7IH1cblxuICAvLyBJZiB3ZSBjYW1lIHRvIHN0YXJ0IG9mIGJ1ZmZlciAtIHRoYXQgbWVhbnMgdnVmZmVyIGlzIHRvbyBzbWFsbCxcbiAgLy8gcmV0dXJuIG1heCB0b28uXG4gIGlmIChwb3MgPT09IDApIHsgcmV0dXJuIG1heDsgfVxuXG4gIHJldHVybiAocG9zICsgX3V0ZjhsZW5bYnVmW3Bvc11dID4gbWF4KSA/IHBvcyA6IG1heDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIE5vdGU6IGFkbGVyMzIgdGFrZXMgMTIlIGZvciBsZXZlbCAwIGFuZCAyJSBmb3IgbGV2ZWwgNi5cbi8vIEl0IGRvZXNuJ3Qgd29ydGggdG8gbWFrZSBhZGRpdGlvbmFsIG9wdGltaXphdGlvbmEgYXMgaW4gb3JpZ2luYWwuXG4vLyBTbWFsbCBzaXplIGlzIHByZWZlcmFibGUuXG5cbmZ1bmN0aW9uIGFkbGVyMzIoYWRsZXIsIGJ1ZiwgbGVuLCBwb3MpIHtcbiAgdmFyIHMxID0gKGFkbGVyICYgMHhmZmZmKSB8MFxuICAgICwgczIgPSAoKGFkbGVyID4+PiAxNikgJiAweGZmZmYpIHwwXG4gICAgLCBuID0gMDtcblxuICB3aGlsZSAobGVuICE9PSAwKSB7XG4gICAgLy8gU2V0IGxpbWl0IH4gdHdpY2UgbGVzcyB0aGFuIDU1NTIsIHRvIGtlZXBcbiAgICAvLyBzMiBpbiAzMS1iaXRzLCBiZWNhdXNlIHdlIGZvcmNlIHNpZ25lZCBpbnRzLlxuICAgIC8vIGluIG90aGVyIGNhc2UgJT0gd2lsbCBmYWlsLlxuICAgIG4gPSBsZW4gPiAyMDAwID8gMjAwMCA6IGxlbjtcbiAgICBsZW4gLT0gbjtcblxuICAgIGRvIHtcbiAgICAgIHMxID0gKHMxICsgYnVmW3BvcysrXSkgfDA7XG4gICAgICBzMiA9IChzMiArIHMxKSB8MDtcbiAgICB9IHdoaWxlICgtLW4pO1xuXG4gICAgczEgJT0gNjU1MjE7XG4gICAgczIgJT0gNjU1MjE7XG4gIH1cblxuICByZXR1cm4gKHMxIHwgKHMyIDw8IDE2KSkgfDA7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBhZGxlcjMyOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qIEFsbG93ZWQgZmx1c2ggdmFsdWVzOyBzZWUgZGVmbGF0ZSgpIGFuZCBpbmZsYXRlKCkgYmVsb3cgZm9yIGRldGFpbHMgKi9cbiAgWl9OT19GTFVTSDogICAgICAgICAwLFxuICBaX1BBUlRJQUxfRkxVU0g6ICAgIDEsXG4gIFpfU1lOQ19GTFVTSDogICAgICAgMixcbiAgWl9GVUxMX0ZMVVNIOiAgICAgICAzLFxuICBaX0ZJTklTSDogICAgICAgICAgIDQsXG4gIFpfQkxPQ0s6ICAgICAgICAgICAgNSxcbiAgWl9UUkVFUzogICAgICAgICAgICA2LFxuXG4gIC8qIFJldHVybiBjb2RlcyBmb3IgdGhlIGNvbXByZXNzaW9uL2RlY29tcHJlc3Npb24gZnVuY3Rpb25zLiBOZWdhdGl2ZSB2YWx1ZXNcbiAgKiBhcmUgZXJyb3JzLCBwb3NpdGl2ZSB2YWx1ZXMgYXJlIHVzZWQgZm9yIHNwZWNpYWwgYnV0IG5vcm1hbCBldmVudHMuXG4gICovXG4gIFpfT0s6ICAgICAgICAgICAgICAgMCxcbiAgWl9TVFJFQU1fRU5EOiAgICAgICAxLFxuICBaX05FRURfRElDVDogICAgICAgIDIsXG4gIFpfRVJSTk86ICAgICAgICAgICAtMSxcbiAgWl9TVFJFQU1fRVJST1I6ICAgIC0yLFxuICBaX0RBVEFfRVJST1I6ICAgICAgLTMsXG4gIC8vWl9NRU1fRVJST1I6ICAgICAtNCxcbiAgWl9CVUZfRVJST1I6ICAgICAgIC01LFxuICAvL1pfVkVSU0lPTl9FUlJPUjogLTYsXG5cbiAgLyogY29tcHJlc3Npb24gbGV2ZWxzICovXG4gIFpfTk9fQ09NUFJFU1NJT046ICAgICAgICAgMCxcbiAgWl9CRVNUX1NQRUVEOiAgICAgICAgICAgICAxLFxuICBaX0JFU1RfQ09NUFJFU1NJT046ICAgICAgIDksXG4gIFpfREVGQVVMVF9DT01QUkVTU0lPTjogICAtMSxcblxuXG4gIFpfRklMVEVSRUQ6ICAgICAgICAgICAgICAgMSxcbiAgWl9IVUZGTUFOX09OTFk6ICAgICAgICAgICAyLFxuICBaX1JMRTogICAgICAgICAgICAgICAgICAgIDMsXG4gIFpfRklYRUQ6ICAgICAgICAgICAgICAgICAgNCxcbiAgWl9ERUZBVUxUX1NUUkFURUdZOiAgICAgICAwLFxuXG4gIC8qIFBvc3NpYmxlIHZhbHVlcyBvZiB0aGUgZGF0YV90eXBlIGZpZWxkICh0aG91Z2ggc2VlIGluZmxhdGUoKSkgKi9cbiAgWl9CSU5BUlk6ICAgICAgICAgICAgICAgICAwLFxuICBaX1RFWFQ6ICAgICAgICAgICAgICAgICAgIDEsXG4gIC8vWl9BU0NJSTogICAgICAgICAgICAgICAgMSwgLy8gPSBaX1RFWFQgKGRlcHJlY2F0ZWQpXG4gIFpfVU5LTk9XTjogICAgICAgICAgICAgICAgMixcblxuICAvKiBUaGUgZGVmbGF0ZSBjb21wcmVzc2lvbiBtZXRob2QgKi9cbiAgWl9ERUZMQVRFRDogICAgICAgICAgICAgICA4XG4gIC8vWl9OVUxMOiAgICAgICAgICAgICAgICAgbnVsbCAvLyBVc2UgLTEgb3IgbnVsbCBpbmxpbmUsIGRlcGVuZGluZyBvbiB2YXIgdHlwZVxufTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIE5vdGU6IHdlIGNhbid0IGdldCBzaWduaWZpY2FudCBzcGVlZCBib29zdCBoZXJlLlxuLy8gU28gd3JpdGUgY29kZSB0byBtaW5pbWl6ZSBzaXplIC0gbm8gcHJlZ2VuZXJhdGVkIHRhYmxlc1xuLy8gYW5kIGFycmF5IHRvb2xzIGRlcGVuZGVuY2llcy5cblxuXG4vLyBVc2Ugb3JkaW5hcnkgYXJyYXksIHNpbmNlIHVudHlwZWQgbWFrZXMgbm8gYm9vc3QgaGVyZVxuZnVuY3Rpb24gbWFrZVRhYmxlKCkge1xuICB2YXIgYywgdGFibGUgPSBbXTtcblxuICBmb3IodmFyIG4gPTA7IG4gPCAyNTY7IG4rKyl7XG4gICAgYyA9IG47XG4gICAgZm9yKHZhciBrID0wOyBrIDwgODsgaysrKXtcbiAgICAgIGMgPSAoKGMmMSkgPyAoMHhFREI4ODMyMCBeIChjID4+PiAxKSkgOiAoYyA+Pj4gMSkpO1xuICAgIH1cbiAgICB0YWJsZVtuXSA9IGM7XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59XG5cbi8vIENyZWF0ZSB0YWJsZSBvbiBsb2FkLiBKdXN0IDI1NSBzaWduZWQgbG9uZ3MuIE5vdCBhIHByb2JsZW0uXG52YXIgY3JjVGFibGUgPSBtYWtlVGFibGUoKTtcblxuXG5mdW5jdGlvbiBjcmMzMihjcmMsIGJ1ZiwgbGVuLCBwb3MpIHtcbiAgdmFyIHQgPSBjcmNUYWJsZVxuICAgICwgZW5kID0gcG9zICsgbGVuO1xuXG4gIGNyYyA9IGNyYyBeICgtMSk7XG5cbiAgZm9yICh2YXIgaSA9IHBvczsgaSA8IGVuZDsgaSsrICkge1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdFsoY3JjIF4gYnVmW2ldKSAmIDB4RkZdO1xuICB9XG5cbiAgcmV0dXJuIChjcmMgXiAoLTEpKTsgLy8gPj4+IDA7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBjcmMzMjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyAgID0gcmVxdWlyZSgnLi4vdXRpbHMvY29tbW9uJyk7XG52YXIgdHJlZXMgICA9IHJlcXVpcmUoJy4vdHJlZXMnKTtcbnZhciBhZGxlcjMyID0gcmVxdWlyZSgnLi9hZGxlcjMyJyk7XG52YXIgY3JjMzIgICA9IHJlcXVpcmUoJy4vY3JjMzInKTtcbnZhciBtc2cgICA9IHJlcXVpcmUoJy4vbWVzc2FnZXMnKTtcblxuLyogUHVibGljIGNvbnN0YW50cyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXG5cblxuLyogQWxsb3dlZCBmbHVzaCB2YWx1ZXM7IHNlZSBkZWZsYXRlKCkgYW5kIGluZmxhdGUoKSBiZWxvdyBmb3IgZGV0YWlscyAqL1xudmFyIFpfTk9fRkxVU0ggICAgICA9IDA7XG52YXIgWl9QQVJUSUFMX0ZMVVNIID0gMTtcbi8vdmFyIFpfU1lOQ19GTFVTSCAgICA9IDI7XG52YXIgWl9GVUxMX0ZMVVNIICAgID0gMztcbnZhciBaX0ZJTklTSCAgICAgICAgPSA0O1xudmFyIFpfQkxPQ0sgICAgICAgICA9IDU7XG4vL3ZhciBaX1RSRUVTICAgICAgICAgPSA2O1xuXG5cbi8qIFJldHVybiBjb2RlcyBmb3IgdGhlIGNvbXByZXNzaW9uL2RlY29tcHJlc3Npb24gZnVuY3Rpb25zLiBOZWdhdGl2ZSB2YWx1ZXNcbiAqIGFyZSBlcnJvcnMsIHBvc2l0aXZlIHZhbHVlcyBhcmUgdXNlZCBmb3Igc3BlY2lhbCBidXQgbm9ybWFsIGV2ZW50cy5cbiAqL1xudmFyIFpfT0sgICAgICAgICAgICA9IDA7XG52YXIgWl9TVFJFQU1fRU5EICAgID0gMTtcbi8vdmFyIFpfTkVFRF9ESUNUICAgICA9IDI7XG4vL3ZhciBaX0VSUk5PICAgICAgICAgPSAtMTtcbnZhciBaX1NUUkVBTV9FUlJPUiAgPSAtMjtcbnZhciBaX0RBVEFfRVJST1IgICAgPSAtMztcbi8vdmFyIFpfTUVNX0VSUk9SICAgICA9IC00O1xudmFyIFpfQlVGX0VSUk9SICAgICA9IC01O1xuLy92YXIgWl9WRVJTSU9OX0VSUk9SID0gLTY7XG5cblxuLyogY29tcHJlc3Npb24gbGV2ZWxzICovXG4vL3ZhciBaX05PX0NPTVBSRVNTSU9OICAgICAgPSAwO1xuLy92YXIgWl9CRVNUX1NQRUVEICAgICAgICAgID0gMTtcbi8vdmFyIFpfQkVTVF9DT01QUkVTU0lPTiAgICA9IDk7XG52YXIgWl9ERUZBVUxUX0NPTVBSRVNTSU9OID0gLTE7XG5cblxudmFyIFpfRklMVEVSRUQgICAgICAgICAgICA9IDE7XG52YXIgWl9IVUZGTUFOX09OTFkgICAgICAgID0gMjtcbnZhciBaX1JMRSAgICAgICAgICAgICAgICAgPSAzO1xudmFyIFpfRklYRUQgICAgICAgICAgICAgICA9IDQ7XG52YXIgWl9ERUZBVUxUX1NUUkFURUdZICAgID0gMDtcblxuLyogUG9zc2libGUgdmFsdWVzIG9mIHRoZSBkYXRhX3R5cGUgZmllbGQgKHRob3VnaCBzZWUgaW5mbGF0ZSgpKSAqL1xuLy92YXIgWl9CSU5BUlkgICAgICAgICAgICAgID0gMDtcbi8vdmFyIFpfVEVYVCAgICAgICAgICAgICAgICA9IDE7XG4vL3ZhciBaX0FTQ0lJICAgICAgICAgICAgICAgPSAxOyAvLyA9IFpfVEVYVFxudmFyIFpfVU5LTk9XTiAgICAgICAgICAgICA9IDI7XG5cblxuLyogVGhlIGRlZmxhdGUgY29tcHJlc3Npb24gbWV0aG9kICovXG52YXIgWl9ERUZMQVRFRCAgPSA4O1xuXG4vKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xuXG5cbnZhciBNQVhfTUVNX0xFVkVMID0gOTtcbi8qIE1heGltdW0gdmFsdWUgZm9yIG1lbUxldmVsIGluIGRlZmxhdGVJbml0MiAqL1xudmFyIE1BWF9XQklUUyA9IDE1O1xuLyogMzJLIExaNzcgd2luZG93ICovXG52YXIgREVGX01FTV9MRVZFTCA9IDg7XG5cblxudmFyIExFTkdUSF9DT0RFUyAgPSAyOTtcbi8qIG51bWJlciBvZiBsZW5ndGggY29kZXMsIG5vdCBjb3VudGluZyB0aGUgc3BlY2lhbCBFTkRfQkxPQ0sgY29kZSAqL1xudmFyIExJVEVSQUxTICAgICAgPSAyNTY7XG4vKiBudW1iZXIgb2YgbGl0ZXJhbCBieXRlcyAwLi4yNTUgKi9cbnZhciBMX0NPREVTICAgICAgID0gTElURVJBTFMgKyAxICsgTEVOR1RIX0NPREVTO1xuLyogbnVtYmVyIG9mIExpdGVyYWwgb3IgTGVuZ3RoIGNvZGVzLCBpbmNsdWRpbmcgdGhlIEVORF9CTE9DSyBjb2RlICovXG52YXIgRF9DT0RFUyAgICAgICA9IDMwO1xuLyogbnVtYmVyIG9mIGRpc3RhbmNlIGNvZGVzICovXG52YXIgQkxfQ09ERVMgICAgICA9IDE5O1xuLyogbnVtYmVyIG9mIGNvZGVzIHVzZWQgdG8gdHJhbnNmZXIgdGhlIGJpdCBsZW5ndGhzICovXG52YXIgSEVBUF9TSVpFICAgICA9IDIqTF9DT0RFUyArIDE7XG4vKiBtYXhpbXVtIGhlYXAgc2l6ZSAqL1xudmFyIE1BWF9CSVRTICA9IDE1O1xuLyogQWxsIGNvZGVzIG11c3Qgbm90IGV4Y2VlZCBNQVhfQklUUyBiaXRzICovXG5cbnZhciBNSU5fTUFUQ0ggPSAzO1xudmFyIE1BWF9NQVRDSCA9IDI1ODtcbnZhciBNSU5fTE9PS0FIRUFEID0gKE1BWF9NQVRDSCArIE1JTl9NQVRDSCArIDEpO1xuXG52YXIgUFJFU0VUX0RJQ1QgPSAweDIwO1xuXG52YXIgSU5JVF9TVEFURSA9IDQyO1xudmFyIEVYVFJBX1NUQVRFID0gNjk7XG52YXIgTkFNRV9TVEFURSA9IDczO1xudmFyIENPTU1FTlRfU1RBVEUgPSA5MTtcbnZhciBIQ1JDX1NUQVRFID0gMTAzO1xudmFyIEJVU1lfU1RBVEUgPSAxMTM7XG52YXIgRklOSVNIX1NUQVRFID0gNjY2O1xuXG52YXIgQlNfTkVFRF9NT1JFICAgICAgPSAxOyAvKiBibG9jayBub3QgY29tcGxldGVkLCBuZWVkIG1vcmUgaW5wdXQgb3IgbW9yZSBvdXRwdXQgKi9cbnZhciBCU19CTE9DS19ET05FICAgICA9IDI7IC8qIGJsb2NrIGZsdXNoIHBlcmZvcm1lZCAqL1xudmFyIEJTX0ZJTklTSF9TVEFSVEVEID0gMzsgLyogZmluaXNoIHN0YXJ0ZWQsIG5lZWQgb25seSBtb3JlIG91dHB1dCBhdCBuZXh0IGRlZmxhdGUgKi9cbnZhciBCU19GSU5JU0hfRE9ORSAgICA9IDQ7IC8qIGZpbmlzaCBkb25lLCBhY2NlcHQgbm8gbW9yZSBpbnB1dCBvciBvdXRwdXQgKi9cblxudmFyIE9TX0NPREUgPSAweDAzOyAvLyBVbml4IDopIC4gRG9uJ3QgZGV0ZWN0LCB1c2UgdGhpcyBkZWZhdWx0LlxuXG5mdW5jdGlvbiBlcnIoc3RybSwgZXJyb3JDb2RlKSB7XG4gIHN0cm0ubXNnID0gbXNnW2Vycm9yQ29kZV07XG4gIHJldHVybiBlcnJvckNvZGU7XG59XG5cbmZ1bmN0aW9uIHJhbmsoZikge1xuICByZXR1cm4gKChmKSA8PCAxKSAtICgoZikgPiA0ID8gOSA6IDApO1xufVxuXG5mdW5jdGlvbiB6ZXJvKGJ1ZikgeyB2YXIgbGVuID0gYnVmLmxlbmd0aDsgd2hpbGUgKC0tbGVuID49IDApIHsgYnVmW2xlbl0gPSAwOyB9IH1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGbHVzaCBhcyBtdWNoIHBlbmRpbmcgb3V0cHV0IGFzIHBvc3NpYmxlLiBBbGwgZGVmbGF0ZSgpIG91dHB1dCBnb2VzXG4gKiB0aHJvdWdoIHRoaXMgZnVuY3Rpb24gc28gc29tZSBhcHBsaWNhdGlvbnMgbWF5IHdpc2ggdG8gbW9kaWZ5IGl0XG4gKiB0byBhdm9pZCBhbGxvY2F0aW5nIGEgbGFyZ2Ugc3RybS0+b3V0cHV0IGJ1ZmZlciBhbmQgY29weWluZyBpbnRvIGl0LlxuICogKFNlZSBhbHNvIHJlYWRfYnVmKCkpLlxuICovXG5mdW5jdGlvbiBmbHVzaF9wZW5kaW5nKHN0cm0pIHtcbiAgdmFyIHMgPSBzdHJtLnN0YXRlO1xuXG4gIC8vX3RyX2ZsdXNoX2JpdHMocyk7XG4gIHZhciBsZW4gPSBzLnBlbmRpbmc7XG4gIGlmIChsZW4gPiBzdHJtLmF2YWlsX291dCkge1xuICAgIGxlbiA9IHN0cm0uYXZhaWxfb3V0O1xuICB9XG4gIGlmIChsZW4gPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgdXRpbHMuYXJyYXlTZXQoc3RybS5vdXRwdXQsIHMucGVuZGluZ19idWYsIHMucGVuZGluZ19vdXQsIGxlbiwgc3RybS5uZXh0X291dCk7XG4gIHN0cm0ubmV4dF9vdXQgKz0gbGVuO1xuICBzLnBlbmRpbmdfb3V0ICs9IGxlbjtcbiAgc3RybS50b3RhbF9vdXQgKz0gbGVuO1xuICBzdHJtLmF2YWlsX291dCAtPSBsZW47XG4gIHMucGVuZGluZyAtPSBsZW47XG4gIGlmIChzLnBlbmRpbmcgPT09IDApIHtcbiAgICBzLnBlbmRpbmdfb3V0ID0gMDtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGZsdXNoX2Jsb2NrX29ubHkgKHMsIGxhc3QpIHtcbiAgdHJlZXMuX3RyX2ZsdXNoX2Jsb2NrKHMsIChzLmJsb2NrX3N0YXJ0ID49IDAgPyBzLmJsb2NrX3N0YXJ0IDogLTEpLCBzLnN0cnN0YXJ0IC0gcy5ibG9ja19zdGFydCwgbGFzdCk7XG4gIHMuYmxvY2tfc3RhcnQgPSBzLnN0cnN0YXJ0O1xuICBmbHVzaF9wZW5kaW5nKHMuc3RybSk7XG59XG5cblxuZnVuY3Rpb24gcHV0X2J5dGUocywgYikge1xuICBzLnBlbmRpbmdfYnVmW3MucGVuZGluZysrXSA9IGI7XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogUHV0IGEgc2hvcnQgaW4gdGhlIHBlbmRpbmcgYnVmZmVyLiBUaGUgMTYtYml0IHZhbHVlIGlzIHB1dCBpbiBNU0Igb3JkZXIuXG4gKiBJTiBhc3NlcnRpb246IHRoZSBzdHJlYW0gc3RhdGUgaXMgY29ycmVjdCBhbmQgdGhlcmUgaXMgZW5vdWdoIHJvb20gaW5cbiAqIHBlbmRpbmdfYnVmLlxuICovXG5mdW5jdGlvbiBwdXRTaG9ydE1TQihzLCBiKSB7XG4vLyAgcHV0X2J5dGUocywgKEJ5dGUpKGIgPj4gOCkpO1xuLy8gIHB1dF9ieXRlKHMsIChCeXRlKShiICYgMHhmZikpO1xuICBzLnBlbmRpbmdfYnVmW3MucGVuZGluZysrXSA9IChiID4+PiA4KSAmIDB4ZmY7XG4gIHMucGVuZGluZ19idWZbcy5wZW5kaW5nKytdID0gYiAmIDB4ZmY7XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBSZWFkIGEgbmV3IGJ1ZmZlciBmcm9tIHRoZSBjdXJyZW50IGlucHV0IHN0cmVhbSwgdXBkYXRlIHRoZSBhZGxlcjMyXG4gKiBhbmQgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIHJlYWQuICBBbGwgZGVmbGF0ZSgpIGlucHV0IGdvZXMgdGhyb3VnaFxuICogdGhpcyBmdW5jdGlvbiBzbyBzb21lIGFwcGxpY2F0aW9ucyBtYXkgd2lzaCB0byBtb2RpZnkgaXQgdG8gYXZvaWRcbiAqIGFsbG9jYXRpbmcgYSBsYXJnZSBzdHJtLT5pbnB1dCBidWZmZXIgYW5kIGNvcHlpbmcgZnJvbSBpdC5cbiAqIChTZWUgYWxzbyBmbHVzaF9wZW5kaW5nKCkpLlxuICovXG5mdW5jdGlvbiByZWFkX2J1ZihzdHJtLCBidWYsIHN0YXJ0LCBzaXplKSB7XG4gIHZhciBsZW4gPSBzdHJtLmF2YWlsX2luO1xuXG4gIGlmIChsZW4gPiBzaXplKSB7IGxlbiA9IHNpemU7IH1cbiAgaWYgKGxlbiA9PT0gMCkgeyByZXR1cm4gMDsgfVxuXG4gIHN0cm0uYXZhaWxfaW4gLT0gbGVuO1xuXG4gIHV0aWxzLmFycmF5U2V0KGJ1Ziwgc3RybS5pbnB1dCwgc3RybS5uZXh0X2luLCBsZW4sIHN0YXJ0KTtcbiAgaWYgKHN0cm0uc3RhdGUud3JhcCA9PT0gMSkge1xuICAgIHN0cm0uYWRsZXIgPSBhZGxlcjMyKHN0cm0uYWRsZXIsIGJ1ZiwgbGVuLCBzdGFydCk7XG4gIH1cblxuICBlbHNlIGlmIChzdHJtLnN0YXRlLndyYXAgPT09IDIpIHtcbiAgICBzdHJtLmFkbGVyID0gY3JjMzIoc3RybS5hZGxlciwgYnVmLCBsZW4sIHN0YXJ0KTtcbiAgfVxuXG4gIHN0cm0ubmV4dF9pbiArPSBsZW47XG4gIHN0cm0udG90YWxfaW4gKz0gbGVuO1xuXG4gIHJldHVybiBsZW47XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBTZXQgbWF0Y2hfc3RhcnQgdG8gdGhlIGxvbmdlc3QgbWF0Y2ggc3RhcnRpbmcgYXQgdGhlIGdpdmVuIHN0cmluZyBhbmRcbiAqIHJldHVybiBpdHMgbGVuZ3RoLiBNYXRjaGVzIHNob3J0ZXIgb3IgZXF1YWwgdG8gcHJldl9sZW5ndGggYXJlIGRpc2NhcmRlZCxcbiAqIGluIHdoaWNoIGNhc2UgdGhlIHJlc3VsdCBpcyBlcXVhbCB0byBwcmV2X2xlbmd0aCBhbmQgbWF0Y2hfc3RhcnQgaXNcbiAqIGdhcmJhZ2UuXG4gKiBJTiBhc3NlcnRpb25zOiBjdXJfbWF0Y2ggaXMgdGhlIGhlYWQgb2YgdGhlIGhhc2ggY2hhaW4gZm9yIHRoZSBjdXJyZW50XG4gKiAgIHN0cmluZyAoc3Ryc3RhcnQpIGFuZCBpdHMgZGlzdGFuY2UgaXMgPD0gTUFYX0RJU1QsIGFuZCBwcmV2X2xlbmd0aCA+PSAxXG4gKiBPVVQgYXNzZXJ0aW9uOiB0aGUgbWF0Y2ggbGVuZ3RoIGlzIG5vdCBncmVhdGVyIHRoYW4gcy0+bG9va2FoZWFkLlxuICovXG5mdW5jdGlvbiBsb25nZXN0X21hdGNoKHMsIGN1cl9tYXRjaCkge1xuICB2YXIgY2hhaW5fbGVuZ3RoID0gcy5tYXhfY2hhaW5fbGVuZ3RoOyAgICAgIC8qIG1heCBoYXNoIGNoYWluIGxlbmd0aCAqL1xuICB2YXIgc2NhbiA9IHMuc3Ryc3RhcnQ7IC8qIGN1cnJlbnQgc3RyaW5nICovXG4gIHZhciBtYXRjaDsgICAgICAgICAgICAgICAgICAgICAgIC8qIG1hdGNoZWQgc3RyaW5nICovXG4gIHZhciBsZW47ICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogbGVuZ3RoIG9mIGN1cnJlbnQgbWF0Y2ggKi9cbiAgdmFyIGJlc3RfbGVuID0gcy5wcmV2X2xlbmd0aDsgICAgICAgICAgICAgIC8qIGJlc3QgbWF0Y2ggbGVuZ3RoIHNvIGZhciAqL1xuICB2YXIgbmljZV9tYXRjaCA9IHMubmljZV9tYXRjaDsgICAgICAgICAgICAgLyogc3RvcCBpZiBtYXRjaCBsb25nIGVub3VnaCAqL1xuICB2YXIgbGltaXQgPSAocy5zdHJzdGFydCA+IChzLndfc2l6ZSAtIE1JTl9MT09LQUhFQUQpKSA/XG4gICAgICBzLnN0cnN0YXJ0IC0gKHMud19zaXplIC0gTUlOX0xPT0tBSEVBRCkgOiAwLypOSUwqLztcblxuICB2YXIgX3dpbiA9IHMud2luZG93OyAvLyBzaG9ydGN1dFxuXG4gIHZhciB3bWFzayA9IHMud19tYXNrO1xuICB2YXIgcHJldiAgPSBzLnByZXY7XG5cbiAgLyogU3RvcCB3aGVuIGN1cl9tYXRjaCBiZWNvbWVzIDw9IGxpbWl0LiBUbyBzaW1wbGlmeSB0aGUgY29kZSxcbiAgICogd2UgcHJldmVudCBtYXRjaGVzIHdpdGggdGhlIHN0cmluZyBvZiB3aW5kb3cgaW5kZXggMC5cbiAgICovXG5cbiAgdmFyIHN0cmVuZCA9IHMuc3Ryc3RhcnQgKyBNQVhfTUFUQ0g7XG4gIHZhciBzY2FuX2VuZDEgID0gX3dpbltzY2FuICsgYmVzdF9sZW4gLSAxXTtcbiAgdmFyIHNjYW5fZW5kICAgPSBfd2luW3NjYW4gKyBiZXN0X2xlbl07XG5cbiAgLyogVGhlIGNvZGUgaXMgb3B0aW1pemVkIGZvciBIQVNIX0JJVFMgPj0gOCBhbmQgTUFYX01BVENILTIgbXVsdGlwbGUgb2YgMTYuXG4gICAqIEl0IGlzIGVhc3kgdG8gZ2V0IHJpZCBvZiB0aGlzIG9wdGltaXphdGlvbiBpZiBuZWNlc3NhcnkuXG4gICAqL1xuICAvLyBBc3NlcnQocy0+aGFzaF9iaXRzID49IDggJiYgTUFYX01BVENIID09IDI1OCwgXCJDb2RlIHRvbyBjbGV2ZXJcIik7XG5cbiAgLyogRG8gbm90IHdhc3RlIHRvbyBtdWNoIHRpbWUgaWYgd2UgYWxyZWFkeSBoYXZlIGEgZ29vZCBtYXRjaDogKi9cbiAgaWYgKHMucHJldl9sZW5ndGggPj0gcy5nb29kX21hdGNoKSB7XG4gICAgY2hhaW5fbGVuZ3RoID4+PSAyO1xuICB9XG4gIC8qIERvIG5vdCBsb29rIGZvciBtYXRjaGVzIGJleW9uZCB0aGUgZW5kIG9mIHRoZSBpbnB1dC4gVGhpcyBpcyBuZWNlc3NhcnlcbiAgICogdG8gbWFrZSBkZWZsYXRlIGRldGVybWluaXN0aWMuXG4gICAqL1xuICBpZiAobmljZV9tYXRjaCA+IHMubG9va2FoZWFkKSB7IG5pY2VfbWF0Y2ggPSBzLmxvb2thaGVhZDsgfVxuXG4gIC8vIEFzc2VydCgodWxnKXMtPnN0cnN0YXJ0IDw9IHMtPndpbmRvd19zaXplLU1JTl9MT09LQUhFQUQsIFwibmVlZCBsb29rYWhlYWRcIik7XG5cbiAgZG8ge1xuICAgIC8vIEFzc2VydChjdXJfbWF0Y2ggPCBzLT5zdHJzdGFydCwgXCJubyBmdXR1cmVcIik7XG4gICAgbWF0Y2ggPSBjdXJfbWF0Y2g7XG5cbiAgICAvKiBTa2lwIHRvIG5leHQgbWF0Y2ggaWYgdGhlIG1hdGNoIGxlbmd0aCBjYW5ub3QgaW5jcmVhc2VcbiAgICAgKiBvciBpZiB0aGUgbWF0Y2ggbGVuZ3RoIGlzIGxlc3MgdGhhbiAyLiAgTm90ZSB0aGF0IHRoZSBjaGVja3MgYmVsb3dcbiAgICAgKiBmb3IgaW5zdWZmaWNpZW50IGxvb2thaGVhZCBvbmx5IG9jY3VyIG9jY2FzaW9uYWxseSBmb3IgcGVyZm9ybWFuY2VcbiAgICAgKiByZWFzb25zLiAgVGhlcmVmb3JlIHVuaW5pdGlhbGl6ZWQgbWVtb3J5IHdpbGwgYmUgYWNjZXNzZWQsIGFuZFxuICAgICAqIGNvbmRpdGlvbmFsIGp1bXBzIHdpbGwgYmUgbWFkZSB0aGF0IGRlcGVuZCBvbiB0aG9zZSB2YWx1ZXMuXG4gICAgICogSG93ZXZlciB0aGUgbGVuZ3RoIG9mIHRoZSBtYXRjaCBpcyBsaW1pdGVkIHRvIHRoZSBsb29rYWhlYWQsIHNvXG4gICAgICogdGhlIG91dHB1dCBvZiBkZWZsYXRlIGlzIG5vdCBhZmZlY3RlZCBieSB0aGUgdW5pbml0aWFsaXplZCB2YWx1ZXMuXG4gICAgICovXG5cbiAgICBpZiAoX3dpblttYXRjaCArIGJlc3RfbGVuXSAgICAgIT09IHNjYW5fZW5kICB8fFxuICAgICAgICBfd2luW21hdGNoICsgYmVzdF9sZW4gLSAxXSAhPT0gc2Nhbl9lbmQxIHx8XG4gICAgICAgIF93aW5bbWF0Y2hdICAgICAgICAgICAgICAgICE9PSBfd2luW3NjYW5dIHx8XG4gICAgICAgIF93aW5bKyttYXRjaF0gICAgICAgICAgICAgICE9PSBfd2luW3NjYW4gKyAxXSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyogVGhlIGNoZWNrIGF0IGJlc3RfbGVuLTEgY2FuIGJlIHJlbW92ZWQgYmVjYXVzZSBpdCB3aWxsIGJlIG1hZGVcbiAgICAgKiBhZ2FpbiBsYXRlci4gKFRoaXMgaGV1cmlzdGljIGlzIG5vdCBhbHdheXMgYSB3aW4uKVxuICAgICAqIEl0IGlzIG5vdCBuZWNlc3NhcnkgdG8gY29tcGFyZSBzY2FuWzJdIGFuZCBtYXRjaFsyXSBzaW5jZSB0aGV5XG4gICAgICogYXJlIGFsd2F5cyBlcXVhbCB3aGVuIHRoZSBvdGhlciBieXRlcyBtYXRjaCwgZ2l2ZW4gdGhhdFxuICAgICAqIHRoZSBoYXNoIGtleXMgYXJlIGVxdWFsIGFuZCB0aGF0IEhBU0hfQklUUyA+PSA4LlxuICAgICAqL1xuICAgIHNjYW4gKz0gMjtcbiAgICBtYXRjaCsrO1xuICAgIC8vIEFzc2VydCgqc2NhbiA9PSAqbWF0Y2gsIFwibWF0Y2hbMl0/XCIpO1xuXG4gICAgLyogV2UgY2hlY2sgZm9yIGluc3VmZmljaWVudCBsb29rYWhlYWQgb25seSBldmVyeSA4dGggY29tcGFyaXNvbjtcbiAgICAgKiB0aGUgMjU2dGggY2hlY2sgd2lsbCBiZSBtYWRlIGF0IHN0cnN0YXJ0KzI1OC5cbiAgICAgKi9cbiAgICBkbyB7XG4gICAgICAvKmpzaGludCBub2VtcHR5OmZhbHNlKi9cbiAgICB9IHdoaWxlIChfd2luWysrc2Nhbl0gPT09IF93aW5bKyttYXRjaF0gJiYgX3dpblsrK3NjYW5dID09PSBfd2luWysrbWF0Y2hdICYmXG4gICAgICAgICAgICAgX3dpblsrK3NjYW5dID09PSBfd2luWysrbWF0Y2hdICYmIF93aW5bKytzY2FuXSA9PT0gX3dpblsrK21hdGNoXSAmJlxuICAgICAgICAgICAgIF93aW5bKytzY2FuXSA9PT0gX3dpblsrK21hdGNoXSAmJiBfd2luWysrc2Nhbl0gPT09IF93aW5bKyttYXRjaF0gJiZcbiAgICAgICAgICAgICBfd2luWysrc2Nhbl0gPT09IF93aW5bKyttYXRjaF0gJiYgX3dpblsrK3NjYW5dID09PSBfd2luWysrbWF0Y2hdICYmXG4gICAgICAgICAgICAgc2NhbiA8IHN0cmVuZCk7XG5cbiAgICAvLyBBc3NlcnQoc2NhbiA8PSBzLT53aW5kb3crKHVuc2lnbmVkKShzLT53aW5kb3dfc2l6ZS0xKSwgXCJ3aWxkIHNjYW5cIik7XG5cbiAgICBsZW4gPSBNQVhfTUFUQ0ggLSAoc3RyZW5kIC0gc2Nhbik7XG4gICAgc2NhbiA9IHN0cmVuZCAtIE1BWF9NQVRDSDtcblxuICAgIGlmIChsZW4gPiBiZXN0X2xlbikge1xuICAgICAgcy5tYXRjaF9zdGFydCA9IGN1cl9tYXRjaDtcbiAgICAgIGJlc3RfbGVuID0gbGVuO1xuICAgICAgaWYgKGxlbiA+PSBuaWNlX21hdGNoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgc2Nhbl9lbmQxICA9IF93aW5bc2NhbiArIGJlc3RfbGVuIC0gMV07XG4gICAgICBzY2FuX2VuZCAgID0gX3dpbltzY2FuICsgYmVzdF9sZW5dO1xuICAgIH1cbiAgfSB3aGlsZSAoKGN1cl9tYXRjaCA9IHByZXZbY3VyX21hdGNoICYgd21hc2tdKSA+IGxpbWl0ICYmIC0tY2hhaW5fbGVuZ3RoICE9PSAwKTtcblxuICBpZiAoYmVzdF9sZW4gPD0gcy5sb29rYWhlYWQpIHtcbiAgICByZXR1cm4gYmVzdF9sZW47XG4gIH1cbiAgcmV0dXJuIHMubG9va2FoZWFkO1xufVxuXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsbCB0aGUgd2luZG93IHdoZW4gdGhlIGxvb2thaGVhZCBiZWNvbWVzIGluc3VmZmljaWVudC5cbiAqIFVwZGF0ZXMgc3Ryc3RhcnQgYW5kIGxvb2thaGVhZC5cbiAqXG4gKiBJTiBhc3NlcnRpb246IGxvb2thaGVhZCA8IE1JTl9MT09LQUhFQURcbiAqIE9VVCBhc3NlcnRpb25zOiBzdHJzdGFydCA8PSB3aW5kb3dfc2l6ZS1NSU5fTE9PS0FIRUFEXG4gKiAgICBBdCBsZWFzdCBvbmUgYnl0ZSBoYXMgYmVlbiByZWFkLCBvciBhdmFpbF9pbiA9PSAwOyByZWFkcyBhcmVcbiAqICAgIHBlcmZvcm1lZCBmb3IgYXQgbGVhc3QgdHdvIGJ5dGVzIChyZXF1aXJlZCBmb3IgdGhlIHppcCB0cmFuc2xhdGVfZW9sXG4gKiAgICBvcHRpb24gLS0gbm90IHN1cHBvcnRlZCBoZXJlKS5cbiAqL1xuZnVuY3Rpb24gZmlsbF93aW5kb3cocykge1xuICB2YXIgX3dfc2l6ZSA9IHMud19zaXplO1xuICB2YXIgcCwgbiwgbSwgbW9yZSwgc3RyO1xuXG4gIC8vQXNzZXJ0KHMtPmxvb2thaGVhZCA8IE1JTl9MT09LQUhFQUQsIFwiYWxyZWFkeSBlbm91Z2ggbG9va2FoZWFkXCIpO1xuXG4gIGRvIHtcbiAgICBtb3JlID0gcy53aW5kb3dfc2l6ZSAtIHMubG9va2FoZWFkIC0gcy5zdHJzdGFydDtcblxuICAgIC8vIEpTIGludHMgaGF2ZSAzMiBiaXQsIGJsb2NrIGJlbG93IG5vdCBuZWVkZWRcbiAgICAvKiBEZWFsIHdpdGggIUAjJCUgNjRLIGxpbWl0OiAqL1xuICAgIC8vaWYgKHNpemVvZihpbnQpIDw9IDIpIHtcbiAgICAvLyAgICBpZiAobW9yZSA9PSAwICYmIHMtPnN0cnN0YXJ0ID09IDAgJiYgcy0+bG9va2FoZWFkID09IDApIHtcbiAgICAvLyAgICAgICAgbW9yZSA9IHdzaXplO1xuICAgIC8vXG4gICAgLy8gIH0gZWxzZSBpZiAobW9yZSA9PSAodW5zaWduZWQpKC0xKSkge1xuICAgIC8vICAgICAgICAvKiBWZXJ5IHVubGlrZWx5LCBidXQgcG9zc2libGUgb24gMTYgYml0IG1hY2hpbmUgaWZcbiAgICAvLyAgICAgICAgICogc3Ryc3RhcnQgPT0gMCAmJiBsb29rYWhlYWQgPT0gMSAoaW5wdXQgZG9uZSBhIGJ5dGUgYXQgdGltZSlcbiAgICAvLyAgICAgICAgICovXG4gICAgLy8gICAgICAgIG1vcmUtLTtcbiAgICAvLyAgICB9XG4gICAgLy99XG5cblxuICAgIC8qIElmIHRoZSB3aW5kb3cgaXMgYWxtb3N0IGZ1bGwgYW5kIHRoZXJlIGlzIGluc3VmZmljaWVudCBsb29rYWhlYWQsXG4gICAgICogbW92ZSB0aGUgdXBwZXIgaGFsZiB0byB0aGUgbG93ZXIgb25lIHRvIG1ha2Ugcm9vbSBpbiB0aGUgdXBwZXIgaGFsZi5cbiAgICAgKi9cbiAgICBpZiAocy5zdHJzdGFydCA+PSBfd19zaXplICsgKF93X3NpemUgLSBNSU5fTE9PS0FIRUFEKSkge1xuXG4gICAgICB1dGlscy5hcnJheVNldChzLndpbmRvdywgcy53aW5kb3csIF93X3NpemUsIF93X3NpemUsIDApO1xuICAgICAgcy5tYXRjaF9zdGFydCAtPSBfd19zaXplO1xuICAgICAgcy5zdHJzdGFydCAtPSBfd19zaXplO1xuICAgICAgLyogd2Ugbm93IGhhdmUgc3Ryc3RhcnQgPj0gTUFYX0RJU1QgKi9cbiAgICAgIHMuYmxvY2tfc3RhcnQgLT0gX3dfc2l6ZTtcblxuICAgICAgLyogU2xpZGUgdGhlIGhhc2ggdGFibGUgKGNvdWxkIGJlIGF2b2lkZWQgd2l0aCAzMiBiaXQgdmFsdWVzXG4gICAgICAgYXQgdGhlIGV4cGVuc2Ugb2YgbWVtb3J5IHVzYWdlKS4gV2Ugc2xpZGUgZXZlbiB3aGVuIGxldmVsID09IDBcbiAgICAgICB0byBrZWVwIHRoZSBoYXNoIHRhYmxlIGNvbnNpc3RlbnQgaWYgd2Ugc3dpdGNoIGJhY2sgdG8gbGV2ZWwgPiAwXG4gICAgICAgbGF0ZXIuIChVc2luZyBsZXZlbCAwIHBlcm1hbmVudGx5IGlzIG5vdCBhbiBvcHRpbWFsIHVzYWdlIG9mXG4gICAgICAgemxpYiwgc28gd2UgZG9uJ3QgY2FyZSBhYm91dCB0aGlzIHBhdGhvbG9naWNhbCBjYXNlLilcbiAgICAgICAqL1xuXG4gICAgICBuID0gcy5oYXNoX3NpemU7XG4gICAgICBwID0gbjtcbiAgICAgIGRvIHtcbiAgICAgICAgbSA9IHMuaGVhZFstLXBdO1xuICAgICAgICBzLmhlYWRbcF0gPSAobSA+PSBfd19zaXplID8gbSAtIF93X3NpemUgOiAwKTtcbiAgICAgIH0gd2hpbGUgKC0tbik7XG5cbiAgICAgIG4gPSBfd19zaXplO1xuICAgICAgcCA9IG47XG4gICAgICBkbyB7XG4gICAgICAgIG0gPSBzLnByZXZbLS1wXTtcbiAgICAgICAgcy5wcmV2W3BdID0gKG0gPj0gX3dfc2l6ZSA/IG0gLSBfd19zaXplIDogMCk7XG4gICAgICAgIC8qIElmIG4gaXMgbm90IG9uIGFueSBoYXNoIGNoYWluLCBwcmV2W25dIGlzIGdhcmJhZ2UgYnV0XG4gICAgICAgICAqIGl0cyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHVzZWQuXG4gICAgICAgICAqL1xuICAgICAgfSB3aGlsZSAoLS1uKTtcblxuICAgICAgbW9yZSArPSBfd19zaXplO1xuICAgIH1cbiAgICBpZiAocy5zdHJtLmF2YWlsX2luID09PSAwKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvKiBJZiB0aGVyZSB3YXMgbm8gc2xpZGluZzpcbiAgICAgKiAgICBzdHJzdGFydCA8PSBXU0laRStNQVhfRElTVC0xICYmIGxvb2thaGVhZCA8PSBNSU5fTE9PS0FIRUFEIC0gMSAmJlxuICAgICAqICAgIG1vcmUgPT0gd2luZG93X3NpemUgLSBsb29rYWhlYWQgLSBzdHJzdGFydFxuICAgICAqID0+IG1vcmUgPj0gd2luZG93X3NpemUgLSAoTUlOX0xPT0tBSEVBRC0xICsgV1NJWkUgKyBNQVhfRElTVC0xKVxuICAgICAqID0+IG1vcmUgPj0gd2luZG93X3NpemUgLSAyKldTSVpFICsgMlxuICAgICAqIEluIHRoZSBCSUdfTUVNIG9yIE1NQVAgY2FzZSAobm90IHlldCBzdXBwb3J0ZWQpLFxuICAgICAqICAgd2luZG93X3NpemUgPT0gaW5wdXRfc2l6ZSArIE1JTl9MT09LQUhFQUQgICYmXG4gICAgICogICBzdHJzdGFydCArIHMtPmxvb2thaGVhZCA8PSBpbnB1dF9zaXplID0+IG1vcmUgPj0gTUlOX0xPT0tBSEVBRC5cbiAgICAgKiBPdGhlcndpc2UsIHdpbmRvd19zaXplID09IDIqV1NJWkUgc28gbW9yZSA+PSAyLlxuICAgICAqIElmIHRoZXJlIHdhcyBzbGlkaW5nLCBtb3JlID49IFdTSVpFLiBTbyBpbiBhbGwgY2FzZXMsIG1vcmUgPj0gMi5cbiAgICAgKi9cbiAgICAvL0Fzc2VydChtb3JlID49IDIsIFwibW9yZSA8IDJcIik7XG4gICAgbiA9IHJlYWRfYnVmKHMuc3RybSwgcy53aW5kb3csIHMuc3Ryc3RhcnQgKyBzLmxvb2thaGVhZCwgbW9yZSk7XG4gICAgcy5sb29rYWhlYWQgKz0gbjtcblxuICAgIC8qIEluaXRpYWxpemUgdGhlIGhhc2ggdmFsdWUgbm93IHRoYXQgd2UgaGF2ZSBzb21lIGlucHV0OiAqL1xuICAgIGlmIChzLmxvb2thaGVhZCArIHMuaW5zZXJ0ID49IE1JTl9NQVRDSCkge1xuICAgICAgc3RyID0gcy5zdHJzdGFydCAtIHMuaW5zZXJ0O1xuICAgICAgcy5pbnNfaCA9IHMud2luZG93W3N0cl07XG5cbiAgICAgIC8qIFVQREFURV9IQVNIKHMsIHMtPmluc19oLCBzLT53aW5kb3dbc3RyICsgMV0pOyAqL1xuICAgICAgcy5pbnNfaCA9ICgocy5pbnNfaCA8PCBzLmhhc2hfc2hpZnQpIF4gcy53aW5kb3dbc3RyICsgMV0pICYgcy5oYXNoX21hc2s7XG4vLyNpZiBNSU5fTUFUQ0ggIT0gM1xuLy8gICAgICAgIENhbGwgdXBkYXRlX2hhc2goKSBNSU5fTUFUQ0gtMyBtb3JlIHRpbWVzXG4vLyNlbmRpZlxuICAgICAgd2hpbGUgKHMuaW5zZXJ0KSB7XG4gICAgICAgIC8qIFVQREFURV9IQVNIKHMsIHMtPmluc19oLCBzLT53aW5kb3dbc3RyICsgTUlOX01BVENILTFdKTsgKi9cbiAgICAgICAgcy5pbnNfaCA9ICgocy5pbnNfaCA8PCBzLmhhc2hfc2hpZnQpIF4gcy53aW5kb3dbc3RyICsgTUlOX01BVENILTFdKSAmIHMuaGFzaF9tYXNrO1xuXG4gICAgICAgIHMucHJldltzdHIgJiBzLndfbWFza10gPSBzLmhlYWRbcy5pbnNfaF07XG4gICAgICAgIHMuaGVhZFtzLmluc19oXSA9IHN0cjtcbiAgICAgICAgc3RyKys7XG4gICAgICAgIHMuaW5zZXJ0LS07XG4gICAgICAgIGlmIChzLmxvb2thaGVhZCArIHMuaW5zZXJ0IDwgTUlOX01BVENIKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyogSWYgdGhlIHdob2xlIGlucHV0IGhhcyBsZXNzIHRoYW4gTUlOX01BVENIIGJ5dGVzLCBpbnNfaCBpcyBnYXJiYWdlLFxuICAgICAqIGJ1dCB0aGlzIGlzIG5vdCBpbXBvcnRhbnQgc2luY2Ugb25seSBsaXRlcmFsIGJ5dGVzIHdpbGwgYmUgZW1pdHRlZC5cbiAgICAgKi9cblxuICB9IHdoaWxlIChzLmxvb2thaGVhZCA8IE1JTl9MT09LQUhFQUQgJiYgcy5zdHJtLmF2YWlsX2luICE9PSAwKTtcblxuICAvKiBJZiB0aGUgV0lOX0lOSVQgYnl0ZXMgYWZ0ZXIgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBkYXRhIGhhdmUgbmV2ZXIgYmVlblxuICAgKiB3cml0dGVuLCB0aGVuIHplcm8gdGhvc2UgYnl0ZXMgaW4gb3JkZXIgdG8gYXZvaWQgbWVtb3J5IGNoZWNrIHJlcG9ydHMgb2ZcbiAgICogdGhlIHVzZSBvZiB1bmluaXRpYWxpemVkIChvciB1bmluaXRpYWxpc2VkIGFzIEp1bGlhbiB3cml0ZXMpIGJ5dGVzIGJ5XG4gICAqIHRoZSBsb25nZXN0IG1hdGNoIHJvdXRpbmVzLiAgVXBkYXRlIHRoZSBoaWdoIHdhdGVyIG1hcmsgZm9yIHRoZSBuZXh0XG4gICAqIHRpbWUgdGhyb3VnaCBoZXJlLiAgV0lOX0lOSVQgaXMgc2V0IHRvIE1BWF9NQVRDSCBzaW5jZSB0aGUgbG9uZ2VzdCBtYXRjaFxuICAgKiByb3V0aW5lcyBhbGxvdyBzY2FubmluZyB0byBzdHJzdGFydCArIE1BWF9NQVRDSCwgaWdub3JpbmcgbG9va2FoZWFkLlxuICAgKi9cbi8vICBpZiAocy5oaWdoX3dhdGVyIDwgcy53aW5kb3dfc2l6ZSkge1xuLy8gICAgdmFyIGN1cnIgPSBzLnN0cnN0YXJ0ICsgcy5sb29rYWhlYWQ7XG4vLyAgICB2YXIgaW5pdCA9IDA7XG4vL1xuLy8gICAgaWYgKHMuaGlnaF93YXRlciA8IGN1cnIpIHtcbi8vICAgICAgLyogUHJldmlvdXMgaGlnaCB3YXRlciBtYXJrIGJlbG93IGN1cnJlbnQgZGF0YSAtLSB6ZXJvIFdJTl9JTklUXG4vLyAgICAgICAqIGJ5dGVzIG9yIHVwIHRvIGVuZCBvZiB3aW5kb3csIHdoaWNoZXZlciBpcyBsZXNzLlxuLy8gICAgICAgKi9cbi8vICAgICAgaW5pdCA9IHMud2luZG93X3NpemUgLSBjdXJyO1xuLy8gICAgICBpZiAoaW5pdCA+IFdJTl9JTklUKVxuLy8gICAgICAgIGluaXQgPSBXSU5fSU5JVDtcbi8vICAgICAgem1lbXplcm8ocy0+d2luZG93ICsgY3VyciwgKHVuc2lnbmVkKWluaXQpO1xuLy8gICAgICBzLT5oaWdoX3dhdGVyID0gY3VyciArIGluaXQ7XG4vLyAgICB9XG4vLyAgICBlbHNlIGlmIChzLT5oaWdoX3dhdGVyIDwgKHVsZyljdXJyICsgV0lOX0lOSVQpIHtcbi8vICAgICAgLyogSGlnaCB3YXRlciBtYXJrIGF0IG9yIGFib3ZlIGN1cnJlbnQgZGF0YSwgYnV0IGJlbG93IGN1cnJlbnQgZGF0YVxuLy8gICAgICAgKiBwbHVzIFdJTl9JTklUIC0tIHplcm8gb3V0IHRvIGN1cnJlbnQgZGF0YSBwbHVzIFdJTl9JTklULCBvciB1cFxuLy8gICAgICAgKiB0byBlbmQgb2Ygd2luZG93LCB3aGljaGV2ZXIgaXMgbGVzcy5cbi8vICAgICAgICovXG4vLyAgICAgIGluaXQgPSAodWxnKWN1cnIgKyBXSU5fSU5JVCAtIHMtPmhpZ2hfd2F0ZXI7XG4vLyAgICAgIGlmIChpbml0ID4gcy0+d2luZG93X3NpemUgLSBzLT5oaWdoX3dhdGVyKVxuLy8gICAgICAgIGluaXQgPSBzLT53aW5kb3dfc2l6ZSAtIHMtPmhpZ2hfd2F0ZXI7XG4vLyAgICAgIHptZW16ZXJvKHMtPndpbmRvdyArIHMtPmhpZ2hfd2F0ZXIsICh1bnNpZ25lZClpbml0KTtcbi8vICAgICAgcy0+aGlnaF93YXRlciArPSBpbml0O1xuLy8gICAgfVxuLy8gIH1cbi8vXG4vLyAgQXNzZXJ0KCh1bGcpcy0+c3Ryc3RhcnQgPD0gcy0+d2luZG93X3NpemUgLSBNSU5fTE9PS0FIRUFELFxuLy8gICAgXCJub3QgZW5vdWdoIHJvb20gZm9yIHNlYXJjaFwiKTtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5IHdpdGhvdXQgY29tcHJlc3Npb24gYXMgbXVjaCBhcyBwb3NzaWJsZSBmcm9tIHRoZSBpbnB1dCBzdHJlYW0sIHJldHVyblxuICogdGhlIGN1cnJlbnQgYmxvY2sgc3RhdGUuXG4gKiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90IGluc2VydCBuZXcgc3RyaW5ncyBpbiB0aGUgZGljdGlvbmFyeSBzaW5jZVxuICogdW5jb21wcmVzc2libGUgZGF0YSBpcyBwcm9iYWJseSBub3QgdXNlZnVsLiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWRcbiAqIG9ubHkgZm9yIHRoZSBsZXZlbD0wIGNvbXByZXNzaW9uIG9wdGlvbi5cbiAqIE5PVEU6IHRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIG9wdGltaXplZCB0byBhdm9pZCBleHRyYSBjb3B5aW5nIGZyb21cbiAqIHdpbmRvdyB0byBwZW5kaW5nX2J1Zi5cbiAqL1xuZnVuY3Rpb24gZGVmbGF0ZV9zdG9yZWQocywgZmx1c2gpIHtcbiAgLyogU3RvcmVkIGJsb2NrcyBhcmUgbGltaXRlZCB0byAweGZmZmYgYnl0ZXMsIHBlbmRpbmdfYnVmIGlzIGxpbWl0ZWRcbiAgICogdG8gcGVuZGluZ19idWZfc2l6ZSwgYW5kIGVhY2ggc3RvcmVkIGJsb2NrIGhhcyBhIDUgYnl0ZSBoZWFkZXI6XG4gICAqL1xuICB2YXIgbWF4X2Jsb2NrX3NpemUgPSAweGZmZmY7XG5cbiAgaWYgKG1heF9ibG9ja19zaXplID4gcy5wZW5kaW5nX2J1Zl9zaXplIC0gNSkge1xuICAgIG1heF9ibG9ja19zaXplID0gcy5wZW5kaW5nX2J1Zl9zaXplIC0gNTtcbiAgfVxuXG4gIC8qIENvcHkgYXMgbXVjaCBhcyBwb3NzaWJsZSBmcm9tIGlucHV0IHRvIG91dHB1dDogKi9cbiAgZm9yICg7Oykge1xuICAgIC8qIEZpbGwgdGhlIHdpbmRvdyBhcyBtdWNoIGFzIHBvc3NpYmxlOiAqL1xuICAgIGlmIChzLmxvb2thaGVhZCA8PSAxKSB7XG5cbiAgICAgIC8vQXNzZXJ0KHMtPnN0cnN0YXJ0IDwgcy0+d19zaXplK01BWF9ESVNUKHMpIHx8XG4gICAgICAvLyAgcy0+YmxvY2tfc3RhcnQgPj0gKGxvbmcpcy0+d19zaXplLCBcInNsaWRlIHRvbyBsYXRlXCIpO1xuLy8gICAgICBpZiAoIShzLnN0cnN0YXJ0IDwgcy53X3NpemUgKyAocy53X3NpemUgLSBNSU5fTE9PS0FIRUFEKSB8fFxuLy8gICAgICAgIHMuYmxvY2tfc3RhcnQgPj0gcy53X3NpemUpKSB7XG4vLyAgICAgICAgdGhyb3cgIG5ldyBFcnJvcihcInNsaWRlIHRvbyBsYXRlXCIpO1xuLy8gICAgICB9XG5cbiAgICAgIGZpbGxfd2luZG93KHMpO1xuICAgICAgaWYgKHMubG9va2FoZWFkID09PSAwICYmIGZsdXNoID09PSBaX05PX0ZMVVNIKSB7XG4gICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzLmxvb2thaGVhZCA9PT0gMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8qIGZsdXNoIHRoZSBjdXJyZW50IGJsb2NrICovXG4gICAgfVxuICAgIC8vQXNzZXJ0KHMtPmJsb2NrX3N0YXJ0ID49IDBMLCBcImJsb2NrIGdvbmVcIik7XG4vLyAgICBpZiAocy5ibG9ja19zdGFydCA8IDApIHRocm93IG5ldyBFcnJvcihcImJsb2NrIGdvbmVcIik7XG5cbiAgICBzLnN0cnN0YXJ0ICs9IHMubG9va2FoZWFkO1xuICAgIHMubG9va2FoZWFkID0gMDtcblxuICAgIC8qIEVtaXQgYSBzdG9yZWQgYmxvY2sgaWYgcGVuZGluZ19idWYgd2lsbCBiZSBmdWxsOiAqL1xuICAgIHZhciBtYXhfc3RhcnQgPSBzLmJsb2NrX3N0YXJ0ICsgbWF4X2Jsb2NrX3NpemU7XG5cbiAgICBpZiAocy5zdHJzdGFydCA9PT0gMCB8fCBzLnN0cnN0YXJ0ID49IG1heF9zdGFydCkge1xuICAgICAgLyogc3Ryc3RhcnQgPT0gMCBpcyBwb3NzaWJsZSB3aGVuIHdyYXBhcm91bmQgb24gMTYtYml0IG1hY2hpbmUgKi9cbiAgICAgIHMubG9va2FoZWFkID0gcy5zdHJzdGFydCAtIG1heF9zdGFydDtcbiAgICAgIHMuc3Ryc3RhcnQgPSBtYXhfc3RhcnQ7XG4gICAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDApOyAqKiovXG4gICAgICBmbHVzaF9ibG9ja19vbmx5KHMsIGZhbHNlKTtcbiAgICAgIGlmIChzLnN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICB9XG4gICAgICAvKioqL1xuXG5cbiAgICB9XG4gICAgLyogRmx1c2ggaWYgd2UgbWF5IGhhdmUgdG8gc2xpZGUsIG90aGVyd2lzZSBibG9ja19zdGFydCBtYXkgYmVjb21lXG4gICAgICogbmVnYXRpdmUgYW5kIHRoZSBkYXRhIHdpbGwgYmUgZ29uZTpcbiAgICAgKi9cbiAgICBpZiAocy5zdHJzdGFydCAtIHMuYmxvY2tfc3RhcnQgPj0gKHMud19zaXplIC0gTUlOX0xPT0tBSEVBRCkpIHtcbiAgICAgIC8qKiogRkxVU0hfQkxPQ0socywgMCk7ICoqKi9cbiAgICAgIGZsdXNoX2Jsb2NrX29ubHkocywgZmFsc2UpO1xuICAgICAgaWYgKHMuc3RybS5hdmFpbF9vdXQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIEJTX05FRURfTU9SRTtcbiAgICAgIH1cbiAgICAgIC8qKiovXG4gICAgfVxuICB9XG5cbiAgcy5pbnNlcnQgPSAwO1xuXG4gIGlmIChmbHVzaCA9PT0gWl9GSU5JU0gpIHtcbiAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDEpOyAqKiovXG4gICAgZmx1c2hfYmxvY2tfb25seShzLCB0cnVlKTtcbiAgICBpZiAocy5zdHJtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgcmV0dXJuIEJTX0ZJTklTSF9TVEFSVEVEO1xuICAgIH1cbiAgICAvKioqL1xuICAgIHJldHVybiBCU19GSU5JU0hfRE9ORTtcbiAgfVxuXG4gIGlmIChzLnN0cnN0YXJ0ID4gcy5ibG9ja19zdGFydCkge1xuICAgIC8qKiogRkxVU0hfQkxPQ0socywgMCk7ICoqKi9cbiAgICBmbHVzaF9ibG9ja19vbmx5KHMsIGZhbHNlKTtcbiAgICBpZiAocy5zdHJtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgcmV0dXJuIEJTX05FRURfTU9SRTtcbiAgICB9XG4gICAgLyoqKi9cbiAgfVxuXG4gIHJldHVybiBCU19ORUVEX01PUkU7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29tcHJlc3MgYXMgbXVjaCBhcyBwb3NzaWJsZSBmcm9tIHRoZSBpbnB1dCBzdHJlYW0sIHJldHVybiB0aGUgY3VycmVudFxuICogYmxvY2sgc3RhdGUuXG4gKiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90IHBlcmZvcm0gbGF6eSBldmFsdWF0aW9uIG9mIG1hdGNoZXMgYW5kIGluc2VydHNcbiAqIG5ldyBzdHJpbmdzIGluIHRoZSBkaWN0aW9uYXJ5IG9ubHkgZm9yIHVubWF0Y2hlZCBzdHJpbmdzIG9yIGZvciBzaG9ydFxuICogbWF0Y2hlcy4gSXQgaXMgdXNlZCBvbmx5IGZvciB0aGUgZmFzdCBjb21wcmVzc2lvbiBvcHRpb25zLlxuICovXG5mdW5jdGlvbiBkZWZsYXRlX2Zhc3QocywgZmx1c2gpIHtcbiAgdmFyIGhhc2hfaGVhZDsgICAgICAgIC8qIGhlYWQgb2YgdGhlIGhhc2ggY2hhaW4gKi9cbiAgdmFyIGJmbHVzaDsgICAgICAgICAgIC8qIHNldCBpZiBjdXJyZW50IGJsb2NrIG11c3QgYmUgZmx1c2hlZCAqL1xuXG4gIGZvciAoOzspIHtcbiAgICAvKiBNYWtlIHN1cmUgdGhhdCB3ZSBhbHdheXMgaGF2ZSBlbm91Z2ggbG9va2FoZWFkLCBleGNlcHRcbiAgICAgKiBhdCB0aGUgZW5kIG9mIHRoZSBpbnB1dCBmaWxlLiBXZSBuZWVkIE1BWF9NQVRDSCBieXRlc1xuICAgICAqIGZvciB0aGUgbmV4dCBtYXRjaCwgcGx1cyBNSU5fTUFUQ0ggYnl0ZXMgdG8gaW5zZXJ0IHRoZVxuICAgICAqIHN0cmluZyBmb2xsb3dpbmcgdGhlIG5leHQgbWF0Y2guXG4gICAgICovXG4gICAgaWYgKHMubG9va2FoZWFkIDwgTUlOX0xPT0tBSEVBRCkge1xuICAgICAgZmlsbF93aW5kb3cocyk7XG4gICAgICBpZiAocy5sb29rYWhlYWQgPCBNSU5fTE9PS0FIRUFEICYmIGZsdXNoID09PSBaX05PX0ZMVVNIKSB7XG4gICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICB9XG4gICAgICBpZiAocy5sb29rYWhlYWQgPT09IDApIHtcbiAgICAgICAgYnJlYWs7IC8qIGZsdXNoIHRoZSBjdXJyZW50IGJsb2NrICovXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogSW5zZXJ0IHRoZSBzdHJpbmcgd2luZG93W3N0cnN0YXJ0IC4uIHN0cnN0YXJ0KzJdIGluIHRoZVxuICAgICAqIGRpY3Rpb25hcnksIGFuZCBzZXQgaGFzaF9oZWFkIHRvIHRoZSBoZWFkIG9mIHRoZSBoYXNoIGNoYWluOlxuICAgICAqL1xuICAgIGhhc2hfaGVhZCA9IDAvKk5JTCovO1xuICAgIGlmIChzLmxvb2thaGVhZCA+PSBNSU5fTUFUQ0gpIHtcbiAgICAgIC8qKiogSU5TRVJUX1NUUklORyhzLCBzLnN0cnN0YXJ0LCBoYXNoX2hlYWQpOyAqKiovXG4gICAgICBzLmluc19oID0gKChzLmluc19oIDw8IHMuaGFzaF9zaGlmdCkgXiBzLndpbmRvd1tzLnN0cnN0YXJ0ICsgTUlOX01BVENIIC0gMV0pICYgcy5oYXNoX21hc2s7XG4gICAgICBoYXNoX2hlYWQgPSBzLnByZXZbcy5zdHJzdGFydCAmIHMud19tYXNrXSA9IHMuaGVhZFtzLmluc19oXTtcbiAgICAgIHMuaGVhZFtzLmluc19oXSA9IHMuc3Ryc3RhcnQ7XG4gICAgICAvKioqL1xuICAgIH1cblxuICAgIC8qIEZpbmQgdGhlIGxvbmdlc3QgbWF0Y2gsIGRpc2NhcmRpbmcgdGhvc2UgPD0gcHJldl9sZW5ndGguXG4gICAgICogQXQgdGhpcyBwb2ludCB3ZSBoYXZlIGFsd2F5cyBtYXRjaF9sZW5ndGggPCBNSU5fTUFUQ0hcbiAgICAgKi9cbiAgICBpZiAoaGFzaF9oZWFkICE9PSAwLypOSUwqLyAmJiAoKHMuc3Ryc3RhcnQgLSBoYXNoX2hlYWQpIDw9IChzLndfc2l6ZSAtIE1JTl9MT09LQUhFQUQpKSkge1xuICAgICAgLyogVG8gc2ltcGxpZnkgdGhlIGNvZGUsIHdlIHByZXZlbnQgbWF0Y2hlcyB3aXRoIHRoZSBzdHJpbmdcbiAgICAgICAqIG9mIHdpbmRvdyBpbmRleCAwIChpbiBwYXJ0aWN1bGFyIHdlIGhhdmUgdG8gYXZvaWQgYSBtYXRjaFxuICAgICAgICogb2YgdGhlIHN0cmluZyB3aXRoIGl0c2VsZiBhdCB0aGUgc3RhcnQgb2YgdGhlIGlucHV0IGZpbGUpLlxuICAgICAgICovXG4gICAgICBzLm1hdGNoX2xlbmd0aCA9IGxvbmdlc3RfbWF0Y2gocywgaGFzaF9oZWFkKTtcbiAgICAgIC8qIGxvbmdlc3RfbWF0Y2goKSBzZXRzIG1hdGNoX3N0YXJ0ICovXG4gICAgfVxuICAgIGlmIChzLm1hdGNoX2xlbmd0aCA+PSBNSU5fTUFUQ0gpIHtcbiAgICAgIC8vIGNoZWNrX21hdGNoKHMsIHMuc3Ryc3RhcnQsIHMubWF0Y2hfc3RhcnQsIHMubWF0Y2hfbGVuZ3RoKTsgLy8gZm9yIGRlYnVnIG9ubHlcblxuICAgICAgLyoqKiBfdHJfdGFsbHlfZGlzdChzLCBzLnN0cnN0YXJ0IC0gcy5tYXRjaF9zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgIHMubWF0Y2hfbGVuZ3RoIC0gTUlOX01BVENILCBiZmx1c2gpOyAqKiovXG4gICAgICBiZmx1c2ggPSB0cmVlcy5fdHJfdGFsbHkocywgcy5zdHJzdGFydCAtIHMubWF0Y2hfc3RhcnQsIHMubWF0Y2hfbGVuZ3RoIC0gTUlOX01BVENIKTtcblxuICAgICAgcy5sb29rYWhlYWQgLT0gcy5tYXRjaF9sZW5ndGg7XG5cbiAgICAgIC8qIEluc2VydCBuZXcgc3RyaW5ncyBpbiB0aGUgaGFzaCB0YWJsZSBvbmx5IGlmIHRoZSBtYXRjaCBsZW5ndGhcbiAgICAgICAqIGlzIG5vdCB0b28gbGFyZ2UuIFRoaXMgc2F2ZXMgdGltZSBidXQgZGVncmFkZXMgY29tcHJlc3Npb24uXG4gICAgICAgKi9cbiAgICAgIGlmIChzLm1hdGNoX2xlbmd0aCA8PSBzLm1heF9sYXp5X21hdGNoLyptYXhfaW5zZXJ0X2xlbmd0aCovICYmIHMubG9va2FoZWFkID49IE1JTl9NQVRDSCkge1xuICAgICAgICBzLm1hdGNoX2xlbmd0aC0tOyAvKiBzdHJpbmcgYXQgc3Ryc3RhcnQgYWxyZWFkeSBpbiB0YWJsZSAqL1xuICAgICAgICBkbyB7XG4gICAgICAgICAgcy5zdHJzdGFydCsrO1xuICAgICAgICAgIC8qKiogSU5TRVJUX1NUUklORyhzLCBzLnN0cnN0YXJ0LCBoYXNoX2hlYWQpOyAqKiovXG4gICAgICAgICAgcy5pbnNfaCA9ICgocy5pbnNfaCA8PCBzLmhhc2hfc2hpZnQpIF4gcy53aW5kb3dbcy5zdHJzdGFydCArIE1JTl9NQVRDSCAtIDFdKSAmIHMuaGFzaF9tYXNrO1xuICAgICAgICAgIGhhc2hfaGVhZCA9IHMucHJldltzLnN0cnN0YXJ0ICYgcy53X21hc2tdID0gcy5oZWFkW3MuaW5zX2hdO1xuICAgICAgICAgIHMuaGVhZFtzLmluc19oXSA9IHMuc3Ryc3RhcnQ7XG4gICAgICAgICAgLyoqKi9cbiAgICAgICAgICAvKiBzdHJzdGFydCBuZXZlciBleGNlZWRzIFdTSVpFLU1BWF9NQVRDSCwgc28gdGhlcmUgYXJlXG4gICAgICAgICAgICogYWx3YXlzIE1JTl9NQVRDSCBieXRlcyBhaGVhZC5cbiAgICAgICAgICAgKi9cbiAgICAgICAgfSB3aGlsZSAoLS1zLm1hdGNoX2xlbmd0aCAhPT0gMCk7XG4gICAgICAgIHMuc3Ryc3RhcnQrKztcbiAgICAgIH0gZWxzZVxuICAgICAge1xuICAgICAgICBzLnN0cnN0YXJ0ICs9IHMubWF0Y2hfbGVuZ3RoO1xuICAgICAgICBzLm1hdGNoX2xlbmd0aCA9IDA7XG4gICAgICAgIHMuaW5zX2ggPSBzLndpbmRvd1tzLnN0cnN0YXJ0XTtcbiAgICAgICAgLyogVVBEQVRFX0hBU0gocywgcy5pbnNfaCwgcy53aW5kb3dbcy5zdHJzdGFydCsxXSk7ICovXG4gICAgICAgIHMuaW5zX2ggPSAoKHMuaW5zX2ggPDwgcy5oYXNoX3NoaWZ0KSBeIHMud2luZG93W3Muc3Ryc3RhcnQgKyAxXSkgJiBzLmhhc2hfbWFzaztcblxuLy8jaWYgTUlOX01BVENIICE9IDNcbi8vICAgICAgICAgICAgICAgIENhbGwgVVBEQVRFX0hBU0goKSBNSU5fTUFUQ0gtMyBtb3JlIHRpbWVzXG4vLyNlbmRpZlxuICAgICAgICAvKiBJZiBsb29rYWhlYWQgPCBNSU5fTUFUQ0gsIGluc19oIGlzIGdhcmJhZ2UsIGJ1dCBpdCBkb2VzIG5vdFxuICAgICAgICAgKiBtYXR0ZXIgc2luY2UgaXQgd2lsbCBiZSByZWNvbXB1dGVkIGF0IG5leHQgZGVmbGF0ZSBjYWxsLlxuICAgICAgICAgKi9cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLyogTm8gbWF0Y2gsIG91dHB1dCBhIGxpdGVyYWwgYnl0ZSAqL1xuICAgICAgLy9UcmFjZXZ2KChzdGRlcnIsXCIlY1wiLCBzLndpbmRvd1tzLnN0cnN0YXJ0XSkpO1xuICAgICAgLyoqKiBfdHJfdGFsbHlfbGl0KHMsIHMud2luZG93W3Muc3Ryc3RhcnRdLCBiZmx1c2gpOyAqKiovXG4gICAgICBiZmx1c2ggPSB0cmVlcy5fdHJfdGFsbHkocywgMCwgcy53aW5kb3dbcy5zdHJzdGFydF0pO1xuXG4gICAgICBzLmxvb2thaGVhZC0tO1xuICAgICAgcy5zdHJzdGFydCsrO1xuICAgIH1cbiAgICBpZiAoYmZsdXNoKSB7XG4gICAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDApOyAqKiovXG4gICAgICBmbHVzaF9ibG9ja19vbmx5KHMsIGZhbHNlKTtcbiAgICAgIGlmIChzLnN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICB9XG4gICAgICAvKioqL1xuICAgIH1cbiAgfVxuICBzLmluc2VydCA9ICgocy5zdHJzdGFydCA8IChNSU5fTUFUQ0gtMSkpID8gcy5zdHJzdGFydCA6IE1JTl9NQVRDSC0xKTtcbiAgaWYgKGZsdXNoID09PSBaX0ZJTklTSCkge1xuICAgIC8qKiogRkxVU0hfQkxPQ0socywgMSk7ICoqKi9cbiAgICBmbHVzaF9ibG9ja19vbmx5KHMsIHRydWUpO1xuICAgIGlmIChzLnN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICByZXR1cm4gQlNfRklOSVNIX1NUQVJURUQ7XG4gICAgfVxuICAgIC8qKiovXG4gICAgcmV0dXJuIEJTX0ZJTklTSF9ET05FO1xuICB9XG4gIGlmIChzLmxhc3RfbGl0KSB7XG4gICAgLyoqKiBGTFVTSF9CTE9DSyhzLCAwKTsgKioqL1xuICAgIGZsdXNoX2Jsb2NrX29ubHkocywgZmFsc2UpO1xuICAgIGlmIChzLnN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICByZXR1cm4gQlNfTkVFRF9NT1JFO1xuICAgIH1cbiAgICAvKioqL1xuICB9XG4gIHJldHVybiBCU19CTE9DS19ET05FO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFNhbWUgYXMgYWJvdmUsIGJ1dCBhY2hpZXZlcyBiZXR0ZXIgY29tcHJlc3Npb24uIFdlIHVzZSBhIGxhenlcbiAqIGV2YWx1YXRpb24gZm9yIG1hdGNoZXM6IGEgbWF0Y2ggaXMgZmluYWxseSBhZG9wdGVkIG9ubHkgaWYgdGhlcmUgaXNcbiAqIG5vIGJldHRlciBtYXRjaCBhdCB0aGUgbmV4dCB3aW5kb3cgcG9zaXRpb24uXG4gKi9cbmZ1bmN0aW9uIGRlZmxhdGVfc2xvdyhzLCBmbHVzaCkge1xuICB2YXIgaGFzaF9oZWFkOyAgICAgICAgICAvKiBoZWFkIG9mIGhhc2ggY2hhaW4gKi9cbiAgdmFyIGJmbHVzaDsgICAgICAgICAgICAgIC8qIHNldCBpZiBjdXJyZW50IGJsb2NrIG11c3QgYmUgZmx1c2hlZCAqL1xuXG4gIHZhciBtYXhfaW5zZXJ0O1xuXG4gIC8qIFByb2Nlc3MgdGhlIGlucHV0IGJsb2NrLiAqL1xuICBmb3IgKDs7KSB7XG4gICAgLyogTWFrZSBzdXJlIHRoYXQgd2UgYWx3YXlzIGhhdmUgZW5vdWdoIGxvb2thaGVhZCwgZXhjZXB0XG4gICAgICogYXQgdGhlIGVuZCBvZiB0aGUgaW5wdXQgZmlsZS4gV2UgbmVlZCBNQVhfTUFUQ0ggYnl0ZXNcbiAgICAgKiBmb3IgdGhlIG5leHQgbWF0Y2gsIHBsdXMgTUlOX01BVENIIGJ5dGVzIHRvIGluc2VydCB0aGVcbiAgICAgKiBzdHJpbmcgZm9sbG93aW5nIHRoZSBuZXh0IG1hdGNoLlxuICAgICAqL1xuICAgIGlmIChzLmxvb2thaGVhZCA8IE1JTl9MT09LQUhFQUQpIHtcbiAgICAgIGZpbGxfd2luZG93KHMpO1xuICAgICAgaWYgKHMubG9va2FoZWFkIDwgTUlOX0xPT0tBSEVBRCAmJiBmbHVzaCA9PT0gWl9OT19GTFVTSCkge1xuICAgICAgICByZXR1cm4gQlNfTkVFRF9NT1JFO1xuICAgICAgfVxuICAgICAgaWYgKHMubG9va2FoZWFkID09PSAwKSB7IGJyZWFrOyB9IC8qIGZsdXNoIHRoZSBjdXJyZW50IGJsb2NrICovXG4gICAgfVxuXG4gICAgLyogSW5zZXJ0IHRoZSBzdHJpbmcgd2luZG93W3N0cnN0YXJ0IC4uIHN0cnN0YXJ0KzJdIGluIHRoZVxuICAgICAqIGRpY3Rpb25hcnksIGFuZCBzZXQgaGFzaF9oZWFkIHRvIHRoZSBoZWFkIG9mIHRoZSBoYXNoIGNoYWluOlxuICAgICAqL1xuICAgIGhhc2hfaGVhZCA9IDAvKk5JTCovO1xuICAgIGlmIChzLmxvb2thaGVhZCA+PSBNSU5fTUFUQ0gpIHtcbiAgICAgIC8qKiogSU5TRVJUX1NUUklORyhzLCBzLnN0cnN0YXJ0LCBoYXNoX2hlYWQpOyAqKiovXG4gICAgICBzLmluc19oID0gKChzLmluc19oIDw8IHMuaGFzaF9zaGlmdCkgXiBzLndpbmRvd1tzLnN0cnN0YXJ0ICsgTUlOX01BVENIIC0gMV0pICYgcy5oYXNoX21hc2s7XG4gICAgICBoYXNoX2hlYWQgPSBzLnByZXZbcy5zdHJzdGFydCAmIHMud19tYXNrXSA9IHMuaGVhZFtzLmluc19oXTtcbiAgICAgIHMuaGVhZFtzLmluc19oXSA9IHMuc3Ryc3RhcnQ7XG4gICAgICAvKioqL1xuICAgIH1cblxuICAgIC8qIEZpbmQgdGhlIGxvbmdlc3QgbWF0Y2gsIGRpc2NhcmRpbmcgdGhvc2UgPD0gcHJldl9sZW5ndGguXG4gICAgICovXG4gICAgcy5wcmV2X2xlbmd0aCA9IHMubWF0Y2hfbGVuZ3RoO1xuICAgIHMucHJldl9tYXRjaCA9IHMubWF0Y2hfc3RhcnQ7XG4gICAgcy5tYXRjaF9sZW5ndGggPSBNSU5fTUFUQ0gtMTtcblxuICAgIGlmIChoYXNoX2hlYWQgIT09IDAvKk5JTCovICYmIHMucHJldl9sZW5ndGggPCBzLm1heF9sYXp5X21hdGNoICYmXG4gICAgICAgIHMuc3Ryc3RhcnQgLSBoYXNoX2hlYWQgPD0gKHMud19zaXplLU1JTl9MT09LQUhFQUQpLypNQVhfRElTVChzKSovKSB7XG4gICAgICAvKiBUbyBzaW1wbGlmeSB0aGUgY29kZSwgd2UgcHJldmVudCBtYXRjaGVzIHdpdGggdGhlIHN0cmluZ1xuICAgICAgICogb2Ygd2luZG93IGluZGV4IDAgKGluIHBhcnRpY3VsYXIgd2UgaGF2ZSB0byBhdm9pZCBhIG1hdGNoXG4gICAgICAgKiBvZiB0aGUgc3RyaW5nIHdpdGggaXRzZWxmIGF0IHRoZSBzdGFydCBvZiB0aGUgaW5wdXQgZmlsZSkuXG4gICAgICAgKi9cbiAgICAgIHMubWF0Y2hfbGVuZ3RoID0gbG9uZ2VzdF9tYXRjaChzLCBoYXNoX2hlYWQpO1xuICAgICAgLyogbG9uZ2VzdF9tYXRjaCgpIHNldHMgbWF0Y2hfc3RhcnQgKi9cblxuICAgICAgaWYgKHMubWF0Y2hfbGVuZ3RoIDw9IDUgJiZcbiAgICAgICAgIChzLnN0cmF0ZWd5ID09PSBaX0ZJTFRFUkVEIHx8IChzLm1hdGNoX2xlbmd0aCA9PT0gTUlOX01BVENIICYmIHMuc3Ryc3RhcnQgLSBzLm1hdGNoX3N0YXJ0ID4gNDA5Ni8qVE9PX0ZBUiovKSkpIHtcblxuICAgICAgICAvKiBJZiBwcmV2X21hdGNoIGlzIGFsc28gTUlOX01BVENILCBtYXRjaF9zdGFydCBpcyBnYXJiYWdlXG4gICAgICAgICAqIGJ1dCB3ZSB3aWxsIGlnbm9yZSB0aGUgY3VycmVudCBtYXRjaCBhbnl3YXkuXG4gICAgICAgICAqL1xuICAgICAgICBzLm1hdGNoX2xlbmd0aCA9IE1JTl9NQVRDSC0xO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiBJZiB0aGVyZSB3YXMgYSBtYXRjaCBhdCB0aGUgcHJldmlvdXMgc3RlcCBhbmQgdGhlIGN1cnJlbnRcbiAgICAgKiBtYXRjaCBpcyBub3QgYmV0dGVyLCBvdXRwdXQgdGhlIHByZXZpb3VzIG1hdGNoOlxuICAgICAqL1xuICAgIGlmIChzLnByZXZfbGVuZ3RoID49IE1JTl9NQVRDSCAmJiBzLm1hdGNoX2xlbmd0aCA8PSBzLnByZXZfbGVuZ3RoKSB7XG4gICAgICBtYXhfaW5zZXJ0ID0gcy5zdHJzdGFydCArIHMubG9va2FoZWFkIC0gTUlOX01BVENIO1xuICAgICAgLyogRG8gbm90IGluc2VydCBzdHJpbmdzIGluIGhhc2ggdGFibGUgYmV5b25kIHRoaXMuICovXG5cbiAgICAgIC8vY2hlY2tfbWF0Y2gocywgcy5zdHJzdGFydC0xLCBzLnByZXZfbWF0Y2gsIHMucHJldl9sZW5ndGgpO1xuXG4gICAgICAvKioqX3RyX3RhbGx5X2Rpc3Qocywgcy5zdHJzdGFydCAtIDEgLSBzLnByZXZfbWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgICBzLnByZXZfbGVuZ3RoIC0gTUlOX01BVENILCBiZmx1c2gpOyoqKi9cbiAgICAgIGJmbHVzaCA9IHRyZWVzLl90cl90YWxseShzLCBzLnN0cnN0YXJ0IC0gMS0gcy5wcmV2X21hdGNoLCBzLnByZXZfbGVuZ3RoIC0gTUlOX01BVENIKTtcbiAgICAgIC8qIEluc2VydCBpbiBoYXNoIHRhYmxlIGFsbCBzdHJpbmdzIHVwIHRvIHRoZSBlbmQgb2YgdGhlIG1hdGNoLlxuICAgICAgICogc3Ryc3RhcnQtMSBhbmQgc3Ryc3RhcnQgYXJlIGFscmVhZHkgaW5zZXJ0ZWQuIElmIHRoZXJlIGlzIG5vdFxuICAgICAgICogZW5vdWdoIGxvb2thaGVhZCwgdGhlIGxhc3QgdHdvIHN0cmluZ3MgYXJlIG5vdCBpbnNlcnRlZCBpblxuICAgICAgICogdGhlIGhhc2ggdGFibGUuXG4gICAgICAgKi9cbiAgICAgIHMubG9va2FoZWFkIC09IHMucHJldl9sZW5ndGgtMTtcbiAgICAgIHMucHJldl9sZW5ndGggLT0gMjtcbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKCsrcy5zdHJzdGFydCA8PSBtYXhfaW5zZXJ0KSB7XG4gICAgICAgICAgLyoqKiBJTlNFUlRfU1RSSU5HKHMsIHMuc3Ryc3RhcnQsIGhhc2hfaGVhZCk7ICoqKi9cbiAgICAgICAgICBzLmluc19oID0gKChzLmluc19oIDw8IHMuaGFzaF9zaGlmdCkgXiBzLndpbmRvd1tzLnN0cnN0YXJ0ICsgTUlOX01BVENIIC0gMV0pICYgcy5oYXNoX21hc2s7XG4gICAgICAgICAgaGFzaF9oZWFkID0gcy5wcmV2W3Muc3Ryc3RhcnQgJiBzLndfbWFza10gPSBzLmhlYWRbcy5pbnNfaF07XG4gICAgICAgICAgcy5oZWFkW3MuaW5zX2hdID0gcy5zdHJzdGFydDtcbiAgICAgICAgICAvKioqL1xuICAgICAgICB9XG4gICAgICB9IHdoaWxlICgtLXMucHJldl9sZW5ndGggIT09IDApO1xuICAgICAgcy5tYXRjaF9hdmFpbGFibGUgPSAwO1xuICAgICAgcy5tYXRjaF9sZW5ndGggPSBNSU5fTUFUQ0gtMTtcbiAgICAgIHMuc3Ryc3RhcnQrKztcblxuICAgICAgaWYgKGJmbHVzaCkge1xuICAgICAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDApOyAqKiovXG4gICAgICAgIGZsdXNoX2Jsb2NrX29ubHkocywgZmFsc2UpO1xuICAgICAgICBpZiAocy5zdHJtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICAgIH1cbiAgICAgICAgLyoqKi9cbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAocy5tYXRjaF9hdmFpbGFibGUpIHtcbiAgICAgIC8qIElmIHRoZXJlIHdhcyBubyBtYXRjaCBhdCB0aGUgcHJldmlvdXMgcG9zaXRpb24sIG91dHB1dCBhXG4gICAgICAgKiBzaW5nbGUgbGl0ZXJhbC4gSWYgdGhlcmUgd2FzIGEgbWF0Y2ggYnV0IHRoZSBjdXJyZW50IG1hdGNoXG4gICAgICAgKiBpcyBsb25nZXIsIHRydW5jYXRlIHRoZSBwcmV2aW91cyBtYXRjaCB0byBhIHNpbmdsZSBsaXRlcmFsLlxuICAgICAgICovXG4gICAgICAvL1RyYWNldnYoKHN0ZGVycixcIiVjXCIsIHMtPndpbmRvd1tzLT5zdHJzdGFydC0xXSkpO1xuICAgICAgLyoqKiBfdHJfdGFsbHlfbGl0KHMsIHMud2luZG93W3Muc3Ryc3RhcnQtMV0sIGJmbHVzaCk7ICoqKi9cbiAgICAgIGJmbHVzaCA9IHRyZWVzLl90cl90YWxseShzLCAwLCBzLndpbmRvd1tzLnN0cnN0YXJ0LTFdKTtcblxuICAgICAgaWYgKGJmbHVzaCkge1xuICAgICAgICAvKioqIEZMVVNIX0JMT0NLX09OTFkocywgMCkgKioqL1xuICAgICAgICBmbHVzaF9ibG9ja19vbmx5KHMsIGZhbHNlKTtcbiAgICAgICAgLyoqKi9cbiAgICAgIH1cbiAgICAgIHMuc3Ryc3RhcnQrKztcbiAgICAgIHMubG9va2FoZWFkLS07XG4gICAgICBpZiAocy5zdHJtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gQlNfTkVFRF9NT1JFO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvKiBUaGVyZSBpcyBubyBwcmV2aW91cyBtYXRjaCB0byBjb21wYXJlIHdpdGgsIHdhaXQgZm9yXG4gICAgICAgKiB0aGUgbmV4dCBzdGVwIHRvIGRlY2lkZS5cbiAgICAgICAqL1xuICAgICAgcy5tYXRjaF9hdmFpbGFibGUgPSAxO1xuICAgICAgcy5zdHJzdGFydCsrO1xuICAgICAgcy5sb29rYWhlYWQtLTtcbiAgICB9XG4gIH1cbiAgLy9Bc3NlcnQgKGZsdXNoICE9IFpfTk9fRkxVU0gsIFwibm8gZmx1c2g/XCIpO1xuICBpZiAocy5tYXRjaF9hdmFpbGFibGUpIHtcbiAgICAvL1RyYWNldnYoKHN0ZGVycixcIiVjXCIsIHMtPndpbmRvd1tzLT5zdHJzdGFydC0xXSkpO1xuICAgIC8qKiogX3RyX3RhbGx5X2xpdChzLCBzLndpbmRvd1tzLnN0cnN0YXJ0LTFdLCBiZmx1c2gpOyAqKiovXG4gICAgYmZsdXNoID0gdHJlZXMuX3RyX3RhbGx5KHMsIDAsIHMud2luZG93W3Muc3Ryc3RhcnQtMV0pO1xuXG4gICAgcy5tYXRjaF9hdmFpbGFibGUgPSAwO1xuICB9XG4gIHMuaW5zZXJ0ID0gcy5zdHJzdGFydCA8IE1JTl9NQVRDSC0xID8gcy5zdHJzdGFydCA6IE1JTl9NQVRDSC0xO1xuICBpZiAoZmx1c2ggPT09IFpfRklOSVNIKSB7XG4gICAgLyoqKiBGTFVTSF9CTE9DSyhzLCAxKTsgKioqL1xuICAgIGZsdXNoX2Jsb2NrX29ubHkocywgdHJ1ZSk7XG4gICAgaWYgKHMuc3RybS5hdmFpbF9vdXQgPT09IDApIHtcbiAgICAgIHJldHVybiBCU19GSU5JU0hfU1RBUlRFRDtcbiAgICB9XG4gICAgLyoqKi9cbiAgICByZXR1cm4gQlNfRklOSVNIX0RPTkU7XG4gIH1cbiAgaWYgKHMubGFzdF9saXQpIHtcbiAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDApOyAqKiovXG4gICAgZmx1c2hfYmxvY2tfb25seShzLCBmYWxzZSk7XG4gICAgaWYgKHMuc3RybS5hdmFpbF9vdXQgPT09IDApIHtcbiAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgfVxuICAgIC8qKiovXG4gIH1cblxuICByZXR1cm4gQlNfQkxPQ0tfRE9ORTtcbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZvciBaX1JMRSwgc2ltcGx5IGxvb2sgZm9yIHJ1bnMgb2YgYnl0ZXMsIGdlbmVyYXRlIG1hdGNoZXMgb25seSBvZiBkaXN0YW5jZVxuICogb25lLiAgRG8gbm90IG1haW50YWluIGEgaGFzaCB0YWJsZS4gIChJdCB3aWxsIGJlIHJlZ2VuZXJhdGVkIGlmIHRoaXMgcnVuIG9mXG4gKiBkZWZsYXRlIHN3aXRjaGVzIGF3YXkgZnJvbSBaX1JMRS4pXG4gKi9cbmZ1bmN0aW9uIGRlZmxhdGVfcmxlKHMsIGZsdXNoKSB7XG4gIHZhciBiZmx1c2g7ICAgICAgICAgICAgLyogc2V0IGlmIGN1cnJlbnQgYmxvY2sgbXVzdCBiZSBmbHVzaGVkICovXG4gIHZhciBwcmV2OyAgICAgICAgICAgICAgLyogYnl0ZSBhdCBkaXN0YW5jZSBvbmUgdG8gbWF0Y2ggKi9cbiAgdmFyIHNjYW4sIHN0cmVuZDsgICAgICAvKiBzY2FuIGdvZXMgdXAgdG8gc3RyZW5kIGZvciBsZW5ndGggb2YgcnVuICovXG5cbiAgdmFyIF93aW4gPSBzLndpbmRvdztcblxuICBmb3IgKDs7KSB7XG4gICAgLyogTWFrZSBzdXJlIHRoYXQgd2UgYWx3YXlzIGhhdmUgZW5vdWdoIGxvb2thaGVhZCwgZXhjZXB0XG4gICAgICogYXQgdGhlIGVuZCBvZiB0aGUgaW5wdXQgZmlsZS4gV2UgbmVlZCBNQVhfTUFUQ0ggYnl0ZXNcbiAgICAgKiBmb3IgdGhlIGxvbmdlc3QgcnVuLCBwbHVzIG9uZSBmb3IgdGhlIHVucm9sbGVkIGxvb3AuXG4gICAgICovXG4gICAgaWYgKHMubG9va2FoZWFkIDw9IE1BWF9NQVRDSCkge1xuICAgICAgZmlsbF93aW5kb3cocyk7XG4gICAgICBpZiAocy5sb29rYWhlYWQgPD0gTUFYX01BVENIICYmIGZsdXNoID09PSBaX05PX0ZMVVNIKSB7XG4gICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICB9XG4gICAgICBpZiAocy5sb29rYWhlYWQgPT09IDApIHsgYnJlYWs7IH0gLyogZmx1c2ggdGhlIGN1cnJlbnQgYmxvY2sgKi9cbiAgICB9XG5cbiAgICAvKiBTZWUgaG93IG1hbnkgdGltZXMgdGhlIHByZXZpb3VzIGJ5dGUgcmVwZWF0cyAqL1xuICAgIHMubWF0Y2hfbGVuZ3RoID0gMDtcbiAgICBpZiAocy5sb29rYWhlYWQgPj0gTUlOX01BVENIICYmIHMuc3Ryc3RhcnQgPiAwKSB7XG4gICAgICBzY2FuID0gcy5zdHJzdGFydCAtIDE7XG4gICAgICBwcmV2ID0gX3dpbltzY2FuXTtcbiAgICAgIGlmIChwcmV2ID09PSBfd2luWysrc2Nhbl0gJiYgcHJldiA9PT0gX3dpblsrK3NjYW5dICYmIHByZXYgPT09IF93aW5bKytzY2FuXSkge1xuICAgICAgICBzdHJlbmQgPSBzLnN0cnN0YXJ0ICsgTUFYX01BVENIO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgLypqc2hpbnQgbm9lbXB0eTpmYWxzZSovXG4gICAgICAgIH0gd2hpbGUgKHByZXYgPT09IF93aW5bKytzY2FuXSAmJiBwcmV2ID09PSBfd2luWysrc2Nhbl0gJiZcbiAgICAgICAgICAgICAgICAgcHJldiA9PT0gX3dpblsrK3NjYW5dICYmIHByZXYgPT09IF93aW5bKytzY2FuXSAmJlxuICAgICAgICAgICAgICAgICBwcmV2ID09PSBfd2luWysrc2Nhbl0gJiYgcHJldiA9PT0gX3dpblsrK3NjYW5dICYmXG4gICAgICAgICAgICAgICAgIHByZXYgPT09IF93aW5bKytzY2FuXSAmJiBwcmV2ID09PSBfd2luWysrc2Nhbl0gJiZcbiAgICAgICAgICAgICAgICAgc2NhbiA8IHN0cmVuZCk7XG4gICAgICAgIHMubWF0Y2hfbGVuZ3RoID0gTUFYX01BVENIIC0gKHN0cmVuZCAtIHNjYW4pO1xuICAgICAgICBpZiAocy5tYXRjaF9sZW5ndGggPiBzLmxvb2thaGVhZCkge1xuICAgICAgICAgIHMubWF0Y2hfbGVuZ3RoID0gcy5sb29rYWhlYWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vQXNzZXJ0KHNjYW4gPD0gcy0+d2luZG93Kyh1SW50KShzLT53aW5kb3dfc2l6ZS0xKSwgXCJ3aWxkIHNjYW5cIik7XG4gICAgfVxuXG4gICAgLyogRW1pdCBtYXRjaCBpZiBoYXZlIHJ1biBvZiBNSU5fTUFUQ0ggb3IgbG9uZ2VyLCBlbHNlIGVtaXQgbGl0ZXJhbCAqL1xuICAgIGlmIChzLm1hdGNoX2xlbmd0aCA+PSBNSU5fTUFUQ0gpIHtcbiAgICAgIC8vY2hlY2tfbWF0Y2gocywgcy5zdHJzdGFydCwgcy5zdHJzdGFydCAtIDEsIHMubWF0Y2hfbGVuZ3RoKTtcblxuICAgICAgLyoqKiBfdHJfdGFsbHlfZGlzdChzLCAxLCBzLm1hdGNoX2xlbmd0aCAtIE1JTl9NQVRDSCwgYmZsdXNoKTsgKioqL1xuICAgICAgYmZsdXNoID0gdHJlZXMuX3RyX3RhbGx5KHMsIDEsIHMubWF0Y2hfbGVuZ3RoIC0gTUlOX01BVENIKTtcblxuICAgICAgcy5sb29rYWhlYWQgLT0gcy5tYXRjaF9sZW5ndGg7XG4gICAgICBzLnN0cnN0YXJ0ICs9IHMubWF0Y2hfbGVuZ3RoO1xuICAgICAgcy5tYXRjaF9sZW5ndGggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKiBObyBtYXRjaCwgb3V0cHV0IGEgbGl0ZXJhbCBieXRlICovXG4gICAgICAvL1RyYWNldnYoKHN0ZGVycixcIiVjXCIsIHMtPndpbmRvd1tzLT5zdHJzdGFydF0pKTtcbiAgICAgIC8qKiogX3RyX3RhbGx5X2xpdChzLCBzLndpbmRvd1tzLnN0cnN0YXJ0XSwgYmZsdXNoKTsgKioqL1xuICAgICAgYmZsdXNoID0gdHJlZXMuX3RyX3RhbGx5KHMsIDAsIHMud2luZG93W3Muc3Ryc3RhcnRdKTtcblxuICAgICAgcy5sb29rYWhlYWQtLTtcbiAgICAgIHMuc3Ryc3RhcnQrKztcbiAgICB9XG4gICAgaWYgKGJmbHVzaCkge1xuICAgICAgLyoqKiBGTFVTSF9CTE9DSyhzLCAwKTsgKioqL1xuICAgICAgZmx1c2hfYmxvY2tfb25seShzLCBmYWxzZSk7XG4gICAgICBpZiAocy5zdHJtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gQlNfTkVFRF9NT1JFO1xuICAgICAgfVxuICAgICAgLyoqKi9cbiAgICB9XG4gIH1cbiAgcy5pbnNlcnQgPSAwO1xuICBpZiAoZmx1c2ggPT09IFpfRklOSVNIKSB7XG4gICAgLyoqKiBGTFVTSF9CTE9DSyhzLCAxKTsgKioqL1xuICAgIGZsdXNoX2Jsb2NrX29ubHkocywgdHJ1ZSk7XG4gICAgaWYgKHMuc3RybS5hdmFpbF9vdXQgPT09IDApIHtcbiAgICAgIHJldHVybiBCU19GSU5JU0hfU1RBUlRFRDtcbiAgICB9XG4gICAgLyoqKi9cbiAgICByZXR1cm4gQlNfRklOSVNIX0RPTkU7XG4gIH1cbiAgaWYgKHMubGFzdF9saXQpIHtcbiAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDApOyAqKiovXG4gICAgZmx1c2hfYmxvY2tfb25seShzLCBmYWxzZSk7XG4gICAgaWYgKHMuc3RybS5hdmFpbF9vdXQgPT09IDApIHtcbiAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgfVxuICAgIC8qKiovXG4gIH1cbiAgcmV0dXJuIEJTX0JMT0NLX0RPTkU7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRm9yIFpfSFVGRk1BTl9PTkxZLCBkbyBub3QgbG9vayBmb3IgbWF0Y2hlcy4gIERvIG5vdCBtYWludGFpbiBhIGhhc2ggdGFibGUuXG4gKiAoSXQgd2lsbCBiZSByZWdlbmVyYXRlZCBpZiB0aGlzIHJ1biBvZiBkZWZsYXRlIHN3aXRjaGVzIGF3YXkgZnJvbSBIdWZmbWFuLilcbiAqL1xuZnVuY3Rpb24gZGVmbGF0ZV9odWZmKHMsIGZsdXNoKSB7XG4gIHZhciBiZmx1c2g7ICAgICAgICAgICAgIC8qIHNldCBpZiBjdXJyZW50IGJsb2NrIG11c3QgYmUgZmx1c2hlZCAqL1xuXG4gIGZvciAoOzspIHtcbiAgICAvKiBNYWtlIHN1cmUgdGhhdCB3ZSBoYXZlIGEgbGl0ZXJhbCB0byB3cml0ZS4gKi9cbiAgICBpZiAocy5sb29rYWhlYWQgPT09IDApIHtcbiAgICAgIGZpbGxfd2luZG93KHMpO1xuICAgICAgaWYgKHMubG9va2FoZWFkID09PSAwKSB7XG4gICAgICAgIGlmIChmbHVzaCA9PT0gWl9OT19GTFVTSCkge1xuICAgICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7ICAgICAgLyogZmx1c2ggdGhlIGN1cnJlbnQgYmxvY2sgKi9cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBPdXRwdXQgYSBsaXRlcmFsIGJ5dGUgKi9cbiAgICBzLm1hdGNoX2xlbmd0aCA9IDA7XG4gICAgLy9UcmFjZXZ2KChzdGRlcnIsXCIlY1wiLCBzLT53aW5kb3dbcy0+c3Ryc3RhcnRdKSk7XG4gICAgLyoqKiBfdHJfdGFsbHlfbGl0KHMsIHMud2luZG93W3Muc3Ryc3RhcnRdLCBiZmx1c2gpOyAqKiovXG4gICAgYmZsdXNoID0gdHJlZXMuX3RyX3RhbGx5KHMsIDAsIHMud2luZG93W3Muc3Ryc3RhcnRdKTtcbiAgICBzLmxvb2thaGVhZC0tO1xuICAgIHMuc3Ryc3RhcnQrKztcbiAgICBpZiAoYmZsdXNoKSB7XG4gICAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDApOyAqKiovXG4gICAgICBmbHVzaF9ibG9ja19vbmx5KHMsIGZhbHNlKTtcbiAgICAgIGlmIChzLnN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiBCU19ORUVEX01PUkU7XG4gICAgICB9XG4gICAgICAvKioqL1xuICAgIH1cbiAgfVxuICBzLmluc2VydCA9IDA7XG4gIGlmIChmbHVzaCA9PT0gWl9GSU5JU0gpIHtcbiAgICAvKioqIEZMVVNIX0JMT0NLKHMsIDEpOyAqKiovXG4gICAgZmx1c2hfYmxvY2tfb25seShzLCB0cnVlKTtcbiAgICBpZiAocy5zdHJtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgcmV0dXJuIEJTX0ZJTklTSF9TVEFSVEVEO1xuICAgIH1cbiAgICAvKioqL1xuICAgIHJldHVybiBCU19GSU5JU0hfRE9ORTtcbiAgfVxuICBpZiAocy5sYXN0X2xpdCkge1xuICAgIC8qKiogRkxVU0hfQkxPQ0socywgMCk7ICoqKi9cbiAgICBmbHVzaF9ibG9ja19vbmx5KHMsIGZhbHNlKTtcbiAgICBpZiAocy5zdHJtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgcmV0dXJuIEJTX05FRURfTU9SRTtcbiAgICB9XG4gICAgLyoqKi9cbiAgfVxuICByZXR1cm4gQlNfQkxPQ0tfRE9ORTtcbn1cblxuLyogVmFsdWVzIGZvciBtYXhfbGF6eV9tYXRjaCwgZ29vZF9tYXRjaCBhbmQgbWF4X2NoYWluX2xlbmd0aCwgZGVwZW5kaW5nIG9uXG4gKiB0aGUgZGVzaXJlZCBwYWNrIGxldmVsICgwLi45KS4gVGhlIHZhbHVlcyBnaXZlbiBiZWxvdyBoYXZlIGJlZW4gdHVuZWQgdG9cbiAqIGV4Y2x1ZGUgd29yc3QgY2FzZSBwZXJmb3JtYW5jZSBmb3IgcGF0aG9sb2dpY2FsIGZpbGVzLiBCZXR0ZXIgdmFsdWVzIG1heSBiZVxuICogZm91bmQgZm9yIHNwZWNpZmljIGZpbGVzLlxuICovXG52YXIgQ29uZmlnID0gZnVuY3Rpb24gKGdvb2RfbGVuZ3RoLCBtYXhfbGF6eSwgbmljZV9sZW5ndGgsIG1heF9jaGFpbiwgZnVuYykge1xuICB0aGlzLmdvb2RfbGVuZ3RoID0gZ29vZF9sZW5ndGg7XG4gIHRoaXMubWF4X2xhenkgPSBtYXhfbGF6eTtcbiAgdGhpcy5uaWNlX2xlbmd0aCA9IG5pY2VfbGVuZ3RoO1xuICB0aGlzLm1heF9jaGFpbiA9IG1heF9jaGFpbjtcbiAgdGhpcy5mdW5jID0gZnVuYztcbn07XG5cbnZhciBjb25maWd1cmF0aW9uX3RhYmxlO1xuXG5jb25maWd1cmF0aW9uX3RhYmxlID0gW1xuICAvKiAgICAgIGdvb2QgbGF6eSBuaWNlIGNoYWluICovXG4gIG5ldyBDb25maWcoMCwgMCwgMCwgMCwgZGVmbGF0ZV9zdG9yZWQpLCAgICAgICAgICAvKiAwIHN0b3JlIG9ubHkgKi9cbiAgbmV3IENvbmZpZyg0LCA0LCA4LCA0LCBkZWZsYXRlX2Zhc3QpLCAgICAgICAgICAgIC8qIDEgbWF4IHNwZWVkLCBubyBsYXp5IG1hdGNoZXMgKi9cbiAgbmV3IENvbmZpZyg0LCA1LCAxNiwgOCwgZGVmbGF0ZV9mYXN0KSwgICAgICAgICAgIC8qIDIgKi9cbiAgbmV3IENvbmZpZyg0LCA2LCAzMiwgMzIsIGRlZmxhdGVfZmFzdCksICAgICAgICAgIC8qIDMgKi9cblxuICBuZXcgQ29uZmlnKDQsIDQsIDE2LCAxNiwgZGVmbGF0ZV9zbG93KSwgICAgICAgICAgLyogNCBsYXp5IG1hdGNoZXMgKi9cbiAgbmV3IENvbmZpZyg4LCAxNiwgMzIsIDMyLCBkZWZsYXRlX3Nsb3cpLCAgICAgICAgIC8qIDUgKi9cbiAgbmV3IENvbmZpZyg4LCAxNiwgMTI4LCAxMjgsIGRlZmxhdGVfc2xvdyksICAgICAgIC8qIDYgKi9cbiAgbmV3IENvbmZpZyg4LCAzMiwgMTI4LCAyNTYsIGRlZmxhdGVfc2xvdyksICAgICAgIC8qIDcgKi9cbiAgbmV3IENvbmZpZygzMiwgMTI4LCAyNTgsIDEwMjQsIGRlZmxhdGVfc2xvdyksICAgIC8qIDggKi9cbiAgbmV3IENvbmZpZygzMiwgMjU4LCAyNTgsIDQwOTYsIGRlZmxhdGVfc2xvdykgICAgIC8qIDkgbWF4IGNvbXByZXNzaW9uICovXG5dO1xuXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogSW5pdGlhbGl6ZSB0aGUgXCJsb25nZXN0IG1hdGNoXCIgcm91dGluZXMgZm9yIGEgbmV3IHpsaWIgc3RyZWFtXG4gKi9cbmZ1bmN0aW9uIGxtX2luaXQocykge1xuICBzLndpbmRvd19zaXplID0gMiAqIHMud19zaXplO1xuXG4gIC8qKiogQ0xFQVJfSEFTSChzKTsgKioqL1xuICB6ZXJvKHMuaGVhZCk7IC8vIEZpbGwgd2l0aCBOSUwgKD0gMCk7XG5cbiAgLyogU2V0IHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyczpcbiAgICovXG4gIHMubWF4X2xhenlfbWF0Y2ggPSBjb25maWd1cmF0aW9uX3RhYmxlW3MubGV2ZWxdLm1heF9sYXp5O1xuICBzLmdvb2RfbWF0Y2ggPSBjb25maWd1cmF0aW9uX3RhYmxlW3MubGV2ZWxdLmdvb2RfbGVuZ3RoO1xuICBzLm5pY2VfbWF0Y2ggPSBjb25maWd1cmF0aW9uX3RhYmxlW3MubGV2ZWxdLm5pY2VfbGVuZ3RoO1xuICBzLm1heF9jaGFpbl9sZW5ndGggPSBjb25maWd1cmF0aW9uX3RhYmxlW3MubGV2ZWxdLm1heF9jaGFpbjtcblxuICBzLnN0cnN0YXJ0ID0gMDtcbiAgcy5ibG9ja19zdGFydCA9IDA7XG4gIHMubG9va2FoZWFkID0gMDtcbiAgcy5pbnNlcnQgPSAwO1xuICBzLm1hdGNoX2xlbmd0aCA9IHMucHJldl9sZW5ndGggPSBNSU5fTUFUQ0ggLSAxO1xuICBzLm1hdGNoX2F2YWlsYWJsZSA9IDA7XG4gIHMuaW5zX2ggPSAwO1xufVxuXG5cbmZ1bmN0aW9uIERlZmxhdGVTdGF0ZSgpIHtcbiAgdGhpcy5zdHJtID0gbnVsbDsgICAgICAgICAgICAvKiBwb2ludGVyIGJhY2sgdG8gdGhpcyB6bGliIHN0cmVhbSAqL1xuICB0aGlzLnN0YXR1cyA9IDA7ICAgICAgICAgICAgLyogYXMgdGhlIG5hbWUgaW1wbGllcyAqL1xuICB0aGlzLnBlbmRpbmdfYnVmID0gbnVsbDsgICAgICAvKiBvdXRwdXQgc3RpbGwgcGVuZGluZyAqL1xuICB0aGlzLnBlbmRpbmdfYnVmX3NpemUgPSAwOyAgLyogc2l6ZSBvZiBwZW5kaW5nX2J1ZiAqL1xuICB0aGlzLnBlbmRpbmdfb3V0ID0gMDsgICAgICAgLyogbmV4dCBwZW5kaW5nIGJ5dGUgdG8gb3V0cHV0IHRvIHRoZSBzdHJlYW0gKi9cbiAgdGhpcy5wZW5kaW5nID0gMDsgICAgICAgICAgIC8qIG5iIG9mIGJ5dGVzIGluIHRoZSBwZW5kaW5nIGJ1ZmZlciAqL1xuICB0aGlzLndyYXAgPSAwOyAgICAgICAgICAgICAgLyogYml0IDAgdHJ1ZSBmb3IgemxpYiwgYml0IDEgdHJ1ZSBmb3IgZ3ppcCAqL1xuICB0aGlzLmd6aGVhZCA9IG51bGw7ICAgICAgICAgLyogZ3ppcCBoZWFkZXIgaW5mb3JtYXRpb24gdG8gd3JpdGUgKi9cbiAgdGhpcy5nemluZGV4ID0gMDsgICAgICAgICAgIC8qIHdoZXJlIGluIGV4dHJhLCBuYW1lLCBvciBjb21tZW50ICovXG4gIHRoaXMubWV0aG9kID0gWl9ERUZMQVRFRDsgLyogY2FuIG9ubHkgYmUgREVGTEFURUQgKi9cbiAgdGhpcy5sYXN0X2ZsdXNoID0gLTE7ICAgLyogdmFsdWUgb2YgZmx1c2ggcGFyYW0gZm9yIHByZXZpb3VzIGRlZmxhdGUgY2FsbCAqL1xuXG4gIHRoaXMud19zaXplID0gMDsgIC8qIExaNzcgd2luZG93IHNpemUgKDMySyBieSBkZWZhdWx0KSAqL1xuICB0aGlzLndfYml0cyA9IDA7ICAvKiBsb2cyKHdfc2l6ZSkgICg4Li4xNikgKi9cbiAgdGhpcy53X21hc2sgPSAwOyAgLyogd19zaXplIC0gMSAqL1xuXG4gIHRoaXMud2luZG93ID0gbnVsbDtcbiAgLyogU2xpZGluZyB3aW5kb3cuIElucHV0IGJ5dGVzIGFyZSByZWFkIGludG8gdGhlIHNlY29uZCBoYWxmIG9mIHRoZSB3aW5kb3csXG4gICAqIGFuZCBtb3ZlIHRvIHRoZSBmaXJzdCBoYWxmIGxhdGVyIHRvIGtlZXAgYSBkaWN0aW9uYXJ5IG9mIGF0IGxlYXN0IHdTaXplXG4gICAqIGJ5dGVzLiBXaXRoIHRoaXMgb3JnYW5pemF0aW9uLCBtYXRjaGVzIGFyZSBsaW1pdGVkIHRvIGEgZGlzdGFuY2Ugb2ZcbiAgICogd1NpemUtTUFYX01BVENIIGJ5dGVzLCBidXQgdGhpcyBlbnN1cmVzIHRoYXQgSU8gaXMgYWx3YXlzXG4gICAqIHBlcmZvcm1lZCB3aXRoIGEgbGVuZ3RoIG11bHRpcGxlIG9mIHRoZSBibG9jayBzaXplLlxuICAgKi9cblxuICB0aGlzLndpbmRvd19zaXplID0gMDtcbiAgLyogQWN0dWFsIHNpemUgb2Ygd2luZG93OiAyKndTaXplLCBleGNlcHQgd2hlbiB0aGUgdXNlciBpbnB1dCBidWZmZXJcbiAgICogaXMgZGlyZWN0bHkgdXNlZCBhcyBzbGlkaW5nIHdpbmRvdy5cbiAgICovXG5cbiAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgLyogTGluayB0byBvbGRlciBzdHJpbmcgd2l0aCBzYW1lIGhhc2ggaW5kZXguIFRvIGxpbWl0IHRoZSBzaXplIG9mIHRoaXNcbiAgICogYXJyYXkgdG8gNjRLLCB0aGlzIGxpbmsgaXMgbWFpbnRhaW5lZCBvbmx5IGZvciB0aGUgbGFzdCAzMksgc3RyaW5ncy5cbiAgICogQW4gaW5kZXggaW4gdGhpcyBhcnJheSBpcyB0aHVzIGEgd2luZG93IGluZGV4IG1vZHVsbyAzMksuXG4gICAqL1xuXG4gIHRoaXMuaGVhZCA9IG51bGw7ICAgLyogSGVhZHMgb2YgdGhlIGhhc2ggY2hhaW5zIG9yIE5JTC4gKi9cblxuICB0aGlzLmluc19oID0gMDsgICAgICAgLyogaGFzaCBpbmRleCBvZiBzdHJpbmcgdG8gYmUgaW5zZXJ0ZWQgKi9cbiAgdGhpcy5oYXNoX3NpemUgPSAwOyAgIC8qIG51bWJlciBvZiBlbGVtZW50cyBpbiBoYXNoIHRhYmxlICovXG4gIHRoaXMuaGFzaF9iaXRzID0gMDsgICAvKiBsb2cyKGhhc2hfc2l6ZSkgKi9cbiAgdGhpcy5oYXNoX21hc2sgPSAwOyAgIC8qIGhhc2hfc2l6ZS0xICovXG5cbiAgdGhpcy5oYXNoX3NoaWZ0ID0gMDtcbiAgLyogTnVtYmVyIG9mIGJpdHMgYnkgd2hpY2ggaW5zX2ggbXVzdCBiZSBzaGlmdGVkIGF0IGVhY2ggaW5wdXRcbiAgICogc3RlcC4gSXQgbXVzdCBiZSBzdWNoIHRoYXQgYWZ0ZXIgTUlOX01BVENIIHN0ZXBzLCB0aGUgb2xkZXN0XG4gICAqIGJ5dGUgbm8gbG9uZ2VyIHRha2VzIHBhcnQgaW4gdGhlIGhhc2gga2V5LCB0aGF0IGlzOlxuICAgKiAgIGhhc2hfc2hpZnQgKiBNSU5fTUFUQ0ggPj0gaGFzaF9iaXRzXG4gICAqL1xuXG4gIHRoaXMuYmxvY2tfc3RhcnQgPSAwO1xuICAvKiBXaW5kb3cgcG9zaXRpb24gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgY3VycmVudCBvdXRwdXQgYmxvY2suIEdldHNcbiAgICogbmVnYXRpdmUgd2hlbiB0aGUgd2luZG93IGlzIG1vdmVkIGJhY2t3YXJkcy5cbiAgICovXG5cbiAgdGhpcy5tYXRjaF9sZW5ndGggPSAwOyAgICAgIC8qIGxlbmd0aCBvZiBiZXN0IG1hdGNoICovXG4gIHRoaXMucHJldl9tYXRjaCA9IDA7ICAgICAgICAvKiBwcmV2aW91cyBtYXRjaCAqL1xuICB0aGlzLm1hdGNoX2F2YWlsYWJsZSA9IDA7ICAgLyogc2V0IGlmIHByZXZpb3VzIG1hdGNoIGV4aXN0cyAqL1xuICB0aGlzLnN0cnN0YXJ0ID0gMDsgICAgICAgICAgLyogc3RhcnQgb2Ygc3RyaW5nIHRvIGluc2VydCAqL1xuICB0aGlzLm1hdGNoX3N0YXJ0ID0gMDsgICAgICAgLyogc3RhcnQgb2YgbWF0Y2hpbmcgc3RyaW5nICovXG4gIHRoaXMubG9va2FoZWFkID0gMDsgICAgICAgICAvKiBudW1iZXIgb2YgdmFsaWQgYnl0ZXMgYWhlYWQgaW4gd2luZG93ICovXG5cbiAgdGhpcy5wcmV2X2xlbmd0aCA9IDA7XG4gIC8qIExlbmd0aCBvZiB0aGUgYmVzdCBtYXRjaCBhdCBwcmV2aW91cyBzdGVwLiBNYXRjaGVzIG5vdCBncmVhdGVyIHRoYW4gdGhpc1xuICAgKiBhcmUgZGlzY2FyZGVkLiBUaGlzIGlzIHVzZWQgaW4gdGhlIGxhenkgbWF0Y2ggZXZhbHVhdGlvbi5cbiAgICovXG5cbiAgdGhpcy5tYXhfY2hhaW5fbGVuZ3RoID0gMDtcbiAgLyogVG8gc3BlZWQgdXAgZGVmbGF0aW9uLCBoYXNoIGNoYWlucyBhcmUgbmV2ZXIgc2VhcmNoZWQgYmV5b25kIHRoaXNcbiAgICogbGVuZ3RoLiAgQSBoaWdoZXIgbGltaXQgaW1wcm92ZXMgY29tcHJlc3Npb24gcmF0aW8gYnV0IGRlZ3JhZGVzIHRoZVxuICAgKiBzcGVlZC5cbiAgICovXG5cbiAgdGhpcy5tYXhfbGF6eV9tYXRjaCA9IDA7XG4gIC8qIEF0dGVtcHQgdG8gZmluZCBhIGJldHRlciBtYXRjaCBvbmx5IHdoZW4gdGhlIGN1cnJlbnQgbWF0Y2ggaXMgc3RyaWN0bHlcbiAgICogc21hbGxlciB0aGFuIHRoaXMgdmFsdWUuIFRoaXMgbWVjaGFuaXNtIGlzIHVzZWQgb25seSBmb3IgY29tcHJlc3Npb25cbiAgICogbGV2ZWxzID49IDQuXG4gICAqL1xuICAvLyBUaGF0J3MgYWxpYXMgdG8gbWF4X2xhenlfbWF0Y2gsIGRvbid0IHVzZSBkaXJlY3RseVxuICAvL3RoaXMubWF4X2luc2VydF9sZW5ndGggPSAwO1xuICAvKiBJbnNlcnQgbmV3IHN0cmluZ3MgaW4gdGhlIGhhc2ggdGFibGUgb25seSBpZiB0aGUgbWF0Y2ggbGVuZ3RoIGlzIG5vdFxuICAgKiBncmVhdGVyIHRoYW4gdGhpcyBsZW5ndGguIFRoaXMgc2F2ZXMgdGltZSBidXQgZGVncmFkZXMgY29tcHJlc3Npb24uXG4gICAqIG1heF9pbnNlcnRfbGVuZ3RoIGlzIHVzZWQgb25seSBmb3IgY29tcHJlc3Npb24gbGV2ZWxzIDw9IDMuXG4gICAqL1xuXG4gIHRoaXMubGV2ZWwgPSAwOyAgICAgLyogY29tcHJlc3Npb24gbGV2ZWwgKDEuLjkpICovXG4gIHRoaXMuc3RyYXRlZ3kgPSAwOyAgLyogZmF2b3Igb3IgZm9yY2UgSHVmZm1hbiBjb2RpbmcqL1xuXG4gIHRoaXMuZ29vZF9tYXRjaCA9IDA7XG4gIC8qIFVzZSBhIGZhc3RlciBzZWFyY2ggd2hlbiB0aGUgcHJldmlvdXMgbWF0Y2ggaXMgbG9uZ2VyIHRoYW4gdGhpcyAqL1xuXG4gIHRoaXMubmljZV9tYXRjaCA9IDA7IC8qIFN0b3Agc2VhcmNoaW5nIHdoZW4gY3VycmVudCBtYXRjaCBleGNlZWRzIHRoaXMgKi9cblxuICAgICAgICAgICAgICAvKiB1c2VkIGJ5IHRyZWVzLmM6ICovXG5cbiAgLyogRGlkbid0IHVzZSBjdF9kYXRhIHR5cGVkZWYgYmVsb3cgdG8gc3VwcHJlc3MgY29tcGlsZXIgd2FybmluZyAqL1xuXG4gIC8vIHN0cnVjdCBjdF9kYXRhX3MgZHluX2x0cmVlW0hFQVBfU0laRV07ICAgLyogbGl0ZXJhbCBhbmQgbGVuZ3RoIHRyZWUgKi9cbiAgLy8gc3RydWN0IGN0X2RhdGFfcyBkeW5fZHRyZWVbMipEX0NPREVTKzFdOyAvKiBkaXN0YW5jZSB0cmVlICovXG4gIC8vIHN0cnVjdCBjdF9kYXRhX3MgYmxfdHJlZVsyKkJMX0NPREVTKzFdOyAgLyogSHVmZm1hbiB0cmVlIGZvciBiaXQgbGVuZ3RocyAqL1xuXG4gIC8vIFVzZSBmbGF0IGFycmF5IG9mIERPVUJMRSBzaXplLCB3aXRoIGludGVybGVhdmVkIGZhdGEsXG4gIC8vIGJlY2F1c2UgSlMgZG9lcyBub3Qgc3VwcG9ydCBlZmZlY3RpdmVcbiAgdGhpcy5keW5fbHRyZWUgID0gbmV3IHV0aWxzLkJ1ZjE2KEhFQVBfU0laRSAqIDIpO1xuICB0aGlzLmR5bl9kdHJlZSAgPSBuZXcgdXRpbHMuQnVmMTYoKDIqRF9DT0RFUysxKSAqIDIpO1xuICB0aGlzLmJsX3RyZWUgICAgPSBuZXcgdXRpbHMuQnVmMTYoKDIqQkxfQ09ERVMrMSkgKiAyKTtcbiAgemVybyh0aGlzLmR5bl9sdHJlZSk7XG4gIHplcm8odGhpcy5keW5fZHRyZWUpO1xuICB6ZXJvKHRoaXMuYmxfdHJlZSk7XG5cbiAgdGhpcy5sX2Rlc2MgICA9IG51bGw7ICAgICAgICAgLyogZGVzYy4gZm9yIGxpdGVyYWwgdHJlZSAqL1xuICB0aGlzLmRfZGVzYyAgID0gbnVsbDsgICAgICAgICAvKiBkZXNjLiBmb3IgZGlzdGFuY2UgdHJlZSAqL1xuICB0aGlzLmJsX2Rlc2MgID0gbnVsbDsgICAgICAgICAvKiBkZXNjLiBmb3IgYml0IGxlbmd0aCB0cmVlICovXG5cbiAgLy91c2ggYmxfY291bnRbTUFYX0JJVFMrMV07XG4gIHRoaXMuYmxfY291bnQgPSBuZXcgdXRpbHMuQnVmMTYoTUFYX0JJVFMrMSk7XG4gIC8qIG51bWJlciBvZiBjb2RlcyBhdCBlYWNoIGJpdCBsZW5ndGggZm9yIGFuIG9wdGltYWwgdHJlZSAqL1xuXG4gIC8vaW50IGhlYXBbMipMX0NPREVTKzFdOyAgICAgIC8qIGhlYXAgdXNlZCB0byBidWlsZCB0aGUgSHVmZm1hbiB0cmVlcyAqL1xuICB0aGlzLmhlYXAgPSBuZXcgdXRpbHMuQnVmMTYoMipMX0NPREVTKzEpOyAgLyogaGVhcCB1c2VkIHRvIGJ1aWxkIHRoZSBIdWZmbWFuIHRyZWVzICovXG4gIHplcm8odGhpcy5oZWFwKTtcblxuICB0aGlzLmhlYXBfbGVuID0gMDsgICAgICAgICAgICAgICAvKiBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGhlYXAgKi9cbiAgdGhpcy5oZWFwX21heCA9IDA7ICAgICAgICAgICAgICAgLyogZWxlbWVudCBvZiBsYXJnZXN0IGZyZXF1ZW5jeSAqL1xuICAvKiBUaGUgc29ucyBvZiBoZWFwW25dIGFyZSBoZWFwWzIqbl0gYW5kIGhlYXBbMipuKzFdLiBoZWFwWzBdIGlzIG5vdCB1c2VkLlxuICAgKiBUaGUgc2FtZSBoZWFwIGFycmF5IGlzIHVzZWQgdG8gYnVpbGQgYWxsIHRyZWVzLlxuICAgKi9cblxuICB0aGlzLmRlcHRoID0gbmV3IHV0aWxzLkJ1ZjE2KDIqTF9DT0RFUysxKTsgLy91Y2ggZGVwdGhbMipMX0NPREVTKzFdO1xuICB6ZXJvKHRoaXMuZGVwdGgpO1xuICAvKiBEZXB0aCBvZiBlYWNoIHN1YnRyZWUgdXNlZCBhcyB0aWUgYnJlYWtlciBmb3IgdHJlZXMgb2YgZXF1YWwgZnJlcXVlbmN5XG4gICAqL1xuXG4gIHRoaXMubF9idWYgPSAwOyAgICAgICAgICAvKiBidWZmZXIgaW5kZXggZm9yIGxpdGVyYWxzIG9yIGxlbmd0aHMgKi9cblxuICB0aGlzLmxpdF9idWZzaXplID0gMDtcbiAgLyogU2l6ZSBvZiBtYXRjaCBidWZmZXIgZm9yIGxpdGVyYWxzL2xlbmd0aHMuICBUaGVyZSBhcmUgNCByZWFzb25zIGZvclxuICAgKiBsaW1pdGluZyBsaXRfYnVmc2l6ZSB0byA2NEs6XG4gICAqICAgLSBmcmVxdWVuY2llcyBjYW4gYmUga2VwdCBpbiAxNiBiaXQgY291bnRlcnNcbiAgICogICAtIGlmIGNvbXByZXNzaW9uIGlzIG5vdCBzdWNjZXNzZnVsIGZvciB0aGUgZmlyc3QgYmxvY2ssIGFsbCBpbnB1dFxuICAgKiAgICAgZGF0YSBpcyBzdGlsbCBpbiB0aGUgd2luZG93IHNvIHdlIGNhbiBzdGlsbCBlbWl0IGEgc3RvcmVkIGJsb2NrIGV2ZW5cbiAgICogICAgIHdoZW4gaW5wdXQgY29tZXMgZnJvbSBzdGFuZGFyZCBpbnB1dC4gIChUaGlzIGNhbiBhbHNvIGJlIGRvbmUgZm9yXG4gICAqICAgICBhbGwgYmxvY2tzIGlmIGxpdF9idWZzaXplIGlzIG5vdCBncmVhdGVyIHRoYW4gMzJLLilcbiAgICogICAtIGlmIGNvbXByZXNzaW9uIGlzIG5vdCBzdWNjZXNzZnVsIGZvciBhIGZpbGUgc21hbGxlciB0aGFuIDY0Sywgd2UgY2FuXG4gICAqICAgICBldmVuIGVtaXQgYSBzdG9yZWQgZmlsZSBpbnN0ZWFkIG9mIGEgc3RvcmVkIGJsb2NrIChzYXZpbmcgNSBieXRlcykuXG4gICAqICAgICBUaGlzIGlzIGFwcGxpY2FibGUgb25seSBmb3IgemlwIChub3QgZ3ppcCBvciB6bGliKS5cbiAgICogICAtIGNyZWF0aW5nIG5ldyBIdWZmbWFuIHRyZWVzIGxlc3MgZnJlcXVlbnRseSBtYXkgbm90IHByb3ZpZGUgZmFzdFxuICAgKiAgICAgYWRhcHRhdGlvbiB0byBjaGFuZ2VzIGluIHRoZSBpbnB1dCBkYXRhIHN0YXRpc3RpY3MuIChUYWtlIGZvclxuICAgKiAgICAgZXhhbXBsZSBhIGJpbmFyeSBmaWxlIHdpdGggcG9vcmx5IGNvbXByZXNzaWJsZSBjb2RlIGZvbGxvd2VkIGJ5XG4gICAqICAgICBhIGhpZ2hseSBjb21wcmVzc2libGUgc3RyaW5nIHRhYmxlLikgU21hbGxlciBidWZmZXIgc2l6ZXMgZ2l2ZVxuICAgKiAgICAgZmFzdCBhZGFwdGF0aW9uIGJ1dCBoYXZlIG9mIGNvdXJzZSB0aGUgb3ZlcmhlYWQgb2YgdHJhbnNtaXR0aW5nXG4gICAqICAgICB0cmVlcyBtb3JlIGZyZXF1ZW50bHkuXG4gICAqICAgLSBJIGNhbid0IGNvdW50IGFib3ZlIDRcbiAgICovXG5cbiAgdGhpcy5sYXN0X2xpdCA9IDA7ICAgICAgLyogcnVubmluZyBpbmRleCBpbiBsX2J1ZiAqL1xuXG4gIHRoaXMuZF9idWYgPSAwO1xuICAvKiBCdWZmZXIgaW5kZXggZm9yIGRpc3RhbmNlcy4gVG8gc2ltcGxpZnkgdGhlIGNvZGUsIGRfYnVmIGFuZCBsX2J1ZiBoYXZlXG4gICAqIHRoZSBzYW1lIG51bWJlciBvZiBlbGVtZW50cy4gVG8gdXNlIGRpZmZlcmVudCBsZW5ndGhzLCBhbiBleHRyYSBmbGFnXG4gICAqIGFycmF5IHdvdWxkIGJlIG5lY2Vzc2FyeS5cbiAgICovXG5cbiAgdGhpcy5vcHRfbGVuID0gMDsgICAgICAgLyogYml0IGxlbmd0aCBvZiBjdXJyZW50IGJsb2NrIHdpdGggb3B0aW1hbCB0cmVlcyAqL1xuICB0aGlzLnN0YXRpY19sZW4gPSAwOyAgICAvKiBiaXQgbGVuZ3RoIG9mIGN1cnJlbnQgYmxvY2sgd2l0aCBzdGF0aWMgdHJlZXMgKi9cbiAgdGhpcy5tYXRjaGVzID0gMDsgICAgICAgLyogbnVtYmVyIG9mIHN0cmluZyBtYXRjaGVzIGluIGN1cnJlbnQgYmxvY2sgKi9cbiAgdGhpcy5pbnNlcnQgPSAwOyAgICAgICAgLyogYnl0ZXMgYXQgZW5kIG9mIHdpbmRvdyBsZWZ0IHRvIGluc2VydCAqL1xuXG5cbiAgdGhpcy5iaV9idWYgPSAwO1xuICAvKiBPdXRwdXQgYnVmZmVyLiBiaXRzIGFyZSBpbnNlcnRlZCBzdGFydGluZyBhdCB0aGUgYm90dG9tIChsZWFzdFxuICAgKiBzaWduaWZpY2FudCBiaXRzKS5cbiAgICovXG4gIHRoaXMuYmlfdmFsaWQgPSAwO1xuICAvKiBOdW1iZXIgb2YgdmFsaWQgYml0cyBpbiBiaV9idWYuICBBbGwgYml0cyBhYm92ZSB0aGUgbGFzdCB2YWxpZCBiaXRcbiAgICogYXJlIGFsd2F5cyB6ZXJvLlxuICAgKi9cblxuICAvLyBVc2VkIGZvciB3aW5kb3cgbWVtb3J5IGluaXQuIFdlIHNhZmVseSBpZ25vcmUgaXQgZm9yIEpTLiBUaGF0IG1ha2VzXG4gIC8vIHNlbnNlIG9ubHkgZm9yIHBvaW50ZXJzIGFuZCBtZW1vcnkgY2hlY2sgdG9vbHMuXG4gIC8vdGhpcy5oaWdoX3dhdGVyID0gMDtcbiAgLyogSGlnaCB3YXRlciBtYXJrIG9mZnNldCBpbiB3aW5kb3cgZm9yIGluaXRpYWxpemVkIGJ5dGVzIC0tIGJ5dGVzIGFib3ZlXG4gICAqIHRoaXMgYXJlIHNldCB0byB6ZXJvIGluIG9yZGVyIHRvIGF2b2lkIG1lbW9yeSBjaGVjayB3YXJuaW5ncyB3aGVuXG4gICAqIGxvbmdlc3QgbWF0Y2ggcm91dGluZXMgYWNjZXNzIGJ5dGVzIHBhc3QgdGhlIGlucHV0LiAgVGhpcyBpcyB0aGVuXG4gICAqIHVwZGF0ZWQgdG8gdGhlIG5ldyBoaWdoIHdhdGVyIG1hcmsuXG4gICAqL1xufVxuXG5cbmZ1bmN0aW9uIGRlZmxhdGVSZXNldEtlZXAoc3RybSkge1xuICB2YXIgcztcblxuICBpZiAoIXN0cm0gfHwgIXN0cm0uc3RhdGUpIHtcbiAgICByZXR1cm4gZXJyKHN0cm0sIFpfU1RSRUFNX0VSUk9SKTtcbiAgfVxuXG4gIHN0cm0udG90YWxfaW4gPSBzdHJtLnRvdGFsX291dCA9IDA7XG4gIHN0cm0uZGF0YV90eXBlID0gWl9VTktOT1dOO1xuXG4gIHMgPSBzdHJtLnN0YXRlO1xuICBzLnBlbmRpbmcgPSAwO1xuICBzLnBlbmRpbmdfb3V0ID0gMDtcblxuICBpZiAocy53cmFwIDwgMCkge1xuICAgIHMud3JhcCA9IC1zLndyYXA7XG4gICAgLyogd2FzIG1hZGUgbmVnYXRpdmUgYnkgZGVmbGF0ZSguLi4sIFpfRklOSVNIKTsgKi9cbiAgfVxuICBzLnN0YXR1cyA9IChzLndyYXAgPyBJTklUX1NUQVRFIDogQlVTWV9TVEFURSk7XG4gIHN0cm0uYWRsZXIgPSAocy53cmFwID09PSAyKSA/XG4gICAgMCAgLy8gY3JjMzIoMCwgWl9OVUxMLCAwKVxuICA6XG4gICAgMTsgLy8gYWRsZXIzMigwLCBaX05VTEwsIDApXG4gIHMubGFzdF9mbHVzaCA9IFpfTk9fRkxVU0g7XG4gIHRyZWVzLl90cl9pbml0KHMpO1xuICByZXR1cm4gWl9PSztcbn1cblxuXG5mdW5jdGlvbiBkZWZsYXRlUmVzZXQoc3RybSkge1xuICB2YXIgcmV0ID0gZGVmbGF0ZVJlc2V0S2VlcChzdHJtKTtcbiAgaWYgKHJldCA9PT0gWl9PSykge1xuICAgIGxtX2luaXQoc3RybS5zdGF0ZSk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuXG5mdW5jdGlvbiBkZWZsYXRlU2V0SGVhZGVyKHN0cm0sIGhlYWQpIHtcbiAgaWYgKCFzdHJtIHx8ICFzdHJtLnN0YXRlKSB7IHJldHVybiBaX1NUUkVBTV9FUlJPUjsgfVxuICBpZiAoc3RybS5zdGF0ZS53cmFwICE9PSAyKSB7IHJldHVybiBaX1NUUkVBTV9FUlJPUjsgfVxuICBzdHJtLnN0YXRlLmd6aGVhZCA9IGhlYWQ7XG4gIHJldHVybiBaX09LO1xufVxuXG5cbmZ1bmN0aW9uIGRlZmxhdGVJbml0MihzdHJtLCBsZXZlbCwgbWV0aG9kLCB3aW5kb3dCaXRzLCBtZW1MZXZlbCwgc3RyYXRlZ3kpIHtcbiAgaWYgKCFzdHJtKSB7IC8vID09PSBaX05VTExcbiAgICByZXR1cm4gWl9TVFJFQU1fRVJST1I7XG4gIH1cbiAgdmFyIHdyYXAgPSAxO1xuXG4gIGlmIChsZXZlbCA9PT0gWl9ERUZBVUxUX0NPTVBSRVNTSU9OKSB7XG4gICAgbGV2ZWwgPSA2O1xuICB9XG5cbiAgaWYgKHdpbmRvd0JpdHMgPCAwKSB7IC8qIHN1cHByZXNzIHpsaWIgd3JhcHBlciAqL1xuICAgIHdyYXAgPSAwO1xuICAgIHdpbmRvd0JpdHMgPSAtd2luZG93Qml0cztcbiAgfVxuXG4gIGVsc2UgaWYgKHdpbmRvd0JpdHMgPiAxNSkge1xuICAgIHdyYXAgPSAyOyAgICAgICAgICAgLyogd3JpdGUgZ3ppcCB3cmFwcGVyIGluc3RlYWQgKi9cbiAgICB3aW5kb3dCaXRzIC09IDE2O1xuICB9XG5cblxuICBpZiAobWVtTGV2ZWwgPCAxIHx8IG1lbUxldmVsID4gTUFYX01FTV9MRVZFTCB8fCBtZXRob2QgIT09IFpfREVGTEFURUQgfHxcbiAgICB3aW5kb3dCaXRzIDwgOCB8fCB3aW5kb3dCaXRzID4gMTUgfHwgbGV2ZWwgPCAwIHx8IGxldmVsID4gOSB8fFxuICAgIHN0cmF0ZWd5IDwgMCB8fCBzdHJhdGVneSA+IFpfRklYRUQpIHtcbiAgICByZXR1cm4gZXJyKHN0cm0sIFpfU1RSRUFNX0VSUk9SKTtcbiAgfVxuXG5cbiAgaWYgKHdpbmRvd0JpdHMgPT09IDgpIHtcbiAgICB3aW5kb3dCaXRzID0gOTtcbiAgfVxuICAvKiB1bnRpbCAyNTYtYnl0ZSB3aW5kb3cgYnVnIGZpeGVkICovXG5cbiAgdmFyIHMgPSBuZXcgRGVmbGF0ZVN0YXRlKCk7XG5cbiAgc3RybS5zdGF0ZSA9IHM7XG4gIHMuc3RybSA9IHN0cm07XG5cbiAgcy53cmFwID0gd3JhcDtcbiAgcy5nemhlYWQgPSBudWxsO1xuICBzLndfYml0cyA9IHdpbmRvd0JpdHM7XG4gIHMud19zaXplID0gMSA8PCBzLndfYml0cztcbiAgcy53X21hc2sgPSBzLndfc2l6ZSAtIDE7XG5cbiAgcy5oYXNoX2JpdHMgPSBtZW1MZXZlbCArIDc7XG4gIHMuaGFzaF9zaXplID0gMSA8PCBzLmhhc2hfYml0cztcbiAgcy5oYXNoX21hc2sgPSBzLmhhc2hfc2l6ZSAtIDE7XG4gIHMuaGFzaF9zaGlmdCA9IH5+KChzLmhhc2hfYml0cyArIE1JTl9NQVRDSCAtIDEpIC8gTUlOX01BVENIKTtcblxuICBzLndpbmRvdyA9IG5ldyB1dGlscy5CdWY4KHMud19zaXplICogMik7XG4gIHMuaGVhZCA9IG5ldyB1dGlscy5CdWYxNihzLmhhc2hfc2l6ZSk7XG4gIHMucHJldiA9IG5ldyB1dGlscy5CdWYxNihzLndfc2l6ZSk7XG5cbiAgLy8gRG9uJ3QgbmVlZCBtZW0gaW5pdCBtYWdpYyBmb3IgSlMuXG4gIC8vcy5oaWdoX3dhdGVyID0gMDsgIC8qIG5vdGhpbmcgd3JpdHRlbiB0byBzLT53aW5kb3cgeWV0ICovXG5cbiAgcy5saXRfYnVmc2l6ZSA9IDEgPDwgKG1lbUxldmVsICsgNik7IC8qIDE2SyBlbGVtZW50cyBieSBkZWZhdWx0ICovXG5cbiAgcy5wZW5kaW5nX2J1Zl9zaXplID0gcy5saXRfYnVmc2l6ZSAqIDQ7XG4gIHMucGVuZGluZ19idWYgPSBuZXcgdXRpbHMuQnVmOChzLnBlbmRpbmdfYnVmX3NpemUpO1xuXG4gIHMuZF9idWYgPSBzLmxpdF9idWZzaXplID4+IDE7XG4gIHMubF9idWYgPSAoMSArIDIpICogcy5saXRfYnVmc2l6ZTtcblxuICBzLmxldmVsID0gbGV2ZWw7XG4gIHMuc3RyYXRlZ3kgPSBzdHJhdGVneTtcbiAgcy5tZXRob2QgPSBtZXRob2Q7XG5cbiAgcmV0dXJuIGRlZmxhdGVSZXNldChzdHJtKTtcbn1cblxuZnVuY3Rpb24gZGVmbGF0ZUluaXQoc3RybSwgbGV2ZWwpIHtcbiAgcmV0dXJuIGRlZmxhdGVJbml0MihzdHJtLCBsZXZlbCwgWl9ERUZMQVRFRCwgTUFYX1dCSVRTLCBERUZfTUVNX0xFVkVMLCBaX0RFRkFVTFRfU1RSQVRFR1kpO1xufVxuXG5cbmZ1bmN0aW9uIGRlZmxhdGUoc3RybSwgZmx1c2gpIHtcbiAgdmFyIG9sZF9mbHVzaCwgcztcbiAgdmFyIGJlZywgdmFsOyAvLyBmb3IgZ3ppcCBoZWFkZXIgd3JpdGUgb25seVxuXG4gIGlmICghc3RybSB8fCAhc3RybS5zdGF0ZSB8fFxuICAgIGZsdXNoID4gWl9CTE9DSyB8fCBmbHVzaCA8IDApIHtcbiAgICByZXR1cm4gc3RybSA/IGVycihzdHJtLCBaX1NUUkVBTV9FUlJPUikgOiBaX1NUUkVBTV9FUlJPUjtcbiAgfVxuXG4gIHMgPSBzdHJtLnN0YXRlO1xuXG4gIGlmICghc3RybS5vdXRwdXQgfHxcbiAgICAgICghc3RybS5pbnB1dCAmJiBzdHJtLmF2YWlsX2luICE9PSAwKSB8fFxuICAgICAgKHMuc3RhdHVzID09PSBGSU5JU0hfU1RBVEUgJiYgZmx1c2ggIT09IFpfRklOSVNIKSkge1xuICAgIHJldHVybiBlcnIoc3RybSwgKHN0cm0uYXZhaWxfb3V0ID09PSAwKSA/IFpfQlVGX0VSUk9SIDogWl9TVFJFQU1fRVJST1IpO1xuICB9XG5cbiAgcy5zdHJtID0gc3RybTsgLyoganVzdCBpbiBjYXNlICovXG4gIG9sZF9mbHVzaCA9IHMubGFzdF9mbHVzaDtcbiAgcy5sYXN0X2ZsdXNoID0gZmx1c2g7XG5cbiAgLyogV3JpdGUgdGhlIGhlYWRlciAqL1xuICBpZiAocy5zdGF0dXMgPT09IElOSVRfU1RBVEUpIHtcblxuICAgIGlmIChzLndyYXAgPT09IDIpIHsgLy8gR1pJUCBoZWFkZXJcbiAgICAgIHN0cm0uYWRsZXIgPSAwOyAgLy9jcmMzMigwTCwgWl9OVUxMLCAwKTtcbiAgICAgIHB1dF9ieXRlKHMsIDMxKTtcbiAgICAgIHB1dF9ieXRlKHMsIDEzOSk7XG4gICAgICBwdXRfYnl0ZShzLCA4KTtcbiAgICAgIGlmICghcy5nemhlYWQpIHsgLy8gcy0+Z3poZWFkID09IFpfTlVMTFxuICAgICAgICBwdXRfYnl0ZShzLCAwKTtcbiAgICAgICAgcHV0X2J5dGUocywgMCk7XG4gICAgICAgIHB1dF9ieXRlKHMsIDApO1xuICAgICAgICBwdXRfYnl0ZShzLCAwKTtcbiAgICAgICAgcHV0X2J5dGUocywgMCk7XG4gICAgICAgIHB1dF9ieXRlKHMsIHMubGV2ZWwgPT09IDkgPyAyIDpcbiAgICAgICAgICAgICAgICAgICAgKHMuc3RyYXRlZ3kgPj0gWl9IVUZGTUFOX09OTFkgfHwgcy5sZXZlbCA8IDIgP1xuICAgICAgICAgICAgICAgICAgICAgNCA6IDApKTtcbiAgICAgICAgcHV0X2J5dGUocywgT1NfQ09ERSk7XG4gICAgICAgIHMuc3RhdHVzID0gQlVTWV9TVEFURTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBwdXRfYnl0ZShzLCAocy5nemhlYWQudGV4dCA/IDEgOiAwKSArXG4gICAgICAgICAgICAgICAgICAgIChzLmd6aGVhZC5oY3JjID8gMiA6IDApICtcbiAgICAgICAgICAgICAgICAgICAgKCFzLmd6aGVhZC5leHRyYSA/IDAgOiA0KSArXG4gICAgICAgICAgICAgICAgICAgICghcy5nemhlYWQubmFtZSA/IDAgOiA4KSArXG4gICAgICAgICAgICAgICAgICAgICghcy5nemhlYWQuY29tbWVudCA/IDAgOiAxNilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICBwdXRfYnl0ZShzLCBzLmd6aGVhZC50aW1lICYgMHhmZik7XG4gICAgICAgIHB1dF9ieXRlKHMsIChzLmd6aGVhZC50aW1lID4+IDgpICYgMHhmZik7XG4gICAgICAgIHB1dF9ieXRlKHMsIChzLmd6aGVhZC50aW1lID4+IDE2KSAmIDB4ZmYpO1xuICAgICAgICBwdXRfYnl0ZShzLCAocy5nemhlYWQudGltZSA+PiAyNCkgJiAweGZmKTtcbiAgICAgICAgcHV0X2J5dGUocywgcy5sZXZlbCA9PT0gOSA/IDIgOlxuICAgICAgICAgICAgICAgICAgICAocy5zdHJhdGVneSA+PSBaX0hVRkZNQU5fT05MWSB8fCBzLmxldmVsIDwgMiA/XG4gICAgICAgICAgICAgICAgICAgICA0IDogMCkpO1xuICAgICAgICBwdXRfYnl0ZShzLCBzLmd6aGVhZC5vcyAmIDB4ZmYpO1xuICAgICAgICBpZiAocy5nemhlYWQuZXh0cmEgJiYgcy5nemhlYWQuZXh0cmEubGVuZ3RoKSB7XG4gICAgICAgICAgcHV0X2J5dGUocywgcy5nemhlYWQuZXh0cmEubGVuZ3RoICYgMHhmZik7XG4gICAgICAgICAgcHV0X2J5dGUocywgKHMuZ3poZWFkLmV4dHJhLmxlbmd0aCA+PiA4KSAmIDB4ZmYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzLmd6aGVhZC5oY3JjKSB7XG4gICAgICAgICAgc3RybS5hZGxlciA9IGNyYzMyKHN0cm0uYWRsZXIsIHMucGVuZGluZ19idWYsIHMucGVuZGluZywgMCk7XG4gICAgICAgIH1cbiAgICAgICAgcy5nemluZGV4ID0gMDtcbiAgICAgICAgcy5zdGF0dXMgPSBFWFRSQV9TVEFURTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSAvLyBERUZMQVRFIGhlYWRlclxuICAgIHtcbiAgICAgIHZhciBoZWFkZXIgPSAoWl9ERUZMQVRFRCArICgocy53X2JpdHMgLSA4KSA8PCA0KSkgPDwgODtcbiAgICAgIHZhciBsZXZlbF9mbGFncyA9IC0xO1xuXG4gICAgICBpZiAocy5zdHJhdGVneSA+PSBaX0hVRkZNQU5fT05MWSB8fCBzLmxldmVsIDwgMikge1xuICAgICAgICBsZXZlbF9mbGFncyA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHMubGV2ZWwgPCA2KSB7XG4gICAgICAgIGxldmVsX2ZsYWdzID0gMTtcbiAgICAgIH0gZWxzZSBpZiAocy5sZXZlbCA9PT0gNikge1xuICAgICAgICBsZXZlbF9mbGFncyA9IDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXZlbF9mbGFncyA9IDM7XG4gICAgICB9XG4gICAgICBoZWFkZXIgfD0gKGxldmVsX2ZsYWdzIDw8IDYpO1xuICAgICAgaWYgKHMuc3Ryc3RhcnQgIT09IDApIHsgaGVhZGVyIHw9IFBSRVNFVF9ESUNUOyB9XG4gICAgICBoZWFkZXIgKz0gMzEgLSAoaGVhZGVyICUgMzEpO1xuXG4gICAgICBzLnN0YXR1cyA9IEJVU1lfU1RBVEU7XG4gICAgICBwdXRTaG9ydE1TQihzLCBoZWFkZXIpO1xuXG4gICAgICAvKiBTYXZlIHRoZSBhZGxlcjMyIG9mIHRoZSBwcmVzZXQgZGljdGlvbmFyeTogKi9cbiAgICAgIGlmIChzLnN0cnN0YXJ0ICE9PSAwKSB7XG4gICAgICAgIHB1dFNob3J0TVNCKHMsIHN0cm0uYWRsZXIgPj4+IDE2KTtcbiAgICAgICAgcHV0U2hvcnRNU0Iocywgc3RybS5hZGxlciAmIDB4ZmZmZik7XG4gICAgICB9XG4gICAgICBzdHJtLmFkbGVyID0gMTsgLy8gYWRsZXIzMigwTCwgWl9OVUxMLCAwKTtcbiAgICB9XG4gIH1cblxuLy8jaWZkZWYgR1pJUFxuICBpZiAocy5zdGF0dXMgPT09IEVYVFJBX1NUQVRFKSB7XG4gICAgaWYgKHMuZ3poZWFkLmV4dHJhLyogIT0gWl9OVUxMKi8pIHtcbiAgICAgIGJlZyA9IHMucGVuZGluZzsgIC8qIHN0YXJ0IG9mIGJ5dGVzIHRvIHVwZGF0ZSBjcmMgKi9cblxuICAgICAgd2hpbGUgKHMuZ3ppbmRleCA8IChzLmd6aGVhZC5leHRyYS5sZW5ndGggJiAweGZmZmYpKSB7XG4gICAgICAgIGlmIChzLnBlbmRpbmcgPT09IHMucGVuZGluZ19idWZfc2l6ZSkge1xuICAgICAgICAgIGlmIChzLmd6aGVhZC5oY3JjICYmIHMucGVuZGluZyA+IGJlZykge1xuICAgICAgICAgICAgc3RybS5hZGxlciA9IGNyYzMyKHN0cm0uYWRsZXIsIHMucGVuZGluZ19idWYsIHMucGVuZGluZyAtIGJlZywgYmVnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmx1c2hfcGVuZGluZyhzdHJtKTtcbiAgICAgICAgICBiZWcgPSBzLnBlbmRpbmc7XG4gICAgICAgICAgaWYgKHMucGVuZGluZyA9PT0gcy5wZW5kaW5nX2J1Zl9zaXplKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHV0X2J5dGUocywgcy5nemhlYWQuZXh0cmFbcy5nemluZGV4XSAmIDB4ZmYpO1xuICAgICAgICBzLmd6aW5kZXgrKztcbiAgICAgIH1cbiAgICAgIGlmIChzLmd6aGVhZC5oY3JjICYmIHMucGVuZGluZyA+IGJlZykge1xuICAgICAgICBzdHJtLmFkbGVyID0gY3JjMzIoc3RybS5hZGxlciwgcy5wZW5kaW5nX2J1Ziwgcy5wZW5kaW5nIC0gYmVnLCBiZWcpO1xuICAgICAgfVxuICAgICAgaWYgKHMuZ3ppbmRleCA9PT0gcy5nemhlYWQuZXh0cmEubGVuZ3RoKSB7XG4gICAgICAgIHMuZ3ppbmRleCA9IDA7XG4gICAgICAgIHMuc3RhdHVzID0gTkFNRV9TVEFURTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzLnN0YXR1cyA9IE5BTUVfU1RBVEU7XG4gICAgfVxuICB9XG4gIGlmIChzLnN0YXR1cyA9PT0gTkFNRV9TVEFURSkge1xuICAgIGlmIChzLmd6aGVhZC5uYW1lLyogIT0gWl9OVUxMKi8pIHtcbiAgICAgIGJlZyA9IHMucGVuZGluZzsgIC8qIHN0YXJ0IG9mIGJ5dGVzIHRvIHVwZGF0ZSBjcmMgKi9cbiAgICAgIC8vaW50IHZhbDtcblxuICAgICAgZG8ge1xuICAgICAgICBpZiAocy5wZW5kaW5nID09PSBzLnBlbmRpbmdfYnVmX3NpemUpIHtcbiAgICAgICAgICBpZiAocy5nemhlYWQuaGNyYyAmJiBzLnBlbmRpbmcgPiBiZWcpIHtcbiAgICAgICAgICAgIHN0cm0uYWRsZXIgPSBjcmMzMihzdHJtLmFkbGVyLCBzLnBlbmRpbmdfYnVmLCBzLnBlbmRpbmcgLSBiZWcsIGJlZyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZsdXNoX3BlbmRpbmcoc3RybSk7XG4gICAgICAgICAgYmVnID0gcy5wZW5kaW5nO1xuICAgICAgICAgIGlmIChzLnBlbmRpbmcgPT09IHMucGVuZGluZ19idWZfc2l6ZSkge1xuICAgICAgICAgICAgdmFsID0gMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBKUyBzcGVjaWZpYzogbGl0dGxlIG1hZ2ljIHRvIGFkZCB6ZXJvIHRlcm1pbmF0b3IgdG8gZW5kIG9mIHN0cmluZ1xuICAgICAgICBpZiAocy5nemluZGV4IDwgcy5nemhlYWQubmFtZS5sZW5ndGgpIHtcbiAgICAgICAgICB2YWwgPSBzLmd6aGVhZC5uYW1lLmNoYXJDb2RlQXQocy5nemluZGV4KyspICYgMHhmZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWwgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHB1dF9ieXRlKHMsIHZhbCk7XG4gICAgICB9IHdoaWxlICh2YWwgIT09IDApO1xuXG4gICAgICBpZiAocy5nemhlYWQuaGNyYyAmJiBzLnBlbmRpbmcgPiBiZWcpe1xuICAgICAgICBzdHJtLmFkbGVyID0gY3JjMzIoc3RybS5hZGxlciwgcy5wZW5kaW5nX2J1Ziwgcy5wZW5kaW5nIC0gYmVnLCBiZWcpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbCA9PT0gMCkge1xuICAgICAgICBzLmd6aW5kZXggPSAwO1xuICAgICAgICBzLnN0YXR1cyA9IENPTU1FTlRfU1RBVEU7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcy5zdGF0dXMgPSBDT01NRU5UX1NUQVRFO1xuICAgIH1cbiAgfVxuICBpZiAocy5zdGF0dXMgPT09IENPTU1FTlRfU1RBVEUpIHtcbiAgICBpZiAocy5nemhlYWQuY29tbWVudC8qICE9IFpfTlVMTCovKSB7XG4gICAgICBiZWcgPSBzLnBlbmRpbmc7ICAvKiBzdGFydCBvZiBieXRlcyB0byB1cGRhdGUgY3JjICovXG4gICAgICAvL2ludCB2YWw7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKHMucGVuZGluZyA9PT0gcy5wZW5kaW5nX2J1Zl9zaXplKSB7XG4gICAgICAgICAgaWYgKHMuZ3poZWFkLmhjcmMgJiYgcy5wZW5kaW5nID4gYmVnKSB7XG4gICAgICAgICAgICBzdHJtLmFkbGVyID0gY3JjMzIoc3RybS5hZGxlciwgcy5wZW5kaW5nX2J1Ziwgcy5wZW5kaW5nIC0gYmVnLCBiZWcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmbHVzaF9wZW5kaW5nKHN0cm0pO1xuICAgICAgICAgIGJlZyA9IHMucGVuZGluZztcbiAgICAgICAgICBpZiAocy5wZW5kaW5nID09PSBzLnBlbmRpbmdfYnVmX3NpemUpIHtcbiAgICAgICAgICAgIHZhbCA9IDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSlMgc3BlY2lmaWM6IGxpdHRsZSBtYWdpYyB0byBhZGQgemVybyB0ZXJtaW5hdG9yIHRvIGVuZCBvZiBzdHJpbmdcbiAgICAgICAgaWYgKHMuZ3ppbmRleCA8IHMuZ3poZWFkLmNvbW1lbnQubGVuZ3RoKSB7XG4gICAgICAgICAgdmFsID0gcy5nemhlYWQuY29tbWVudC5jaGFyQ29kZUF0KHMuZ3ppbmRleCsrKSAmIDB4ZmY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsID0gMDtcbiAgICAgICAgfVxuICAgICAgICBwdXRfYnl0ZShzLCB2YWwpO1xuICAgICAgfSB3aGlsZSAodmFsICE9PSAwKTtcblxuICAgICAgaWYgKHMuZ3poZWFkLmhjcmMgJiYgcy5wZW5kaW5nID4gYmVnKSB7XG4gICAgICAgIHN0cm0uYWRsZXIgPSBjcmMzMihzdHJtLmFkbGVyLCBzLnBlbmRpbmdfYnVmLCBzLnBlbmRpbmcgLSBiZWcsIGJlZyk7XG4gICAgICB9XG4gICAgICBpZiAodmFsID09PSAwKSB7XG4gICAgICAgIHMuc3RhdHVzID0gSENSQ19TVEFURTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzLnN0YXR1cyA9IEhDUkNfU1RBVEU7XG4gICAgfVxuICB9XG4gIGlmIChzLnN0YXR1cyA9PT0gSENSQ19TVEFURSkge1xuICAgIGlmIChzLmd6aGVhZC5oY3JjKSB7XG4gICAgICBpZiAocy5wZW5kaW5nICsgMiA+IHMucGVuZGluZ19idWZfc2l6ZSkge1xuICAgICAgICBmbHVzaF9wZW5kaW5nKHN0cm0pO1xuICAgICAgfVxuICAgICAgaWYgKHMucGVuZGluZyArIDIgPD0gcy5wZW5kaW5nX2J1Zl9zaXplKSB7XG4gICAgICAgIHB1dF9ieXRlKHMsIHN0cm0uYWRsZXIgJiAweGZmKTtcbiAgICAgICAgcHV0X2J5dGUocywgKHN0cm0uYWRsZXIgPj4gOCkgJiAweGZmKTtcbiAgICAgICAgc3RybS5hZGxlciA9IDA7IC8vY3JjMzIoMEwsIFpfTlVMTCwgMCk7XG4gICAgICAgIHMuc3RhdHVzID0gQlVTWV9TVEFURTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzLnN0YXR1cyA9IEJVU1lfU1RBVEU7XG4gICAgfVxuICB9XG4vLyNlbmRpZlxuXG4gIC8qIEZsdXNoIGFzIG11Y2ggcGVuZGluZyBvdXRwdXQgYXMgcG9zc2libGUgKi9cbiAgaWYgKHMucGVuZGluZyAhPT0gMCkge1xuICAgIGZsdXNoX3BlbmRpbmcoc3RybSk7XG4gICAgaWYgKHN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICAvKiBTaW5jZSBhdmFpbF9vdXQgaXMgMCwgZGVmbGF0ZSB3aWxsIGJlIGNhbGxlZCBhZ2FpbiB3aXRoXG4gICAgICAgKiBtb3JlIG91dHB1dCBzcGFjZSwgYnV0IHBvc3NpYmx5IHdpdGggYm90aCBwZW5kaW5nIGFuZFxuICAgICAgICogYXZhaWxfaW4gZXF1YWwgdG8gemVyby4gVGhlcmUgd29uJ3QgYmUgYW55dGhpbmcgdG8gZG8sXG4gICAgICAgKiBidXQgdGhpcyBpcyBub3QgYW4gZXJyb3Igc2l0dWF0aW9uIHNvIG1ha2Ugc3VyZSB3ZVxuICAgICAgICogcmV0dXJuIE9LIGluc3RlYWQgb2YgQlVGX0VSUk9SIGF0IG5leHQgY2FsbCBvZiBkZWZsYXRlOlxuICAgICAgICovXG4gICAgICBzLmxhc3RfZmx1c2ggPSAtMTtcbiAgICAgIHJldHVybiBaX09LO1xuICAgIH1cblxuICAgIC8qIE1ha2Ugc3VyZSB0aGVyZSBpcyBzb21ldGhpbmcgdG8gZG8gYW5kIGF2b2lkIGR1cGxpY2F0ZSBjb25zZWN1dGl2ZVxuICAgICAqIGZsdXNoZXMuIEZvciByZXBlYXRlZCBhbmQgdXNlbGVzcyBjYWxscyB3aXRoIFpfRklOSVNILCB3ZSBrZWVwXG4gICAgICogcmV0dXJuaW5nIFpfU1RSRUFNX0VORCBpbnN0ZWFkIG9mIFpfQlVGX0VSUk9SLlxuICAgICAqL1xuICB9IGVsc2UgaWYgKHN0cm0uYXZhaWxfaW4gPT09IDAgJiYgcmFuayhmbHVzaCkgPD0gcmFuayhvbGRfZmx1c2gpICYmXG4gICAgZmx1c2ggIT09IFpfRklOSVNIKSB7XG4gICAgcmV0dXJuIGVycihzdHJtLCBaX0JVRl9FUlJPUik7XG4gIH1cblxuICAvKiBVc2VyIG11c3Qgbm90IHByb3ZpZGUgbW9yZSBpbnB1dCBhZnRlciB0aGUgZmlyc3QgRklOSVNIOiAqL1xuICBpZiAocy5zdGF0dXMgPT09IEZJTklTSF9TVEFURSAmJiBzdHJtLmF2YWlsX2luICE9PSAwKSB7XG4gICAgcmV0dXJuIGVycihzdHJtLCBaX0JVRl9FUlJPUik7XG4gIH1cblxuICAvKiBTdGFydCBhIG5ldyBibG9jayBvciBjb250aW51ZSB0aGUgY3VycmVudCBvbmUuXG4gICAqL1xuICBpZiAoc3RybS5hdmFpbF9pbiAhPT0gMCB8fCBzLmxvb2thaGVhZCAhPT0gMCB8fFxuICAgIChmbHVzaCAhPT0gWl9OT19GTFVTSCAmJiBzLnN0YXR1cyAhPT0gRklOSVNIX1NUQVRFKSkge1xuICAgIHZhciBic3RhdGUgPSAocy5zdHJhdGVneSA9PT0gWl9IVUZGTUFOX09OTFkpID8gZGVmbGF0ZV9odWZmKHMsIGZsdXNoKSA6XG4gICAgICAocy5zdHJhdGVneSA9PT0gWl9STEUgPyBkZWZsYXRlX3JsZShzLCBmbHVzaCkgOlxuICAgICAgICBjb25maWd1cmF0aW9uX3RhYmxlW3MubGV2ZWxdLmZ1bmMocywgZmx1c2gpKTtcblxuICAgIGlmIChic3RhdGUgPT09IEJTX0ZJTklTSF9TVEFSVEVEIHx8IGJzdGF0ZSA9PT0gQlNfRklOSVNIX0RPTkUpIHtcbiAgICAgIHMuc3RhdHVzID0gRklOSVNIX1NUQVRFO1xuICAgIH1cbiAgICBpZiAoYnN0YXRlID09PSBCU19ORUVEX01PUkUgfHwgYnN0YXRlID09PSBCU19GSU5JU0hfU1RBUlRFRCkge1xuICAgICAgaWYgKHN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICAgIHMubGFzdF9mbHVzaCA9IC0xO1xuICAgICAgICAvKiBhdm9pZCBCVUZfRVJST1IgbmV4dCBjYWxsLCBzZWUgYWJvdmUgKi9cbiAgICAgIH1cbiAgICAgIHJldHVybiBaX09LO1xuICAgICAgLyogSWYgZmx1c2ggIT0gWl9OT19GTFVTSCAmJiBhdmFpbF9vdXQgPT0gMCwgdGhlIG5leHQgY2FsbFxuICAgICAgICogb2YgZGVmbGF0ZSBzaG91bGQgdXNlIHRoZSBzYW1lIGZsdXNoIHBhcmFtZXRlciB0byBtYWtlIHN1cmVcbiAgICAgICAqIHRoYXQgdGhlIGZsdXNoIGlzIGNvbXBsZXRlLiBTbyB3ZSBkb24ndCBoYXZlIHRvIG91dHB1dCBhblxuICAgICAgICogZW1wdHkgYmxvY2sgaGVyZSwgdGhpcyB3aWxsIGJlIGRvbmUgYXQgbmV4dCBjYWxsLiBUaGlzIGFsc29cbiAgICAgICAqIGVuc3VyZXMgdGhhdCBmb3IgYSB2ZXJ5IHNtYWxsIG91dHB1dCBidWZmZXIsIHdlIGVtaXQgYXQgbW9zdFxuICAgICAgICogb25lIGVtcHR5IGJsb2NrLlxuICAgICAgICovXG4gICAgfVxuICAgIGlmIChic3RhdGUgPT09IEJTX0JMT0NLX0RPTkUpIHtcbiAgICAgIGlmIChmbHVzaCA9PT0gWl9QQVJUSUFMX0ZMVVNIKSB7XG4gICAgICAgIHRyZWVzLl90cl9hbGlnbihzKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGZsdXNoICE9PSBaX0JMT0NLKSB7IC8qIEZVTExfRkxVU0ggb3IgU1lOQ19GTFVTSCAqL1xuXG4gICAgICAgIHRyZWVzLl90cl9zdG9yZWRfYmxvY2socywgMCwgMCwgZmFsc2UpO1xuICAgICAgICAvKiBGb3IgYSBmdWxsIGZsdXNoLCB0aGlzIGVtcHR5IGJsb2NrIHdpbGwgYmUgcmVjb2duaXplZFxuICAgICAgICAgKiBhcyBhIHNwZWNpYWwgbWFya2VyIGJ5IGluZmxhdGVfc3luYygpLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKGZsdXNoID09PSBaX0ZVTExfRkxVU0gpIHtcbiAgICAgICAgICAvKioqIENMRUFSX0hBU0gocyk7ICoqKi8gICAgICAgICAgICAgLyogZm9yZ2V0IGhpc3RvcnkgKi9cbiAgICAgICAgICB6ZXJvKHMuaGVhZCk7IC8vIEZpbGwgd2l0aCBOSUwgKD0gMCk7XG5cbiAgICAgICAgICBpZiAocy5sb29rYWhlYWQgPT09IDApIHtcbiAgICAgICAgICAgIHMuc3Ryc3RhcnQgPSAwO1xuICAgICAgICAgICAgcy5ibG9ja19zdGFydCA9IDA7XG4gICAgICAgICAgICBzLmluc2VydCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmbHVzaF9wZW5kaW5nKHN0cm0pO1xuICAgICAgaWYgKHN0cm0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICAgIHMubGFzdF9mbHVzaCA9IC0xOyAvKiBhdm9pZCBCVUZfRVJST1IgYXQgbmV4dCBjYWxsLCBzZWUgYWJvdmUgKi9cbiAgICAgICAgcmV0dXJuIFpfT0s7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vQXNzZXJ0KHN0cm0tPmF2YWlsX291dCA+IDAsIFwiYnVnMlwiKTtcbiAgLy9pZiAoc3RybS5hdmFpbF9vdXQgPD0gMCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJidWcyXCIpO31cblxuICBpZiAoZmx1c2ggIT09IFpfRklOSVNIKSB7IHJldHVybiBaX09LOyB9XG4gIGlmIChzLndyYXAgPD0gMCkgeyByZXR1cm4gWl9TVFJFQU1fRU5EOyB9XG5cbiAgLyogV3JpdGUgdGhlIHRyYWlsZXIgKi9cbiAgaWYgKHMud3JhcCA9PT0gMikge1xuICAgIHB1dF9ieXRlKHMsIHN0cm0uYWRsZXIgJiAweGZmKTtcbiAgICBwdXRfYnl0ZShzLCAoc3RybS5hZGxlciA+PiA4KSAmIDB4ZmYpO1xuICAgIHB1dF9ieXRlKHMsIChzdHJtLmFkbGVyID4+IDE2KSAmIDB4ZmYpO1xuICAgIHB1dF9ieXRlKHMsIChzdHJtLmFkbGVyID4+IDI0KSAmIDB4ZmYpO1xuICAgIHB1dF9ieXRlKHMsIHN0cm0udG90YWxfaW4gJiAweGZmKTtcbiAgICBwdXRfYnl0ZShzLCAoc3RybS50b3RhbF9pbiA+PiA4KSAmIDB4ZmYpO1xuICAgIHB1dF9ieXRlKHMsIChzdHJtLnRvdGFsX2luID4+IDE2KSAmIDB4ZmYpO1xuICAgIHB1dF9ieXRlKHMsIChzdHJtLnRvdGFsX2luID4+IDI0KSAmIDB4ZmYpO1xuICB9XG4gIGVsc2VcbiAge1xuICAgIHB1dFNob3J0TVNCKHMsIHN0cm0uYWRsZXIgPj4+IDE2KTtcbiAgICBwdXRTaG9ydE1TQihzLCBzdHJtLmFkbGVyICYgMHhmZmZmKTtcbiAgfVxuXG4gIGZsdXNoX3BlbmRpbmcoc3RybSk7XG4gIC8qIElmIGF2YWlsX291dCBpcyB6ZXJvLCB0aGUgYXBwbGljYXRpb24gd2lsbCBjYWxsIGRlZmxhdGUgYWdhaW5cbiAgICogdG8gZmx1c2ggdGhlIHJlc3QuXG4gICAqL1xuICBpZiAocy53cmFwID4gMCkgeyBzLndyYXAgPSAtcy53cmFwOyB9XG4gIC8qIHdyaXRlIHRoZSB0cmFpbGVyIG9ubHkgb25jZSEgKi9cbiAgcmV0dXJuIHMucGVuZGluZyAhPT0gMCA/IFpfT0sgOiBaX1NUUkVBTV9FTkQ7XG59XG5cbmZ1bmN0aW9uIGRlZmxhdGVFbmQoc3RybSkge1xuICB2YXIgc3RhdHVzO1xuXG4gIGlmICghc3RybS8qPT0gWl9OVUxMKi8gfHwgIXN0cm0uc3RhdGUvKj09IFpfTlVMTCovKSB7XG4gICAgcmV0dXJuIFpfU1RSRUFNX0VSUk9SO1xuICB9XG5cbiAgc3RhdHVzID0gc3RybS5zdGF0ZS5zdGF0dXM7XG4gIGlmIChzdGF0dXMgIT09IElOSVRfU1RBVEUgJiZcbiAgICBzdGF0dXMgIT09IEVYVFJBX1NUQVRFICYmXG4gICAgc3RhdHVzICE9PSBOQU1FX1NUQVRFICYmXG4gICAgc3RhdHVzICE9PSBDT01NRU5UX1NUQVRFICYmXG4gICAgc3RhdHVzICE9PSBIQ1JDX1NUQVRFICYmXG4gICAgc3RhdHVzICE9PSBCVVNZX1NUQVRFICYmXG4gICAgc3RhdHVzICE9PSBGSU5JU0hfU1RBVEVcbiAgKSB7XG4gICAgcmV0dXJuIGVycihzdHJtLCBaX1NUUkVBTV9FUlJPUik7XG4gIH1cblxuICBzdHJtLnN0YXRlID0gbnVsbDtcblxuICByZXR1cm4gc3RhdHVzID09PSBCVVNZX1NUQVRFID8gZXJyKHN0cm0sIFpfREFUQV9FUlJPUikgOiBaX09LO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5IHRoZSBzb3VyY2Ugc3RhdGUgdG8gdGhlIGRlc3RpbmF0aW9uIHN0YXRlXG4gKi9cbi8vZnVuY3Rpb24gZGVmbGF0ZUNvcHkoZGVzdCwgc291cmNlKSB7XG4vL1xuLy99XG5cbmV4cG9ydHMuZGVmbGF0ZUluaXQgPSBkZWZsYXRlSW5pdDtcbmV4cG9ydHMuZGVmbGF0ZUluaXQyID0gZGVmbGF0ZUluaXQyO1xuZXhwb3J0cy5kZWZsYXRlUmVzZXQgPSBkZWZsYXRlUmVzZXQ7XG5leHBvcnRzLmRlZmxhdGVSZXNldEtlZXAgPSBkZWZsYXRlUmVzZXRLZWVwO1xuZXhwb3J0cy5kZWZsYXRlU2V0SGVhZGVyID0gZGVmbGF0ZVNldEhlYWRlcjtcbmV4cG9ydHMuZGVmbGF0ZSA9IGRlZmxhdGU7XG5leHBvcnRzLmRlZmxhdGVFbmQgPSBkZWZsYXRlRW5kO1xuZXhwb3J0cy5kZWZsYXRlSW5mbyA9ICdwYWtvIGRlZmxhdGUgKGZyb20gTm9kZWNhIHByb2plY3QpJztcblxuLyogTm90IGltcGxlbWVudGVkXG5leHBvcnRzLmRlZmxhdGVCb3VuZCA9IGRlZmxhdGVCb3VuZDtcbmV4cG9ydHMuZGVmbGF0ZUNvcHkgPSBkZWZsYXRlQ29weTtcbmV4cG9ydHMuZGVmbGF0ZVNldERpY3Rpb25hcnkgPSBkZWZsYXRlU2V0RGljdGlvbmFyeTtcbmV4cG9ydHMuZGVmbGF0ZVBhcmFtcyA9IGRlZmxhdGVQYXJhbXM7XG5leHBvcnRzLmRlZmxhdGVQZW5kaW5nID0gZGVmbGF0ZVBlbmRpbmc7XG5leHBvcnRzLmRlZmxhdGVQcmltZSA9IGRlZmxhdGVQcmltZTtcbmV4cG9ydHMuZGVmbGF0ZVR1bmUgPSBkZWZsYXRlVHVuZTtcbiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbmZ1bmN0aW9uIEdaaGVhZGVyKCkge1xuICAvKiB0cnVlIGlmIGNvbXByZXNzZWQgZGF0YSBiZWxpZXZlZCB0byBiZSB0ZXh0ICovXG4gIHRoaXMudGV4dCAgICAgICA9IDA7XG4gIC8qIG1vZGlmaWNhdGlvbiB0aW1lICovXG4gIHRoaXMudGltZSAgICAgICA9IDA7XG4gIC8qIGV4dHJhIGZsYWdzIChub3QgdXNlZCB3aGVuIHdyaXRpbmcgYSBnemlwIGZpbGUpICovXG4gIHRoaXMueGZsYWdzICAgICA9IDA7XG4gIC8qIG9wZXJhdGluZyBzeXN0ZW0gKi9cbiAgdGhpcy5vcyAgICAgICAgID0gMDtcbiAgLyogcG9pbnRlciB0byBleHRyYSBmaWVsZCBvciBaX05VTEwgaWYgbm9uZSAqL1xuICB0aGlzLmV4dHJhICAgICAgPSBudWxsO1xuICAvKiBleHRyYSBmaWVsZCBsZW5ndGggKHZhbGlkIGlmIGV4dHJhICE9IFpfTlVMTCkgKi9cbiAgdGhpcy5leHRyYV9sZW4gID0gMDsgLy8gQWN0dWFsbHksIHdlIGRvbid0IG5lZWQgaXQgaW4gSlMsXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCBsZWF2ZSBmb3IgZmV3IGNvZGUgbW9kaWZpY2F0aW9uc1xuXG4gIC8vXG4gIC8vIFNldHVwIGxpbWl0cyBpcyBub3QgbmVjZXNzYXJ5IGJlY2F1c2UgaW4ganMgd2Ugc2hvdWxkIG5vdCBwcmVhbGxvY2F0ZSBtZW1vcnkgXG4gIC8vIGZvciBpbmZsYXRlIHVzZSBjb25zdGFudCBsaW1pdCBpbiA2NTUzNiBieXRlc1xuICAvL1xuXG4gIC8qIHNwYWNlIGF0IGV4dHJhIChvbmx5IHdoZW4gcmVhZGluZyBoZWFkZXIpICovXG4gIC8vIHRoaXMuZXh0cmFfbWF4ICA9IDA7XG4gIC8qIHBvaW50ZXIgdG8gemVyby10ZXJtaW5hdGVkIGZpbGUgbmFtZSBvciBaX05VTEwgKi9cbiAgdGhpcy5uYW1lICAgICAgID0gJyc7XG4gIC8qIHNwYWNlIGF0IG5hbWUgKG9ubHkgd2hlbiByZWFkaW5nIGhlYWRlcikgKi9cbiAgLy8gdGhpcy5uYW1lX21heCAgID0gMDtcbiAgLyogcG9pbnRlciB0byB6ZXJvLXRlcm1pbmF0ZWQgY29tbWVudCBvciBaX05VTEwgKi9cbiAgdGhpcy5jb21tZW50ICAgID0gJyc7XG4gIC8qIHNwYWNlIGF0IGNvbW1lbnQgKG9ubHkgd2hlbiByZWFkaW5nIGhlYWRlcikgKi9cbiAgLy8gdGhpcy5jb21tX21heCAgID0gMDtcbiAgLyogdHJ1ZSBpZiB0aGVyZSB3YXMgb3Igd2lsbCBiZSBhIGhlYWRlciBjcmMgKi9cbiAgdGhpcy5oY3JjICAgICAgID0gMDtcbiAgLyogdHJ1ZSB3aGVuIGRvbmUgcmVhZGluZyBnemlwIGhlYWRlciAobm90IHVzZWQgd2hlbiB3cml0aW5nIGEgZ3ppcCBmaWxlKSAqL1xuICB0aGlzLmRvbmUgICAgICAgPSBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHWmhlYWRlcjsiLCIndXNlIHN0cmljdCc7XG5cbi8vIFNlZSBzdGF0ZSBkZWZzIGZyb20gaW5mbGF0ZS5qc1xudmFyIEJBRCA9IDMwOyAgICAgICAvKiBnb3QgYSBkYXRhIGVycm9yIC0tIHJlbWFpbiBoZXJlIHVudGlsIHJlc2V0ICovXG52YXIgVFlQRSA9IDEyOyAgICAgIC8qIGk6IHdhaXRpbmcgZm9yIHR5cGUgYml0cywgaW5jbHVkaW5nIGxhc3QtZmxhZyBiaXQgKi9cblxuLypcbiAgIERlY29kZSBsaXRlcmFsLCBsZW5ndGgsIGFuZCBkaXN0YW5jZSBjb2RlcyBhbmQgd3JpdGUgb3V0IHRoZSByZXN1bHRpbmdcbiAgIGxpdGVyYWwgYW5kIG1hdGNoIGJ5dGVzIHVudGlsIGVpdGhlciBub3QgZW5vdWdoIGlucHV0IG9yIG91dHB1dCBpc1xuICAgYXZhaWxhYmxlLCBhbiBlbmQtb2YtYmxvY2sgaXMgZW5jb3VudGVyZWQsIG9yIGEgZGF0YSBlcnJvciBpcyBlbmNvdW50ZXJlZC5cbiAgIFdoZW4gbGFyZ2UgZW5vdWdoIGlucHV0IGFuZCBvdXRwdXQgYnVmZmVycyBhcmUgc3VwcGxpZWQgdG8gaW5mbGF0ZSgpLCBmb3JcbiAgIGV4YW1wbGUsIGEgMTZLIGlucHV0IGJ1ZmZlciBhbmQgYSA2NEsgb3V0cHV0IGJ1ZmZlciwgbW9yZSB0aGFuIDk1JSBvZiB0aGVcbiAgIGluZmxhdGUgZXhlY3V0aW9uIHRpbWUgaXMgc3BlbnQgaW4gdGhpcyByb3V0aW5lLlxuXG4gICBFbnRyeSBhc3N1bXB0aW9uczpcblxuICAgICAgICBzdGF0ZS5tb2RlID09PSBMRU5cbiAgICAgICAgc3RybS5hdmFpbF9pbiA+PSA2XG4gICAgICAgIHN0cm0uYXZhaWxfb3V0ID49IDI1OFxuICAgICAgICBzdGFydCA+PSBzdHJtLmF2YWlsX291dFxuICAgICAgICBzdGF0ZS5iaXRzIDwgOFxuXG4gICBPbiByZXR1cm4sIHN0YXRlLm1vZGUgaXMgb25lIG9mOlxuXG4gICAgICAgIExFTiAtLSByYW4gb3V0IG9mIGVub3VnaCBvdXRwdXQgc3BhY2Ugb3IgZW5vdWdoIGF2YWlsYWJsZSBpbnB1dFxuICAgICAgICBUWVBFIC0tIHJlYWNoZWQgZW5kIG9mIGJsb2NrIGNvZGUsIGluZmxhdGUoKSB0byBpbnRlcnByZXQgbmV4dCBibG9ja1xuICAgICAgICBCQUQgLS0gZXJyb3IgaW4gYmxvY2sgZGF0YVxuXG4gICBOb3RlczpcblxuICAgIC0gVGhlIG1heGltdW0gaW5wdXQgYml0cyB1c2VkIGJ5IGEgbGVuZ3RoL2Rpc3RhbmNlIHBhaXIgaXMgMTUgYml0cyBmb3IgdGhlXG4gICAgICBsZW5ndGggY29kZSwgNSBiaXRzIGZvciB0aGUgbGVuZ3RoIGV4dHJhLCAxNSBiaXRzIGZvciB0aGUgZGlzdGFuY2UgY29kZSxcbiAgICAgIGFuZCAxMyBiaXRzIGZvciB0aGUgZGlzdGFuY2UgZXh0cmEuICBUaGlzIHRvdGFscyA0OCBiaXRzLCBvciBzaXggYnl0ZXMuXG4gICAgICBUaGVyZWZvcmUgaWYgc3RybS5hdmFpbF9pbiA+PSA2LCB0aGVuIHRoZXJlIGlzIGVub3VnaCBpbnB1dCB0byBhdm9pZFxuICAgICAgY2hlY2tpbmcgZm9yIGF2YWlsYWJsZSBpbnB1dCB3aGlsZSBkZWNvZGluZy5cblxuICAgIC0gVGhlIG1heGltdW0gYnl0ZXMgdGhhdCBhIHNpbmdsZSBsZW5ndGgvZGlzdGFuY2UgcGFpciBjYW4gb3V0cHV0IGlzIDI1OFxuICAgICAgYnl0ZXMsIHdoaWNoIGlzIHRoZSBtYXhpbXVtIGxlbmd0aCB0aGF0IGNhbiBiZSBjb2RlZC4gIGluZmxhdGVfZmFzdCgpXG4gICAgICByZXF1aXJlcyBzdHJtLmF2YWlsX291dCA+PSAyNTggZm9yIGVhY2ggbG9vcCB0byBhdm9pZCBjaGVja2luZyBmb3JcbiAgICAgIG91dHB1dCBzcGFjZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmZsYXRlX2Zhc3Qoc3RybSwgc3RhcnQpIHtcbiAgdmFyIHN0YXRlO1xuICB2YXIgX2luOyAgICAgICAgICAgICAgICAgICAgLyogbG9jYWwgc3RybS5pbnB1dCAqL1xuICB2YXIgbGFzdDsgICAgICAgICAgICAgICAgICAgLyogaGF2ZSBlbm91Z2ggaW5wdXQgd2hpbGUgaW4gPCBsYXN0ICovXG4gIHZhciBfb3V0OyAgICAgICAgICAgICAgICAgICAvKiBsb2NhbCBzdHJtLm91dHB1dCAqL1xuICB2YXIgYmVnOyAgICAgICAgICAgICAgICAgICAgLyogaW5mbGF0ZSgpJ3MgaW5pdGlhbCBzdHJtLm91dHB1dCAqL1xuICB2YXIgZW5kOyAgICAgICAgICAgICAgICAgICAgLyogd2hpbGUgb3V0IDwgZW5kLCBlbm91Z2ggc3BhY2UgYXZhaWxhYmxlICovXG4vLyNpZmRlZiBJTkZMQVRFX1NUUklDVFxuICB2YXIgZG1heDsgICAgICAgICAgICAgICAgICAgLyogbWF4aW11bSBkaXN0YW5jZSBmcm9tIHpsaWIgaGVhZGVyICovXG4vLyNlbmRpZlxuICB2YXIgd3NpemU7ICAgICAgICAgICAgICAgICAgLyogd2luZG93IHNpemUgb3IgemVybyBpZiBub3QgdXNpbmcgd2luZG93ICovXG4gIHZhciB3aGF2ZTsgICAgICAgICAgICAgICAgICAvKiB2YWxpZCBieXRlcyBpbiB0aGUgd2luZG93ICovXG4gIHZhciB3bmV4dDsgICAgICAgICAgICAgICAgICAvKiB3aW5kb3cgd3JpdGUgaW5kZXggKi9cbiAgdmFyIHdpbmRvdzsgICAgICAgICAgICAgICAgIC8qIGFsbG9jYXRlZCBzbGlkaW5nIHdpbmRvdywgaWYgd3NpemUgIT0gMCAqL1xuICB2YXIgaG9sZDsgICAgICAgICAgICAgICAgICAgLyogbG9jYWwgc3RybS5ob2xkICovXG4gIHZhciBiaXRzOyAgICAgICAgICAgICAgICAgICAvKiBsb2NhbCBzdHJtLmJpdHMgKi9cbiAgdmFyIGxjb2RlOyAgICAgICAgICAgICAgICAgIC8qIGxvY2FsIHN0cm0ubGVuY29kZSAqL1xuICB2YXIgZGNvZGU7ICAgICAgICAgICAgICAgICAgLyogbG9jYWwgc3RybS5kaXN0Y29kZSAqL1xuICB2YXIgbG1hc2s7ICAgICAgICAgICAgICAgICAgLyogbWFzayBmb3IgZmlyc3QgbGV2ZWwgb2YgbGVuZ3RoIGNvZGVzICovXG4gIHZhciBkbWFzazsgICAgICAgICAgICAgICAgICAvKiBtYXNrIGZvciBmaXJzdCBsZXZlbCBvZiBkaXN0YW5jZSBjb2RlcyAqL1xuICB2YXIgaGVyZTsgICAgICAgICAgICAgICAgICAgLyogcmV0cmlldmVkIHRhYmxlIGVudHJ5ICovXG4gIHZhciBvcDsgICAgICAgICAgICAgICAgICAgICAvKiBjb2RlIGJpdHMsIG9wZXJhdGlvbiwgZXh0cmEgYml0cywgb3IgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qICB3aW5kb3cgcG9zaXRpb24sIHdpbmRvdyBieXRlcyB0byBjb3B5ICovXG4gIHZhciBsZW47ICAgICAgICAgICAgICAgICAgICAvKiBtYXRjaCBsZW5ndGgsIHVudXNlZCBieXRlcyAqL1xuICB2YXIgZGlzdDsgICAgICAgICAgICAgICAgICAgLyogbWF0Y2ggZGlzdGFuY2UgKi9cbiAgdmFyIGZyb207ICAgICAgICAgICAgICAgICAgIC8qIHdoZXJlIHRvIGNvcHkgbWF0Y2ggZnJvbSAqL1xuICB2YXIgZnJvbV9zb3VyY2U7XG5cblxuICB2YXIgaW5wdXQsIG91dHB1dDsgLy8gSlMgc3BlY2lmaWMsIGJlY2F1c2Ugd2UgaGF2ZSBubyBwb2ludGVyc1xuXG4gIC8qIGNvcHkgc3RhdGUgdG8gbG9jYWwgdmFyaWFibGVzICovXG4gIHN0YXRlID0gc3RybS5zdGF0ZTtcbiAgLy9oZXJlID0gc3RhdGUuaGVyZTtcbiAgX2luID0gc3RybS5uZXh0X2luO1xuICBpbnB1dCA9IHN0cm0uaW5wdXQ7XG4gIGxhc3QgPSBfaW4gKyAoc3RybS5hdmFpbF9pbiAtIDUpO1xuICBfb3V0ID0gc3RybS5uZXh0X291dDtcbiAgb3V0cHV0ID0gc3RybS5vdXRwdXQ7XG4gIGJlZyA9IF9vdXQgLSAoc3RhcnQgLSBzdHJtLmF2YWlsX291dCk7XG4gIGVuZCA9IF9vdXQgKyAoc3RybS5hdmFpbF9vdXQgLSAyNTcpO1xuLy8jaWZkZWYgSU5GTEFURV9TVFJJQ1RcbiAgZG1heCA9IHN0YXRlLmRtYXg7XG4vLyNlbmRpZlxuICB3c2l6ZSA9IHN0YXRlLndzaXplO1xuICB3aGF2ZSA9IHN0YXRlLndoYXZlO1xuICB3bmV4dCA9IHN0YXRlLnduZXh0O1xuICB3aW5kb3cgPSBzdGF0ZS53aW5kb3c7XG4gIGhvbGQgPSBzdGF0ZS5ob2xkO1xuICBiaXRzID0gc3RhdGUuYml0cztcbiAgbGNvZGUgPSBzdGF0ZS5sZW5jb2RlO1xuICBkY29kZSA9IHN0YXRlLmRpc3Rjb2RlO1xuICBsbWFzayA9ICgxIDw8IHN0YXRlLmxlbmJpdHMpIC0gMTtcbiAgZG1hc2sgPSAoMSA8PCBzdGF0ZS5kaXN0Yml0cykgLSAxO1xuXG5cbiAgLyogZGVjb2RlIGxpdGVyYWxzIGFuZCBsZW5ndGgvZGlzdGFuY2VzIHVudGlsIGVuZC1vZi1ibG9jayBvciBub3QgZW5vdWdoXG4gICAgIGlucHV0IGRhdGEgb3Igb3V0cHV0IHNwYWNlICovXG5cbiAgdG9wOlxuICBkbyB7XG4gICAgaWYgKGJpdHMgPCAxNSkge1xuICAgICAgaG9sZCArPSBpbnB1dFtfaW4rK10gPDwgYml0cztcbiAgICAgIGJpdHMgKz0gODtcbiAgICAgIGhvbGQgKz0gaW5wdXRbX2luKytdIDw8IGJpdHM7XG4gICAgICBiaXRzICs9IDg7XG4gICAgfVxuXG4gICAgaGVyZSA9IGxjb2RlW2hvbGQgJiBsbWFza107XG5cbiAgICBkb2xlbjpcbiAgICBmb3IgKDs7KSB7IC8vIEdvdG8gZW11bGF0aW9uXG4gICAgICBvcCA9IGhlcmUgPj4+IDI0LypoZXJlLmJpdHMqLztcbiAgICAgIGhvbGQgPj4+PSBvcDtcbiAgICAgIGJpdHMgLT0gb3A7XG4gICAgICBvcCA9IChoZXJlID4+PiAxNikgJiAweGZmLypoZXJlLm9wKi87XG4gICAgICBpZiAob3AgPT09IDApIHsgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGxpdGVyYWwgKi9cbiAgICAgICAgLy9UcmFjZXZ2KChzdGRlcnIsIGhlcmUudmFsID49IDB4MjAgJiYgaGVyZS52YWwgPCAweDdmID9cbiAgICAgICAgLy8gICAgICAgIFwiaW5mbGF0ZTogICAgICAgICBsaXRlcmFsICclYydcXG5cIiA6XG4gICAgICAgIC8vICAgICAgICBcImluZmxhdGU6ICAgICAgICAgbGl0ZXJhbCAweCUwMnhcXG5cIiwgaGVyZS52YWwpKTtcbiAgICAgICAgb3V0cHV0W19vdXQrK10gPSBoZXJlICYgMHhmZmZmLypoZXJlLnZhbCovO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAob3AgJiAxNikgeyAgICAgICAgICAgICAgICAgICAgIC8qIGxlbmd0aCBiYXNlICovXG4gICAgICAgIGxlbiA9IGhlcmUgJiAweGZmZmYvKmhlcmUudmFsKi87XG4gICAgICAgIG9wICY9IDE1OyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIG51bWJlciBvZiBleHRyYSBiaXRzICovXG4gICAgICAgIGlmIChvcCkge1xuICAgICAgICAgIGlmIChiaXRzIDwgb3ApIHtcbiAgICAgICAgICAgIGhvbGQgKz0gaW5wdXRbX2luKytdIDw8IGJpdHM7XG4gICAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxlbiArPSBob2xkICYgKCgxIDw8IG9wKSAtIDEpO1xuICAgICAgICAgIGhvbGQgPj4+PSBvcDtcbiAgICAgICAgICBiaXRzIC09IG9wO1xuICAgICAgICB9XG4gICAgICAgIC8vVHJhY2V2digoc3RkZXJyLCBcImluZmxhdGU6ICAgICAgICAgbGVuZ3RoICV1XFxuXCIsIGxlbikpO1xuICAgICAgICBpZiAoYml0cyA8IDE1KSB7XG4gICAgICAgICAgaG9sZCArPSBpbnB1dFtfaW4rK10gPDwgYml0cztcbiAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgICAgaG9sZCArPSBpbnB1dFtfaW4rK10gPDwgYml0cztcbiAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgIH1cbiAgICAgICAgaGVyZSA9IGRjb2RlW2hvbGQgJiBkbWFza107XG5cbiAgICAgICAgZG9kaXN0OlxuICAgICAgICBmb3IgKDs7KSB7IC8vIGdvdG8gZW11bGF0aW9uXG4gICAgICAgICAgb3AgPSBoZXJlID4+PiAyNC8qaGVyZS5iaXRzKi87XG4gICAgICAgICAgaG9sZCA+Pj49IG9wO1xuICAgICAgICAgIGJpdHMgLT0gb3A7XG4gICAgICAgICAgb3AgPSAoaGVyZSA+Pj4gMTYpICYgMHhmZi8qaGVyZS5vcCovO1xuXG4gICAgICAgICAgaWYgKG9wICYgMTYpIHsgICAgICAgICAgICAgICAgICAgICAgLyogZGlzdGFuY2UgYmFzZSAqL1xuICAgICAgICAgICAgZGlzdCA9IGhlcmUgJiAweGZmZmYvKmhlcmUudmFsKi87XG4gICAgICAgICAgICBvcCAmPSAxNTsgICAgICAgICAgICAgICAgICAgICAgIC8qIG51bWJlciBvZiBleHRyYSBiaXRzICovXG4gICAgICAgICAgICBpZiAoYml0cyA8IG9wKSB7XG4gICAgICAgICAgICAgIGhvbGQgKz0gaW5wdXRbX2luKytdIDw8IGJpdHM7XG4gICAgICAgICAgICAgIGJpdHMgKz0gODtcbiAgICAgICAgICAgICAgaWYgKGJpdHMgPCBvcCkge1xuICAgICAgICAgICAgICAgIGhvbGQgKz0gaW5wdXRbX2luKytdIDw8IGJpdHM7XG4gICAgICAgICAgICAgICAgYml0cyArPSA4O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXN0ICs9IGhvbGQgJiAoKDEgPDwgb3ApIC0gMSk7XG4vLyNpZmRlZiBJTkZMQVRFX1NUUklDVFxuICAgICAgICAgICAgaWYgKGRpc3QgPiBkbWF4KSB7XG4gICAgICAgICAgICAgIHN0cm0ubXNnID0gJ2ludmFsaWQgZGlzdGFuY2UgdG9vIGZhciBiYWNrJztcbiAgICAgICAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgICAgICAgYnJlYWsgdG9wO1xuICAgICAgICAgICAgfVxuLy8jZW5kaWZcbiAgICAgICAgICAgIGhvbGQgPj4+PSBvcDtcbiAgICAgICAgICAgIGJpdHMgLT0gb3A7XG4gICAgICAgICAgICAvL1RyYWNldnYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgICAgICAgIGRpc3RhbmNlICV1XFxuXCIsIGRpc3QpKTtcbiAgICAgICAgICAgIG9wID0gX291dCAtIGJlZzsgICAgICAgICAgICAgICAgLyogbWF4IGRpc3RhbmNlIGluIG91dHB1dCAqL1xuICAgICAgICAgICAgaWYgKGRpc3QgPiBvcCkgeyAgICAgICAgICAgICAgICAvKiBzZWUgaWYgY29weSBmcm9tIHdpbmRvdyAqL1xuICAgICAgICAgICAgICBvcCA9IGRpc3QgLSBvcDsgICAgICAgICAgICAgICAvKiBkaXN0YW5jZSBiYWNrIGluIHdpbmRvdyAqL1xuICAgICAgICAgICAgICBpZiAob3AgPiB3aGF2ZSkge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zYW5lKSB7XG4gICAgICAgICAgICAgICAgICBzdHJtLm1zZyA9ICdpbnZhbGlkIGRpc3RhbmNlIHRvbyBmYXIgYmFjayc7XG4gICAgICAgICAgICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICAgICAgICAgICAgYnJlYWsgdG9wO1xuICAgICAgICAgICAgICAgIH1cblxuLy8gKCEpIFRoaXMgYmxvY2sgaXMgZGlzYWJsZWQgaW4gemxpYiBkZWZhaWx0cyxcbi8vIGRvbid0IGVuYWJsZSBpdCBmb3IgYmluYXJ5IGNvbXBhdGliaWxpdHlcbi8vI2lmZGVmIElORkxBVEVfQUxMT1dfSU5WQUxJRF9ESVNUQU5DRV9UT09GQVJfQVJSUlxuLy8gICAgICAgICAgICAgICAgaWYgKGxlbiA8PSBvcCAtIHdoYXZlKSB7XG4vLyAgICAgICAgICAgICAgICAgIGRvIHtcbi8vICAgICAgICAgICAgICAgICAgICBvdXRwdXRbX291dCsrXSA9IDA7XG4vLyAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKC0tbGVuKTtcbi8vICAgICAgICAgICAgICAgICAgY29udGludWUgdG9wO1xuLy8gICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgbGVuIC09IG9wIC0gd2hhdmU7XG4vLyAgICAgICAgICAgICAgICBkbyB7XG4vLyAgICAgICAgICAgICAgICAgIG91dHB1dFtfb3V0KytdID0gMDtcbi8vICAgICAgICAgICAgICAgIH0gd2hpbGUgKC0tb3AgPiB3aGF2ZSk7XG4vLyAgICAgICAgICAgICAgICBpZiAob3AgPT09IDApIHtcbi8vICAgICAgICAgICAgICAgICAgZnJvbSA9IF9vdXQgLSBkaXN0O1xuLy8gICAgICAgICAgICAgICAgICBkbyB7XG4vLyAgICAgICAgICAgICAgICAgICAgb3V0cHV0W19vdXQrK10gPSBvdXRwdXRbZnJvbSsrXTtcbi8vICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoLS1sZW4pO1xuLy8gICAgICAgICAgICAgICAgICBjb250aW51ZSB0b3A7XG4vLyAgICAgICAgICAgICAgICB9XG4vLyNlbmRpZlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGZyb20gPSAwOyAvLyB3aW5kb3cgaW5kZXhcbiAgICAgICAgICAgICAgZnJvbV9zb3VyY2UgPSB3aW5kb3c7XG4gICAgICAgICAgICAgIGlmICh3bmV4dCA9PT0gMCkgeyAgICAgICAgICAgLyogdmVyeSBjb21tb24gY2FzZSAqL1xuICAgICAgICAgICAgICAgIGZyb20gKz0gd3NpemUgLSBvcDtcbiAgICAgICAgICAgICAgICBpZiAob3AgPCBsZW4pIHsgICAgICAgICAvKiBzb21lIGZyb20gd2luZG93ICovXG4gICAgICAgICAgICAgICAgICBsZW4gLT0gb3A7XG4gICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFtfb3V0KytdID0gd2luZG93W2Zyb20rK107XG4gICAgICAgICAgICAgICAgICB9IHdoaWxlICgtLW9wKTtcbiAgICAgICAgICAgICAgICAgIGZyb20gPSBfb3V0IC0gZGlzdDsgIC8qIHJlc3QgZnJvbSBvdXRwdXQgKi9cbiAgICAgICAgICAgICAgICAgIGZyb21fc291cmNlID0gb3V0cHV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIGlmICh3bmV4dCA8IG9wKSB7ICAgICAgLyogd3JhcCBhcm91bmQgd2luZG93ICovXG4gICAgICAgICAgICAgICAgZnJvbSArPSB3c2l6ZSArIHduZXh0IC0gb3A7XG4gICAgICAgICAgICAgICAgb3AgLT0gd25leHQ7XG4gICAgICAgICAgICAgICAgaWYgKG9wIDwgbGVuKSB7ICAgICAgICAgLyogc29tZSBmcm9tIGVuZCBvZiB3aW5kb3cgKi9cbiAgICAgICAgICAgICAgICAgIGxlbiAtPSBvcDtcbiAgICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0W19vdXQrK10gPSB3aW5kb3dbZnJvbSsrXTtcbiAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKC0tb3ApO1xuICAgICAgICAgICAgICAgICAgZnJvbSA9IDA7XG4gICAgICAgICAgICAgICAgICBpZiAod25leHQgPCBsZW4pIHsgIC8qIHNvbWUgZnJvbSBzdGFydCBvZiB3aW5kb3cgKi9cbiAgICAgICAgICAgICAgICAgICAgb3AgPSB3bmV4dDtcbiAgICAgICAgICAgICAgICAgICAgbGVuIC09IG9wO1xuICAgICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W19vdXQrK10gPSB3aW5kb3dbZnJvbSsrXTtcbiAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoLS1vcCk7XG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSBfb3V0IC0gZGlzdDsgICAgICAvKiByZXN0IGZyb20gb3V0cHV0ICovXG4gICAgICAgICAgICAgICAgICAgIGZyb21fc291cmNlID0gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHsgICAgICAgICAgICAgICAgICAgICAgLyogY29udGlndW91cyBpbiB3aW5kb3cgKi9cbiAgICAgICAgICAgICAgICBmcm9tICs9IHduZXh0IC0gb3A7XG4gICAgICAgICAgICAgICAgaWYgKG9wIDwgbGVuKSB7ICAgICAgICAgLyogc29tZSBmcm9tIHdpbmRvdyAqL1xuICAgICAgICAgICAgICAgICAgbGVuIC09IG9wO1xuICAgICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRbX291dCsrXSA9IHdpbmRvd1tmcm9tKytdO1xuICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoLS1vcCk7XG4gICAgICAgICAgICAgICAgICBmcm9tID0gX291dCAtIGRpc3Q7ICAvKiByZXN0IGZyb20gb3V0cHV0ICovXG4gICAgICAgICAgICAgICAgICBmcm9tX3NvdXJjZSA9IG91dHB1dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgd2hpbGUgKGxlbiA+IDIpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRbX291dCsrXSA9IGZyb21fc291cmNlW2Zyb20rK107XG4gICAgICAgICAgICAgICAgb3V0cHV0W19vdXQrK10gPSBmcm9tX3NvdXJjZVtmcm9tKytdO1xuICAgICAgICAgICAgICAgIG91dHB1dFtfb3V0KytdID0gZnJvbV9zb3VyY2VbZnJvbSsrXTtcbiAgICAgICAgICAgICAgICBsZW4gLT0gMztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0W19vdXQrK10gPSBmcm9tX3NvdXJjZVtmcm9tKytdO1xuICAgICAgICAgICAgICAgIGlmIChsZW4gPiAxKSB7XG4gICAgICAgICAgICAgICAgICBvdXRwdXRbX291dCsrXSA9IGZyb21fc291cmNlW2Zyb20rK107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgZnJvbSA9IF9vdXQgLSBkaXN0OyAgICAgICAgICAvKiBjb3B5IGRpcmVjdCBmcm9tIG91dHB1dCAqL1xuICAgICAgICAgICAgICBkbyB7ICAgICAgICAgICAgICAgICAgICAgICAgLyogbWluaW11bSBsZW5ndGggaXMgdGhyZWUgKi9cbiAgICAgICAgICAgICAgICBvdXRwdXRbX291dCsrXSA9IG91dHB1dFtmcm9tKytdO1xuICAgICAgICAgICAgICAgIG91dHB1dFtfb3V0KytdID0gb3V0cHV0W2Zyb20rK107XG4gICAgICAgICAgICAgICAgb3V0cHV0W19vdXQrK10gPSBvdXRwdXRbZnJvbSsrXTtcbiAgICAgICAgICAgICAgICBsZW4gLT0gMztcbiAgICAgICAgICAgICAgfSB3aGlsZSAobGVuID4gMik7XG4gICAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRbX291dCsrXSA9IG91dHB1dFtmcm9tKytdO1xuICAgICAgICAgICAgICAgIGlmIChsZW4gPiAxKSB7XG4gICAgICAgICAgICAgICAgICBvdXRwdXRbX291dCsrXSA9IG91dHB1dFtmcm9tKytdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICgob3AgJiA2NCkgPT09IDApIHsgICAgICAgICAgLyogMm5kIGxldmVsIGRpc3RhbmNlIGNvZGUgKi9cbiAgICAgICAgICAgIGhlcmUgPSBkY29kZVsoaGVyZSAmIDB4ZmZmZikvKmhlcmUudmFsKi8gKyAoaG9sZCAmICgoMSA8PCBvcCkgLSAxKSldO1xuICAgICAgICAgICAgY29udGludWUgZG9kaXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN0cm0ubXNnID0gJ2ludmFsaWQgZGlzdGFuY2UgY29kZSc7XG4gICAgICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICAgICAgYnJlYWsgdG9wO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrOyAvLyBuZWVkIHRvIGVtdWxhdGUgZ290byB2aWEgXCJjb250aW51ZVwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKChvcCAmIDY0KSA9PT0gMCkgeyAgICAgICAgICAgICAgLyogMm5kIGxldmVsIGxlbmd0aCBjb2RlICovXG4gICAgICAgIGhlcmUgPSBsY29kZVsoaGVyZSAmIDB4ZmZmZikvKmhlcmUudmFsKi8gKyAoaG9sZCAmICgoMSA8PCBvcCkgLSAxKSldO1xuICAgICAgICBjb250aW51ZSBkb2xlbjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG9wICYgMzIpIHsgICAgICAgICAgICAgICAgICAgICAvKiBlbmQtb2YtYmxvY2sgKi9cbiAgICAgICAgLy9UcmFjZXZ2KChzdGRlcnIsIFwiaW5mbGF0ZTogICAgICAgICBlbmQgb2YgYmxvY2tcXG5cIikpO1xuICAgICAgICBzdGF0ZS5tb2RlID0gVFlQRTtcbiAgICAgICAgYnJlYWsgdG9wO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHN0cm0ubXNnID0gJ2ludmFsaWQgbGl0ZXJhbC9sZW5ndGggY29kZSc7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBCQUQ7XG4gICAgICAgIGJyZWFrIHRvcDtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7IC8vIG5lZWQgdG8gZW11bGF0ZSBnb3RvIHZpYSBcImNvbnRpbnVlXCJcbiAgICB9XG4gIH0gd2hpbGUgKF9pbiA8IGxhc3QgJiYgX291dCA8IGVuZCk7XG5cbiAgLyogcmV0dXJuIHVudXNlZCBieXRlcyAob24gZW50cnksIGJpdHMgPCA4LCBzbyBpbiB3b24ndCBnbyB0b28gZmFyIGJhY2spICovXG4gIGxlbiA9IGJpdHMgPj4gMztcbiAgX2luIC09IGxlbjtcbiAgYml0cyAtPSBsZW4gPDwgMztcbiAgaG9sZCAmPSAoMSA8PCBiaXRzKSAtIDE7XG5cbiAgLyogdXBkYXRlIHN0YXRlIGFuZCByZXR1cm4gKi9cbiAgc3RybS5uZXh0X2luID0gX2luO1xuICBzdHJtLm5leHRfb3V0ID0gX291dDtcbiAgc3RybS5hdmFpbF9pbiA9IChfaW4gPCBsYXN0ID8gNSArIChsYXN0IC0gX2luKSA6IDUgLSAoX2luIC0gbGFzdCkpO1xuICBzdHJtLmF2YWlsX291dCA9IChfb3V0IDwgZW5kID8gMjU3ICsgKGVuZCAtIF9vdXQpIDogMjU3IC0gKF9vdXQgLSBlbmQpKTtcbiAgc3RhdGUuaG9sZCA9IGhvbGQ7XG4gIHN0YXRlLmJpdHMgPSBiaXRzO1xuICByZXR1cm47XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzL2NvbW1vbicpO1xudmFyIGFkbGVyMzIgPSByZXF1aXJlKCcuL2FkbGVyMzInKTtcbnZhciBjcmMzMiAgID0gcmVxdWlyZSgnLi9jcmMzMicpO1xudmFyIGluZmxhdGVfZmFzdCA9IHJlcXVpcmUoJy4vaW5mZmFzdCcpO1xudmFyIGluZmxhdGVfdGFibGUgPSByZXF1aXJlKCcuL2luZnRyZWVzJyk7XG5cbnZhciBDT0RFUyA9IDA7XG52YXIgTEVOUyA9IDE7XG52YXIgRElTVFMgPSAyO1xuXG4vKiBQdWJsaWMgY29uc3RhbnRzID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cblxuXG4vKiBBbGxvd2VkIGZsdXNoIHZhbHVlczsgc2VlIGRlZmxhdGUoKSBhbmQgaW5mbGF0ZSgpIGJlbG93IGZvciBkZXRhaWxzICovXG4vL3ZhciBaX05PX0ZMVVNIICAgICAgPSAwO1xuLy92YXIgWl9QQVJUSUFMX0ZMVVNIID0gMTtcbi8vdmFyIFpfU1lOQ19GTFVTSCAgICA9IDI7XG4vL3ZhciBaX0ZVTExfRkxVU0ggICAgPSAzO1xudmFyIFpfRklOSVNIICAgICAgICA9IDQ7XG52YXIgWl9CTE9DSyAgICAgICAgID0gNTtcbnZhciBaX1RSRUVTICAgICAgICAgPSA2O1xuXG5cbi8qIFJldHVybiBjb2RlcyBmb3IgdGhlIGNvbXByZXNzaW9uL2RlY29tcHJlc3Npb24gZnVuY3Rpb25zLiBOZWdhdGl2ZSB2YWx1ZXNcbiAqIGFyZSBlcnJvcnMsIHBvc2l0aXZlIHZhbHVlcyBhcmUgdXNlZCBmb3Igc3BlY2lhbCBidXQgbm9ybWFsIGV2ZW50cy5cbiAqL1xudmFyIFpfT0sgICAgICAgICAgICA9IDA7XG52YXIgWl9TVFJFQU1fRU5EICAgID0gMTtcbnZhciBaX05FRURfRElDVCAgICAgPSAyO1xuLy92YXIgWl9FUlJOTyAgICAgICAgID0gLTE7XG52YXIgWl9TVFJFQU1fRVJST1IgID0gLTI7XG52YXIgWl9EQVRBX0VSUk9SICAgID0gLTM7XG52YXIgWl9NRU1fRVJST1IgICAgID0gLTQ7XG52YXIgWl9CVUZfRVJST1IgICAgID0gLTU7XG4vL3ZhciBaX1ZFUlNJT05fRVJST1IgPSAtNjtcblxuLyogVGhlIGRlZmxhdGUgY29tcHJlc3Npb24gbWV0aG9kICovXG52YXIgWl9ERUZMQVRFRCAgPSA4O1xuXG5cbi8qIFNUQVRFUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xuXG5cbnZhciAgICBIRUFEID0gMTsgICAgICAgLyogaTogd2FpdGluZyBmb3IgbWFnaWMgaGVhZGVyICovXG52YXIgICAgRkxBR1MgPSAyOyAgICAgIC8qIGk6IHdhaXRpbmcgZm9yIG1ldGhvZCBhbmQgZmxhZ3MgKGd6aXApICovXG52YXIgICAgVElNRSA9IDM7ICAgICAgIC8qIGk6IHdhaXRpbmcgZm9yIG1vZGlmaWNhdGlvbiB0aW1lIChnemlwKSAqL1xudmFyICAgIE9TID0gNDsgICAgICAgICAvKiBpOiB3YWl0aW5nIGZvciBleHRyYSBmbGFncyBhbmQgb3BlcmF0aW5nIHN5c3RlbSAoZ3ppcCkgKi9cbnZhciAgICBFWExFTiA9IDU7ICAgICAgLyogaTogd2FpdGluZyBmb3IgZXh0cmEgbGVuZ3RoIChnemlwKSAqL1xudmFyICAgIEVYVFJBID0gNjsgICAgICAvKiBpOiB3YWl0aW5nIGZvciBleHRyYSBieXRlcyAoZ3ppcCkgKi9cbnZhciAgICBOQU1FID0gNzsgICAgICAgLyogaTogd2FpdGluZyBmb3IgZW5kIG9mIGZpbGUgbmFtZSAoZ3ppcCkgKi9cbnZhciAgICBDT01NRU5UID0gODsgICAgLyogaTogd2FpdGluZyBmb3IgZW5kIG9mIGNvbW1lbnQgKGd6aXApICovXG52YXIgICAgSENSQyA9IDk7ICAgICAgIC8qIGk6IHdhaXRpbmcgZm9yIGhlYWRlciBjcmMgKGd6aXApICovXG52YXIgICAgRElDVElEID0gMTA7ICAgIC8qIGk6IHdhaXRpbmcgZm9yIGRpY3Rpb25hcnkgY2hlY2sgdmFsdWUgKi9cbnZhciAgICBESUNUID0gMTE7ICAgICAgLyogd2FpdGluZyBmb3IgaW5mbGF0ZVNldERpY3Rpb25hcnkoKSBjYWxsICovXG52YXIgICAgICAgIFRZUEUgPSAxMjsgICAgICAvKiBpOiB3YWl0aW5nIGZvciB0eXBlIGJpdHMsIGluY2x1ZGluZyBsYXN0LWZsYWcgYml0ICovXG52YXIgICAgICAgIFRZUEVETyA9IDEzOyAgICAvKiBpOiBzYW1lLCBidXQgc2tpcCBjaGVjayB0byBleGl0IGluZmxhdGUgb24gbmV3IGJsb2NrICovXG52YXIgICAgICAgIFNUT1JFRCA9IDE0OyAgICAvKiBpOiB3YWl0aW5nIGZvciBzdG9yZWQgc2l6ZSAobGVuZ3RoIGFuZCBjb21wbGVtZW50KSAqL1xudmFyICAgICAgICBDT1BZXyA9IDE1OyAgICAgLyogaS9vOiBzYW1lIGFzIENPUFkgYmVsb3csIGJ1dCBvbmx5IGZpcnN0IHRpbWUgaW4gKi9cbnZhciAgICAgICAgQ09QWSA9IDE2OyAgICAgIC8qIGkvbzogd2FpdGluZyBmb3IgaW5wdXQgb3Igb3V0cHV0IHRvIGNvcHkgc3RvcmVkIGJsb2NrICovXG52YXIgICAgICAgIFRBQkxFID0gMTc7ICAgICAvKiBpOiB3YWl0aW5nIGZvciBkeW5hbWljIGJsb2NrIHRhYmxlIGxlbmd0aHMgKi9cbnZhciAgICAgICAgTEVOTEVOUyA9IDE4OyAgIC8qIGk6IHdhaXRpbmcgZm9yIGNvZGUgbGVuZ3RoIGNvZGUgbGVuZ3RocyAqL1xudmFyICAgICAgICBDT0RFTEVOUyA9IDE5OyAgLyogaTogd2FpdGluZyBmb3IgbGVuZ3RoL2xpdCBhbmQgZGlzdGFuY2UgY29kZSBsZW5ndGhzICovXG52YXIgICAgICAgICAgICBMRU5fID0gMjA7ICAgICAgLyogaTogc2FtZSBhcyBMRU4gYmVsb3csIGJ1dCBvbmx5IGZpcnN0IHRpbWUgaW4gKi9cbnZhciAgICAgICAgICAgIExFTiA9IDIxOyAgICAgICAvKiBpOiB3YWl0aW5nIGZvciBsZW5ndGgvbGl0L2VvYiBjb2RlICovXG52YXIgICAgICAgICAgICBMRU5FWFQgPSAyMjsgICAgLyogaTogd2FpdGluZyBmb3IgbGVuZ3RoIGV4dHJhIGJpdHMgKi9cbnZhciAgICAgICAgICAgIERJU1QgPSAyMzsgICAgICAvKiBpOiB3YWl0aW5nIGZvciBkaXN0YW5jZSBjb2RlICovXG52YXIgICAgICAgICAgICBESVNURVhUID0gMjQ7ICAgLyogaTogd2FpdGluZyBmb3IgZGlzdGFuY2UgZXh0cmEgYml0cyAqL1xudmFyICAgICAgICAgICAgTUFUQ0ggPSAyNTsgICAgIC8qIG86IHdhaXRpbmcgZm9yIG91dHB1dCBzcGFjZSB0byBjb3B5IHN0cmluZyAqL1xudmFyICAgICAgICAgICAgTElUID0gMjY7ICAgICAgIC8qIG86IHdhaXRpbmcgZm9yIG91dHB1dCBzcGFjZSB0byB3cml0ZSBsaXRlcmFsICovXG52YXIgICAgQ0hFQ0sgPSAyNzsgICAgIC8qIGk6IHdhaXRpbmcgZm9yIDMyLWJpdCBjaGVjayB2YWx1ZSAqL1xudmFyICAgIExFTkdUSCA9IDI4OyAgICAvKiBpOiB3YWl0aW5nIGZvciAzMi1iaXQgbGVuZ3RoIChnemlwKSAqL1xudmFyICAgIERPTkUgPSAyOTsgICAgICAvKiBmaW5pc2hlZCBjaGVjaywgZG9uZSAtLSByZW1haW4gaGVyZSB1bnRpbCByZXNldCAqL1xudmFyICAgIEJBRCA9IDMwOyAgICAgICAvKiBnb3QgYSBkYXRhIGVycm9yIC0tIHJlbWFpbiBoZXJlIHVudGlsIHJlc2V0ICovXG52YXIgICAgTUVNID0gMzE7ICAgICAgIC8qIGdvdCBhbiBpbmZsYXRlKCkgbWVtb3J5IGVycm9yIC0tIHJlbWFpbiBoZXJlIHVudGlsIHJlc2V0ICovXG52YXIgICAgU1lOQyA9IDMyOyAgICAgIC8qIGxvb2tpbmcgZm9yIHN5bmNocm9uaXphdGlvbiBieXRlcyB0byByZXN0YXJ0IGluZmxhdGUoKSAqL1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xuXG5cblxudmFyIEVOT1VHSF9MRU5TID0gODUyO1xudmFyIEVOT1VHSF9ESVNUUyA9IDU5Mjtcbi8vdmFyIEVOT1VHSCA9ICAoRU5PVUdIX0xFTlMrRU5PVUdIX0RJU1RTKTtcblxudmFyIE1BWF9XQklUUyA9IDE1O1xuLyogMzJLIExaNzcgd2luZG93ICovXG52YXIgREVGX1dCSVRTID0gTUFYX1dCSVRTO1xuXG5cbmZ1bmN0aW9uIFpTV0FQMzIocSkge1xuICByZXR1cm4gICgoKHEgPj4+IDI0KSAmIDB4ZmYpICtcbiAgICAgICAgICAoKHEgPj4+IDgpICYgMHhmZjAwKSArXG4gICAgICAgICAgKChxICYgMHhmZjAwKSA8PCA4KSArXG4gICAgICAgICAgKChxICYgMHhmZikgPDwgMjQpKTtcbn1cblxuXG5mdW5jdGlvbiBJbmZsYXRlU3RhdGUoKSB7XG4gIHRoaXMubW9kZSA9IDA7ICAgICAgICAgICAgIC8qIGN1cnJlbnQgaW5mbGF0ZSBtb2RlICovXG4gIHRoaXMubGFzdCA9IGZhbHNlOyAgICAgICAgICAvKiB0cnVlIGlmIHByb2Nlc3NpbmcgbGFzdCBibG9jayAqL1xuICB0aGlzLndyYXAgPSAwOyAgICAgICAgICAgICAgLyogYml0IDAgdHJ1ZSBmb3IgemxpYiwgYml0IDEgdHJ1ZSBmb3IgZ3ppcCAqL1xuICB0aGlzLmhhdmVkaWN0ID0gZmFsc2U7ICAgICAgLyogdHJ1ZSBpZiBkaWN0aW9uYXJ5IHByb3ZpZGVkICovXG4gIHRoaXMuZmxhZ3MgPSAwOyAgICAgICAgICAgICAvKiBnemlwIGhlYWRlciBtZXRob2QgYW5kIGZsYWdzICgwIGlmIHpsaWIpICovXG4gIHRoaXMuZG1heCA9IDA7ICAgICAgICAgICAgICAvKiB6bGliIGhlYWRlciBtYXggZGlzdGFuY2UgKElORkxBVEVfU1RSSUNUKSAqL1xuICB0aGlzLmNoZWNrID0gMDsgICAgICAgICAgICAgLyogcHJvdGVjdGVkIGNvcHkgb2YgY2hlY2sgdmFsdWUgKi9cbiAgdGhpcy50b3RhbCA9IDA7ICAgICAgICAgICAgIC8qIHByb3RlY3RlZCBjb3B5IG9mIG91dHB1dCBjb3VudCAqL1xuICAvLyBUT0RPOiBtYXkgYmUge31cbiAgdGhpcy5oZWFkID0gbnVsbDsgICAgICAgICAgIC8qIHdoZXJlIHRvIHNhdmUgZ3ppcCBoZWFkZXIgaW5mb3JtYXRpb24gKi9cblxuICAvKiBzbGlkaW5nIHdpbmRvdyAqL1xuICB0aGlzLndiaXRzID0gMDsgICAgICAgICAgICAgLyogbG9nIGJhc2UgMiBvZiByZXF1ZXN0ZWQgd2luZG93IHNpemUgKi9cbiAgdGhpcy53c2l6ZSA9IDA7ICAgICAgICAgICAgIC8qIHdpbmRvdyBzaXplIG9yIHplcm8gaWYgbm90IHVzaW5nIHdpbmRvdyAqL1xuICB0aGlzLndoYXZlID0gMDsgICAgICAgICAgICAgLyogdmFsaWQgYnl0ZXMgaW4gdGhlIHdpbmRvdyAqL1xuICB0aGlzLnduZXh0ID0gMDsgICAgICAgICAgICAgLyogd2luZG93IHdyaXRlIGluZGV4ICovXG4gIHRoaXMud2luZG93ID0gbnVsbDsgICAgICAgICAvKiBhbGxvY2F0ZWQgc2xpZGluZyB3aW5kb3csIGlmIG5lZWRlZCAqL1xuXG4gIC8qIGJpdCBhY2N1bXVsYXRvciAqL1xuICB0aGlzLmhvbGQgPSAwOyAgICAgICAgICAgICAgLyogaW5wdXQgYml0IGFjY3VtdWxhdG9yICovXG4gIHRoaXMuYml0cyA9IDA7ICAgICAgICAgICAgICAvKiBudW1iZXIgb2YgYml0cyBpbiBcImluXCIgKi9cblxuICAvKiBmb3Igc3RyaW5nIGFuZCBzdG9yZWQgYmxvY2sgY29weWluZyAqL1xuICB0aGlzLmxlbmd0aCA9IDA7ICAgICAgICAgICAgLyogbGl0ZXJhbCBvciBsZW5ndGggb2YgZGF0YSB0byBjb3B5ICovXG4gIHRoaXMub2Zmc2V0ID0gMDsgICAgICAgICAgICAvKiBkaXN0YW5jZSBiYWNrIHRvIGNvcHkgc3RyaW5nIGZyb20gKi9cblxuICAvKiBmb3IgdGFibGUgYW5kIGNvZGUgZGVjb2RpbmcgKi9cbiAgdGhpcy5leHRyYSA9IDA7ICAgICAgICAgICAgIC8qIGV4dHJhIGJpdHMgbmVlZGVkICovXG5cbiAgLyogZml4ZWQgYW5kIGR5bmFtaWMgY29kZSB0YWJsZXMgKi9cbiAgdGhpcy5sZW5jb2RlID0gbnVsbDsgICAgICAgICAgLyogc3RhcnRpbmcgdGFibGUgZm9yIGxlbmd0aC9saXRlcmFsIGNvZGVzICovXG4gIHRoaXMuZGlzdGNvZGUgPSBudWxsOyAgICAgICAgIC8qIHN0YXJ0aW5nIHRhYmxlIGZvciBkaXN0YW5jZSBjb2RlcyAqL1xuICB0aGlzLmxlbmJpdHMgPSAwOyAgICAgICAgICAgLyogaW5kZXggYml0cyBmb3IgbGVuY29kZSAqL1xuICB0aGlzLmRpc3RiaXRzID0gMDsgICAgICAgICAgLyogaW5kZXggYml0cyBmb3IgZGlzdGNvZGUgKi9cblxuICAvKiBkeW5hbWljIHRhYmxlIGJ1aWxkaW5nICovXG4gIHRoaXMubmNvZGUgPSAwOyAgICAgICAgICAgICAvKiBudW1iZXIgb2YgY29kZSBsZW5ndGggY29kZSBsZW5ndGhzICovXG4gIHRoaXMubmxlbiA9IDA7ICAgICAgICAgICAgICAvKiBudW1iZXIgb2YgbGVuZ3RoIGNvZGUgbGVuZ3RocyAqL1xuICB0aGlzLm5kaXN0ID0gMDsgICAgICAgICAgICAgLyogbnVtYmVyIG9mIGRpc3RhbmNlIGNvZGUgbGVuZ3RocyAqL1xuICB0aGlzLmhhdmUgPSAwOyAgICAgICAgICAgICAgLyogbnVtYmVyIG9mIGNvZGUgbGVuZ3RocyBpbiBsZW5zW10gKi9cbiAgdGhpcy5uZXh0ID0gbnVsbDsgICAgICAgICAgICAgIC8qIG5leHQgYXZhaWxhYmxlIHNwYWNlIGluIGNvZGVzW10gKi9cblxuICB0aGlzLmxlbnMgPSBuZXcgdXRpbHMuQnVmMTYoMzIwKTsgLyogdGVtcG9yYXJ5IHN0b3JhZ2UgZm9yIGNvZGUgbGVuZ3RocyAqL1xuICB0aGlzLndvcmsgPSBuZXcgdXRpbHMuQnVmMTYoMjg4KTsgLyogd29yayBhcmVhIGZvciBjb2RlIHRhYmxlIGJ1aWxkaW5nICovXG5cbiAgLypcbiAgIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSBwb2ludGVycyBpbiBqcywgd2UgdXNlIGxlbmNvZGUgYW5kIGRpc3Rjb2RlIGRpcmVjdGx5XG4gICBhcyBidWZmZXJzIHNvIHdlIGRvbid0IG5lZWQgY29kZXNcbiAgKi9cbiAgLy90aGlzLmNvZGVzID0gbmV3IHV0aWxzLkJ1ZjMyKEVOT1VHSCk7ICAgICAgIC8qIHNwYWNlIGZvciBjb2RlIHRhYmxlcyAqL1xuICB0aGlzLmxlbmR5biA9IG51bGw7ICAgICAgICAgICAgICAvKiBkeW5hbWljIHRhYmxlIGZvciBsZW5ndGgvbGl0ZXJhbCBjb2RlcyAoSlMgc3BlY2lmaWMpICovXG4gIHRoaXMuZGlzdGR5biA9IG51bGw7ICAgICAgICAgICAgIC8qIGR5bmFtaWMgdGFibGUgZm9yIGRpc3RhbmNlIGNvZGVzIChKUyBzcGVjaWZpYykgKi9cbiAgdGhpcy5zYW5lID0gMDsgICAgICAgICAgICAgICAgICAgLyogaWYgZmFsc2UsIGFsbG93IGludmFsaWQgZGlzdGFuY2UgdG9vIGZhciAqL1xuICB0aGlzLmJhY2sgPSAwOyAgICAgICAgICAgICAgICAgICAvKiBiaXRzIGJhY2sgb2YgbGFzdCB1bnByb2Nlc3NlZCBsZW5ndGgvbGl0ICovXG4gIHRoaXMud2FzID0gMDsgICAgICAgICAgICAgICAgICAgIC8qIGluaXRpYWwgbGVuZ3RoIG9mIG1hdGNoICovXG59XG5cbmZ1bmN0aW9uIGluZmxhdGVSZXNldEtlZXAoc3RybSkge1xuICB2YXIgc3RhdGU7XG5cbiAgaWYgKCFzdHJtIHx8ICFzdHJtLnN0YXRlKSB7IHJldHVybiBaX1NUUkVBTV9FUlJPUjsgfVxuICBzdGF0ZSA9IHN0cm0uc3RhdGU7XG4gIHN0cm0udG90YWxfaW4gPSBzdHJtLnRvdGFsX291dCA9IHN0YXRlLnRvdGFsID0gMDtcbiAgc3RybS5tc2cgPSAnJzsgLypaX05VTEwqL1xuICBpZiAoc3RhdGUud3JhcCkgeyAgICAgICAvKiB0byBzdXBwb3J0IGlsbC1jb25jZWl2ZWQgSmF2YSB0ZXN0IHN1aXRlICovXG4gICAgc3RybS5hZGxlciA9IHN0YXRlLndyYXAgJiAxO1xuICB9XG4gIHN0YXRlLm1vZGUgPSBIRUFEO1xuICBzdGF0ZS5sYXN0ID0gMDtcbiAgc3RhdGUuaGF2ZWRpY3QgPSAwO1xuICBzdGF0ZS5kbWF4ID0gMzI3Njg7XG4gIHN0YXRlLmhlYWQgPSBudWxsLypaX05VTEwqLztcbiAgc3RhdGUuaG9sZCA9IDA7XG4gIHN0YXRlLmJpdHMgPSAwO1xuICAvL3N0YXRlLmxlbmNvZGUgPSBzdGF0ZS5kaXN0Y29kZSA9IHN0YXRlLm5leHQgPSBzdGF0ZS5jb2RlcztcbiAgc3RhdGUubGVuY29kZSA9IHN0YXRlLmxlbmR5biA9IG5ldyB1dGlscy5CdWYzMihFTk9VR0hfTEVOUyk7XG4gIHN0YXRlLmRpc3Rjb2RlID0gc3RhdGUuZGlzdGR5biA9IG5ldyB1dGlscy5CdWYzMihFTk9VR0hfRElTVFMpO1xuXG4gIHN0YXRlLnNhbmUgPSAxO1xuICBzdGF0ZS5iYWNrID0gLTE7XG4gIC8vVHJhY2V2KChzdGRlcnIsIFwiaW5mbGF0ZTogcmVzZXRcXG5cIikpO1xuICByZXR1cm4gWl9PSztcbn1cblxuZnVuY3Rpb24gaW5mbGF0ZVJlc2V0KHN0cm0pIHtcbiAgdmFyIHN0YXRlO1xuXG4gIGlmICghc3RybSB8fCAhc3RybS5zdGF0ZSkgeyByZXR1cm4gWl9TVFJFQU1fRVJST1I7IH1cbiAgc3RhdGUgPSBzdHJtLnN0YXRlO1xuICBzdGF0ZS53c2l6ZSA9IDA7XG4gIHN0YXRlLndoYXZlID0gMDtcbiAgc3RhdGUud25leHQgPSAwO1xuICByZXR1cm4gaW5mbGF0ZVJlc2V0S2VlcChzdHJtKTtcblxufVxuXG5mdW5jdGlvbiBpbmZsYXRlUmVzZXQyKHN0cm0sIHdpbmRvd0JpdHMpIHtcbiAgdmFyIHdyYXA7XG4gIHZhciBzdGF0ZTtcblxuICAvKiBnZXQgdGhlIHN0YXRlICovXG4gIGlmICghc3RybSB8fCAhc3RybS5zdGF0ZSkgeyByZXR1cm4gWl9TVFJFQU1fRVJST1I7IH1cbiAgc3RhdGUgPSBzdHJtLnN0YXRlO1xuXG4gIC8qIGV4dHJhY3Qgd3JhcCByZXF1ZXN0IGZyb20gd2luZG93Qml0cyBwYXJhbWV0ZXIgKi9cbiAgaWYgKHdpbmRvd0JpdHMgPCAwKSB7XG4gICAgd3JhcCA9IDA7XG4gICAgd2luZG93Qml0cyA9IC13aW5kb3dCaXRzO1xuICB9XG4gIGVsc2Uge1xuICAgIHdyYXAgPSAod2luZG93Qml0cyA+PiA0KSArIDE7XG4gICAgaWYgKHdpbmRvd0JpdHMgPCA0OCkge1xuICAgICAgd2luZG93Qml0cyAmPSAxNTtcbiAgICB9XG4gIH1cblxuICAvKiBzZXQgbnVtYmVyIG9mIHdpbmRvdyBiaXRzLCBmcmVlIHdpbmRvdyBpZiBkaWZmZXJlbnQgKi9cbiAgaWYgKHdpbmRvd0JpdHMgJiYgKHdpbmRvd0JpdHMgPCA4IHx8IHdpbmRvd0JpdHMgPiAxNSkpIHtcbiAgICByZXR1cm4gWl9TVFJFQU1fRVJST1I7XG4gIH1cbiAgaWYgKHN0YXRlLndpbmRvdyAhPT0gbnVsbCAmJiBzdGF0ZS53Yml0cyAhPT0gd2luZG93Qml0cykge1xuICAgIHN0YXRlLndpbmRvdyA9IG51bGw7XG4gIH1cblxuICAvKiB1cGRhdGUgc3RhdGUgYW5kIHJlc2V0IHRoZSByZXN0IG9mIGl0ICovXG4gIHN0YXRlLndyYXAgPSB3cmFwO1xuICBzdGF0ZS53Yml0cyA9IHdpbmRvd0JpdHM7XG4gIHJldHVybiBpbmZsYXRlUmVzZXQoc3RybSk7XG59XG5cbmZ1bmN0aW9uIGluZmxhdGVJbml0MihzdHJtLCB3aW5kb3dCaXRzKSB7XG4gIHZhciByZXQ7XG4gIHZhciBzdGF0ZTtcblxuICBpZiAoIXN0cm0pIHsgcmV0dXJuIFpfU1RSRUFNX0VSUk9SOyB9XG4gIC8vc3RybS5tc2cgPSBaX05VTEw7ICAgICAgICAgICAgICAgICAvKiBpbiBjYXNlIHdlIHJldHVybiBhbiBlcnJvciAqL1xuXG4gIHN0YXRlID0gbmV3IEluZmxhdGVTdGF0ZSgpO1xuXG4gIC8vaWYgKHN0YXRlID09PSBaX05VTEwpIHJldHVybiBaX01FTV9FUlJPUjtcbiAgLy9UcmFjZXYoKHN0ZGVyciwgXCJpbmZsYXRlOiBhbGxvY2F0ZWRcXG5cIikpO1xuICBzdHJtLnN0YXRlID0gc3RhdGU7XG4gIHN0YXRlLndpbmRvdyA9IG51bGwvKlpfTlVMTCovO1xuICByZXQgPSBpbmZsYXRlUmVzZXQyKHN0cm0sIHdpbmRvd0JpdHMpO1xuICBpZiAocmV0ICE9PSBaX09LKSB7XG4gICAgc3RybS5zdGF0ZSA9IG51bGwvKlpfTlVMTCovO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGluZmxhdGVJbml0KHN0cm0pIHtcbiAgcmV0dXJuIGluZmxhdGVJbml0MihzdHJtLCBERUZfV0JJVFMpO1xufVxuXG5cbi8qXG4gUmV0dXJuIHN0YXRlIHdpdGggbGVuZ3RoIGFuZCBkaXN0YW5jZSBkZWNvZGluZyB0YWJsZXMgYW5kIGluZGV4IHNpemVzIHNldCB0b1xuIGZpeGVkIGNvZGUgZGVjb2RpbmcuICBOb3JtYWxseSB0aGlzIHJldHVybnMgZml4ZWQgdGFibGVzIGZyb20gaW5mZml4ZWQuaC5cbiBJZiBCVUlMREZJWEVEIGlzIGRlZmluZWQsIHRoZW4gaW5zdGVhZCB0aGlzIHJvdXRpbmUgYnVpbGRzIHRoZSB0YWJsZXMgdGhlXG4gZmlyc3QgdGltZSBpdCdzIGNhbGxlZCwgYW5kIHJldHVybnMgdGhvc2UgdGFibGVzIHRoZSBmaXJzdCB0aW1lIGFuZFxuIHRoZXJlYWZ0ZXIuICBUaGlzIHJlZHVjZXMgdGhlIHNpemUgb2YgdGhlIGNvZGUgYnkgYWJvdXQgMksgYnl0ZXMsIGluXG4gZXhjaGFuZ2UgZm9yIGEgbGl0dGxlIGV4ZWN1dGlvbiB0aW1lLiAgSG93ZXZlciwgQlVJTERGSVhFRCBzaG91bGQgbm90IGJlXG4gdXNlZCBmb3IgdGhyZWFkZWQgYXBwbGljYXRpb25zLCBzaW5jZSB0aGUgcmV3cml0aW5nIG9mIHRoZSB0YWJsZXMgYW5kIHZpcmdpblxuIG1heSBub3QgYmUgdGhyZWFkLXNhZmUuXG4gKi9cbnZhciB2aXJnaW4gPSB0cnVlO1xuXG52YXIgbGVuZml4LCBkaXN0Zml4OyAvLyBXZSBoYXZlIG5vIHBvaW50ZXJzIGluIEpTLCBzbyBrZWVwIHRhYmxlcyBzZXBhcmF0ZVxuXG5mdW5jdGlvbiBmaXhlZHRhYmxlcyhzdGF0ZSkge1xuICAvKiBidWlsZCBmaXhlZCBodWZmbWFuIHRhYmxlcyBpZiBmaXJzdCBjYWxsIChtYXkgbm90IGJlIHRocmVhZCBzYWZlKSAqL1xuICBpZiAodmlyZ2luKSB7XG4gICAgdmFyIHN5bTtcblxuICAgIGxlbmZpeCA9IG5ldyB1dGlscy5CdWYzMig1MTIpO1xuICAgIGRpc3RmaXggPSBuZXcgdXRpbHMuQnVmMzIoMzIpO1xuXG4gICAgLyogbGl0ZXJhbC9sZW5ndGggdGFibGUgKi9cbiAgICBzeW0gPSAwO1xuICAgIHdoaWxlIChzeW0gPCAxNDQpIHsgc3RhdGUubGVuc1tzeW0rK10gPSA4OyB9XG4gICAgd2hpbGUgKHN5bSA8IDI1NikgeyBzdGF0ZS5sZW5zW3N5bSsrXSA9IDk7IH1cbiAgICB3aGlsZSAoc3ltIDwgMjgwKSB7IHN0YXRlLmxlbnNbc3ltKytdID0gNzsgfVxuICAgIHdoaWxlIChzeW0gPCAyODgpIHsgc3RhdGUubGVuc1tzeW0rK10gPSA4OyB9XG5cbiAgICBpbmZsYXRlX3RhYmxlKExFTlMsICBzdGF0ZS5sZW5zLCAwLCAyODgsIGxlbmZpeCwgICAwLCBzdGF0ZS53b3JrLCB7Yml0czogOX0pO1xuXG4gICAgLyogZGlzdGFuY2UgdGFibGUgKi9cbiAgICBzeW0gPSAwO1xuICAgIHdoaWxlIChzeW0gPCAzMikgeyBzdGF0ZS5sZW5zW3N5bSsrXSA9IDU7IH1cblxuICAgIGluZmxhdGVfdGFibGUoRElTVFMsIHN0YXRlLmxlbnMsIDAsIDMyLCAgIGRpc3RmaXgsIDAsIHN0YXRlLndvcmssIHtiaXRzOiA1fSk7XG5cbiAgICAvKiBkbyB0aGlzIGp1c3Qgb25jZSAqL1xuICAgIHZpcmdpbiA9IGZhbHNlO1xuICB9XG5cbiAgc3RhdGUubGVuY29kZSA9IGxlbmZpeDtcbiAgc3RhdGUubGVuYml0cyA9IDk7XG4gIHN0YXRlLmRpc3Rjb2RlID0gZGlzdGZpeDtcbiAgc3RhdGUuZGlzdGJpdHMgPSA1O1xufVxuXG5cbi8qXG4gVXBkYXRlIHRoZSB3aW5kb3cgd2l0aCB0aGUgbGFzdCB3c2l6ZSAobm9ybWFsbHkgMzJLKSBieXRlcyB3cml0dGVuIGJlZm9yZVxuIHJldHVybmluZy4gIElmIHdpbmRvdyBkb2VzIG5vdCBleGlzdCB5ZXQsIGNyZWF0ZSBpdC4gIFRoaXMgaXMgb25seSBjYWxsZWRcbiB3aGVuIGEgd2luZG93IGlzIGFscmVhZHkgaW4gdXNlLCBvciB3aGVuIG91dHB1dCBoYXMgYmVlbiB3cml0dGVuIGR1cmluZyB0aGlzXG4gaW5mbGF0ZSBjYWxsLCBidXQgdGhlIGVuZCBvZiB0aGUgZGVmbGF0ZSBzdHJlYW0gaGFzIG5vdCBiZWVuIHJlYWNoZWQgeWV0LlxuIEl0IGlzIGFsc28gY2FsbGVkIHRvIGNyZWF0ZSBhIHdpbmRvdyBmb3IgZGljdGlvbmFyeSBkYXRhIHdoZW4gYSBkaWN0aW9uYXJ5XG4gaXMgbG9hZGVkLlxuXG4gUHJvdmlkaW5nIG91dHB1dCBidWZmZXJzIGxhcmdlciB0aGFuIDMySyB0byBpbmZsYXRlKCkgc2hvdWxkIHByb3ZpZGUgYSBzcGVlZFxuIGFkdmFudGFnZSwgc2luY2Ugb25seSB0aGUgbGFzdCAzMksgb2Ygb3V0cHV0IGlzIGNvcGllZCB0byB0aGUgc2xpZGluZyB3aW5kb3dcbiB1cG9uIHJldHVybiBmcm9tIGluZmxhdGUoKSwgYW5kIHNpbmNlIGFsbCBkaXN0YW5jZXMgYWZ0ZXIgdGhlIGZpcnN0IDMySyBvZlxuIG91dHB1dCB3aWxsIGZhbGwgaW4gdGhlIG91dHB1dCBkYXRhLCBtYWtpbmcgbWF0Y2ggY29waWVzIHNpbXBsZXIgYW5kIGZhc3Rlci5cbiBUaGUgYWR2YW50YWdlIG1heSBiZSBkZXBlbmRlbnQgb24gdGhlIHNpemUgb2YgdGhlIHByb2Nlc3NvcidzIGRhdGEgY2FjaGVzLlxuICovXG5mdW5jdGlvbiB1cGRhdGV3aW5kb3coc3RybSwgc3JjLCBlbmQsIGNvcHkpIHtcbiAgdmFyIGRpc3Q7XG4gIHZhciBzdGF0ZSA9IHN0cm0uc3RhdGU7XG5cbiAgLyogaWYgaXQgaGFzbid0IGJlZW4gZG9uZSBhbHJlYWR5LCBhbGxvY2F0ZSBzcGFjZSBmb3IgdGhlIHdpbmRvdyAqL1xuICBpZiAoc3RhdGUud2luZG93ID09PSBudWxsKSB7XG4gICAgc3RhdGUud3NpemUgPSAxIDw8IHN0YXRlLndiaXRzO1xuICAgIHN0YXRlLnduZXh0ID0gMDtcbiAgICBzdGF0ZS53aGF2ZSA9IDA7XG5cbiAgICBzdGF0ZS53aW5kb3cgPSBuZXcgdXRpbHMuQnVmOChzdGF0ZS53c2l6ZSk7XG4gIH1cblxuICAvKiBjb3B5IHN0YXRlLT53c2l6ZSBvciBsZXNzIG91dHB1dCBieXRlcyBpbnRvIHRoZSBjaXJjdWxhciB3aW5kb3cgKi9cbiAgaWYgKGNvcHkgPj0gc3RhdGUud3NpemUpIHtcbiAgICB1dGlscy5hcnJheVNldChzdGF0ZS53aW5kb3csc3JjLCBlbmQgLSBzdGF0ZS53c2l6ZSwgc3RhdGUud3NpemUsIDApO1xuICAgIHN0YXRlLnduZXh0ID0gMDtcbiAgICBzdGF0ZS53aGF2ZSA9IHN0YXRlLndzaXplO1xuICB9XG4gIGVsc2Uge1xuICAgIGRpc3QgPSBzdGF0ZS53c2l6ZSAtIHN0YXRlLnduZXh0O1xuICAgIGlmIChkaXN0ID4gY29weSkge1xuICAgICAgZGlzdCA9IGNvcHk7XG4gICAgfVxuICAgIC8vem1lbWNweShzdGF0ZS0+d2luZG93ICsgc3RhdGUtPnduZXh0LCBlbmQgLSBjb3B5LCBkaXN0KTtcbiAgICB1dGlscy5hcnJheVNldChzdGF0ZS53aW5kb3csc3JjLCBlbmQgLSBjb3B5LCBkaXN0LCBzdGF0ZS53bmV4dCk7XG4gICAgY29weSAtPSBkaXN0O1xuICAgIGlmIChjb3B5KSB7XG4gICAgICAvL3ptZW1jcHkoc3RhdGUtPndpbmRvdywgZW5kIC0gY29weSwgY29weSk7XG4gICAgICB1dGlscy5hcnJheVNldChzdGF0ZS53aW5kb3csc3JjLCBlbmQgLSBjb3B5LCBjb3B5LCAwKTtcbiAgICAgIHN0YXRlLnduZXh0ID0gY29weTtcbiAgICAgIHN0YXRlLndoYXZlID0gc3RhdGUud3NpemU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc3RhdGUud25leHQgKz0gZGlzdDtcbiAgICAgIGlmIChzdGF0ZS53bmV4dCA9PT0gc3RhdGUud3NpemUpIHsgc3RhdGUud25leHQgPSAwOyB9XG4gICAgICBpZiAoc3RhdGUud2hhdmUgPCBzdGF0ZS53c2l6ZSkgeyBzdGF0ZS53aGF2ZSArPSBkaXN0OyB9XG4gICAgfVxuICB9XG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBpbmZsYXRlKHN0cm0sIGZsdXNoKSB7XG4gIHZhciBzdGF0ZTtcbiAgdmFyIGlucHV0LCBvdXRwdXQ7ICAgICAgICAgIC8vIGlucHV0L291dHB1dCBidWZmZXJzXG4gIHZhciBuZXh0OyAgICAgICAgICAgICAgICAgICAvKiBuZXh0IGlucHV0IElOREVYICovXG4gIHZhciBwdXQ7ICAgICAgICAgICAgICAgICAgICAvKiBuZXh0IG91dHB1dCBJTkRFWCAqL1xuICB2YXIgaGF2ZSwgbGVmdDsgICAgICAgICAgICAgLyogYXZhaWxhYmxlIGlucHV0IGFuZCBvdXRwdXQgKi9cbiAgdmFyIGhvbGQ7ICAgICAgICAgICAgICAgICAgIC8qIGJpdCBidWZmZXIgKi9cbiAgdmFyIGJpdHM7ICAgICAgICAgICAgICAgICAgIC8qIGJpdHMgaW4gYml0IGJ1ZmZlciAqL1xuICB2YXIgX2luLCBfb3V0OyAgICAgICAgICAgICAgLyogc2F2ZSBzdGFydGluZyBhdmFpbGFibGUgaW5wdXQgYW5kIG91dHB1dCAqL1xuICB2YXIgY29weTsgICAgICAgICAgICAgICAgICAgLyogbnVtYmVyIG9mIHN0b3JlZCBvciBtYXRjaCBieXRlcyB0byBjb3B5ICovXG4gIHZhciBmcm9tOyAgICAgICAgICAgICAgICAgICAvKiB3aGVyZSB0byBjb3B5IG1hdGNoIGJ5dGVzIGZyb20gKi9cbiAgdmFyIGZyb21fc291cmNlO1xuICB2YXIgaGVyZSA9IDA7ICAgICAgICAgICAgICAgLyogY3VycmVudCBkZWNvZGluZyB0YWJsZSBlbnRyeSAqL1xuICB2YXIgaGVyZV9iaXRzLCBoZXJlX29wLCBoZXJlX3ZhbDsgLy8gcGFrZWQgXCJoZXJlXCIgZGVub3JtYWxpemVkIChKUyBzcGVjaWZpYylcbiAgLy92YXIgbGFzdDsgICAgICAgICAgICAgICAgICAgLyogcGFyZW50IHRhYmxlIGVudHJ5ICovXG4gIHZhciBsYXN0X2JpdHMsIGxhc3Rfb3AsIGxhc3RfdmFsOyAvLyBwYWtlZCBcImxhc3RcIiBkZW5vcm1hbGl6ZWQgKEpTIHNwZWNpZmljKVxuICB2YXIgbGVuOyAgICAgICAgICAgICAgICAgICAgLyogbGVuZ3RoIHRvIGNvcHkgZm9yIHJlcGVhdHMsIGJpdHMgdG8gZHJvcCAqL1xuICB2YXIgcmV0OyAgICAgICAgICAgICAgICAgICAgLyogcmV0dXJuIGNvZGUgKi9cbiAgdmFyIGhidWYgPSBuZXcgdXRpbHMuQnVmOCg0KTsgICAgLyogYnVmZmVyIGZvciBnemlwIGhlYWRlciBjcmMgY2FsY3VsYXRpb24gKi9cbiAgdmFyIG9wdHM7XG5cbiAgdmFyIG47IC8vIHRlbXBvcmFyeSB2YXIgZm9yIE5FRURfQklUU1xuXG4gIHZhciBvcmRlciA9IC8qIHBlcm11dGF0aW9uIG9mIGNvZGUgbGVuZ3RocyAqL1xuICAgIFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XTtcblxuXG4gIGlmICghc3RybSB8fCAhc3RybS5zdGF0ZSB8fCAhc3RybS5vdXRwdXQgfHxcbiAgICAgICghc3RybS5pbnB1dCAmJiBzdHJtLmF2YWlsX2luICE9PSAwKSkge1xuICAgIHJldHVybiBaX1NUUkVBTV9FUlJPUjtcbiAgfVxuXG4gIHN0YXRlID0gc3RybS5zdGF0ZTtcbiAgaWYgKHN0YXRlLm1vZGUgPT09IFRZUEUpIHsgc3RhdGUubW9kZSA9IFRZUEVETzsgfSAgICAvKiBza2lwIGNoZWNrICovXG5cblxuICAvLy0tLSBMT0FEKCkgLS0tXG4gIHB1dCA9IHN0cm0ubmV4dF9vdXQ7XG4gIG91dHB1dCA9IHN0cm0ub3V0cHV0O1xuICBsZWZ0ID0gc3RybS5hdmFpbF9vdXQ7XG4gIG5leHQgPSBzdHJtLm5leHRfaW47XG4gIGlucHV0ID0gc3RybS5pbnB1dDtcbiAgaGF2ZSA9IHN0cm0uYXZhaWxfaW47XG4gIGhvbGQgPSBzdGF0ZS5ob2xkO1xuICBiaXRzID0gc3RhdGUuYml0cztcbiAgLy8tLS1cblxuICBfaW4gPSBoYXZlO1xuICBfb3V0ID0gbGVmdDtcbiAgcmV0ID0gWl9PSztcblxuICBpbmZfbGVhdmU6IC8vIGdvdG8gZW11bGF0aW9uXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKHN0YXRlLm1vZGUpIHtcbiAgICBjYXNlIEhFQUQ6XG4gICAgICBpZiAoc3RhdGUud3JhcCA9PT0gMCkge1xuICAgICAgICBzdGF0ZS5tb2RlID0gVFlQRURPO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8vPT09IE5FRURCSVRTKDE2KTtcbiAgICAgIHdoaWxlIChiaXRzIDwgMTYpIHtcbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgIH1cbiAgICAgIC8vPT09Ly9cbiAgICAgIGlmICgoc3RhdGUud3JhcCAmIDIpICYmIGhvbGQgPT09IDB4OGIxZikgeyAgLyogZ3ppcCBoZWFkZXIgKi9cbiAgICAgICAgc3RhdGUuY2hlY2sgPSAwLypjcmMzMigwTCwgWl9OVUxMLCAwKSovO1xuICAgICAgICAvLz09PSBDUkMyKHN0YXRlLmNoZWNrLCBob2xkKTtcbiAgICAgICAgaGJ1ZlswXSA9IGhvbGQgJiAweGZmO1xuICAgICAgICBoYnVmWzFdID0gKGhvbGQgPj4+IDgpICYgMHhmZjtcbiAgICAgICAgc3RhdGUuY2hlY2sgPSBjcmMzMihzdGF0ZS5jaGVjaywgaGJ1ZiwgMiwgMCk7XG4gICAgICAgIC8vPT09Ly9cblxuICAgICAgICAvLz09PSBJTklUQklUUygpO1xuICAgICAgICBob2xkID0gMDtcbiAgICAgICAgYml0cyA9IDA7XG4gICAgICAgIC8vPT09Ly9cbiAgICAgICAgc3RhdGUubW9kZSA9IEZMQUdTO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHN0YXRlLmZsYWdzID0gMDsgICAgICAgICAgIC8qIGV4cGVjdCB6bGliIGhlYWRlciAqL1xuICAgICAgaWYgKHN0YXRlLmhlYWQpIHtcbiAgICAgICAgc3RhdGUuaGVhZC5kb25lID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIShzdGF0ZS53cmFwICYgMSkgfHwgICAvKiBjaGVjayBpZiB6bGliIGhlYWRlciBhbGxvd2VkICovXG4gICAgICAgICgoKGhvbGQgJiAweGZmKS8qQklUUyg4KSovIDw8IDgpICsgKGhvbGQgPj4gOCkpICUgMzEpIHtcbiAgICAgICAgc3RybS5tc2cgPSAnaW5jb3JyZWN0IGhlYWRlciBjaGVjayc7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBCQUQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKChob2xkICYgMHgwZikvKkJJVFMoNCkqLyAhPT0gWl9ERUZMQVRFRCkge1xuICAgICAgICBzdHJtLm1zZyA9ICd1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZCc7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBCQUQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8tLS0gRFJPUEJJVFMoNCkgLS0tLy9cbiAgICAgIGhvbGQgPj4+PSA0O1xuICAgICAgYml0cyAtPSA0O1xuICAgICAgLy8tLS0vL1xuICAgICAgbGVuID0gKGhvbGQgJiAweDBmKS8qQklUUyg0KSovICsgODtcbiAgICAgIGlmIChzdGF0ZS53Yml0cyA9PT0gMCkge1xuICAgICAgICBzdGF0ZS53Yml0cyA9IGxlbjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGxlbiA+IHN0YXRlLndiaXRzKSB7XG4gICAgICAgIHN0cm0ubXNnID0gJ2ludmFsaWQgd2luZG93IHNpemUnO1xuICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHN0YXRlLmRtYXggPSAxIDw8IGxlbjtcbiAgICAgIC8vVHJhY2V2KChzdGRlcnIsIFwiaW5mbGF0ZTogICB6bGliIGhlYWRlciBva1xcblwiKSk7XG4gICAgICBzdHJtLmFkbGVyID0gc3RhdGUuY2hlY2sgPSAxLyphZGxlcjMyKDBMLCBaX05VTEwsIDApKi87XG4gICAgICBzdGF0ZS5tb2RlID0gaG9sZCAmIDB4MjAwID8gRElDVElEIDogVFlQRTtcbiAgICAgIC8vPT09IElOSVRCSVRTKCk7XG4gICAgICBob2xkID0gMDtcbiAgICAgIGJpdHMgPSAwO1xuICAgICAgLy89PT0vL1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBGTEFHUzpcbiAgICAgIC8vPT09IE5FRURCSVRTKDE2KTsgKi9cbiAgICAgIHdoaWxlIChiaXRzIDwgMTYpIHtcbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgIH1cbiAgICAgIC8vPT09Ly9cbiAgICAgIHN0YXRlLmZsYWdzID0gaG9sZDtcbiAgICAgIGlmICgoc3RhdGUuZmxhZ3MgJiAweGZmKSAhPT0gWl9ERUZMQVRFRCkge1xuICAgICAgICBzdHJtLm1zZyA9ICd1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZCc7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBCQUQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmZsYWdzICYgMHhlMDAwKSB7XG4gICAgICAgIHN0cm0ubXNnID0gJ3Vua25vd24gaGVhZGVyIGZsYWdzIHNldCc7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBCQUQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmhlYWQpIHtcbiAgICAgICAgc3RhdGUuaGVhZC50ZXh0ID0gKChob2xkID4+IDgpICYgMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUuZmxhZ3MgJiAweDAyMDApIHtcbiAgICAgICAgLy89PT0gQ1JDMihzdGF0ZS5jaGVjaywgaG9sZCk7XG4gICAgICAgIGhidWZbMF0gPSBob2xkICYgMHhmZjtcbiAgICAgICAgaGJ1ZlsxXSA9IChob2xkID4+PiA4KSAmIDB4ZmY7XG4gICAgICAgIHN0YXRlLmNoZWNrID0gY3JjMzIoc3RhdGUuY2hlY2ssIGhidWYsIDIsIDApO1xuICAgICAgICAvLz09PS8vXG4gICAgICB9XG4gICAgICAvLz09PSBJTklUQklUUygpO1xuICAgICAgaG9sZCA9IDA7XG4gICAgICBiaXRzID0gMDtcbiAgICAgIC8vPT09Ly9cbiAgICAgIHN0YXRlLm1vZGUgPSBUSU1FO1xuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgIGNhc2UgVElNRTpcbiAgICAgIC8vPT09IE5FRURCSVRTKDMyKTsgKi9cbiAgICAgIHdoaWxlIChiaXRzIDwgMzIpIHtcbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgIH1cbiAgICAgIC8vPT09Ly9cbiAgICAgIGlmIChzdGF0ZS5oZWFkKSB7XG4gICAgICAgIHN0YXRlLmhlYWQudGltZSA9IGhvbGQ7XG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUuZmxhZ3MgJiAweDAyMDApIHtcbiAgICAgICAgLy89PT0gQ1JDNChzdGF0ZS5jaGVjaywgaG9sZClcbiAgICAgICAgaGJ1ZlswXSA9IGhvbGQgJiAweGZmO1xuICAgICAgICBoYnVmWzFdID0gKGhvbGQgPj4+IDgpICYgMHhmZjtcbiAgICAgICAgaGJ1ZlsyXSA9IChob2xkID4+PiAxNikgJiAweGZmO1xuICAgICAgICBoYnVmWzNdID0gKGhvbGQgPj4+IDI0KSAmIDB4ZmY7XG4gICAgICAgIHN0YXRlLmNoZWNrID0gY3JjMzIoc3RhdGUuY2hlY2ssIGhidWYsIDQsIDApO1xuICAgICAgICAvLz09PVxuICAgICAgfVxuICAgICAgLy89PT0gSU5JVEJJVFMoKTtcbiAgICAgIGhvbGQgPSAwO1xuICAgICAgYml0cyA9IDA7XG4gICAgICAvLz09PS8vXG4gICAgICBzdGF0ZS5tb2RlID0gT1M7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBPUzpcbiAgICAgIC8vPT09IE5FRURCSVRTKDE2KTsgKi9cbiAgICAgIHdoaWxlIChiaXRzIDwgMTYpIHtcbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgIH1cbiAgICAgIC8vPT09Ly9cbiAgICAgIGlmIChzdGF0ZS5oZWFkKSB7XG4gICAgICAgIHN0YXRlLmhlYWQueGZsYWdzID0gKGhvbGQgJiAweGZmKTtcbiAgICAgICAgc3RhdGUuaGVhZC5vcyA9IChob2xkID4+IDgpO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmZsYWdzICYgMHgwMjAwKSB7XG4gICAgICAgIC8vPT09IENSQzIoc3RhdGUuY2hlY2ssIGhvbGQpO1xuICAgICAgICBoYnVmWzBdID0gaG9sZCAmIDB4ZmY7XG4gICAgICAgIGhidWZbMV0gPSAoaG9sZCA+Pj4gOCkgJiAweGZmO1xuICAgICAgICBzdGF0ZS5jaGVjayA9IGNyYzMyKHN0YXRlLmNoZWNrLCBoYnVmLCAyLCAwKTtcbiAgICAgICAgLy89PT0vL1xuICAgICAgfVxuICAgICAgLy89PT0gSU5JVEJJVFMoKTtcbiAgICAgIGhvbGQgPSAwO1xuICAgICAgYml0cyA9IDA7XG4gICAgICAvLz09PS8vXG4gICAgICBzdGF0ZS5tb2RlID0gRVhMRU47XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBFWExFTjpcbiAgICAgIGlmIChzdGF0ZS5mbGFncyAmIDB4MDQwMCkge1xuICAgICAgICAvLz09PSBORUVEQklUUygxNik7ICovXG4gICAgICAgIHdoaWxlIChiaXRzIDwgMTYpIHtcbiAgICAgICAgICBpZiAoaGF2ZSA9PT0gMCkgeyBicmVhayBpbmZfbGVhdmU7IH1cbiAgICAgICAgICBoYXZlLS07XG4gICAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgICAgYml0cyArPSA4O1xuICAgICAgICB9XG4gICAgICAgIC8vPT09Ly9cbiAgICAgICAgc3RhdGUubGVuZ3RoID0gaG9sZDtcbiAgICAgICAgaWYgKHN0YXRlLmhlYWQpIHtcbiAgICAgICAgICBzdGF0ZS5oZWFkLmV4dHJhX2xlbiA9IGhvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmZsYWdzICYgMHgwMjAwKSB7XG4gICAgICAgICAgLy89PT0gQ1JDMihzdGF0ZS5jaGVjaywgaG9sZCk7XG4gICAgICAgICAgaGJ1ZlswXSA9IGhvbGQgJiAweGZmO1xuICAgICAgICAgIGhidWZbMV0gPSAoaG9sZCA+Pj4gOCkgJiAweGZmO1xuICAgICAgICAgIHN0YXRlLmNoZWNrID0gY3JjMzIoc3RhdGUuY2hlY2ssIGhidWYsIDIsIDApO1xuICAgICAgICAgIC8vPT09Ly9cbiAgICAgICAgfVxuICAgICAgICAvLz09PSBJTklUQklUUygpO1xuICAgICAgICBob2xkID0gMDtcbiAgICAgICAgYml0cyA9IDA7XG4gICAgICAgIC8vPT09Ly9cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHN0YXRlLmhlYWQpIHtcbiAgICAgICAgc3RhdGUuaGVhZC5leHRyYSA9IG51bGwvKlpfTlVMTCovO1xuICAgICAgfVxuICAgICAgc3RhdGUubW9kZSA9IEVYVFJBO1xuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgIGNhc2UgRVhUUkE6XG4gICAgICBpZiAoc3RhdGUuZmxhZ3MgJiAweDA0MDApIHtcbiAgICAgICAgY29weSA9IHN0YXRlLmxlbmd0aDtcbiAgICAgICAgaWYgKGNvcHkgPiBoYXZlKSB7IGNvcHkgPSBoYXZlOyB9XG4gICAgICAgIGlmIChjb3B5KSB7XG4gICAgICAgICAgaWYgKHN0YXRlLmhlYWQpIHtcbiAgICAgICAgICAgIGxlbiA9IHN0YXRlLmhlYWQuZXh0cmFfbGVuIC0gc3RhdGUubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKCFzdGF0ZS5oZWFkLmV4dHJhKSB7XG4gICAgICAgICAgICAgIC8vIFVzZSB1bnR5cGVkIGFycmF5IGZvciBtb3JlIGNvbnZlbmllbmQgcHJvY2Vzc2luZyBsYXRlclxuICAgICAgICAgICAgICBzdGF0ZS5oZWFkLmV4dHJhID0gbmV3IEFycmF5KHN0YXRlLmhlYWQuZXh0cmFfbGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHV0aWxzLmFycmF5U2V0KFxuICAgICAgICAgICAgICBzdGF0ZS5oZWFkLmV4dHJhLFxuICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgbmV4dCxcbiAgICAgICAgICAgICAgLy8gZXh0cmEgZmllbGQgaXMgbGltaXRlZCB0byA2NTUzNiBieXRlc1xuICAgICAgICAgICAgICAvLyAtIG5vIG5lZWQgZm9yIGFkZGl0aW9uYWwgc2l6ZSBjaGVja1xuICAgICAgICAgICAgICBjb3B5LFxuICAgICAgICAgICAgICAvKmxlbiArIGNvcHkgPiBzdGF0ZS5oZWFkLmV4dHJhX21heCAtIGxlbiA/IHN0YXRlLmhlYWQuZXh0cmFfbWF4IDogY29weSwqL1xuICAgICAgICAgICAgICBsZW5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvL3ptZW1jcHkoc3RhdGUuaGVhZC5leHRyYSArIGxlbiwgbmV4dCxcbiAgICAgICAgICAgIC8vICAgICAgICBsZW4gKyBjb3B5ID4gc3RhdGUuaGVhZC5leHRyYV9tYXggP1xuICAgICAgICAgICAgLy8gICAgICAgIHN0YXRlLmhlYWQuZXh0cmFfbWF4IC0gbGVuIDogY29weSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGF0ZS5mbGFncyAmIDB4MDIwMCkge1xuICAgICAgICAgICAgc3RhdGUuY2hlY2sgPSBjcmMzMihzdGF0ZS5jaGVjaywgaW5wdXQsIGNvcHksIG5leHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoYXZlIC09IGNvcHk7XG4gICAgICAgICAgbmV4dCArPSBjb3B5O1xuICAgICAgICAgIHN0YXRlLmxlbmd0aCAtPSBjb3B5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0ZS5sZW5ndGgpIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICB9XG4gICAgICBzdGF0ZS5sZW5ndGggPSAwO1xuICAgICAgc3RhdGUubW9kZSA9IE5BTUU7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBOQU1FOlxuICAgICAgaWYgKHN0YXRlLmZsYWdzICYgMHgwODAwKSB7XG4gICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICBjb3B5ID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIC8vIFRPRE86IDIgb3IgMSBieXRlcz9cbiAgICAgICAgICBsZW4gPSBpbnB1dFtuZXh0ICsgY29weSsrXTtcbiAgICAgICAgICAvKiB1c2UgY29uc3RhbnQgbGltaXQgYmVjYXVzZSBpbiBqcyB3ZSBzaG91bGQgbm90IHByZWFsbG9jYXRlIG1lbW9yeSAqL1xuICAgICAgICAgIGlmIChzdGF0ZS5oZWFkICYmIGxlbiAmJlxuICAgICAgICAgICAgICAoc3RhdGUubGVuZ3RoIDwgNjU1MzYgLypzdGF0ZS5oZWFkLm5hbWVfbWF4Ki8pKSB7XG4gICAgICAgICAgICBzdGF0ZS5oZWFkLm5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShsZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAobGVuICYmIGNvcHkgPCBoYXZlKTtcblxuICAgICAgICBpZiAoc3RhdGUuZmxhZ3MgJiAweDAyMDApIHtcbiAgICAgICAgICBzdGF0ZS5jaGVjayA9IGNyYzMyKHN0YXRlLmNoZWNrLCBpbnB1dCwgY29weSwgbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaGF2ZSAtPSBjb3B5O1xuICAgICAgICBuZXh0ICs9IGNvcHk7XG4gICAgICAgIGlmIChsZW4pIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzdGF0ZS5oZWFkKSB7XG4gICAgICAgIHN0YXRlLmhlYWQubmFtZSA9IG51bGw7XG4gICAgICB9XG4gICAgICBzdGF0ZS5sZW5ndGggPSAwO1xuICAgICAgc3RhdGUubW9kZSA9IENPTU1FTlQ7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBDT01NRU5UOlxuICAgICAgaWYgKHN0YXRlLmZsYWdzICYgMHgxMDAwKSB7XG4gICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICBjb3B5ID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGxlbiA9IGlucHV0W25leHQgKyBjb3B5KytdO1xuICAgICAgICAgIC8qIHVzZSBjb25zdGFudCBsaW1pdCBiZWNhdXNlIGluIGpzIHdlIHNob3VsZCBub3QgcHJlYWxsb2NhdGUgbWVtb3J5ICovXG4gICAgICAgICAgaWYgKHN0YXRlLmhlYWQgJiYgbGVuICYmXG4gICAgICAgICAgICAgIChzdGF0ZS5sZW5ndGggPCA2NTUzNiAvKnN0YXRlLmhlYWQuY29tbV9tYXgqLykpIHtcbiAgICAgICAgICAgIHN0YXRlLmhlYWQuY29tbWVudCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGxlbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChsZW4gJiYgY29weSA8IGhhdmUpO1xuICAgICAgICBpZiAoc3RhdGUuZmxhZ3MgJiAweDAyMDApIHtcbiAgICAgICAgICBzdGF0ZS5jaGVjayA9IGNyYzMyKHN0YXRlLmNoZWNrLCBpbnB1dCwgY29weSwgbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaGF2ZSAtPSBjb3B5O1xuICAgICAgICBuZXh0ICs9IGNvcHk7XG4gICAgICAgIGlmIChsZW4pIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzdGF0ZS5oZWFkKSB7XG4gICAgICAgIHN0YXRlLmhlYWQuY29tbWVudCA9IG51bGw7XG4gICAgICB9XG4gICAgICBzdGF0ZS5tb2RlID0gSENSQztcbiAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICBjYXNlIEhDUkM6XG4gICAgICBpZiAoc3RhdGUuZmxhZ3MgJiAweDAyMDApIHtcbiAgICAgICAgLy89PT0gTkVFREJJVFMoMTYpOyAqL1xuICAgICAgICB3aGlsZSAoYml0cyA8IDE2KSB7XG4gICAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgICAgaGF2ZS0tO1xuICAgICAgICAgIGhvbGQgKz0gaW5wdXRbbmV4dCsrXSA8PCBiaXRzO1xuICAgICAgICAgIGJpdHMgKz0gODtcbiAgICAgICAgfVxuICAgICAgICAvLz09PS8vXG4gICAgICAgIGlmIChob2xkICE9PSAoc3RhdGUuY2hlY2sgJiAweGZmZmYpKSB7XG4gICAgICAgICAgc3RybS5tc2cgPSAnaGVhZGVyIGNyYyBtaXNtYXRjaCc7XG4gICAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLz09PSBJTklUQklUUygpO1xuICAgICAgICBob2xkID0gMDtcbiAgICAgICAgYml0cyA9IDA7XG4gICAgICAgIC8vPT09Ly9cbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5oZWFkKSB7XG4gICAgICAgIHN0YXRlLmhlYWQuaGNyYyA9ICgoc3RhdGUuZmxhZ3MgPj4gOSkgJiAxKTtcbiAgICAgICAgc3RhdGUuaGVhZC5kb25lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHN0cm0uYWRsZXIgPSBzdGF0ZS5jaGVjayA9IDAgLypjcmMzMigwTCwgWl9OVUxMLCAwKSovO1xuICAgICAgc3RhdGUubW9kZSA9IFRZUEU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERJQ1RJRDpcbiAgICAgIC8vPT09IE5FRURCSVRTKDMyKTsgKi9cbiAgICAgIHdoaWxlIChiaXRzIDwgMzIpIHtcbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgIH1cbiAgICAgIC8vPT09Ly9cbiAgICAgIHN0cm0uYWRsZXIgPSBzdGF0ZS5jaGVjayA9IFpTV0FQMzIoaG9sZCk7XG4gICAgICAvLz09PSBJTklUQklUUygpO1xuICAgICAgaG9sZCA9IDA7XG4gICAgICBiaXRzID0gMDtcbiAgICAgIC8vPT09Ly9cbiAgICAgIHN0YXRlLm1vZGUgPSBESUNUO1xuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgIGNhc2UgRElDVDpcbiAgICAgIGlmIChzdGF0ZS5oYXZlZGljdCA9PT0gMCkge1xuICAgICAgICAvLy0tLSBSRVNUT1JFKCkgLS0tXG4gICAgICAgIHN0cm0ubmV4dF9vdXQgPSBwdXQ7XG4gICAgICAgIHN0cm0uYXZhaWxfb3V0ID0gbGVmdDtcbiAgICAgICAgc3RybS5uZXh0X2luID0gbmV4dDtcbiAgICAgICAgc3RybS5hdmFpbF9pbiA9IGhhdmU7XG4gICAgICAgIHN0YXRlLmhvbGQgPSBob2xkO1xuICAgICAgICBzdGF0ZS5iaXRzID0gYml0cztcbiAgICAgICAgLy8tLS1cbiAgICAgICAgcmV0dXJuIFpfTkVFRF9ESUNUO1xuICAgICAgfVxuICAgICAgc3RybS5hZGxlciA9IHN0YXRlLmNoZWNrID0gMS8qYWRsZXIzMigwTCwgWl9OVUxMLCAwKSovO1xuICAgICAgc3RhdGUubW9kZSA9IFRZUEU7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBUWVBFOlxuICAgICAgaWYgKGZsdXNoID09PSBaX0JMT0NLIHx8IGZsdXNoID09PSBaX1RSRUVTKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgIGNhc2UgVFlQRURPOlxuICAgICAgaWYgKHN0YXRlLmxhc3QpIHtcbiAgICAgICAgLy8tLS0gQllURUJJVFMoKSAtLS0vL1xuICAgICAgICBob2xkID4+Pj0gYml0cyAmIDc7XG4gICAgICAgIGJpdHMgLT0gYml0cyAmIDc7XG4gICAgICAgIC8vLS0tLy9cbiAgICAgICAgc3RhdGUubW9kZSA9IENIRUNLO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8vPT09IE5FRURCSVRTKDMpOyAqL1xuICAgICAgd2hpbGUgKGJpdHMgPCAzKSB7XG4gICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICBoYXZlLS07XG4gICAgICAgIGhvbGQgKz0gaW5wdXRbbmV4dCsrXSA8PCBiaXRzO1xuICAgICAgICBiaXRzICs9IDg7XG4gICAgICB9XG4gICAgICAvLz09PS8vXG4gICAgICBzdGF0ZS5sYXN0ID0gKGhvbGQgJiAweDAxKS8qQklUUygxKSovO1xuICAgICAgLy8tLS0gRFJPUEJJVFMoMSkgLS0tLy9cbiAgICAgIGhvbGQgPj4+PSAxO1xuICAgICAgYml0cyAtPSAxO1xuICAgICAgLy8tLS0vL1xuXG4gICAgICBzd2l0Y2ggKChob2xkICYgMHgwMykvKkJJVFMoMikqLykge1xuICAgICAgY2FzZSAwOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogc3RvcmVkIGJsb2NrICovXG4gICAgICAgIC8vVHJhY2V2KChzdGRlcnIsIFwiaW5mbGF0ZTogICAgIHN0b3JlZCBibG9jayVzXFxuXCIsXG4gICAgICAgIC8vICAgICAgICBzdGF0ZS5sYXN0ID8gXCIgKGxhc3QpXCIgOiBcIlwiKSk7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBTVE9SRUQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogZml4ZWQgYmxvY2sgKi9cbiAgICAgICAgZml4ZWR0YWJsZXMoc3RhdGUpO1xuICAgICAgICAvL1RyYWNldigoc3RkZXJyLCBcImluZmxhdGU6ICAgICBmaXhlZCBjb2RlcyBibG9jayVzXFxuXCIsXG4gICAgICAgIC8vICAgICAgICBzdGF0ZS5sYXN0ID8gXCIgKGxhc3QpXCIgOiBcIlwiKSk7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBMRU5fOyAgICAgICAgICAgICAvKiBkZWNvZGUgY29kZXMgKi9cbiAgICAgICAgaWYgKGZsdXNoID09PSBaX1RSRUVTKSB7XG4gICAgICAgICAgLy8tLS0gRFJPUEJJVFMoMikgLS0tLy9cbiAgICAgICAgICBob2xkID4+Pj0gMjtcbiAgICAgICAgICBiaXRzIC09IDI7XG4gICAgICAgICAgLy8tLS0vL1xuICAgICAgICAgIGJyZWFrIGluZl9sZWF2ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGR5bmFtaWMgYmxvY2sgKi9cbiAgICAgICAgLy9UcmFjZXYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgICAgZHluYW1pYyBjb2RlcyBibG9jayVzXFxuXCIsXG4gICAgICAgIC8vICAgICAgICBzdGF0ZS5sYXN0ID8gXCIgKGxhc3QpXCIgOiBcIlwiKSk7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBUQUJMRTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHN0cm0ubXNnID0gJ2ludmFsaWQgYmxvY2sgdHlwZSc7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBCQUQ7XG4gICAgICB9XG4gICAgICAvLy0tLSBEUk9QQklUUygyKSAtLS0vL1xuICAgICAgaG9sZCA+Pj49IDI7XG4gICAgICBiaXRzIC09IDI7XG4gICAgICAvLy0tLS8vXG4gICAgICBicmVhaztcbiAgICBjYXNlIFNUT1JFRDpcbiAgICAgIC8vLS0tIEJZVEVCSVRTKCkgLS0tLy8gLyogZ28gdG8gYnl0ZSBib3VuZGFyeSAqL1xuICAgICAgaG9sZCA+Pj49IGJpdHMgJiA3O1xuICAgICAgYml0cyAtPSBiaXRzICYgNztcbiAgICAgIC8vLS0tLy9cbiAgICAgIC8vPT09IE5FRURCSVRTKDMyKTsgKi9cbiAgICAgIHdoaWxlIChiaXRzIDwgMzIpIHtcbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgIH1cbiAgICAgIC8vPT09Ly9cbiAgICAgIGlmICgoaG9sZCAmIDB4ZmZmZikgIT09ICgoaG9sZCA+Pj4gMTYpIF4gMHhmZmZmKSkge1xuICAgICAgICBzdHJtLm1zZyA9ICdpbnZhbGlkIHN0b3JlZCBibG9jayBsZW5ndGhzJztcbiAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBzdGF0ZS5sZW5ndGggPSBob2xkICYgMHhmZmZmO1xuICAgICAgLy9UcmFjZXYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgICAgICBzdG9yZWQgbGVuZ3RoICV1XFxuXCIsXG4gICAgICAvLyAgICAgICAgc3RhdGUubGVuZ3RoKSk7XG4gICAgICAvLz09PSBJTklUQklUUygpO1xuICAgICAgaG9sZCA9IDA7XG4gICAgICBiaXRzID0gMDtcbiAgICAgIC8vPT09Ly9cbiAgICAgIHN0YXRlLm1vZGUgPSBDT1BZXztcbiAgICAgIGlmIChmbHVzaCA9PT0gWl9UUkVFUykgeyBicmVhayBpbmZfbGVhdmU7IH1cbiAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICBjYXNlIENPUFlfOlxuICAgICAgc3RhdGUubW9kZSA9IENPUFk7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBDT1BZOlxuICAgICAgY29weSA9IHN0YXRlLmxlbmd0aDtcbiAgICAgIGlmIChjb3B5KSB7XG4gICAgICAgIGlmIChjb3B5ID4gaGF2ZSkgeyBjb3B5ID0gaGF2ZTsgfVxuICAgICAgICBpZiAoY29weSA+IGxlZnQpIHsgY29weSA9IGxlZnQ7IH1cbiAgICAgICAgaWYgKGNvcHkgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIC8vLS0tIHptZW1jcHkocHV0LCBuZXh0LCBjb3B5KTsgLS0tXG4gICAgICAgIHV0aWxzLmFycmF5U2V0KG91dHB1dCwgaW5wdXQsIG5leHQsIGNvcHksIHB1dCk7XG4gICAgICAgIC8vLS0tLy9cbiAgICAgICAgaGF2ZSAtPSBjb3B5O1xuICAgICAgICBuZXh0ICs9IGNvcHk7XG4gICAgICAgIGxlZnQgLT0gY29weTtcbiAgICAgICAgcHV0ICs9IGNvcHk7XG4gICAgICAgIHN0YXRlLmxlbmd0aCAtPSBjb3B5O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8vVHJhY2V2KChzdGRlcnIsIFwiaW5mbGF0ZTogICAgICAgc3RvcmVkIGVuZFxcblwiKSk7XG4gICAgICBzdGF0ZS5tb2RlID0gVFlQRTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVEFCTEU6XG4gICAgICAvLz09PSBORUVEQklUUygxNCk7ICovXG4gICAgICB3aGlsZSAoYml0cyA8IDE0KSB7XG4gICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICBoYXZlLS07XG4gICAgICAgIGhvbGQgKz0gaW5wdXRbbmV4dCsrXSA8PCBiaXRzO1xuICAgICAgICBiaXRzICs9IDg7XG4gICAgICB9XG4gICAgICAvLz09PS8vXG4gICAgICBzdGF0ZS5ubGVuID0gKGhvbGQgJiAweDFmKS8qQklUUyg1KSovICsgMjU3O1xuICAgICAgLy8tLS0gRFJPUEJJVFMoNSkgLS0tLy9cbiAgICAgIGhvbGQgPj4+PSA1O1xuICAgICAgYml0cyAtPSA1O1xuICAgICAgLy8tLS0vL1xuICAgICAgc3RhdGUubmRpc3QgPSAoaG9sZCAmIDB4MWYpLypCSVRTKDUpKi8gKyAxO1xuICAgICAgLy8tLS0gRFJPUEJJVFMoNSkgLS0tLy9cbiAgICAgIGhvbGQgPj4+PSA1O1xuICAgICAgYml0cyAtPSA1O1xuICAgICAgLy8tLS0vL1xuICAgICAgc3RhdGUubmNvZGUgPSAoaG9sZCAmIDB4MGYpLypCSVRTKDQpKi8gKyA0O1xuICAgICAgLy8tLS0gRFJPUEJJVFMoNCkgLS0tLy9cbiAgICAgIGhvbGQgPj4+PSA0O1xuICAgICAgYml0cyAtPSA0O1xuICAgICAgLy8tLS0vL1xuLy8jaWZuZGVmIFBLWklQX0JVR19XT1JLQVJPVU5EXG4gICAgICBpZiAoc3RhdGUubmxlbiA+IDI4NiB8fCBzdGF0ZS5uZGlzdCA+IDMwKSB7XG4gICAgICAgIHN0cm0ubXNnID0gJ3RvbyBtYW55IGxlbmd0aCBvciBkaXN0YW5jZSBzeW1ib2xzJztcbiAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4vLyNlbmRpZlxuICAgICAgLy9UcmFjZXYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgICAgICB0YWJsZSBzaXplcyBva1xcblwiKSk7XG4gICAgICBzdGF0ZS5oYXZlID0gMDtcbiAgICAgIHN0YXRlLm1vZGUgPSBMRU5MRU5TO1xuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgIGNhc2UgTEVOTEVOUzpcbiAgICAgIHdoaWxlIChzdGF0ZS5oYXZlIDwgc3RhdGUubmNvZGUpIHtcbiAgICAgICAgLy89PT0gTkVFREJJVFMoMyk7XG4gICAgICAgIHdoaWxlIChiaXRzIDwgMykge1xuICAgICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICAgIGhhdmUtLTtcbiAgICAgICAgICBob2xkICs9IGlucHV0W25leHQrK10gPDwgYml0cztcbiAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgIH1cbiAgICAgICAgLy89PT0vL1xuICAgICAgICBzdGF0ZS5sZW5zW29yZGVyW3N0YXRlLmhhdmUrK11dID0gKGhvbGQgJiAweDA3KTsvL0JJVFMoMyk7XG4gICAgICAgIC8vLS0tIERST1BCSVRTKDMpIC0tLS8vXG4gICAgICAgIGhvbGQgPj4+PSAzO1xuICAgICAgICBiaXRzIC09IDM7XG4gICAgICAgIC8vLS0tLy9cbiAgICAgIH1cbiAgICAgIHdoaWxlIChzdGF0ZS5oYXZlIDwgMTkpIHtcbiAgICAgICAgc3RhdGUubGVuc1tvcmRlcltzdGF0ZS5oYXZlKytdXSA9IDA7XG4gICAgICB9XG4gICAgICAvLyBXZSBoYXZlIHNlcGFyYXRlIHRhYmxlcyAmIG5vIHBvaW50ZXJzLiAyIGNvbW1lbnRlZCBsaW5lcyBiZWxvdyBub3QgbmVlZGVkLlxuICAgICAgLy9zdGF0ZS5uZXh0ID0gc3RhdGUuY29kZXM7XG4gICAgICAvL3N0YXRlLmxlbmNvZGUgPSBzdGF0ZS5uZXh0O1xuICAgICAgLy8gU3dpdGNoIHRvIHVzZSBkeW5hbWljIHRhYmxlXG4gICAgICBzdGF0ZS5sZW5jb2RlID0gc3RhdGUubGVuZHluO1xuICAgICAgc3RhdGUubGVuYml0cyA9IDc7XG5cbiAgICAgIG9wdHMgPSB7Yml0czogc3RhdGUubGVuYml0c307XG4gICAgICByZXQgPSBpbmZsYXRlX3RhYmxlKENPREVTLCBzdGF0ZS5sZW5zLCAwLCAxOSwgc3RhdGUubGVuY29kZSwgMCwgc3RhdGUud29yaywgb3B0cyk7XG4gICAgICBzdGF0ZS5sZW5iaXRzID0gb3B0cy5iaXRzO1xuXG4gICAgICBpZiAocmV0KSB7XG4gICAgICAgIHN0cm0ubXNnID0gJ2ludmFsaWQgY29kZSBsZW5ndGhzIHNldCc7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBCQUQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy9UcmFjZXYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgICAgICBjb2RlIGxlbmd0aHMgb2tcXG5cIikpO1xuICAgICAgc3RhdGUuaGF2ZSA9IDA7XG4gICAgICBzdGF0ZS5tb2RlID0gQ09ERUxFTlM7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBDT0RFTEVOUzpcbiAgICAgIHdoaWxlIChzdGF0ZS5oYXZlIDwgc3RhdGUubmxlbiArIHN0YXRlLm5kaXN0KSB7XG4gICAgICAgIGZvciAoOzspIHtcbiAgICAgICAgICBoZXJlID0gc3RhdGUubGVuY29kZVtob2xkICYgKCgxIDw8IHN0YXRlLmxlbmJpdHMpIC0gMSldOy8qQklUUyhzdGF0ZS5sZW5iaXRzKSovXG4gICAgICAgICAgaGVyZV9iaXRzID0gaGVyZSA+Pj4gMjQ7XG4gICAgICAgICAgaGVyZV9vcCA9IChoZXJlID4+PiAxNikgJiAweGZmO1xuICAgICAgICAgIGhlcmVfdmFsID0gaGVyZSAmIDB4ZmZmZjtcblxuICAgICAgICAgIGlmICgoaGVyZV9iaXRzKSA8PSBiaXRzKSB7IGJyZWFrOyB9XG4gICAgICAgICAgLy8tLS0gUFVMTEJZVEUoKSAtLS0vL1xuICAgICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICAgIGhhdmUtLTtcbiAgICAgICAgICBob2xkICs9IGlucHV0W25leHQrK10gPDwgYml0cztcbiAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgICAgLy8tLS0vL1xuICAgICAgICB9XG4gICAgICAgIGlmIChoZXJlX3ZhbCA8IDE2KSB7XG4gICAgICAgICAgLy8tLS0gRFJPUEJJVFMoaGVyZS5iaXRzKSAtLS0vL1xuICAgICAgICAgIGhvbGQgPj4+PSBoZXJlX2JpdHM7XG4gICAgICAgICAgYml0cyAtPSBoZXJlX2JpdHM7XG4gICAgICAgICAgLy8tLS0vL1xuICAgICAgICAgIHN0YXRlLmxlbnNbc3RhdGUuaGF2ZSsrXSA9IGhlcmVfdmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChoZXJlX3ZhbCA9PT0gMTYpIHtcbiAgICAgICAgICAgIC8vPT09IE5FRURCSVRTKGhlcmUuYml0cyArIDIpO1xuICAgICAgICAgICAgbiA9IGhlcmVfYml0cyArIDI7XG4gICAgICAgICAgICB3aGlsZSAoYml0cyA8IG4pIHtcbiAgICAgICAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgICAgICAgIGhhdmUtLTtcbiAgICAgICAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgICAgICAgIGJpdHMgKz0gODtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vPT09Ly9cbiAgICAgICAgICAgIC8vLS0tIERST1BCSVRTKGhlcmUuYml0cykgLS0tLy9cbiAgICAgICAgICAgIGhvbGQgPj4+PSBoZXJlX2JpdHM7XG4gICAgICAgICAgICBiaXRzIC09IGhlcmVfYml0cztcbiAgICAgICAgICAgIC8vLS0tLy9cbiAgICAgICAgICAgIGlmIChzdGF0ZS5oYXZlID09PSAwKSB7XG4gICAgICAgICAgICAgIHN0cm0ubXNnID0gJ2ludmFsaWQgYml0IGxlbmd0aCByZXBlYXQnO1xuICAgICAgICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxlbiA9IHN0YXRlLmxlbnNbc3RhdGUuaGF2ZSAtIDFdO1xuICAgICAgICAgICAgY29weSA9IDMgKyAoaG9sZCAmIDB4MDMpOy8vQklUUygyKTtcbiAgICAgICAgICAgIC8vLS0tIERST1BCSVRTKDIpIC0tLS8vXG4gICAgICAgICAgICBob2xkID4+Pj0gMjtcbiAgICAgICAgICAgIGJpdHMgLT0gMjtcbiAgICAgICAgICAgIC8vLS0tLy9cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoaGVyZV92YWwgPT09IDE3KSB7XG4gICAgICAgICAgICAvLz09PSBORUVEQklUUyhoZXJlLmJpdHMgKyAzKTtcbiAgICAgICAgICAgIG4gPSBoZXJlX2JpdHMgKyAzO1xuICAgICAgICAgICAgd2hpbGUgKGJpdHMgPCBuKSB7XG4gICAgICAgICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICAgICAgICBoYXZlLS07XG4gICAgICAgICAgICAgIGhvbGQgKz0gaW5wdXRbbmV4dCsrXSA8PCBiaXRzO1xuICAgICAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLz09PS8vXG4gICAgICAgICAgICAvLy0tLSBEUk9QQklUUyhoZXJlLmJpdHMpIC0tLS8vXG4gICAgICAgICAgICBob2xkID4+Pj0gaGVyZV9iaXRzO1xuICAgICAgICAgICAgYml0cyAtPSBoZXJlX2JpdHM7XG4gICAgICAgICAgICAvLy0tLS8vXG4gICAgICAgICAgICBsZW4gPSAwO1xuICAgICAgICAgICAgY29weSA9IDMgKyAoaG9sZCAmIDB4MDcpOy8vQklUUygzKTtcbiAgICAgICAgICAgIC8vLS0tIERST1BCSVRTKDMpIC0tLS8vXG4gICAgICAgICAgICBob2xkID4+Pj0gMztcbiAgICAgICAgICAgIGJpdHMgLT0gMztcbiAgICAgICAgICAgIC8vLS0tLy9cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLz09PSBORUVEQklUUyhoZXJlLmJpdHMgKyA3KTtcbiAgICAgICAgICAgIG4gPSBoZXJlX2JpdHMgKyA3O1xuICAgICAgICAgICAgd2hpbGUgKGJpdHMgPCBuKSB7XG4gICAgICAgICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICAgICAgICBoYXZlLS07XG4gICAgICAgICAgICAgIGhvbGQgKz0gaW5wdXRbbmV4dCsrXSA8PCBiaXRzO1xuICAgICAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLz09PS8vXG4gICAgICAgICAgICAvLy0tLSBEUk9QQklUUyhoZXJlLmJpdHMpIC0tLS8vXG4gICAgICAgICAgICBob2xkID4+Pj0gaGVyZV9iaXRzO1xuICAgICAgICAgICAgYml0cyAtPSBoZXJlX2JpdHM7XG4gICAgICAgICAgICAvLy0tLS8vXG4gICAgICAgICAgICBsZW4gPSAwO1xuICAgICAgICAgICAgY29weSA9IDExICsgKGhvbGQgJiAweDdmKTsvL0JJVFMoNyk7XG4gICAgICAgICAgICAvLy0tLSBEUk9QQklUUyg3KSAtLS0vL1xuICAgICAgICAgICAgaG9sZCA+Pj49IDc7XG4gICAgICAgICAgICBiaXRzIC09IDc7XG4gICAgICAgICAgICAvLy0tLS8vXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGF0ZS5oYXZlICsgY29weSA+IHN0YXRlLm5sZW4gKyBzdGF0ZS5uZGlzdCkge1xuICAgICAgICAgICAgc3RybS5tc2cgPSAnaW52YWxpZCBiaXQgbGVuZ3RoIHJlcGVhdCc7XG4gICAgICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHdoaWxlIChjb3B5LS0pIHtcbiAgICAgICAgICAgIHN0YXRlLmxlbnNbc3RhdGUuaGF2ZSsrXSA9IGxlbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogaGFuZGxlIGVycm9yIGJyZWFrcyBpbiB3aGlsZSAqL1xuICAgICAgaWYgKHN0YXRlLm1vZGUgPT09IEJBRCkgeyBicmVhazsgfVxuXG4gICAgICAvKiBjaGVjayBmb3IgZW5kLW9mLWJsb2NrIGNvZGUgKGJldHRlciBoYXZlIG9uZSkgKi9cbiAgICAgIGlmIChzdGF0ZS5sZW5zWzI1Nl0gPT09IDApIHtcbiAgICAgICAgc3RybS5tc2cgPSAnaW52YWxpZCBjb2RlIC0tIG1pc3NpbmcgZW5kLW9mLWJsb2NrJztcbiAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8qIGJ1aWxkIGNvZGUgdGFibGVzIC0tIG5vdGU6IGRvIG5vdCBjaGFuZ2UgdGhlIGxlbmJpdHMgb3IgZGlzdGJpdHNcbiAgICAgICAgIHZhbHVlcyBoZXJlICg5IGFuZCA2KSB3aXRob3V0IHJlYWRpbmcgdGhlIGNvbW1lbnRzIGluIGluZnRyZWVzLmhcbiAgICAgICAgIGNvbmNlcm5pbmcgdGhlIEVOT1VHSCBjb25zdGFudHMsIHdoaWNoIGRlcGVuZCBvbiB0aG9zZSB2YWx1ZXMgKi9cbiAgICAgIHN0YXRlLmxlbmJpdHMgPSA5O1xuXG4gICAgICBvcHRzID0ge2JpdHM6IHN0YXRlLmxlbmJpdHN9O1xuICAgICAgcmV0ID0gaW5mbGF0ZV90YWJsZShMRU5TLCBzdGF0ZS5sZW5zLCAwLCBzdGF0ZS5ubGVuLCBzdGF0ZS5sZW5jb2RlLCAwLCBzdGF0ZS53b3JrLCBvcHRzKTtcbiAgICAgIC8vIFdlIGhhdmUgc2VwYXJhdGUgdGFibGVzICYgbm8gcG9pbnRlcnMuIDIgY29tbWVudGVkIGxpbmVzIGJlbG93IG5vdCBuZWVkZWQuXG4gICAgICAvLyBzdGF0ZS5uZXh0X2luZGV4ID0gb3B0cy50YWJsZV9pbmRleDtcbiAgICAgIHN0YXRlLmxlbmJpdHMgPSBvcHRzLmJpdHM7XG4gICAgICAvLyBzdGF0ZS5sZW5jb2RlID0gc3RhdGUubmV4dDtcblxuICAgICAgaWYgKHJldCkge1xuICAgICAgICBzdHJtLm1zZyA9ICdpbnZhbGlkIGxpdGVyYWwvbGVuZ3RocyBzZXQnO1xuICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgc3RhdGUuZGlzdGJpdHMgPSA2O1xuICAgICAgLy9zdGF0ZS5kaXN0Y29kZS5jb3B5KHN0YXRlLmNvZGVzKTtcbiAgICAgIC8vIFN3aXRjaCB0byB1c2UgZHluYW1pYyB0YWJsZVxuICAgICAgc3RhdGUuZGlzdGNvZGUgPSBzdGF0ZS5kaXN0ZHluO1xuICAgICAgb3B0cyA9IHtiaXRzOiBzdGF0ZS5kaXN0Yml0c307XG4gICAgICByZXQgPSBpbmZsYXRlX3RhYmxlKERJU1RTLCBzdGF0ZS5sZW5zLCBzdGF0ZS5ubGVuLCBzdGF0ZS5uZGlzdCwgc3RhdGUuZGlzdGNvZGUsIDAsIHN0YXRlLndvcmssIG9wdHMpO1xuICAgICAgLy8gV2UgaGF2ZSBzZXBhcmF0ZSB0YWJsZXMgJiBubyBwb2ludGVycy4gMiBjb21tZW50ZWQgbGluZXMgYmVsb3cgbm90IG5lZWRlZC5cbiAgICAgIC8vIHN0YXRlLm5leHRfaW5kZXggPSBvcHRzLnRhYmxlX2luZGV4O1xuICAgICAgc3RhdGUuZGlzdGJpdHMgPSBvcHRzLmJpdHM7XG4gICAgICAvLyBzdGF0ZS5kaXN0Y29kZSA9IHN0YXRlLm5leHQ7XG5cbiAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgc3RybS5tc2cgPSAnaW52YWxpZCBkaXN0YW5jZXMgc2V0JztcbiAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvL1RyYWNldigoc3RkZXJyLCAnaW5mbGF0ZTogICAgICAgY29kZXMgb2tcXG4nKSk7XG4gICAgICBzdGF0ZS5tb2RlID0gTEVOXztcbiAgICAgIGlmIChmbHVzaCA9PT0gWl9UUkVFUykgeyBicmVhayBpbmZfbGVhdmU7IH1cbiAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICBjYXNlIExFTl86XG4gICAgICBzdGF0ZS5tb2RlID0gTEVOO1xuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgIGNhc2UgTEVOOlxuICAgICAgaWYgKGhhdmUgPj0gNiAmJiBsZWZ0ID49IDI1OCkge1xuICAgICAgICAvLy0tLSBSRVNUT1JFKCkgLS0tXG4gICAgICAgIHN0cm0ubmV4dF9vdXQgPSBwdXQ7XG4gICAgICAgIHN0cm0uYXZhaWxfb3V0ID0gbGVmdDtcbiAgICAgICAgc3RybS5uZXh0X2luID0gbmV4dDtcbiAgICAgICAgc3RybS5hdmFpbF9pbiA9IGhhdmU7XG4gICAgICAgIHN0YXRlLmhvbGQgPSBob2xkO1xuICAgICAgICBzdGF0ZS5iaXRzID0gYml0cztcbiAgICAgICAgLy8tLS1cbiAgICAgICAgaW5mbGF0ZV9mYXN0KHN0cm0sIF9vdXQpO1xuICAgICAgICAvLy0tLSBMT0FEKCkgLS0tXG4gICAgICAgIHB1dCA9IHN0cm0ubmV4dF9vdXQ7XG4gICAgICAgIG91dHB1dCA9IHN0cm0ub3V0cHV0O1xuICAgICAgICBsZWZ0ID0gc3RybS5hdmFpbF9vdXQ7XG4gICAgICAgIG5leHQgPSBzdHJtLm5leHRfaW47XG4gICAgICAgIGlucHV0ID0gc3RybS5pbnB1dDtcbiAgICAgICAgaGF2ZSA9IHN0cm0uYXZhaWxfaW47XG4gICAgICAgIGhvbGQgPSBzdGF0ZS5ob2xkO1xuICAgICAgICBiaXRzID0gc3RhdGUuYml0cztcbiAgICAgICAgLy8tLS1cblxuICAgICAgICBpZiAoc3RhdGUubW9kZSA9PT0gVFlQRSkge1xuICAgICAgICAgIHN0YXRlLmJhY2sgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHN0YXRlLmJhY2sgPSAwO1xuICAgICAgZm9yICg7Oykge1xuICAgICAgICBoZXJlID0gc3RhdGUubGVuY29kZVtob2xkICYgKCgxIDw8IHN0YXRlLmxlbmJpdHMpIC0xKV07ICAvKkJJVFMoc3RhdGUubGVuYml0cykqL1xuICAgICAgICBoZXJlX2JpdHMgPSBoZXJlID4+PiAyNDtcbiAgICAgICAgaGVyZV9vcCA9IChoZXJlID4+PiAxNikgJiAweGZmO1xuICAgICAgICBoZXJlX3ZhbCA9IGhlcmUgJiAweGZmZmY7XG5cbiAgICAgICAgaWYgKGhlcmVfYml0cyA8PSBiaXRzKSB7IGJyZWFrOyB9XG4gICAgICAgIC8vLS0tIFBVTExCWVRFKCkgLS0tLy9cbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgICAgLy8tLS0vL1xuICAgICAgfVxuICAgICAgaWYgKGhlcmVfb3AgJiYgKGhlcmVfb3AgJiAweGYwKSA9PT0gMCkge1xuICAgICAgICBsYXN0X2JpdHMgPSBoZXJlX2JpdHM7XG4gICAgICAgIGxhc3Rfb3AgPSBoZXJlX29wO1xuICAgICAgICBsYXN0X3ZhbCA9IGhlcmVfdmFsO1xuICAgICAgICBmb3IgKDs7KSB7XG4gICAgICAgICAgaGVyZSA9IHN0YXRlLmxlbmNvZGVbbGFzdF92YWwgK1xuICAgICAgICAgICAgICAgICAgKChob2xkICYgKCgxIDw8IChsYXN0X2JpdHMgKyBsYXN0X29wKSkgLTEpKS8qQklUUyhsYXN0LmJpdHMgKyBsYXN0Lm9wKSovID4+IGxhc3RfYml0cyldO1xuICAgICAgICAgIGhlcmVfYml0cyA9IGhlcmUgPj4+IDI0O1xuICAgICAgICAgIGhlcmVfb3AgPSAoaGVyZSA+Pj4gMTYpICYgMHhmZjtcbiAgICAgICAgICBoZXJlX3ZhbCA9IGhlcmUgJiAweGZmZmY7XG5cbiAgICAgICAgICBpZiAoKGxhc3RfYml0cyArIGhlcmVfYml0cykgPD0gYml0cykgeyBicmVhazsgfVxuICAgICAgICAgIC8vLS0tIFBVTExCWVRFKCkgLS0tLy9cbiAgICAgICAgICBpZiAoaGF2ZSA9PT0gMCkgeyBicmVhayBpbmZfbGVhdmU7IH1cbiAgICAgICAgICBoYXZlLS07XG4gICAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgICAgYml0cyArPSA4O1xuICAgICAgICAgIC8vLS0tLy9cbiAgICAgICAgfVxuICAgICAgICAvLy0tLSBEUk9QQklUUyhsYXN0LmJpdHMpIC0tLS8vXG4gICAgICAgIGhvbGQgPj4+PSBsYXN0X2JpdHM7XG4gICAgICAgIGJpdHMgLT0gbGFzdF9iaXRzO1xuICAgICAgICAvLy0tLS8vXG4gICAgICAgIHN0YXRlLmJhY2sgKz0gbGFzdF9iaXRzO1xuICAgICAgfVxuICAgICAgLy8tLS0gRFJPUEJJVFMoaGVyZS5iaXRzKSAtLS0vL1xuICAgICAgaG9sZCA+Pj49IGhlcmVfYml0cztcbiAgICAgIGJpdHMgLT0gaGVyZV9iaXRzO1xuICAgICAgLy8tLS0vL1xuICAgICAgc3RhdGUuYmFjayArPSBoZXJlX2JpdHM7XG4gICAgICBzdGF0ZS5sZW5ndGggPSBoZXJlX3ZhbDtcbiAgICAgIGlmIChoZXJlX29wID09PSAwKSB7XG4gICAgICAgIC8vVHJhY2V2digoc3RkZXJyLCBoZXJlLnZhbCA+PSAweDIwICYmIGhlcmUudmFsIDwgMHg3ZiA/XG4gICAgICAgIC8vICAgICAgICBcImluZmxhdGU6ICAgICAgICAgbGl0ZXJhbCAnJWMnXFxuXCIgOlxuICAgICAgICAvLyAgICAgICAgXCJpbmZsYXRlOiAgICAgICAgIGxpdGVyYWwgMHglMDJ4XFxuXCIsIGhlcmUudmFsKSk7XG4gICAgICAgIHN0YXRlLm1vZGUgPSBMSVQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGhlcmVfb3AgJiAzMikge1xuICAgICAgICAvL1RyYWNldnYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgICAgICAgIGVuZCBvZiBibG9ja1xcblwiKSk7XG4gICAgICAgIHN0YXRlLmJhY2sgPSAtMTtcbiAgICAgICAgc3RhdGUubW9kZSA9IFRZUEU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGhlcmVfb3AgJiA2NCkge1xuICAgICAgICBzdHJtLm1zZyA9ICdpbnZhbGlkIGxpdGVyYWwvbGVuZ3RoIGNvZGUnO1xuICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHN0YXRlLmV4dHJhID0gaGVyZV9vcCAmIDE1O1xuICAgICAgc3RhdGUubW9kZSA9IExFTkVYVDtcbiAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICBjYXNlIExFTkVYVDpcbiAgICAgIGlmIChzdGF0ZS5leHRyYSkge1xuICAgICAgICAvLz09PSBORUVEQklUUyhzdGF0ZS5leHRyYSk7XG4gICAgICAgIG4gPSBzdGF0ZS5leHRyYTtcbiAgICAgICAgd2hpbGUgKGJpdHMgPCBuKSB7XG4gICAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgICAgaGF2ZS0tO1xuICAgICAgICAgIGhvbGQgKz0gaW5wdXRbbmV4dCsrXSA8PCBiaXRzO1xuICAgICAgICAgIGJpdHMgKz0gODtcbiAgICAgICAgfVxuICAgICAgICAvLz09PS8vXG4gICAgICAgIHN0YXRlLmxlbmd0aCArPSBob2xkICYgKCgxIDw8IHN0YXRlLmV4dHJhKSAtMSkvKkJJVFMoc3RhdGUuZXh0cmEpKi87XG4gICAgICAgIC8vLS0tIERST1BCSVRTKHN0YXRlLmV4dHJhKSAtLS0vL1xuICAgICAgICBob2xkID4+Pj0gc3RhdGUuZXh0cmE7XG4gICAgICAgIGJpdHMgLT0gc3RhdGUuZXh0cmE7XG4gICAgICAgIC8vLS0tLy9cbiAgICAgICAgc3RhdGUuYmFjayArPSBzdGF0ZS5leHRyYTtcbiAgICAgIH1cbiAgICAgIC8vVHJhY2V2digoc3RkZXJyLCBcImluZmxhdGU6ICAgICAgICAgbGVuZ3RoICV1XFxuXCIsIHN0YXRlLmxlbmd0aCkpO1xuICAgICAgc3RhdGUud2FzID0gc3RhdGUubGVuZ3RoO1xuICAgICAgc3RhdGUubW9kZSA9IERJU1Q7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBESVNUOlxuICAgICAgZm9yICg7Oykge1xuICAgICAgICBoZXJlID0gc3RhdGUuZGlzdGNvZGVbaG9sZCAmICgoMSA8PCBzdGF0ZS5kaXN0Yml0cykgLTEpXTsvKkJJVFMoc3RhdGUuZGlzdGJpdHMpKi9cbiAgICAgICAgaGVyZV9iaXRzID0gaGVyZSA+Pj4gMjQ7XG4gICAgICAgIGhlcmVfb3AgPSAoaGVyZSA+Pj4gMTYpICYgMHhmZjtcbiAgICAgICAgaGVyZV92YWwgPSBoZXJlICYgMHhmZmZmO1xuXG4gICAgICAgIGlmICgoaGVyZV9iaXRzKSA8PSBiaXRzKSB7IGJyZWFrOyB9XG4gICAgICAgIC8vLS0tIFBVTExCWVRFKCkgLS0tLy9cbiAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgIGhhdmUtLTtcbiAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgIGJpdHMgKz0gODtcbiAgICAgICAgLy8tLS0vL1xuICAgICAgfVxuICAgICAgaWYgKChoZXJlX29wICYgMHhmMCkgPT09IDApIHtcbiAgICAgICAgbGFzdF9iaXRzID0gaGVyZV9iaXRzO1xuICAgICAgICBsYXN0X29wID0gaGVyZV9vcDtcbiAgICAgICAgbGFzdF92YWwgPSBoZXJlX3ZhbDtcbiAgICAgICAgZm9yICg7Oykge1xuICAgICAgICAgIGhlcmUgPSBzdGF0ZS5kaXN0Y29kZVtsYXN0X3ZhbCArXG4gICAgICAgICAgICAgICAgICAoKGhvbGQgJiAoKDEgPDwgKGxhc3RfYml0cyArIGxhc3Rfb3ApKSAtMSkpLypCSVRTKGxhc3QuYml0cyArIGxhc3Qub3ApKi8gPj4gbGFzdF9iaXRzKV07XG4gICAgICAgICAgaGVyZV9iaXRzID0gaGVyZSA+Pj4gMjQ7XG4gICAgICAgICAgaGVyZV9vcCA9IChoZXJlID4+PiAxNikgJiAweGZmO1xuICAgICAgICAgIGhlcmVfdmFsID0gaGVyZSAmIDB4ZmZmZjtcblxuICAgICAgICAgIGlmICgobGFzdF9iaXRzICsgaGVyZV9iaXRzKSA8PSBiaXRzKSB7IGJyZWFrOyB9XG4gICAgICAgICAgLy8tLS0gUFVMTEJZVEUoKSAtLS0vL1xuICAgICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICAgIGhhdmUtLTtcbiAgICAgICAgICBob2xkICs9IGlucHV0W25leHQrK10gPDwgYml0cztcbiAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgICAgLy8tLS0vL1xuICAgICAgICB9XG4gICAgICAgIC8vLS0tIERST1BCSVRTKGxhc3QuYml0cykgLS0tLy9cbiAgICAgICAgaG9sZCA+Pj49IGxhc3RfYml0cztcbiAgICAgICAgYml0cyAtPSBsYXN0X2JpdHM7XG4gICAgICAgIC8vLS0tLy9cbiAgICAgICAgc3RhdGUuYmFjayArPSBsYXN0X2JpdHM7XG4gICAgICB9XG4gICAgICAvLy0tLSBEUk9QQklUUyhoZXJlLmJpdHMpIC0tLS8vXG4gICAgICBob2xkID4+Pj0gaGVyZV9iaXRzO1xuICAgICAgYml0cyAtPSBoZXJlX2JpdHM7XG4gICAgICAvLy0tLS8vXG4gICAgICBzdGF0ZS5iYWNrICs9IGhlcmVfYml0cztcbiAgICAgIGlmIChoZXJlX29wICYgNjQpIHtcbiAgICAgICAgc3RybS5tc2cgPSAnaW52YWxpZCBkaXN0YW5jZSBjb2RlJztcbiAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBzdGF0ZS5vZmZzZXQgPSBoZXJlX3ZhbDtcbiAgICAgIHN0YXRlLmV4dHJhID0gKGhlcmVfb3ApICYgMTU7XG4gICAgICBzdGF0ZS5tb2RlID0gRElTVEVYVDtcbiAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICBjYXNlIERJU1RFWFQ6XG4gICAgICBpZiAoc3RhdGUuZXh0cmEpIHtcbiAgICAgICAgLy89PT0gTkVFREJJVFMoc3RhdGUuZXh0cmEpO1xuICAgICAgICBuID0gc3RhdGUuZXh0cmE7XG4gICAgICAgIHdoaWxlIChiaXRzIDwgbikge1xuICAgICAgICAgIGlmIChoYXZlID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgICAgIGhhdmUtLTtcbiAgICAgICAgICBob2xkICs9IGlucHV0W25leHQrK10gPDwgYml0cztcbiAgICAgICAgICBiaXRzICs9IDg7XG4gICAgICAgIH1cbiAgICAgICAgLy89PT0vL1xuICAgICAgICBzdGF0ZS5vZmZzZXQgKz0gaG9sZCAmICgoMSA8PCBzdGF0ZS5leHRyYSkgLTEpLypCSVRTKHN0YXRlLmV4dHJhKSovO1xuICAgICAgICAvLy0tLSBEUk9QQklUUyhzdGF0ZS5leHRyYSkgLS0tLy9cbiAgICAgICAgaG9sZCA+Pj49IHN0YXRlLmV4dHJhO1xuICAgICAgICBiaXRzIC09IHN0YXRlLmV4dHJhO1xuICAgICAgICAvLy0tLS8vXG4gICAgICAgIHN0YXRlLmJhY2sgKz0gc3RhdGUuZXh0cmE7XG4gICAgICB9XG4vLyNpZmRlZiBJTkZMQVRFX1NUUklDVFxuICAgICAgaWYgKHN0YXRlLm9mZnNldCA+IHN0YXRlLmRtYXgpIHtcbiAgICAgICAgc3RybS5tc2cgPSAnaW52YWxpZCBkaXN0YW5jZSB0b28gZmFyIGJhY2snO1xuICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbi8vI2VuZGlmXG4gICAgICAvL1RyYWNldnYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgICAgICAgIGRpc3RhbmNlICV1XFxuXCIsIHN0YXRlLm9mZnNldCkpO1xuICAgICAgc3RhdGUubW9kZSA9IE1BVENIO1xuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgIGNhc2UgTUFUQ0g6XG4gICAgICBpZiAobGVmdCA9PT0gMCkgeyBicmVhayBpbmZfbGVhdmU7IH1cbiAgICAgIGNvcHkgPSBfb3V0IC0gbGVmdDtcbiAgICAgIGlmIChzdGF0ZS5vZmZzZXQgPiBjb3B5KSB7ICAgICAgICAgLyogY29weSBmcm9tIHdpbmRvdyAqL1xuICAgICAgICBjb3B5ID0gc3RhdGUub2Zmc2V0IC0gY29weTtcbiAgICAgICAgaWYgKGNvcHkgPiBzdGF0ZS53aGF2ZSkge1xuICAgICAgICAgIGlmIChzdGF0ZS5zYW5lKSB7XG4gICAgICAgICAgICBzdHJtLm1zZyA9ICdpbnZhbGlkIGRpc3RhbmNlIHRvbyBmYXIgYmFjayc7XG4gICAgICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuLy8gKCEpIFRoaXMgYmxvY2sgaXMgZGlzYWJsZWQgaW4gemxpYiBkZWZhaWx0cyxcbi8vIGRvbid0IGVuYWJsZSBpdCBmb3IgYmluYXJ5IGNvbXBhdGliaWxpdHlcbi8vI2lmZGVmIElORkxBVEVfQUxMT1dfSU5WQUxJRF9ESVNUQU5DRV9UT09GQVJfQVJSUlxuLy8gICAgICAgICAgVHJhY2UoKHN0ZGVyciwgXCJpbmZsYXRlLmMgdG9vIGZhclxcblwiKSk7XG4vLyAgICAgICAgICBjb3B5IC09IHN0YXRlLndoYXZlO1xuLy8gICAgICAgICAgaWYgKGNvcHkgPiBzdGF0ZS5sZW5ndGgpIHsgY29weSA9IHN0YXRlLmxlbmd0aDsgfVxuLy8gICAgICAgICAgaWYgKGNvcHkgPiBsZWZ0KSB7IGNvcHkgPSBsZWZ0OyB9XG4vLyAgICAgICAgICBsZWZ0IC09IGNvcHk7XG4vLyAgICAgICAgICBzdGF0ZS5sZW5ndGggLT0gY29weTtcbi8vICAgICAgICAgIGRvIHtcbi8vICAgICAgICAgICAgb3V0cHV0W3B1dCsrXSA9IDA7XG4vLyAgICAgICAgICB9IHdoaWxlICgtLWNvcHkpO1xuLy8gICAgICAgICAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCkgeyBzdGF0ZS5tb2RlID0gTEVOOyB9XG4vLyAgICAgICAgICBicmVhaztcbi8vI2VuZGlmXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvcHkgPiBzdGF0ZS53bmV4dCkge1xuICAgICAgICAgIGNvcHkgLT0gc3RhdGUud25leHQ7XG4gICAgICAgICAgZnJvbSA9IHN0YXRlLndzaXplIC0gY29weTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBmcm9tID0gc3RhdGUud25leHQgLSBjb3B5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb3B5ID4gc3RhdGUubGVuZ3RoKSB7IGNvcHkgPSBzdGF0ZS5sZW5ndGg7IH1cbiAgICAgICAgZnJvbV9zb3VyY2UgPSBzdGF0ZS53aW5kb3c7XG4gICAgICB9XG4gICAgICBlbHNlIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBjb3B5IGZyb20gb3V0cHV0ICovXG4gICAgICAgIGZyb21fc291cmNlID0gb3V0cHV0O1xuICAgICAgICBmcm9tID0gcHV0IC0gc3RhdGUub2Zmc2V0O1xuICAgICAgICBjb3B5ID0gc3RhdGUubGVuZ3RoO1xuICAgICAgfVxuICAgICAgaWYgKGNvcHkgPiBsZWZ0KSB7IGNvcHkgPSBsZWZ0OyB9XG4gICAgICBsZWZ0IC09IGNvcHk7XG4gICAgICBzdGF0ZS5sZW5ndGggLT0gY29weTtcbiAgICAgIGRvIHtcbiAgICAgICAgb3V0cHV0W3B1dCsrXSA9IGZyb21fc291cmNlW2Zyb20rK107XG4gICAgICB9IHdoaWxlICgtLWNvcHkpO1xuICAgICAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCkgeyBzdGF0ZS5tb2RlID0gTEVOOyB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIExJVDpcbiAgICAgIGlmIChsZWZ0ID09PSAwKSB7IGJyZWFrIGluZl9sZWF2ZTsgfVxuICAgICAgb3V0cHV0W3B1dCsrXSA9IHN0YXRlLmxlbmd0aDtcbiAgICAgIGxlZnQtLTtcbiAgICAgIHN0YXRlLm1vZGUgPSBMRU47XG4gICAgICBicmVhaztcbiAgICBjYXNlIENIRUNLOlxuICAgICAgaWYgKHN0YXRlLndyYXApIHtcbiAgICAgICAgLy89PT0gTkVFREJJVFMoMzIpO1xuICAgICAgICB3aGlsZSAoYml0cyA8IDMyKSB7XG4gICAgICAgICAgaWYgKGhhdmUgPT09IDApIHsgYnJlYWsgaW5mX2xlYXZlOyB9XG4gICAgICAgICAgaGF2ZS0tO1xuICAgICAgICAgIC8vIFVzZSAnfCcgaW5zZGVhZCBvZiAnKycgdG8gbWFrZSBzdXJlIHRoYXQgcmVzdWx0IGlzIHNpZ25lZFxuICAgICAgICAgIGhvbGQgfD0gaW5wdXRbbmV4dCsrXSA8PCBiaXRzO1xuICAgICAgICAgIGJpdHMgKz0gODtcbiAgICAgICAgfVxuICAgICAgICAvLz09PS8vXG4gICAgICAgIF9vdXQgLT0gbGVmdDtcbiAgICAgICAgc3RybS50b3RhbF9vdXQgKz0gX291dDtcbiAgICAgICAgc3RhdGUudG90YWwgKz0gX291dDtcbiAgICAgICAgaWYgKF9vdXQpIHtcbiAgICAgICAgICBzdHJtLmFkbGVyID0gc3RhdGUuY2hlY2sgPVxuICAgICAgICAgICAgICAvKlVQREFURShzdGF0ZS5jaGVjaywgcHV0IC0gX291dCwgX291dCk7Ki9cbiAgICAgICAgICAgICAgKHN0YXRlLmZsYWdzID8gY3JjMzIoc3RhdGUuY2hlY2ssIG91dHB1dCwgX291dCwgcHV0IC0gX291dCkgOiBhZGxlcjMyKHN0YXRlLmNoZWNrLCBvdXRwdXQsIF9vdXQsIHB1dCAtIF9vdXQpKTtcblxuICAgICAgICB9XG4gICAgICAgIF9vdXQgPSBsZWZ0O1xuICAgICAgICAvLyBOQjogY3JjMzIgc3RvcmVkIGFzIHNpZ25lZCAzMi1iaXQgaW50LCBaU1dBUDMyIHJldHVybnMgc2lnbmVkIHRvb1xuICAgICAgICBpZiAoKHN0YXRlLmZsYWdzID8gaG9sZCA6IFpTV0FQMzIoaG9sZCkpICE9PSBzdGF0ZS5jaGVjaykge1xuICAgICAgICAgIHN0cm0ubXNnID0gJ2luY29ycmVjdCBkYXRhIGNoZWNrJztcbiAgICAgICAgICBzdGF0ZS5tb2RlID0gQkFEO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vPT09IElOSVRCSVRTKCk7XG4gICAgICAgIGhvbGQgPSAwO1xuICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgLy89PT0vL1xuICAgICAgICAvL1RyYWNldigoc3RkZXJyLCBcImluZmxhdGU6ICAgY2hlY2sgbWF0Y2hlcyB0cmFpbGVyXFxuXCIpKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLm1vZGUgPSBMRU5HVEg7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBMRU5HVEg6XG4gICAgICBpZiAoc3RhdGUud3JhcCAmJiBzdGF0ZS5mbGFncykge1xuICAgICAgICAvLz09PSBORUVEQklUUygzMik7XG4gICAgICAgIHdoaWxlIChiaXRzIDwgMzIpIHtcbiAgICAgICAgICBpZiAoaGF2ZSA9PT0gMCkgeyBicmVhayBpbmZfbGVhdmU7IH1cbiAgICAgICAgICBoYXZlLS07XG4gICAgICAgICAgaG9sZCArPSBpbnB1dFtuZXh0KytdIDw8IGJpdHM7XG4gICAgICAgICAgYml0cyArPSA4O1xuICAgICAgICB9XG4gICAgICAgIC8vPT09Ly9cbiAgICAgICAgaWYgKGhvbGQgIT09IChzdGF0ZS50b3RhbCAmIDB4ZmZmZmZmZmYpKSB7XG4gICAgICAgICAgc3RybS5tc2cgPSAnaW5jb3JyZWN0IGxlbmd0aCBjaGVjayc7XG4gICAgICAgICAgc3RhdGUubW9kZSA9IEJBRDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLz09PSBJTklUQklUUygpO1xuICAgICAgICBob2xkID0gMDtcbiAgICAgICAgYml0cyA9IDA7XG4gICAgICAgIC8vPT09Ly9cbiAgICAgICAgLy9UcmFjZXYoKHN0ZGVyciwgXCJpbmZsYXRlOiAgIGxlbmd0aCBtYXRjaGVzIHRyYWlsZXJcXG5cIikpO1xuICAgICAgfVxuICAgICAgc3RhdGUubW9kZSA9IERPTkU7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgY2FzZSBET05FOlxuICAgICAgcmV0ID0gWl9TVFJFQU1fRU5EO1xuICAgICAgYnJlYWsgaW5mX2xlYXZlO1xuICAgIGNhc2UgQkFEOlxuICAgICAgcmV0ID0gWl9EQVRBX0VSUk9SO1xuICAgICAgYnJlYWsgaW5mX2xlYXZlO1xuICAgIGNhc2UgTUVNOlxuICAgICAgcmV0dXJuIFpfTUVNX0VSUk9SO1xuICAgIGNhc2UgU1lOQzpcbiAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFpfU1RSRUFNX0VSUk9SO1xuICAgIH1cbiAgfVxuXG4gIC8vIGluZl9sZWF2ZSA8LSBoZXJlIGlzIHJlYWwgcGxhY2UgZm9yIFwiZ290byBpbmZfbGVhdmVcIiwgZW11bGF0ZWQgdmlhIFwiYnJlYWsgaW5mX2xlYXZlXCJcblxuICAvKlxuICAgICBSZXR1cm4gZnJvbSBpbmZsYXRlKCksIHVwZGF0aW5nIHRoZSB0b3RhbCBjb3VudHMgYW5kIHRoZSBjaGVjayB2YWx1ZS5cbiAgICAgSWYgdGhlcmUgd2FzIG5vIHByb2dyZXNzIGR1cmluZyB0aGUgaW5mbGF0ZSgpIGNhbGwsIHJldHVybiBhIGJ1ZmZlclxuICAgICBlcnJvci4gIENhbGwgdXBkYXRld2luZG93KCkgdG8gY3JlYXRlIGFuZC9vciB1cGRhdGUgdGhlIHdpbmRvdyBzdGF0ZS5cbiAgICAgTm90ZTogYSBtZW1vcnkgZXJyb3IgZnJvbSBpbmZsYXRlKCkgaXMgbm9uLXJlY292ZXJhYmxlLlxuICAgKi9cblxuICAvLy0tLSBSRVNUT1JFKCkgLS0tXG4gIHN0cm0ubmV4dF9vdXQgPSBwdXQ7XG4gIHN0cm0uYXZhaWxfb3V0ID0gbGVmdDtcbiAgc3RybS5uZXh0X2luID0gbmV4dDtcbiAgc3RybS5hdmFpbF9pbiA9IGhhdmU7XG4gIHN0YXRlLmhvbGQgPSBob2xkO1xuICBzdGF0ZS5iaXRzID0gYml0cztcbiAgLy8tLS1cblxuICBpZiAoc3RhdGUud3NpemUgfHwgKF9vdXQgIT09IHN0cm0uYXZhaWxfb3V0ICYmIHN0YXRlLm1vZGUgPCBCQUQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAoc3RhdGUubW9kZSA8IENIRUNLIHx8IGZsdXNoICE9PSBaX0ZJTklTSCkpKSB7XG4gICAgaWYgKHVwZGF0ZXdpbmRvdyhzdHJtLCBzdHJtLm91dHB1dCwgc3RybS5uZXh0X291dCwgX291dCAtIHN0cm0uYXZhaWxfb3V0KSkge1xuICAgICAgc3RhdGUubW9kZSA9IE1FTTtcbiAgICAgIHJldHVybiBaX01FTV9FUlJPUjtcbiAgICB9XG4gIH1cbiAgX2luIC09IHN0cm0uYXZhaWxfaW47XG4gIF9vdXQgLT0gc3RybS5hdmFpbF9vdXQ7XG4gIHN0cm0udG90YWxfaW4gKz0gX2luO1xuICBzdHJtLnRvdGFsX291dCArPSBfb3V0O1xuICBzdGF0ZS50b3RhbCArPSBfb3V0O1xuICBpZiAoc3RhdGUud3JhcCAmJiBfb3V0KSB7XG4gICAgc3RybS5hZGxlciA9IHN0YXRlLmNoZWNrID0gLypVUERBVEUoc3RhdGUuY2hlY2ssIHN0cm0ubmV4dF9vdXQgLSBfb3V0LCBfb3V0KTsqL1xuICAgICAgKHN0YXRlLmZsYWdzID8gY3JjMzIoc3RhdGUuY2hlY2ssIG91dHB1dCwgX291dCwgc3RybS5uZXh0X291dCAtIF9vdXQpIDogYWRsZXIzMihzdGF0ZS5jaGVjaywgb3V0cHV0LCBfb3V0LCBzdHJtLm5leHRfb3V0IC0gX291dCkpO1xuICB9XG4gIHN0cm0uZGF0YV90eXBlID0gc3RhdGUuYml0cyArIChzdGF0ZS5sYXN0ID8gNjQgOiAwKSArXG4gICAgICAgICAgICAgICAgICAgIChzdGF0ZS5tb2RlID09PSBUWVBFID8gMTI4IDogMCkgK1xuICAgICAgICAgICAgICAgICAgICAoc3RhdGUubW9kZSA9PT0gTEVOXyB8fCBzdGF0ZS5tb2RlID09PSBDT1BZXyA/IDI1NiA6IDApO1xuICBpZiAoKChfaW4gPT09IDAgJiYgX291dCA9PT0gMCkgfHwgZmx1c2ggPT09IFpfRklOSVNIKSAmJiByZXQgPT09IFpfT0spIHtcbiAgICByZXQgPSBaX0JVRl9FUlJPUjtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBpbmZsYXRlRW5kKHN0cm0pIHtcblxuICBpZiAoIXN0cm0gfHwgIXN0cm0uc3RhdGUgLyp8fCBzdHJtLT56ZnJlZSA9PSAoZnJlZV9mdW5jKTAqLykge1xuICAgIHJldHVybiBaX1NUUkVBTV9FUlJPUjtcbiAgfVxuXG4gIHZhciBzdGF0ZSA9IHN0cm0uc3RhdGU7XG4gIGlmIChzdGF0ZS53aW5kb3cpIHtcbiAgICBzdGF0ZS53aW5kb3cgPSBudWxsO1xuICB9XG4gIHN0cm0uc3RhdGUgPSBudWxsO1xuICByZXR1cm4gWl9PSztcbn1cblxuZnVuY3Rpb24gaW5mbGF0ZUdldEhlYWRlcihzdHJtLCBoZWFkKSB7XG4gIHZhciBzdGF0ZTtcblxuICAvKiBjaGVjayBzdGF0ZSAqL1xuICBpZiAoIXN0cm0gfHwgIXN0cm0uc3RhdGUpIHsgcmV0dXJuIFpfU1RSRUFNX0VSUk9SOyB9XG4gIHN0YXRlID0gc3RybS5zdGF0ZTtcbiAgaWYgKChzdGF0ZS53cmFwICYgMikgPT09IDApIHsgcmV0dXJuIFpfU1RSRUFNX0VSUk9SOyB9XG5cbiAgLyogc2F2ZSBoZWFkZXIgc3RydWN0dXJlICovXG4gIHN0YXRlLmhlYWQgPSBoZWFkO1xuICBoZWFkLmRvbmUgPSBmYWxzZTtcbiAgcmV0dXJuIFpfT0s7XG59XG5cblxuZXhwb3J0cy5pbmZsYXRlUmVzZXQgPSBpbmZsYXRlUmVzZXQ7XG5leHBvcnRzLmluZmxhdGVSZXNldDIgPSBpbmZsYXRlUmVzZXQyO1xuZXhwb3J0cy5pbmZsYXRlUmVzZXRLZWVwID0gaW5mbGF0ZVJlc2V0S2VlcDtcbmV4cG9ydHMuaW5mbGF0ZUluaXQgPSBpbmZsYXRlSW5pdDtcbmV4cG9ydHMuaW5mbGF0ZUluaXQyID0gaW5mbGF0ZUluaXQyO1xuZXhwb3J0cy5pbmZsYXRlID0gaW5mbGF0ZTtcbmV4cG9ydHMuaW5mbGF0ZUVuZCA9IGluZmxhdGVFbmQ7XG5leHBvcnRzLmluZmxhdGVHZXRIZWFkZXIgPSBpbmZsYXRlR2V0SGVhZGVyO1xuZXhwb3J0cy5pbmZsYXRlSW5mbyA9ICdwYWtvIGluZmxhdGUgKGZyb20gTm9kZWNhIHByb2plY3QpJztcblxuLyogTm90IGltcGxlbWVudGVkXG5leHBvcnRzLmluZmxhdGVDb3B5ID0gaW5mbGF0ZUNvcHk7XG5leHBvcnRzLmluZmxhdGVHZXREaWN0aW9uYXJ5ID0gaW5mbGF0ZUdldERpY3Rpb25hcnk7XG5leHBvcnRzLmluZmxhdGVNYXJrID0gaW5mbGF0ZU1hcms7XG5leHBvcnRzLmluZmxhdGVQcmltZSA9IGluZmxhdGVQcmltZTtcbmV4cG9ydHMuaW5mbGF0ZVNldERpY3Rpb25hcnkgPSBpbmZsYXRlU2V0RGljdGlvbmFyeTtcbmV4cG9ydHMuaW5mbGF0ZVN5bmMgPSBpbmZsYXRlU3luYztcbmV4cG9ydHMuaW5mbGF0ZVN5bmNQb2ludCA9IGluZmxhdGVTeW5jUG9pbnQ7XG5leHBvcnRzLmluZmxhdGVVbmRlcm1pbmUgPSBpbmZsYXRlVW5kZXJtaW5lO1xuKi8iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMvY29tbW9uJyk7XG5cbnZhciBNQVhCSVRTID0gMTU7XG52YXIgRU5PVUdIX0xFTlMgPSA4NTI7XG52YXIgRU5PVUdIX0RJU1RTID0gNTkyO1xuLy92YXIgRU5PVUdIID0gKEVOT1VHSF9MRU5TK0VOT1VHSF9ESVNUUyk7XG5cbnZhciBDT0RFUyA9IDA7XG52YXIgTEVOUyA9IDE7XG52YXIgRElTVFMgPSAyO1xuXG52YXIgbGJhc2UgPSBbIC8qIExlbmd0aCBjb2RlcyAyNTcuLjI4NSBiYXNlICovXG4gIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTMsIDE1LCAxNywgMTksIDIzLCAyNywgMzEsXG4gIDM1LCA0MywgNTEsIDU5LCA2NywgODMsIDk5LCAxMTUsIDEzMSwgMTYzLCAxOTUsIDIyNywgMjU4LCAwLCAwXG5dO1xuXG52YXIgbGV4dCA9IFsgLyogTGVuZ3RoIGNvZGVzIDI1Ny4uMjg1IGV4dHJhICovXG4gIDE2LCAxNiwgMTYsIDE2LCAxNiwgMTYsIDE2LCAxNiwgMTcsIDE3LCAxNywgMTcsIDE4LCAxOCwgMTgsIDE4LFxuICAxOSwgMTksIDE5LCAxOSwgMjAsIDIwLCAyMCwgMjAsIDIxLCAyMSwgMjEsIDIxLCAxNiwgNzIsIDc4XG5dO1xuXG52YXIgZGJhc2UgPSBbIC8qIERpc3RhbmNlIGNvZGVzIDAuLjI5IGJhc2UgKi9cbiAgMSwgMiwgMywgNCwgNSwgNywgOSwgMTMsIDE3LCAyNSwgMzMsIDQ5LCA2NSwgOTcsIDEyOSwgMTkzLFxuICAyNTcsIDM4NSwgNTEzLCA3NjksIDEwMjUsIDE1MzcsIDIwNDksIDMwNzMsIDQwOTcsIDYxNDUsXG4gIDgxOTMsIDEyMjg5LCAxNjM4NSwgMjQ1NzcsIDAsIDBcbl07XG5cbnZhciBkZXh0ID0gWyAvKiBEaXN0YW5jZSBjb2RlcyAwLi4yOSBleHRyYSAqL1xuICAxNiwgMTYsIDE2LCAxNiwgMTcsIDE3LCAxOCwgMTgsIDE5LCAxOSwgMjAsIDIwLCAyMSwgMjEsIDIyLCAyMixcbiAgMjMsIDIzLCAyNCwgMjQsIDI1LCAyNSwgMjYsIDI2LCAyNywgMjcsXG4gIDI4LCAyOCwgMjksIDI5LCA2NCwgNjRcbl07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5mbGF0ZV90YWJsZSh0eXBlLCBsZW5zLCBsZW5zX2luZGV4LCBjb2RlcywgdGFibGUsIHRhYmxlX2luZGV4LCB3b3JrLCBvcHRzKVxue1xuICB2YXIgYml0cyA9IG9wdHMuYml0cztcbiAgICAgIC8vaGVyZSA9IG9wdHMuaGVyZTsgLyogdGFibGUgZW50cnkgZm9yIGR1cGxpY2F0aW9uICovXG5cbiAgdmFyIGxlbiA9IDA7ICAgICAgICAgICAgICAgLyogYSBjb2RlJ3MgbGVuZ3RoIGluIGJpdHMgKi9cbiAgdmFyIHN5bSA9IDA7ICAgICAgICAgICAgICAgLyogaW5kZXggb2YgY29kZSBzeW1ib2xzICovXG4gIHZhciBtaW4gPSAwLCBtYXggPSAwOyAgICAgICAgICAvKiBtaW5pbXVtIGFuZCBtYXhpbXVtIGNvZGUgbGVuZ3RocyAqL1xuICB2YXIgcm9vdCA9IDA7ICAgICAgICAgICAgICAvKiBudW1iZXIgb2YgaW5kZXggYml0cyBmb3Igcm9vdCB0YWJsZSAqL1xuICB2YXIgY3VyciA9IDA7ICAgICAgICAgICAgICAvKiBudW1iZXIgb2YgaW5kZXggYml0cyBmb3IgY3VycmVudCB0YWJsZSAqL1xuICB2YXIgZHJvcCA9IDA7ICAgICAgICAgICAgICAvKiBjb2RlIGJpdHMgdG8gZHJvcCBmb3Igc3ViLXRhYmxlICovXG4gIHZhciBsZWZ0ID0gMDsgICAgICAgICAgICAgICAgICAgLyogbnVtYmVyIG9mIHByZWZpeCBjb2RlcyBhdmFpbGFibGUgKi9cbiAgdmFyIHVzZWQgPSAwOyAgICAgICAgICAgICAgLyogY29kZSBlbnRyaWVzIGluIHRhYmxlIHVzZWQgKi9cbiAgdmFyIGh1ZmYgPSAwOyAgICAgICAgICAgICAgLyogSHVmZm1hbiBjb2RlICovXG4gIHZhciBpbmNyOyAgICAgICAgICAgICAgLyogZm9yIGluY3JlbWVudGluZyBjb2RlLCBpbmRleCAqL1xuICB2YXIgZmlsbDsgICAgICAgICAgICAgIC8qIGluZGV4IGZvciByZXBsaWNhdGluZyBlbnRyaWVzICovXG4gIHZhciBsb3c7ICAgICAgICAgICAgICAgLyogbG93IGJpdHMgZm9yIGN1cnJlbnQgcm9vdCBlbnRyeSAqL1xuICB2YXIgbWFzazsgICAgICAgICAgICAgIC8qIG1hc2sgZm9yIGxvdyByb290IGJpdHMgKi9cbiAgdmFyIG5leHQ7ICAgICAgICAgICAgIC8qIG5leHQgYXZhaWxhYmxlIHNwYWNlIGluIHRhYmxlICovXG4gIHZhciBiYXNlID0gbnVsbDsgICAgIC8qIGJhc2UgdmFsdWUgdGFibGUgdG8gdXNlICovXG4gIHZhciBiYXNlX2luZGV4ID0gMDtcbi8vICB2YXIgc2hvZXh0cmE7ICAgIC8qIGV4dHJhIGJpdHMgdGFibGUgdG8gdXNlICovXG4gIHZhciBlbmQ7ICAgICAgICAgICAgICAgICAgICAvKiB1c2UgYmFzZSBhbmQgZXh0cmEgZm9yIHN5bWJvbCA+IGVuZCAqL1xuICB2YXIgY291bnQgPSBuZXcgdXRpbHMuQnVmMTYoTUFYQklUUysxKTsgLy9bTUFYQklUUysxXTsgICAgLyogbnVtYmVyIG9mIGNvZGVzIG9mIGVhY2ggbGVuZ3RoICovXG4gIHZhciBvZmZzID0gbmV3IHV0aWxzLkJ1ZjE2KE1BWEJJVFMrMSk7IC8vW01BWEJJVFMrMV07ICAgICAvKiBvZmZzZXRzIGluIHRhYmxlIGZvciBlYWNoIGxlbmd0aCAqL1xuICB2YXIgZXh0cmEgPSBudWxsO1xuICB2YXIgZXh0cmFfaW5kZXggPSAwO1xuXG4gIHZhciBoZXJlX2JpdHMsIGhlcmVfb3AsIGhlcmVfdmFsO1xuXG4gIC8qXG4gICBQcm9jZXNzIGEgc2V0IG9mIGNvZGUgbGVuZ3RocyB0byBjcmVhdGUgYSBjYW5vbmljYWwgSHVmZm1hbiBjb2RlLiAgVGhlXG4gICBjb2RlIGxlbmd0aHMgYXJlIGxlbnNbMC4uY29kZXMtMV0uICBFYWNoIGxlbmd0aCBjb3JyZXNwb25kcyB0byB0aGVcbiAgIHN5bWJvbHMgMC4uY29kZXMtMS4gIFRoZSBIdWZmbWFuIGNvZGUgaXMgZ2VuZXJhdGVkIGJ5IGZpcnN0IHNvcnRpbmcgdGhlXG4gICBzeW1ib2xzIGJ5IGxlbmd0aCBmcm9tIHNob3J0IHRvIGxvbmcsIGFuZCByZXRhaW5pbmcgdGhlIHN5bWJvbCBvcmRlclxuICAgZm9yIGNvZGVzIHdpdGggZXF1YWwgbGVuZ3Rocy4gIFRoZW4gdGhlIGNvZGUgc3RhcnRzIHdpdGggYWxsIHplcm8gYml0c1xuICAgZm9yIHRoZSBmaXJzdCBjb2RlIG9mIHRoZSBzaG9ydGVzdCBsZW5ndGgsIGFuZCB0aGUgY29kZXMgYXJlIGludGVnZXJcbiAgIGluY3JlbWVudHMgZm9yIHRoZSBzYW1lIGxlbmd0aCwgYW5kIHplcm9zIGFyZSBhcHBlbmRlZCBhcyB0aGUgbGVuZ3RoXG4gICBpbmNyZWFzZXMuICBGb3IgdGhlIGRlZmxhdGUgZm9ybWF0LCB0aGVzZSBiaXRzIGFyZSBzdG9yZWQgYmFja3dhcmRzXG4gICBmcm9tIHRoZWlyIG1vcmUgbmF0dXJhbCBpbnRlZ2VyIGluY3JlbWVudCBvcmRlcmluZywgYW5kIHNvIHdoZW4gdGhlXG4gICBkZWNvZGluZyB0YWJsZXMgYXJlIGJ1aWx0IGluIHRoZSBsYXJnZSBsb29wIGJlbG93LCB0aGUgaW50ZWdlciBjb2Rlc1xuICAgYXJlIGluY3JlbWVudGVkIGJhY2t3YXJkcy5cblxuICAgVGhpcyByb3V0aW5lIGFzc3VtZXMsIGJ1dCBkb2VzIG5vdCBjaGVjaywgdGhhdCBhbGwgb2YgdGhlIGVudHJpZXMgaW5cbiAgIGxlbnNbXSBhcmUgaW4gdGhlIHJhbmdlIDAuLk1BWEJJVFMuICBUaGUgY2FsbGVyIG11c3QgYXNzdXJlIHRoaXMuXG4gICAxLi5NQVhCSVRTIGlzIGludGVycHJldGVkIGFzIHRoYXQgY29kZSBsZW5ndGguICB6ZXJvIG1lYW5zIHRoYXQgdGhhdFxuICAgc3ltYm9sIGRvZXMgbm90IG9jY3VyIGluIHRoaXMgY29kZS5cblxuICAgVGhlIGNvZGVzIGFyZSBzb3J0ZWQgYnkgY29tcHV0aW5nIGEgY291bnQgb2YgY29kZXMgZm9yIGVhY2ggbGVuZ3RoLFxuICAgY3JlYXRpbmcgZnJvbSB0aGF0IGEgdGFibGUgb2Ygc3RhcnRpbmcgaW5kaWNlcyBmb3IgZWFjaCBsZW5ndGggaW4gdGhlXG4gICBzb3J0ZWQgdGFibGUsIGFuZCB0aGVuIGVudGVyaW5nIHRoZSBzeW1ib2xzIGluIG9yZGVyIGluIHRoZSBzb3J0ZWRcbiAgIHRhYmxlLiAgVGhlIHNvcnRlZCB0YWJsZSBpcyB3b3JrW10sIHdpdGggdGhhdCBzcGFjZSBiZWluZyBwcm92aWRlZCBieVxuICAgdGhlIGNhbGxlci5cblxuICAgVGhlIGxlbmd0aCBjb3VudHMgYXJlIHVzZWQgZm9yIG90aGVyIHB1cnBvc2VzIGFzIHdlbGwsIGkuZS4gZmluZGluZ1xuICAgdGhlIG1pbmltdW0gYW5kIG1heGltdW0gbGVuZ3RoIGNvZGVzLCBkZXRlcm1pbmluZyBpZiB0aGVyZSBhcmUgYW55XG4gICBjb2RlcyBhdCBhbGwsIGNoZWNraW5nIGZvciBhIHZhbGlkIHNldCBvZiBsZW5ndGhzLCBhbmQgbG9va2luZyBhaGVhZFxuICAgYXQgbGVuZ3RoIGNvdW50cyB0byBkZXRlcm1pbmUgc3ViLXRhYmxlIHNpemVzIHdoZW4gYnVpbGRpbmcgdGhlXG4gICBkZWNvZGluZyB0YWJsZXMuXG4gICAqL1xuXG4gIC8qIGFjY3VtdWxhdGUgbGVuZ3RocyBmb3IgY29kZXMgKGFzc3VtZXMgbGVuc1tdIGFsbCBpbiAwLi5NQVhCSVRTKSAqL1xuICBmb3IgKGxlbiA9IDA7IGxlbiA8PSBNQVhCSVRTOyBsZW4rKykge1xuICAgIGNvdW50W2xlbl0gPSAwO1xuICB9XG4gIGZvciAoc3ltID0gMDsgc3ltIDwgY29kZXM7IHN5bSsrKSB7XG4gICAgY291bnRbbGVuc1tsZW5zX2luZGV4ICsgc3ltXV0rKztcbiAgfVxuXG4gIC8qIGJvdW5kIGNvZGUgbGVuZ3RocywgZm9yY2Ugcm9vdCB0byBiZSB3aXRoaW4gY29kZSBsZW5ndGhzICovXG4gIHJvb3QgPSBiaXRzO1xuICBmb3IgKG1heCA9IE1BWEJJVFM7IG1heCA+PSAxOyBtYXgtLSkge1xuICAgIGlmIChjb3VudFttYXhdICE9PSAwKSB7IGJyZWFrOyB9XG4gIH1cbiAgaWYgKHJvb3QgPiBtYXgpIHtcbiAgICByb290ID0gbWF4O1xuICB9XG4gIGlmIChtYXggPT09IDApIHsgICAgICAgICAgICAgICAgICAgICAvKiBubyBzeW1ib2xzIHRvIGNvZGUgYXQgYWxsICovXG4gICAgLy90YWJsZS5vcFtvcHRzLnRhYmxlX2luZGV4XSA9IDY0OyAgLy9oZXJlLm9wID0gKHZhciBjaGFyKTY0OyAgICAvKiBpbnZhbGlkIGNvZGUgbWFya2VyICovXG4gICAgLy90YWJsZS5iaXRzW29wdHMudGFibGVfaW5kZXhdID0gMTsgICAvL2hlcmUuYml0cyA9ICh2YXIgY2hhcikxO1xuICAgIC8vdGFibGUudmFsW29wdHMudGFibGVfaW5kZXgrK10gPSAwOyAgIC8vaGVyZS52YWwgPSAodmFyIHNob3J0KTA7XG4gICAgdGFibGVbdGFibGVfaW5kZXgrK10gPSAoMSA8PCAyNCkgfCAoNjQgPDwgMTYpIHwgMDtcblxuXG4gICAgLy90YWJsZS5vcFtvcHRzLnRhYmxlX2luZGV4XSA9IDY0O1xuICAgIC8vdGFibGUuYml0c1tvcHRzLnRhYmxlX2luZGV4XSA9IDE7XG4gICAgLy90YWJsZS52YWxbb3B0cy50YWJsZV9pbmRleCsrXSA9IDA7XG4gICAgdGFibGVbdGFibGVfaW5kZXgrK10gPSAoMSA8PCAyNCkgfCAoNjQgPDwgMTYpIHwgMDtcblxuICAgIG9wdHMuYml0cyA9IDE7XG4gICAgcmV0dXJuIDA7ICAgICAvKiBubyBzeW1ib2xzLCBidXQgd2FpdCBmb3IgZGVjb2RpbmcgdG8gcmVwb3J0IGVycm9yICovXG4gIH1cbiAgZm9yIChtaW4gPSAxOyBtaW4gPCBtYXg7IG1pbisrKSB7XG4gICAgaWYgKGNvdW50W21pbl0gIT09IDApIHsgYnJlYWs7IH1cbiAgfVxuICBpZiAocm9vdCA8IG1pbikge1xuICAgIHJvb3QgPSBtaW47XG4gIH1cblxuICAvKiBjaGVjayBmb3IgYW4gb3Zlci1zdWJzY3JpYmVkIG9yIGluY29tcGxldGUgc2V0IG9mIGxlbmd0aHMgKi9cbiAgbGVmdCA9IDE7XG4gIGZvciAobGVuID0gMTsgbGVuIDw9IE1BWEJJVFM7IGxlbisrKSB7XG4gICAgbGVmdCA8PD0gMTtcbiAgICBsZWZ0IC09IGNvdW50W2xlbl07XG4gICAgaWYgKGxlZnQgPCAwKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfSAgICAgICAgLyogb3Zlci1zdWJzY3JpYmVkICovXG4gIH1cbiAgaWYgKGxlZnQgPiAwICYmICh0eXBlID09PSBDT0RFUyB8fCBtYXggIT09IDEpKSB7XG4gICAgcmV0dXJuIC0xOyAgICAgICAgICAgICAgICAgICAgICAvKiBpbmNvbXBsZXRlIHNldCAqL1xuICB9XG5cbiAgLyogZ2VuZXJhdGUgb2Zmc2V0cyBpbnRvIHN5bWJvbCB0YWJsZSBmb3IgZWFjaCBsZW5ndGggZm9yIHNvcnRpbmcgKi9cbiAgb2Zmc1sxXSA9IDA7XG4gIGZvciAobGVuID0gMTsgbGVuIDwgTUFYQklUUzsgbGVuKyspIHtcbiAgICBvZmZzW2xlbiArIDFdID0gb2Zmc1tsZW5dICsgY291bnRbbGVuXTtcbiAgfVxuXG4gIC8qIHNvcnQgc3ltYm9scyBieSBsZW5ndGgsIGJ5IHN5bWJvbCBvcmRlciB3aXRoaW4gZWFjaCBsZW5ndGggKi9cbiAgZm9yIChzeW0gPSAwOyBzeW0gPCBjb2Rlczsgc3ltKyspIHtcbiAgICBpZiAobGVuc1tsZW5zX2luZGV4ICsgc3ltXSAhPT0gMCkge1xuICAgICAgd29ya1tvZmZzW2xlbnNbbGVuc19pbmRleCArIHN5bV1dKytdID0gc3ltO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICBDcmVhdGUgYW5kIGZpbGwgaW4gZGVjb2RpbmcgdGFibGVzLiAgSW4gdGhpcyBsb29wLCB0aGUgdGFibGUgYmVpbmdcbiAgIGZpbGxlZCBpcyBhdCBuZXh0IGFuZCBoYXMgY3VyciBpbmRleCBiaXRzLiAgVGhlIGNvZGUgYmVpbmcgdXNlZCBpcyBodWZmXG4gICB3aXRoIGxlbmd0aCBsZW4uICBUaGF0IGNvZGUgaXMgY29udmVydGVkIHRvIGFuIGluZGV4IGJ5IGRyb3BwaW5nIGRyb3BcbiAgIGJpdHMgb2ZmIG9mIHRoZSBib3R0b20uICBGb3IgY29kZXMgd2hlcmUgbGVuIGlzIGxlc3MgdGhhbiBkcm9wICsgY3VycixcbiAgIHRob3NlIHRvcCBkcm9wICsgY3VyciAtIGxlbiBiaXRzIGFyZSBpbmNyZW1lbnRlZCB0aHJvdWdoIGFsbCB2YWx1ZXMgdG9cbiAgIGZpbGwgdGhlIHRhYmxlIHdpdGggcmVwbGljYXRlZCBlbnRyaWVzLlxuXG4gICByb290IGlzIHRoZSBudW1iZXIgb2YgaW5kZXggYml0cyBmb3IgdGhlIHJvb3QgdGFibGUuICBXaGVuIGxlbiBleGNlZWRzXG4gICByb290LCBzdWItdGFibGVzIGFyZSBjcmVhdGVkIHBvaW50ZWQgdG8gYnkgdGhlIHJvb3QgZW50cnkgd2l0aCBhbiBpbmRleFxuICAgb2YgdGhlIGxvdyByb290IGJpdHMgb2YgaHVmZi4gIFRoaXMgaXMgc2F2ZWQgaW4gbG93IHRvIGNoZWNrIGZvciB3aGVuIGFcbiAgIG5ldyBzdWItdGFibGUgc2hvdWxkIGJlIHN0YXJ0ZWQuICBkcm9wIGlzIHplcm8gd2hlbiB0aGUgcm9vdCB0YWJsZSBpc1xuICAgYmVpbmcgZmlsbGVkLCBhbmQgZHJvcCBpcyByb290IHdoZW4gc3ViLXRhYmxlcyBhcmUgYmVpbmcgZmlsbGVkLlxuXG4gICBXaGVuIGEgbmV3IHN1Yi10YWJsZSBpcyBuZWVkZWQsIGl0IGlzIG5lY2Vzc2FyeSB0byBsb29rIGFoZWFkIGluIHRoZVxuICAgY29kZSBsZW5ndGhzIHRvIGRldGVybWluZSB3aGF0IHNpemUgc3ViLXRhYmxlIGlzIG5lZWRlZC4gIFRoZSBsZW5ndGhcbiAgIGNvdW50cyBhcmUgdXNlZCBmb3IgdGhpcywgYW5kIHNvIGNvdW50W10gaXMgZGVjcmVtZW50ZWQgYXMgY29kZXMgYXJlXG4gICBlbnRlcmVkIGluIHRoZSB0YWJsZXMuXG5cbiAgIHVzZWQga2VlcHMgdHJhY2sgb2YgaG93IG1hbnkgdGFibGUgZW50cmllcyBoYXZlIGJlZW4gYWxsb2NhdGVkIGZyb20gdGhlXG4gICBwcm92aWRlZCAqdGFibGUgc3BhY2UuICBJdCBpcyBjaGVja2VkIGZvciBMRU5TIGFuZCBESVNUIHRhYmxlcyBhZ2FpbnN0XG4gICB0aGUgY29uc3RhbnRzIEVOT1VHSF9MRU5TIGFuZCBFTk9VR0hfRElTVFMgdG8gZ3VhcmQgYWdhaW5zdCBjaGFuZ2VzIGluXG4gICB0aGUgaW5pdGlhbCByb290IHRhYmxlIHNpemUgY29uc3RhbnRzLiAgU2VlIHRoZSBjb21tZW50cyBpbiBpbmZ0cmVlcy5oXG4gICBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cblxuICAgc3ltIGluY3JlbWVudHMgdGhyb3VnaCBhbGwgc3ltYm9scywgYW5kIHRoZSBsb29wIHRlcm1pbmF0ZXMgd2hlblxuICAgYWxsIGNvZGVzIG9mIGxlbmd0aCBtYXgsIGkuZS4gYWxsIGNvZGVzLCBoYXZlIGJlZW4gcHJvY2Vzc2VkLiAgVGhpc1xuICAgcm91dGluZSBwZXJtaXRzIGluY29tcGxldGUgY29kZXMsIHNvIGFub3RoZXIgbG9vcCBhZnRlciB0aGlzIG9uZSBmaWxsc1xuICAgaW4gdGhlIHJlc3Qgb2YgdGhlIGRlY29kaW5nIHRhYmxlcyB3aXRoIGludmFsaWQgY29kZSBtYXJrZXJzLlxuICAgKi9cblxuICAvKiBzZXQgdXAgZm9yIGNvZGUgdHlwZSAqL1xuICAvLyBwb29yIG1hbiBvcHRpbWl6YXRpb24gLSB1c2UgaWYtZWxzZSBpbnN0ZWFkIG9mIHN3aXRjaCxcbiAgLy8gdG8gYXZvaWQgZGVvcHRzIGluIG9sZCB2OFxuICBpZiAodHlwZSA9PT0gQ09ERVMpIHtcbiAgICAgIGJhc2UgPSBleHRyYSA9IHdvcms7ICAgIC8qIGR1bW15IHZhbHVlLS1ub3QgdXNlZCAqL1xuICAgICAgZW5kID0gMTk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gTEVOUykge1xuICAgICAgYmFzZSA9IGxiYXNlO1xuICAgICAgYmFzZV9pbmRleCAtPSAyNTc7XG4gICAgICBleHRyYSA9IGxleHQ7XG4gICAgICBleHRyYV9pbmRleCAtPSAyNTc7XG4gICAgICBlbmQgPSAyNTY7XG4gIH0gZWxzZSB7ICAgICAgICAgICAgICAgICAgICAvKiBESVNUUyAqL1xuICAgICAgYmFzZSA9IGRiYXNlO1xuICAgICAgZXh0cmEgPSBkZXh0O1xuICAgICAgZW5kID0gLTE7XG4gIH1cblxuICAvKiBpbml0aWFsaXplIG9wdHMgZm9yIGxvb3AgKi9cbiAgaHVmZiA9IDA7ICAgICAgICAgICAgICAgICAgIC8qIHN0YXJ0aW5nIGNvZGUgKi9cbiAgc3ltID0gMDsgICAgICAgICAgICAgICAgICAgIC8qIHN0YXJ0aW5nIGNvZGUgc3ltYm9sICovXG4gIGxlbiA9IG1pbjsgICAgICAgICAgICAgICAgICAvKiBzdGFydGluZyBjb2RlIGxlbmd0aCAqL1xuICBuZXh0ID0gdGFibGVfaW5kZXg7ICAgICAgICAgICAgICAvKiBjdXJyZW50IHRhYmxlIHRvIGZpbGwgaW4gKi9cbiAgY3VyciA9IHJvb3Q7ICAgICAgICAgICAgICAgIC8qIGN1cnJlbnQgdGFibGUgaW5kZXggYml0cyAqL1xuICBkcm9wID0gMDsgICAgICAgICAgICAgICAgICAgLyogY3VycmVudCBiaXRzIHRvIGRyb3AgZnJvbSBjb2RlIGZvciBpbmRleCAqL1xuICBsb3cgPSAtMTsgICAgICAgICAgICAgICAgICAgLyogdHJpZ2dlciBuZXcgc3ViLXRhYmxlIHdoZW4gbGVuID4gcm9vdCAqL1xuICB1c2VkID0gMSA8PCByb290OyAgICAgICAgICAvKiB1c2Ugcm9vdCB0YWJsZSBlbnRyaWVzICovXG4gIG1hc2sgPSB1c2VkIC0gMTsgICAgICAgICAgICAvKiBtYXNrIGZvciBjb21wYXJpbmcgbG93ICovXG5cbiAgLyogY2hlY2sgYXZhaWxhYmxlIHRhYmxlIHNwYWNlICovXG4gIGlmICgodHlwZSA9PT0gTEVOUyAmJiB1c2VkID4gRU5PVUdIX0xFTlMpIHx8XG4gICAgKHR5cGUgPT09IERJU1RTICYmIHVzZWQgPiBFTk9VR0hfRElTVFMpKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICB2YXIgaT0wO1xuICAvKiBwcm9jZXNzIGFsbCBjb2RlcyBhbmQgbWFrZSB0YWJsZSBlbnRyaWVzICovXG4gIGZvciAoOzspIHtcbiAgICBpKys7XG4gICAgLyogY3JlYXRlIHRhYmxlIGVudHJ5ICovXG4gICAgaGVyZV9iaXRzID0gbGVuIC0gZHJvcDtcbiAgICBpZiAod29ya1tzeW1dIDwgZW5kKSB7XG4gICAgICBoZXJlX29wID0gMDtcbiAgICAgIGhlcmVfdmFsID0gd29ya1tzeW1dO1xuICAgIH1cbiAgICBlbHNlIGlmICh3b3JrW3N5bV0gPiBlbmQpIHtcbiAgICAgIGhlcmVfb3AgPSBleHRyYVtleHRyYV9pbmRleCArIHdvcmtbc3ltXV07XG4gICAgICBoZXJlX3ZhbCA9IGJhc2VbYmFzZV9pbmRleCArIHdvcmtbc3ltXV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaGVyZV9vcCA9IDMyICsgNjQ7ICAgICAgICAgLyogZW5kIG9mIGJsb2NrICovXG4gICAgICBoZXJlX3ZhbCA9IDA7XG4gICAgfVxuXG4gICAgLyogcmVwbGljYXRlIGZvciB0aG9zZSBpbmRpY2VzIHdpdGggbG93IGxlbiBiaXRzIGVxdWFsIHRvIGh1ZmYgKi9cbiAgICBpbmNyID0gMSA8PCAobGVuIC0gZHJvcCk7XG4gICAgZmlsbCA9IDEgPDwgY3VycjtcbiAgICBtaW4gPSBmaWxsOyAgICAgICAgICAgICAgICAgLyogc2F2ZSBvZmZzZXQgdG8gbmV4dCB0YWJsZSAqL1xuICAgIGRvIHtcbiAgICAgIGZpbGwgLT0gaW5jcjtcbiAgICAgIHRhYmxlW25leHQgKyAoaHVmZiA+PiBkcm9wKSArIGZpbGxdID0gKGhlcmVfYml0cyA8PCAyNCkgfCAoaGVyZV9vcCA8PCAxNikgfCBoZXJlX3ZhbCB8MDtcbiAgICB9IHdoaWxlIChmaWxsICE9PSAwKTtcblxuICAgIC8qIGJhY2t3YXJkcyBpbmNyZW1lbnQgdGhlIGxlbi1iaXQgY29kZSBodWZmICovXG4gICAgaW5jciA9IDEgPDwgKGxlbiAtIDEpO1xuICAgIHdoaWxlIChodWZmICYgaW5jcikge1xuICAgICAgaW5jciA+Pj0gMTtcbiAgICB9XG4gICAgaWYgKGluY3IgIT09IDApIHtcbiAgICAgIGh1ZmYgJj0gaW5jciAtIDE7XG4gICAgICBodWZmICs9IGluY3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGh1ZmYgPSAwO1xuICAgIH1cblxuICAgIC8qIGdvIHRvIG5leHQgc3ltYm9sLCB1cGRhdGUgY291bnQsIGxlbiAqL1xuICAgIHN5bSsrO1xuICAgIGlmICgtLShjb3VudFtsZW5dKSA9PT0gMCkge1xuICAgICAgaWYgKGxlbiA9PT0gbWF4KSB7IGJyZWFrOyB9XG4gICAgICBsZW4gPSBsZW5zW2xlbnNfaW5kZXggKyB3b3JrW3N5bV1dO1xuICAgIH1cblxuICAgIC8qIGNyZWF0ZSBuZXcgc3ViLXRhYmxlIGlmIG5lZWRlZCAqL1xuICAgIGlmIChsZW4gPiByb290ICYmIChodWZmICYgbWFzaykgIT09IGxvdykge1xuICAgICAgLyogaWYgZmlyc3QgdGltZSwgdHJhbnNpdGlvbiB0byBzdWItdGFibGVzICovXG4gICAgICBpZiAoZHJvcCA9PT0gMCkge1xuICAgICAgICBkcm9wID0gcm9vdDtcbiAgICAgIH1cblxuICAgICAgLyogaW5jcmVtZW50IHBhc3QgbGFzdCB0YWJsZSAqL1xuICAgICAgbmV4dCArPSBtaW47ICAgICAgICAgICAgLyogaGVyZSBtaW4gaXMgMSA8PCBjdXJyICovXG5cbiAgICAgIC8qIGRldGVybWluZSBsZW5ndGggb2YgbmV4dCB0YWJsZSAqL1xuICAgICAgY3VyciA9IGxlbiAtIGRyb3A7XG4gICAgICBsZWZ0ID0gMSA8PCBjdXJyO1xuICAgICAgd2hpbGUgKGN1cnIgKyBkcm9wIDwgbWF4KSB7XG4gICAgICAgIGxlZnQgLT0gY291bnRbY3VyciArIGRyb3BdO1xuICAgICAgICBpZiAobGVmdCA8PSAwKSB7IGJyZWFrOyB9XG4gICAgICAgIGN1cnIrKztcbiAgICAgICAgbGVmdCA8PD0gMTtcbiAgICAgIH1cblxuICAgICAgLyogY2hlY2sgZm9yIGVub3VnaCBzcGFjZSAqL1xuICAgICAgdXNlZCArPSAxIDw8IGN1cnI7XG4gICAgICBpZiAoKHR5cGUgPT09IExFTlMgJiYgdXNlZCA+IEVOT1VHSF9MRU5TKSB8fFxuICAgICAgICAodHlwZSA9PT0gRElTVFMgJiYgdXNlZCA+IEVOT1VHSF9ESVNUUykpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG5cbiAgICAgIC8qIHBvaW50IGVudHJ5IGluIHJvb3QgdGFibGUgdG8gc3ViLXRhYmxlICovXG4gICAgICBsb3cgPSBodWZmICYgbWFzaztcbiAgICAgIC8qdGFibGUub3BbbG93XSA9IGN1cnI7XG4gICAgICB0YWJsZS5iaXRzW2xvd10gPSByb290O1xuICAgICAgdGFibGUudmFsW2xvd10gPSBuZXh0IC0gb3B0cy50YWJsZV9pbmRleDsqL1xuICAgICAgdGFibGVbbG93XSA9IChyb290IDw8IDI0KSB8IChjdXJyIDw8IDE2KSB8IChuZXh0IC0gdGFibGVfaW5kZXgpIHwwO1xuICAgIH1cbiAgfVxuXG4gIC8qIGZpbGwgaW4gcmVtYWluaW5nIHRhYmxlIGVudHJ5IGlmIGNvZGUgaXMgaW5jb21wbGV0ZSAoZ3VhcmFudGVlZCB0byBoYXZlXG4gICBhdCBtb3N0IG9uZSByZW1haW5pbmcgZW50cnksIHNpbmNlIGlmIHRoZSBjb2RlIGlzIGluY29tcGxldGUsIHRoZVxuICAgbWF4aW11bSBjb2RlIGxlbmd0aCB0aGF0IHdhcyBhbGxvd2VkIHRvIGdldCB0aGlzIGZhciBpcyBvbmUgYml0KSAqL1xuICBpZiAoaHVmZiAhPT0gMCkge1xuICAgIC8vdGFibGUub3BbbmV4dCArIGh1ZmZdID0gNjQ7ICAgICAgICAgICAgLyogaW52YWxpZCBjb2RlIG1hcmtlciAqL1xuICAgIC8vdGFibGUuYml0c1tuZXh0ICsgaHVmZl0gPSBsZW4gLSBkcm9wO1xuICAgIC8vdGFibGUudmFsW25leHQgKyBodWZmXSA9IDA7XG4gICAgdGFibGVbbmV4dCArIGh1ZmZdID0gKChsZW4gLSBkcm9wKSA8PCAyNCkgfCAoNjQgPDwgMTYpIHwwO1xuICB9XG5cbiAgLyogc2V0IHJldHVybiBwYXJhbWV0ZXJzICovXG4gIC8vb3B0cy50YWJsZV9pbmRleCArPSB1c2VkO1xuICBvcHRzLmJpdHMgPSByb290O1xuICByZXR1cm4gMDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAnMic6ICAgICduZWVkIGRpY3Rpb25hcnknLCAgICAgLyogWl9ORUVEX0RJQ1QgICAgICAgMiAgKi9cbiAgJzEnOiAgICAnc3RyZWFtIGVuZCcsICAgICAgICAgIC8qIFpfU1RSRUFNX0VORCAgICAgIDEgICovXG4gICcwJzogICAgJycsICAgICAgICAgICAgICAgICAgICAvKiBaX09LICAgICAgICAgICAgICAwICAqL1xuICAnLTEnOiAgICdmaWxlIGVycm9yJywgICAgICAgICAgLyogWl9FUlJOTyAgICAgICAgICgtMSkgKi9cbiAgJy0yJzogICAnc3RyZWFtIGVycm9yJywgICAgICAgIC8qIFpfU1RSRUFNX0VSUk9SICAoLTIpICovXG4gICctMyc6ICAgJ2RhdGEgZXJyb3InLCAgICAgICAgICAvKiBaX0RBVEFfRVJST1IgICAgKC0zKSAqL1xuICAnLTQnOiAgICdpbnN1ZmZpY2llbnQgbWVtb3J5JywgLyogWl9NRU1fRVJST1IgICAgICgtNCkgKi9cbiAgJy01JzogICAnYnVmZmVyIGVycm9yJywgICAgICAgIC8qIFpfQlVGX0VSUk9SICAgICAoLTUpICovXG4gICctNic6ICAgJ2luY29tcGF0aWJsZSB2ZXJzaW9uJyAvKiBaX1ZFUlNJT05fRVJST1IgKC02KSAqL1xufTsiLCIndXNlIHN0cmljdCc7XG5cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMvY29tbW9uJyk7XG5cbi8qIFB1YmxpYyBjb25zdGFudHMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xuXG5cbi8vdmFyIFpfRklMVEVSRUQgICAgICAgICAgPSAxO1xuLy92YXIgWl9IVUZGTUFOX09OTFkgICAgICA9IDI7XG4vL3ZhciBaX1JMRSAgICAgICAgICAgICAgID0gMztcbnZhciBaX0ZJWEVEICAgICAgICAgICAgICAgPSA0O1xuLy92YXIgWl9ERUZBVUxUX1NUUkFURUdZICA9IDA7XG5cbi8qIFBvc3NpYmxlIHZhbHVlcyBvZiB0aGUgZGF0YV90eXBlIGZpZWxkICh0aG91Z2ggc2VlIGluZmxhdGUoKSkgKi9cbnZhciBaX0JJTkFSWSAgICAgICAgICAgICAgPSAwO1xudmFyIFpfVEVYVCAgICAgICAgICAgICAgICA9IDE7XG4vL3ZhciBaX0FTQ0lJICAgICAgICAgICAgID0gMTsgLy8gPSBaX1RFWFRcbnZhciBaX1VOS05PV04gICAgICAgICAgICAgPSAyO1xuXG4vKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xuXG5cbmZ1bmN0aW9uIHplcm8oYnVmKSB7IHZhciBsZW4gPSBidWYubGVuZ3RoOyB3aGlsZSAoLS1sZW4gPj0gMCkgeyBidWZbbGVuXSA9IDA7IH0gfVxuXG4vLyBGcm9tIHp1dGlsLmhcblxudmFyIFNUT1JFRF9CTE9DSyA9IDA7XG52YXIgU1RBVElDX1RSRUVTID0gMTtcbnZhciBEWU5fVFJFRVMgICAgPSAyO1xuLyogVGhlIHRocmVlIGtpbmRzIG9mIGJsb2NrIHR5cGUgKi9cblxudmFyIE1JTl9NQVRDSCAgICA9IDM7XG52YXIgTUFYX01BVENIICAgID0gMjU4O1xuLyogVGhlIG1pbmltdW0gYW5kIG1heGltdW0gbWF0Y2ggbGVuZ3RocyAqL1xuXG4vLyBGcm9tIGRlZmxhdGUuaFxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBJbnRlcm5hbCBjb21wcmVzc2lvbiBzdGF0ZS5cbiAqL1xuXG52YXIgTEVOR1RIX0NPREVTICA9IDI5O1xuLyogbnVtYmVyIG9mIGxlbmd0aCBjb2Rlcywgbm90IGNvdW50aW5nIHRoZSBzcGVjaWFsIEVORF9CTE9DSyBjb2RlICovXG5cbnZhciBMSVRFUkFMUyAgICAgID0gMjU2O1xuLyogbnVtYmVyIG9mIGxpdGVyYWwgYnl0ZXMgMC4uMjU1ICovXG5cbnZhciBMX0NPREVTICAgICAgID0gTElURVJBTFMgKyAxICsgTEVOR1RIX0NPREVTO1xuLyogbnVtYmVyIG9mIExpdGVyYWwgb3IgTGVuZ3RoIGNvZGVzLCBpbmNsdWRpbmcgdGhlIEVORF9CTE9DSyBjb2RlICovXG5cbnZhciBEX0NPREVTICAgICAgID0gMzA7XG4vKiBudW1iZXIgb2YgZGlzdGFuY2UgY29kZXMgKi9cblxudmFyIEJMX0NPREVTICAgICAgPSAxOTtcbi8qIG51bWJlciBvZiBjb2RlcyB1c2VkIHRvIHRyYW5zZmVyIHRoZSBiaXQgbGVuZ3RocyAqL1xuXG52YXIgSEVBUF9TSVpFICAgICA9IDIqTF9DT0RFUyArIDE7XG4vKiBtYXhpbXVtIGhlYXAgc2l6ZSAqL1xuXG52YXIgTUFYX0JJVFMgICAgICA9IDE1O1xuLyogQWxsIGNvZGVzIG11c3Qgbm90IGV4Y2VlZCBNQVhfQklUUyBiaXRzICovXG5cbnZhciBCdWZfc2l6ZSAgICAgID0gMTY7XG4vKiBzaXplIG9mIGJpdCBidWZmZXIgaW4gYmlfYnVmICovXG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb25zdGFudHNcbiAqL1xuXG52YXIgTUFYX0JMX0JJVFMgPSA3O1xuLyogQml0IGxlbmd0aCBjb2RlcyBtdXN0IG5vdCBleGNlZWQgTUFYX0JMX0JJVFMgYml0cyAqL1xuXG52YXIgRU5EX0JMT0NLICAgPSAyNTY7XG4vKiBlbmQgb2YgYmxvY2sgbGl0ZXJhbCBjb2RlICovXG5cbnZhciBSRVBfM182ICAgICA9IDE2O1xuLyogcmVwZWF0IHByZXZpb3VzIGJpdCBsZW5ndGggMy02IHRpbWVzICgyIGJpdHMgb2YgcmVwZWF0IGNvdW50KSAqL1xuXG52YXIgUkVQWl8zXzEwICAgPSAxNztcbi8qIHJlcGVhdCBhIHplcm8gbGVuZ3RoIDMtMTAgdGltZXMgICgzIGJpdHMgb2YgcmVwZWF0IGNvdW50KSAqL1xuXG52YXIgUkVQWl8xMV8xMzggPSAxODtcbi8qIHJlcGVhdCBhIHplcm8gbGVuZ3RoIDExLTEzOCB0aW1lcyAgKDcgYml0cyBvZiByZXBlYXQgY291bnQpICovXG5cbnZhciBleHRyYV9sYml0cyA9ICAgLyogZXh0cmEgYml0cyBmb3IgZWFjaCBsZW5ndGggY29kZSAqL1xuICBbMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMiwyLDIsMiwzLDMsMywzLDQsNCw0LDQsNSw1LDUsNSwwXTtcblxudmFyIGV4dHJhX2RiaXRzID0gICAvKiBleHRyYSBiaXRzIGZvciBlYWNoIGRpc3RhbmNlIGNvZGUgKi9cbiAgWzAsMCwwLDAsMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3LDgsOCw5LDksMTAsMTAsMTEsMTEsMTIsMTIsMTMsMTNdO1xuXG52YXIgZXh0cmFfYmxiaXRzID0gIC8qIGV4dHJhIGJpdHMgZm9yIGVhY2ggYml0IGxlbmd0aCBjb2RlICovXG4gIFswLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDIsMyw3XTtcblxudmFyIGJsX29yZGVyID1cbiAgWzE2LDE3LDE4LDAsOCw3LDksNiwxMCw1LDExLDQsMTIsMywxMywyLDE0LDEsMTVdO1xuLyogVGhlIGxlbmd0aHMgb2YgdGhlIGJpdCBsZW5ndGggY29kZXMgYXJlIHNlbnQgaW4gb3JkZXIgb2YgZGVjcmVhc2luZ1xuICogcHJvYmFiaWxpdHksIHRvIGF2b2lkIHRyYW5zbWl0dGluZyB0aGUgbGVuZ3RocyBmb3IgdW51c2VkIGJpdCBsZW5ndGggY29kZXMuXG4gKi9cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBMb2NhbCBkYXRhLiBUaGVzZSBhcmUgaW5pdGlhbGl6ZWQgb25seSBvbmNlLlxuICovXG5cbi8vIFdlIHByZS1maWxsIGFycmF5cyB3aXRoIDAgdG8gYXZvaWQgdW5pbml0aWFsaXplZCBnYXBzXG5cbnZhciBESVNUX0NPREVfTEVOID0gNTEyOyAvKiBzZWUgZGVmaW5pdGlvbiBvZiBhcnJheSBkaXN0X2NvZGUgYmVsb3cgKi9cblxuLy8gISEhISBVc2UgZmxhdCBhcnJheSBpbnNkZWFkIG9mIHN0cnVjdHVyZSwgRnJlcSA9IGkqMiwgTGVuID0gaSoyKzFcbnZhciBzdGF0aWNfbHRyZWUgID0gbmV3IEFycmF5KChMX0NPREVTKzIpICogMik7XG56ZXJvKHN0YXRpY19sdHJlZSk7XG4vKiBUaGUgc3RhdGljIGxpdGVyYWwgdHJlZS4gU2luY2UgdGhlIGJpdCBsZW5ndGhzIGFyZSBpbXBvc2VkLCB0aGVyZSBpcyBub1xuICogbmVlZCBmb3IgdGhlIExfQ09ERVMgZXh0cmEgY29kZXMgdXNlZCBkdXJpbmcgaGVhcCBjb25zdHJ1Y3Rpb24uIEhvd2V2ZXJcbiAqIFRoZSBjb2RlcyAyODYgYW5kIDI4NyBhcmUgbmVlZGVkIHRvIGJ1aWxkIGEgY2Fub25pY2FsIHRyZWUgKHNlZSBfdHJfaW5pdFxuICogYmVsb3cpLlxuICovXG5cbnZhciBzdGF0aWNfZHRyZWUgID0gbmV3IEFycmF5KERfQ09ERVMgKiAyKTtcbnplcm8oc3RhdGljX2R0cmVlKTtcbi8qIFRoZSBzdGF0aWMgZGlzdGFuY2UgdHJlZS4gKEFjdHVhbGx5IGEgdHJpdmlhbCB0cmVlIHNpbmNlIGFsbCBjb2RlcyB1c2VcbiAqIDUgYml0cy4pXG4gKi9cblxudmFyIF9kaXN0X2NvZGUgICAgPSBuZXcgQXJyYXkoRElTVF9DT0RFX0xFTik7XG56ZXJvKF9kaXN0X2NvZGUpO1xuLyogRGlzdGFuY2UgY29kZXMuIFRoZSBmaXJzdCAyNTYgdmFsdWVzIGNvcnJlc3BvbmQgdG8gdGhlIGRpc3RhbmNlc1xuICogMyAuLiAyNTgsIHRoZSBsYXN0IDI1NiB2YWx1ZXMgY29ycmVzcG9uZCB0byB0aGUgdG9wIDggYml0cyBvZlxuICogdGhlIDE1IGJpdCBkaXN0YW5jZXMuXG4gKi9cblxudmFyIF9sZW5ndGhfY29kZSAgPSBuZXcgQXJyYXkoTUFYX01BVENILU1JTl9NQVRDSCsxKTtcbnplcm8oX2xlbmd0aF9jb2RlKTtcbi8qIGxlbmd0aCBjb2RlIGZvciBlYWNoIG5vcm1hbGl6ZWQgbWF0Y2ggbGVuZ3RoICgwID09IE1JTl9NQVRDSCkgKi9cblxudmFyIGJhc2VfbGVuZ3RoICAgPSBuZXcgQXJyYXkoTEVOR1RIX0NPREVTKTtcbnplcm8oYmFzZV9sZW5ndGgpO1xuLyogRmlyc3Qgbm9ybWFsaXplZCBsZW5ndGggZm9yIGVhY2ggY29kZSAoMCA9IE1JTl9NQVRDSCkgKi9cblxudmFyIGJhc2VfZGlzdCAgICAgPSBuZXcgQXJyYXkoRF9DT0RFUyk7XG56ZXJvKGJhc2VfZGlzdCk7XG4vKiBGaXJzdCBub3JtYWxpemVkIGRpc3RhbmNlIGZvciBlYWNoIGNvZGUgKDAgPSBkaXN0YW5jZSBvZiAxKSAqL1xuXG5cbnZhciBTdGF0aWNUcmVlRGVzYyA9IGZ1bmN0aW9uIChzdGF0aWNfdHJlZSwgZXh0cmFfYml0cywgZXh0cmFfYmFzZSwgZWxlbXMsIG1heF9sZW5ndGgpIHtcblxuICB0aGlzLnN0YXRpY190cmVlICA9IHN0YXRpY190cmVlOyAgLyogc3RhdGljIHRyZWUgb3IgTlVMTCAqL1xuICB0aGlzLmV4dHJhX2JpdHMgICA9IGV4dHJhX2JpdHM7ICAgLyogZXh0cmEgYml0cyBmb3IgZWFjaCBjb2RlIG9yIE5VTEwgKi9cbiAgdGhpcy5leHRyYV9iYXNlICAgPSBleHRyYV9iYXNlOyAgIC8qIGJhc2UgaW5kZXggZm9yIGV4dHJhX2JpdHMgKi9cbiAgdGhpcy5lbGVtcyAgICAgICAgPSBlbGVtczsgICAgICAgIC8qIG1heCBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIHRyZWUgKi9cbiAgdGhpcy5tYXhfbGVuZ3RoICAgPSBtYXhfbGVuZ3RoOyAgIC8qIG1heCBiaXQgbGVuZ3RoIGZvciB0aGUgY29kZXMgKi9cblxuICAvLyBzaG93IGlmIGBzdGF0aWNfdHJlZWAgaGFzIGRhdGEgb3IgZHVtbXkgLSBuZWVkZWQgZm9yIG1vbm9tb3JwaGljIG9iamVjdHNcbiAgdGhpcy5oYXNfc3RyZWUgICAgPSBzdGF0aWNfdHJlZSAmJiBzdGF0aWNfdHJlZS5sZW5ndGg7XG59O1xuXG5cbnZhciBzdGF0aWNfbF9kZXNjO1xudmFyIHN0YXRpY19kX2Rlc2M7XG52YXIgc3RhdGljX2JsX2Rlc2M7XG5cblxudmFyIFRyZWVEZXNjID0gZnVuY3Rpb24oZHluX3RyZWUsIHN0YXRfZGVzYykge1xuICB0aGlzLmR5bl90cmVlID0gZHluX3RyZWU7ICAgICAvKiB0aGUgZHluYW1pYyB0cmVlICovXG4gIHRoaXMubWF4X2NvZGUgPSAwOyAgICAgICAgICAgIC8qIGxhcmdlc3QgY29kZSB3aXRoIG5vbiB6ZXJvIGZyZXF1ZW5jeSAqL1xuICB0aGlzLnN0YXRfZGVzYyA9IHN0YXRfZGVzYzsgICAvKiB0aGUgY29ycmVzcG9uZGluZyBzdGF0aWMgdHJlZSAqL1xufTtcblxuXG5cbmZ1bmN0aW9uIGRfY29kZShkaXN0KSB7XG4gIHJldHVybiBkaXN0IDwgMjU2ID8gX2Rpc3RfY29kZVtkaXN0XSA6IF9kaXN0X2NvZGVbMjU2ICsgKGRpc3QgPj4+IDcpXTtcbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIE91dHB1dCBhIHNob3J0IExTQiBmaXJzdCBvbiB0aGUgc3RyZWFtLlxuICogSU4gYXNzZXJ0aW9uOiB0aGVyZSBpcyBlbm91Z2ggcm9vbSBpbiBwZW5kaW5nQnVmLlxuICovXG5mdW5jdGlvbiBwdXRfc2hvcnQgKHMsIHcpIHtcbi8vICAgIHB1dF9ieXRlKHMsICh1Y2gpKCh3KSAmIDB4ZmYpKTtcbi8vICAgIHB1dF9ieXRlKHMsICh1Y2gpKCh1c2gpKHcpID4+IDgpKTtcbiAgcy5wZW5kaW5nX2J1ZltzLnBlbmRpbmcrK10gPSAodykgJiAweGZmO1xuICBzLnBlbmRpbmdfYnVmW3MucGVuZGluZysrXSA9ICh3ID4+PiA4KSAmIDB4ZmY7XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBTZW5kIGEgdmFsdWUgb24gYSBnaXZlbiBudW1iZXIgb2YgYml0cy5cbiAqIElOIGFzc2VydGlvbjogbGVuZ3RoIDw9IDE2IGFuZCB2YWx1ZSBmaXRzIGluIGxlbmd0aCBiaXRzLlxuICovXG5mdW5jdGlvbiBzZW5kX2JpdHMocywgdmFsdWUsIGxlbmd0aCkge1xuICBpZiAocy5iaV92YWxpZCA+IChCdWZfc2l6ZSAtIGxlbmd0aCkpIHtcbiAgICBzLmJpX2J1ZiB8PSAodmFsdWUgPDwgcy5iaV92YWxpZCkgJiAweGZmZmY7XG4gICAgcHV0X3Nob3J0KHMsIHMuYmlfYnVmKTtcbiAgICBzLmJpX2J1ZiA9IHZhbHVlID4+IChCdWZfc2l6ZSAtIHMuYmlfdmFsaWQpO1xuICAgIHMuYmlfdmFsaWQgKz0gbGVuZ3RoIC0gQnVmX3NpemU7XG4gIH0gZWxzZSB7XG4gICAgcy5iaV9idWYgfD0gKHZhbHVlIDw8IHMuYmlfdmFsaWQpICYgMHhmZmZmO1xuICAgIHMuYmlfdmFsaWQgKz0gbGVuZ3RoO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc2VuZF9jb2RlKHMsIGMsIHRyZWUpIHtcbiAgc2VuZF9iaXRzKHMsIHRyZWVbYyoyXS8qLkNvZGUqLywgdHJlZVtjKjIgKyAxXS8qLkxlbiovKTtcbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFJldmVyc2UgdGhlIGZpcnN0IGxlbiBiaXRzIG9mIGEgY29kZSwgdXNpbmcgc3RyYWlnaHRmb3J3YXJkIGNvZGUgKGEgZmFzdGVyXG4gKiBtZXRob2Qgd291bGQgdXNlIGEgdGFibGUpXG4gKiBJTiBhc3NlcnRpb246IDEgPD0gbGVuIDw9IDE1XG4gKi9cbmZ1bmN0aW9uIGJpX3JldmVyc2UoY29kZSwgbGVuKSB7XG4gIHZhciByZXMgPSAwO1xuICBkbyB7XG4gICAgcmVzIHw9IGNvZGUgJiAxO1xuICAgIGNvZGUgPj4+PSAxO1xuICAgIHJlcyA8PD0gMTtcbiAgfSB3aGlsZSAoLS1sZW4gPiAwKTtcbiAgcmV0dXJuIHJlcyA+Pj4gMTtcbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZsdXNoIHRoZSBiaXQgYnVmZmVyLCBrZWVwaW5nIGF0IG1vc3QgNyBiaXRzIGluIGl0LlxuICovXG5mdW5jdGlvbiBiaV9mbHVzaChzKSB7XG4gIGlmIChzLmJpX3ZhbGlkID09PSAxNikge1xuICAgIHB1dF9zaG9ydChzLCBzLmJpX2J1Zik7XG4gICAgcy5iaV9idWYgPSAwO1xuICAgIHMuYmlfdmFsaWQgPSAwO1xuXG4gIH0gZWxzZSBpZiAocy5iaV92YWxpZCA+PSA4KSB7XG4gICAgcy5wZW5kaW5nX2J1ZltzLnBlbmRpbmcrK10gPSBzLmJpX2J1ZiAmIDB4ZmY7XG4gICAgcy5iaV9idWYgPj49IDg7XG4gICAgcy5iaV92YWxpZCAtPSA4O1xuICB9XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb21wdXRlIHRoZSBvcHRpbWFsIGJpdCBsZW5ndGhzIGZvciBhIHRyZWUgYW5kIHVwZGF0ZSB0aGUgdG90YWwgYml0IGxlbmd0aFxuICogZm9yIHRoZSBjdXJyZW50IGJsb2NrLlxuICogSU4gYXNzZXJ0aW9uOiB0aGUgZmllbGRzIGZyZXEgYW5kIGRhZCBhcmUgc2V0LCBoZWFwW2hlYXBfbWF4XSBhbmRcbiAqICAgIGFib3ZlIGFyZSB0aGUgdHJlZSBub2RlcyBzb3J0ZWQgYnkgaW5jcmVhc2luZyBmcmVxdWVuY3kuXG4gKiBPVVQgYXNzZXJ0aW9uczogdGhlIGZpZWxkIGxlbiBpcyBzZXQgdG8gdGhlIG9wdGltYWwgYml0IGxlbmd0aCwgdGhlXG4gKiAgICAgYXJyYXkgYmxfY291bnQgY29udGFpbnMgdGhlIGZyZXF1ZW5jaWVzIGZvciBlYWNoIGJpdCBsZW5ndGguXG4gKiAgICAgVGhlIGxlbmd0aCBvcHRfbGVuIGlzIHVwZGF0ZWQ7IHN0YXRpY19sZW4gaXMgYWxzbyB1cGRhdGVkIGlmIHN0cmVlIGlzXG4gKiAgICAgbm90IG51bGwuXG4gKi9cbmZ1bmN0aW9uIGdlbl9iaXRsZW4ocywgZGVzYylcbi8vICAgIGRlZmxhdGVfc3RhdGUgKnM7XG4vLyAgICB0cmVlX2Rlc2MgKmRlc2M7ICAgIC8qIHRoZSB0cmVlIGRlc2NyaXB0b3IgKi9cbntcbiAgdmFyIHRyZWUgICAgICAgICAgICA9IGRlc2MuZHluX3RyZWU7XG4gIHZhciBtYXhfY29kZSAgICAgICAgPSBkZXNjLm1heF9jb2RlO1xuICB2YXIgc3RyZWUgICAgICAgICAgID0gZGVzYy5zdGF0X2Rlc2Muc3RhdGljX3RyZWU7XG4gIHZhciBoYXNfc3RyZWUgICAgICAgPSBkZXNjLnN0YXRfZGVzYy5oYXNfc3RyZWU7XG4gIHZhciBleHRyYSAgICAgICAgICAgPSBkZXNjLnN0YXRfZGVzYy5leHRyYV9iaXRzO1xuICB2YXIgYmFzZSAgICAgICAgICAgID0gZGVzYy5zdGF0X2Rlc2MuZXh0cmFfYmFzZTtcbiAgdmFyIG1heF9sZW5ndGggICAgICA9IGRlc2Muc3RhdF9kZXNjLm1heF9sZW5ndGg7XG4gIHZhciBoOyAgICAgICAgICAgICAgLyogaGVhcCBpbmRleCAqL1xuICB2YXIgbiwgbTsgICAgICAgICAgIC8qIGl0ZXJhdGUgb3ZlciB0aGUgdHJlZSBlbGVtZW50cyAqL1xuICB2YXIgYml0czsgICAgICAgICAgIC8qIGJpdCBsZW5ndGggKi9cbiAgdmFyIHhiaXRzOyAgICAgICAgICAvKiBleHRyYSBiaXRzICovXG4gIHZhciBmOyAgICAgICAgICAgICAgLyogZnJlcXVlbmN5ICovXG4gIHZhciBvdmVyZmxvdyA9IDA7ICAgLyogbnVtYmVyIG9mIGVsZW1lbnRzIHdpdGggYml0IGxlbmd0aCB0b28gbGFyZ2UgKi9cblxuICBmb3IgKGJpdHMgPSAwOyBiaXRzIDw9IE1BWF9CSVRTOyBiaXRzKyspIHtcbiAgICBzLmJsX2NvdW50W2JpdHNdID0gMDtcbiAgfVxuXG4gIC8qIEluIGEgZmlyc3QgcGFzcywgY29tcHV0ZSB0aGUgb3B0aW1hbCBiaXQgbGVuZ3RocyAod2hpY2ggbWF5XG4gICAqIG92ZXJmbG93IGluIHRoZSBjYXNlIG9mIHRoZSBiaXQgbGVuZ3RoIHRyZWUpLlxuICAgKi9cbiAgdHJlZVtzLmhlYXBbcy5oZWFwX21heF0qMiArIDFdLyouTGVuKi8gPSAwOyAvKiByb290IG9mIHRoZSBoZWFwICovXG5cbiAgZm9yIChoID0gcy5oZWFwX21heCsxOyBoIDwgSEVBUF9TSVpFOyBoKyspIHtcbiAgICBuID0gcy5oZWFwW2hdO1xuICAgIGJpdHMgPSB0cmVlW3RyZWVbbioyICsxXS8qLkRhZCovICogMiArIDFdLyouTGVuKi8gKyAxO1xuICAgIGlmIChiaXRzID4gbWF4X2xlbmd0aCkge1xuICAgICAgYml0cyA9IG1heF9sZW5ndGg7XG4gICAgICBvdmVyZmxvdysrO1xuICAgIH1cbiAgICB0cmVlW24qMiArIDFdLyouTGVuKi8gPSBiaXRzO1xuICAgIC8qIFdlIG92ZXJ3cml0ZSB0cmVlW25dLkRhZCB3aGljaCBpcyBubyBsb25nZXIgbmVlZGVkICovXG5cbiAgICBpZiAobiA+IG1heF9jb2RlKSB7IGNvbnRpbnVlOyB9IC8qIG5vdCBhIGxlYWYgbm9kZSAqL1xuXG4gICAgcy5ibF9jb3VudFtiaXRzXSsrO1xuICAgIHhiaXRzID0gMDtcbiAgICBpZiAobiA+PSBiYXNlKSB7XG4gICAgICB4Yml0cyA9IGV4dHJhW24tYmFzZV07XG4gICAgfVxuICAgIGYgPSB0cmVlW24gKiAyXS8qLkZyZXEqLztcbiAgICBzLm9wdF9sZW4gKz0gZiAqIChiaXRzICsgeGJpdHMpO1xuICAgIGlmIChoYXNfc3RyZWUpIHtcbiAgICAgIHMuc3RhdGljX2xlbiArPSBmICogKHN0cmVlW24qMiArIDFdLyouTGVuKi8gKyB4Yml0cyk7XG4gICAgfVxuICB9XG4gIGlmIChvdmVyZmxvdyA9PT0gMCkgeyByZXR1cm47IH1cblxuICAvLyBUcmFjZSgoc3RkZXJyLFwiXFxuYml0IGxlbmd0aCBvdmVyZmxvd1xcblwiKSk7XG4gIC8qIFRoaXMgaGFwcGVucyBmb3IgZXhhbXBsZSBvbiBvYmoyIGFuZCBwaWMgb2YgdGhlIENhbGdhcnkgY29ycHVzICovXG5cbiAgLyogRmluZCB0aGUgZmlyc3QgYml0IGxlbmd0aCB3aGljaCBjb3VsZCBpbmNyZWFzZTogKi9cbiAgZG8ge1xuICAgIGJpdHMgPSBtYXhfbGVuZ3RoLTE7XG4gICAgd2hpbGUgKHMuYmxfY291bnRbYml0c10gPT09IDApIHsgYml0cy0tOyB9XG4gICAgcy5ibF9jb3VudFtiaXRzXS0tOyAgICAgIC8qIG1vdmUgb25lIGxlYWYgZG93biB0aGUgdHJlZSAqL1xuICAgIHMuYmxfY291bnRbYml0cysxXSArPSAyOyAvKiBtb3ZlIG9uZSBvdmVyZmxvdyBpdGVtIGFzIGl0cyBicm90aGVyICovXG4gICAgcy5ibF9jb3VudFttYXhfbGVuZ3RoXS0tO1xuICAgIC8qIFRoZSBicm90aGVyIG9mIHRoZSBvdmVyZmxvdyBpdGVtIGFsc28gbW92ZXMgb25lIHN0ZXAgdXAsXG4gICAgICogYnV0IHRoaXMgZG9lcyBub3QgYWZmZWN0IGJsX2NvdW50W21heF9sZW5ndGhdXG4gICAgICovXG4gICAgb3ZlcmZsb3cgLT0gMjtcbiAgfSB3aGlsZSAob3ZlcmZsb3cgPiAwKTtcblxuICAvKiBOb3cgcmVjb21wdXRlIGFsbCBiaXQgbGVuZ3Rocywgc2Nhbm5pbmcgaW4gaW5jcmVhc2luZyBmcmVxdWVuY3kuXG4gICAqIGggaXMgc3RpbGwgZXF1YWwgdG8gSEVBUF9TSVpFLiAoSXQgaXMgc2ltcGxlciB0byByZWNvbnN0cnVjdCBhbGxcbiAgICogbGVuZ3RocyBpbnN0ZWFkIG9mIGZpeGluZyBvbmx5IHRoZSB3cm9uZyBvbmVzLiBUaGlzIGlkZWEgaXMgdGFrZW5cbiAgICogZnJvbSAnYXInIHdyaXR0ZW4gYnkgSGFydWhpa28gT2t1bXVyYS4pXG4gICAqL1xuICBmb3IgKGJpdHMgPSBtYXhfbGVuZ3RoOyBiaXRzICE9PSAwOyBiaXRzLS0pIHtcbiAgICBuID0gcy5ibF9jb3VudFtiaXRzXTtcbiAgICB3aGlsZSAobiAhPT0gMCkge1xuICAgICAgbSA9IHMuaGVhcFstLWhdO1xuICAgICAgaWYgKG0gPiBtYXhfY29kZSkgeyBjb250aW51ZTsgfVxuICAgICAgaWYgKHRyZWVbbSoyICsgMV0vKi5MZW4qLyAhPT0gYml0cykge1xuICAgICAgICAvLyBUcmFjZSgoc3RkZXJyLFwiY29kZSAlZCBiaXRzICVkLT4lZFxcblwiLCBtLCB0cmVlW21dLkxlbiwgYml0cykpO1xuICAgICAgICBzLm9wdF9sZW4gKz0gKGJpdHMgLSB0cmVlW20qMiArIDFdLyouTGVuKi8pKnRyZWVbbSoyXS8qLkZyZXEqLztcbiAgICAgICAgdHJlZVttKjIgKyAxXS8qLkxlbiovID0gYml0cztcbiAgICAgIH1cbiAgICAgIG4tLTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEdlbmVyYXRlIHRoZSBjb2RlcyBmb3IgYSBnaXZlbiB0cmVlIGFuZCBiaXQgY291bnRzICh3aGljaCBuZWVkIG5vdCBiZVxuICogb3B0aW1hbCkuXG4gKiBJTiBhc3NlcnRpb246IHRoZSBhcnJheSBibF9jb3VudCBjb250YWlucyB0aGUgYml0IGxlbmd0aCBzdGF0aXN0aWNzIGZvclxuICogdGhlIGdpdmVuIHRyZWUgYW5kIHRoZSBmaWVsZCBsZW4gaXMgc2V0IGZvciBhbGwgdHJlZSBlbGVtZW50cy5cbiAqIE9VVCBhc3NlcnRpb246IHRoZSBmaWVsZCBjb2RlIGlzIHNldCBmb3IgYWxsIHRyZWUgZWxlbWVudHMgb2Ygbm9uXG4gKiAgICAgemVybyBjb2RlIGxlbmd0aC5cbiAqL1xuZnVuY3Rpb24gZ2VuX2NvZGVzKHRyZWUsIG1heF9jb2RlLCBibF9jb3VudClcbi8vICAgIGN0X2RhdGEgKnRyZWU7ICAgICAgICAgICAgIC8qIHRoZSB0cmVlIHRvIGRlY29yYXRlICovXG4vLyAgICBpbnQgbWF4X2NvZGU7ICAgICAgICAgICAgICAvKiBsYXJnZXN0IGNvZGUgd2l0aCBub24gemVybyBmcmVxdWVuY3kgKi9cbi8vICAgIHVzaGYgKmJsX2NvdW50OyAgICAgICAgICAgIC8qIG51bWJlciBvZiBjb2RlcyBhdCBlYWNoIGJpdCBsZW5ndGggKi9cbntcbiAgdmFyIG5leHRfY29kZSA9IG5ldyBBcnJheShNQVhfQklUUysxKTsgLyogbmV4dCBjb2RlIHZhbHVlIGZvciBlYWNoIGJpdCBsZW5ndGggKi9cbiAgdmFyIGNvZGUgPSAwOyAgICAgICAgICAgICAgLyogcnVubmluZyBjb2RlIHZhbHVlICovXG4gIHZhciBiaXRzOyAgICAgICAgICAgICAgICAgIC8qIGJpdCBpbmRleCAqL1xuICB2YXIgbjsgICAgICAgICAgICAgICAgICAgICAvKiBjb2RlIGluZGV4ICovXG5cbiAgLyogVGhlIGRpc3RyaWJ1dGlvbiBjb3VudHMgYXJlIGZpcnN0IHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGNvZGUgdmFsdWVzXG4gICAqIHdpdGhvdXQgYml0IHJldmVyc2FsLlxuICAgKi9cbiAgZm9yIChiaXRzID0gMTsgYml0cyA8PSBNQVhfQklUUzsgYml0cysrKSB7XG4gICAgbmV4dF9jb2RlW2JpdHNdID0gY29kZSA9IChjb2RlICsgYmxfY291bnRbYml0cy0xXSkgPDwgMTtcbiAgfVxuICAvKiBDaGVjayB0aGF0IHRoZSBiaXQgY291bnRzIGluIGJsX2NvdW50IGFyZSBjb25zaXN0ZW50LiBUaGUgbGFzdCBjb2RlXG4gICAqIG11c3QgYmUgYWxsIG9uZXMuXG4gICAqL1xuICAvL0Fzc2VydCAoY29kZSArIGJsX2NvdW50W01BWF9CSVRTXS0xID09ICgxPDxNQVhfQklUUyktMSxcbiAgLy8gICAgICAgIFwiaW5jb25zaXN0ZW50IGJpdCBjb3VudHNcIik7XG4gIC8vVHJhY2V2KChzdGRlcnIsXCJcXG5nZW5fY29kZXM6IG1heF9jb2RlICVkIFwiLCBtYXhfY29kZSkpO1xuXG4gIGZvciAobiA9IDA7ICBuIDw9IG1heF9jb2RlOyBuKyspIHtcbiAgICB2YXIgbGVuID0gdHJlZVtuKjIgKyAxXS8qLkxlbiovO1xuICAgIGlmIChsZW4gPT09IDApIHsgY29udGludWU7IH1cbiAgICAvKiBOb3cgcmV2ZXJzZSB0aGUgYml0cyAqL1xuICAgIHRyZWVbbioyXS8qLkNvZGUqLyA9IGJpX3JldmVyc2UobmV4dF9jb2RlW2xlbl0rKywgbGVuKTtcblxuICAgIC8vVHJhY2Vjdih0cmVlICE9IHN0YXRpY19sdHJlZSwgKHN0ZGVycixcIlxcbm4gJTNkICVjIGwgJTJkIGMgJTR4ICgleCkgXCIsXG4gICAgLy8gICAgIG4sIChpc2dyYXBoKG4pID8gbiA6ICcgJyksIGxlbiwgdHJlZVtuXS5Db2RlLCBuZXh0X2NvZGVbbGVuXS0xKSk7XG4gIH1cbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEluaXRpYWxpemUgdGhlIHZhcmlvdXMgJ2NvbnN0YW50JyB0YWJsZXMuXG4gKi9cbmZ1bmN0aW9uIHRyX3N0YXRpY19pbml0KCkge1xuICB2YXIgbjsgICAgICAgIC8qIGl0ZXJhdGVzIG92ZXIgdHJlZSBlbGVtZW50cyAqL1xuICB2YXIgYml0czsgICAgIC8qIGJpdCBjb3VudGVyICovXG4gIHZhciBsZW5ndGg7ICAgLyogbGVuZ3RoIHZhbHVlICovXG4gIHZhciBjb2RlOyAgICAgLyogY29kZSB2YWx1ZSAqL1xuICB2YXIgZGlzdDsgICAgIC8qIGRpc3RhbmNlIGluZGV4ICovXG4gIHZhciBibF9jb3VudCA9IG5ldyBBcnJheShNQVhfQklUUysxKTtcbiAgLyogbnVtYmVyIG9mIGNvZGVzIGF0IGVhY2ggYml0IGxlbmd0aCBmb3IgYW4gb3B0aW1hbCB0cmVlICovXG5cbiAgLy8gZG8gY2hlY2sgaW4gX3RyX2luaXQoKVxuICAvL2lmIChzdGF0aWNfaW5pdF9kb25lKSByZXR1cm47XG5cbiAgLyogRm9yIHNvbWUgZW1iZWRkZWQgdGFyZ2V0cywgZ2xvYmFsIHZhcmlhYmxlcyBhcmUgbm90IGluaXRpYWxpemVkOiAqL1xuLyojaWZkZWYgTk9fSU5JVF9HTE9CQUxfUE9JTlRFUlNcbiAgc3RhdGljX2xfZGVzYy5zdGF0aWNfdHJlZSA9IHN0YXRpY19sdHJlZTtcbiAgc3RhdGljX2xfZGVzYy5leHRyYV9iaXRzID0gZXh0cmFfbGJpdHM7XG4gIHN0YXRpY19kX2Rlc2Muc3RhdGljX3RyZWUgPSBzdGF0aWNfZHRyZWU7XG4gIHN0YXRpY19kX2Rlc2MuZXh0cmFfYml0cyA9IGV4dHJhX2RiaXRzO1xuICBzdGF0aWNfYmxfZGVzYy5leHRyYV9iaXRzID0gZXh0cmFfYmxiaXRzO1xuI2VuZGlmKi9cblxuICAvKiBJbml0aWFsaXplIHRoZSBtYXBwaW5nIGxlbmd0aCAoMC4uMjU1KSAtPiBsZW5ndGggY29kZSAoMC4uMjgpICovXG4gIGxlbmd0aCA9IDA7XG4gIGZvciAoY29kZSA9IDA7IGNvZGUgPCBMRU5HVEhfQ09ERVMtMTsgY29kZSsrKSB7XG4gICAgYmFzZV9sZW5ndGhbY29kZV0gPSBsZW5ndGg7XG4gICAgZm9yIChuID0gMDsgbiA8ICgxPDxleHRyYV9sYml0c1tjb2RlXSk7IG4rKykge1xuICAgICAgX2xlbmd0aF9jb2RlW2xlbmd0aCsrXSA9IGNvZGU7XG4gICAgfVxuICB9XG4gIC8vQXNzZXJ0IChsZW5ndGggPT0gMjU2LCBcInRyX3N0YXRpY19pbml0OiBsZW5ndGggIT0gMjU2XCIpO1xuICAvKiBOb3RlIHRoYXQgdGhlIGxlbmd0aCAyNTUgKG1hdGNoIGxlbmd0aCAyNTgpIGNhbiBiZSByZXByZXNlbnRlZFxuICAgKiBpbiB0d28gZGlmZmVyZW50IHdheXM6IGNvZGUgMjg0ICsgNSBiaXRzIG9yIGNvZGUgMjg1LCBzbyB3ZVxuICAgKiBvdmVyd3JpdGUgbGVuZ3RoX2NvZGVbMjU1XSB0byB1c2UgdGhlIGJlc3QgZW5jb2Rpbmc6XG4gICAqL1xuICBfbGVuZ3RoX2NvZGVbbGVuZ3RoLTFdID0gY29kZTtcblxuICAvKiBJbml0aWFsaXplIHRoZSBtYXBwaW5nIGRpc3QgKDAuLjMySykgLT4gZGlzdCBjb2RlICgwLi4yOSkgKi9cbiAgZGlzdCA9IDA7XG4gIGZvciAoY29kZSA9IDAgOyBjb2RlIDwgMTY7IGNvZGUrKykge1xuICAgIGJhc2VfZGlzdFtjb2RlXSA9IGRpc3Q7XG4gICAgZm9yIChuID0gMDsgbiA8ICgxPDxleHRyYV9kYml0c1tjb2RlXSk7IG4rKykge1xuICAgICAgX2Rpc3RfY29kZVtkaXN0KytdID0gY29kZTtcbiAgICB9XG4gIH1cbiAgLy9Bc3NlcnQgKGRpc3QgPT0gMjU2LCBcInRyX3N0YXRpY19pbml0OiBkaXN0ICE9IDI1NlwiKTtcbiAgZGlzdCA+Pj0gNzsgLyogZnJvbSBub3cgb24sIGFsbCBkaXN0YW5jZXMgYXJlIGRpdmlkZWQgYnkgMTI4ICovXG4gIGZvciAoIDsgY29kZSA8IERfQ09ERVM7IGNvZGUrKykge1xuICAgIGJhc2VfZGlzdFtjb2RlXSA9IGRpc3QgPDwgNztcbiAgICBmb3IgKG4gPSAwOyBuIDwgKDE8PChleHRyYV9kYml0c1tjb2RlXS03KSk7IG4rKykge1xuICAgICAgX2Rpc3RfY29kZVsyNTYgKyBkaXN0KytdID0gY29kZTtcbiAgICB9XG4gIH1cbiAgLy9Bc3NlcnQgKGRpc3QgPT0gMjU2LCBcInRyX3N0YXRpY19pbml0OiAyNTYrZGlzdCAhPSA1MTJcIik7XG5cbiAgLyogQ29uc3RydWN0IHRoZSBjb2RlcyBvZiB0aGUgc3RhdGljIGxpdGVyYWwgdHJlZSAqL1xuICBmb3IgKGJpdHMgPSAwOyBiaXRzIDw9IE1BWF9CSVRTOyBiaXRzKyspIHtcbiAgICBibF9jb3VudFtiaXRzXSA9IDA7XG4gIH1cblxuICBuID0gMDtcbiAgd2hpbGUgKG4gPD0gMTQzKSB7XG4gICAgc3RhdGljX2x0cmVlW24qMiArIDFdLyouTGVuKi8gPSA4O1xuICAgIG4rKztcbiAgICBibF9jb3VudFs4XSsrO1xuICB9XG4gIHdoaWxlIChuIDw9IDI1NSkge1xuICAgIHN0YXRpY19sdHJlZVtuKjIgKyAxXS8qLkxlbiovID0gOTtcbiAgICBuKys7XG4gICAgYmxfY291bnRbOV0rKztcbiAgfVxuICB3aGlsZSAobiA8PSAyNzkpIHtcbiAgICBzdGF0aWNfbHRyZWVbbioyICsgMV0vKi5MZW4qLyA9IDc7XG4gICAgbisrO1xuICAgIGJsX2NvdW50WzddKys7XG4gIH1cbiAgd2hpbGUgKG4gPD0gMjg3KSB7XG4gICAgc3RhdGljX2x0cmVlW24qMiArIDFdLyouTGVuKi8gPSA4O1xuICAgIG4rKztcbiAgICBibF9jb3VudFs4XSsrO1xuICB9XG4gIC8qIENvZGVzIDI4NiBhbmQgMjg3IGRvIG5vdCBleGlzdCwgYnV0IHdlIG11c3QgaW5jbHVkZSB0aGVtIGluIHRoZVxuICAgKiB0cmVlIGNvbnN0cnVjdGlvbiB0byBnZXQgYSBjYW5vbmljYWwgSHVmZm1hbiB0cmVlIChsb25nZXN0IGNvZGVcbiAgICogYWxsIG9uZXMpXG4gICAqL1xuICBnZW5fY29kZXMoc3RhdGljX2x0cmVlLCBMX0NPREVTKzEsIGJsX2NvdW50KTtcblxuICAvKiBUaGUgc3RhdGljIGRpc3RhbmNlIHRyZWUgaXMgdHJpdmlhbDogKi9cbiAgZm9yIChuID0gMDsgbiA8IERfQ09ERVM7IG4rKykge1xuICAgIHN0YXRpY19kdHJlZVtuKjIgKyAxXS8qLkxlbiovID0gNTtcbiAgICBzdGF0aWNfZHRyZWVbbioyXS8qLkNvZGUqLyA9IGJpX3JldmVyc2UobiwgNSk7XG4gIH1cblxuICAvLyBOb3cgZGF0YSByZWFkeSBhbmQgd2UgY2FuIGluaXQgc3RhdGljIHRyZWVzXG4gIHN0YXRpY19sX2Rlc2MgPSBuZXcgU3RhdGljVHJlZURlc2Moc3RhdGljX2x0cmVlLCBleHRyYV9sYml0cywgTElURVJBTFMrMSwgTF9DT0RFUywgTUFYX0JJVFMpO1xuICBzdGF0aWNfZF9kZXNjID0gbmV3IFN0YXRpY1RyZWVEZXNjKHN0YXRpY19kdHJlZSwgZXh0cmFfZGJpdHMsIDAsICAgICAgICAgIERfQ09ERVMsIE1BWF9CSVRTKTtcbiAgc3RhdGljX2JsX2Rlc2MgPW5ldyBTdGF0aWNUcmVlRGVzYyhuZXcgQXJyYXkoMCksIGV4dHJhX2JsYml0cywgMCwgICAgICAgICBCTF9DT0RFUywgTUFYX0JMX0JJVFMpO1xuXG4gIC8vc3RhdGljX2luaXRfZG9uZSA9IHRydWU7XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBJbml0aWFsaXplIGEgbmV3IGJsb2NrLlxuICovXG5mdW5jdGlvbiBpbml0X2Jsb2NrKHMpIHtcbiAgdmFyIG47IC8qIGl0ZXJhdGVzIG92ZXIgdHJlZSBlbGVtZW50cyAqL1xuXG4gIC8qIEluaXRpYWxpemUgdGhlIHRyZWVzLiAqL1xuICBmb3IgKG4gPSAwOyBuIDwgTF9DT0RFUzsgIG4rKykgeyBzLmR5bl9sdHJlZVtuKjJdLyouRnJlcSovID0gMDsgfVxuICBmb3IgKG4gPSAwOyBuIDwgRF9DT0RFUzsgIG4rKykgeyBzLmR5bl9kdHJlZVtuKjJdLyouRnJlcSovID0gMDsgfVxuICBmb3IgKG4gPSAwOyBuIDwgQkxfQ09ERVM7IG4rKykgeyBzLmJsX3RyZWVbbioyXS8qLkZyZXEqLyA9IDA7IH1cblxuICBzLmR5bl9sdHJlZVtFTkRfQkxPQ0sqMl0vKi5GcmVxKi8gPSAxO1xuICBzLm9wdF9sZW4gPSBzLnN0YXRpY19sZW4gPSAwO1xuICBzLmxhc3RfbGl0ID0gcy5tYXRjaGVzID0gMDtcbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZsdXNoIHRoZSBiaXQgYnVmZmVyIGFuZCBhbGlnbiB0aGUgb3V0cHV0IG9uIGEgYnl0ZSBib3VuZGFyeVxuICovXG5mdW5jdGlvbiBiaV93aW5kdXAocylcbntcbiAgaWYgKHMuYmlfdmFsaWQgPiA4KSB7XG4gICAgcHV0X3Nob3J0KHMsIHMuYmlfYnVmKTtcbiAgfSBlbHNlIGlmIChzLmJpX3ZhbGlkID4gMCkge1xuICAgIC8vcHV0X2J5dGUocywgKEJ5dGUpcy0+YmlfYnVmKTtcbiAgICBzLnBlbmRpbmdfYnVmW3MucGVuZGluZysrXSA9IHMuYmlfYnVmO1xuICB9XG4gIHMuYmlfYnVmID0gMDtcbiAgcy5iaV92YWxpZCA9IDA7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weSBhIHN0b3JlZCBibG9jaywgc3RvcmluZyBmaXJzdCB0aGUgbGVuZ3RoIGFuZCBpdHNcbiAqIG9uZSdzIGNvbXBsZW1lbnQgaWYgcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiBjb3B5X2Jsb2NrKHMsIGJ1ZiwgbGVuLCBoZWFkZXIpXG4vL0RlZmxhdGVTdGF0ZSAqcztcbi8vY2hhcmYgICAgKmJ1ZjsgICAgLyogdGhlIGlucHV0IGRhdGEgKi9cbi8vdW5zaWduZWQgbGVuOyAgICAgLyogaXRzIGxlbmd0aCAqL1xuLy9pbnQgICAgICBoZWFkZXI7ICAvKiB0cnVlIGlmIGJsb2NrIGhlYWRlciBtdXN0IGJlIHdyaXR0ZW4gKi9cbntcbiAgYmlfd2luZHVwKHMpOyAgICAgICAgLyogYWxpZ24gb24gYnl0ZSBib3VuZGFyeSAqL1xuXG4gIGlmIChoZWFkZXIpIHtcbiAgICBwdXRfc2hvcnQocywgbGVuKTtcbiAgICBwdXRfc2hvcnQocywgfmxlbik7XG4gIH1cbi8vICB3aGlsZSAobGVuLS0pIHtcbi8vICAgIHB1dF9ieXRlKHMsICpidWYrKyk7XG4vLyAgfVxuICB1dGlscy5hcnJheVNldChzLnBlbmRpbmdfYnVmLCBzLndpbmRvdywgYnVmLCBsZW4sIHMucGVuZGluZyk7XG4gIHMucGVuZGluZyArPSBsZW47XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29tcGFyZXMgdG8gc3VidHJlZXMsIHVzaW5nIHRoZSB0cmVlIGRlcHRoIGFzIHRpZSBicmVha2VyIHdoZW5cbiAqIHRoZSBzdWJ0cmVlcyBoYXZlIGVxdWFsIGZyZXF1ZW5jeS4gVGhpcyBtaW5pbWl6ZXMgdGhlIHdvcnN0IGNhc2UgbGVuZ3RoLlxuICovXG5mdW5jdGlvbiBzbWFsbGVyKHRyZWUsIG4sIG0sIGRlcHRoKSB7XG4gIHZhciBfbjIgPSBuKjI7XG4gIHZhciBfbTIgPSBtKjI7XG4gIHJldHVybiAodHJlZVtfbjJdLyouRnJlcSovIDwgdHJlZVtfbTJdLyouRnJlcSovIHx8XG4gICAgICAgICAodHJlZVtfbjJdLyouRnJlcSovID09PSB0cmVlW19tMl0vKi5GcmVxKi8gJiYgZGVwdGhbbl0gPD0gZGVwdGhbbV0pKTtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBSZXN0b3JlIHRoZSBoZWFwIHByb3BlcnR5IGJ5IG1vdmluZyBkb3duIHRoZSB0cmVlIHN0YXJ0aW5nIGF0IG5vZGUgayxcbiAqIGV4Y2hhbmdpbmcgYSBub2RlIHdpdGggdGhlIHNtYWxsZXN0IG9mIGl0cyB0d28gc29ucyBpZiBuZWNlc3NhcnksIHN0b3BwaW5nXG4gKiB3aGVuIHRoZSBoZWFwIHByb3BlcnR5IGlzIHJlLWVzdGFibGlzaGVkIChlYWNoIGZhdGhlciBzbWFsbGVyIHRoYW4gaXRzXG4gKiB0d28gc29ucykuXG4gKi9cbmZ1bmN0aW9uIHBxZG93bmhlYXAocywgdHJlZSwgaylcbi8vICAgIGRlZmxhdGVfc3RhdGUgKnM7XG4vLyAgICBjdF9kYXRhICp0cmVlOyAgLyogdGhlIHRyZWUgdG8gcmVzdG9yZSAqL1xuLy8gICAgaW50IGs7ICAgICAgICAgICAgICAgLyogbm9kZSB0byBtb3ZlIGRvd24gKi9cbntcbiAgdmFyIHYgPSBzLmhlYXBba107XG4gIHZhciBqID0gayA8PCAxOyAgLyogbGVmdCBzb24gb2YgayAqL1xuICB3aGlsZSAoaiA8PSBzLmhlYXBfbGVuKSB7XG4gICAgLyogU2V0IGogdG8gdGhlIHNtYWxsZXN0IG9mIHRoZSB0d28gc29uczogKi9cbiAgICBpZiAoaiA8IHMuaGVhcF9sZW4gJiZcbiAgICAgIHNtYWxsZXIodHJlZSwgcy5oZWFwW2orMV0sIHMuaGVhcFtqXSwgcy5kZXB0aCkpIHtcbiAgICAgIGorKztcbiAgICB9XG4gICAgLyogRXhpdCBpZiB2IGlzIHNtYWxsZXIgdGhhbiBib3RoIHNvbnMgKi9cbiAgICBpZiAoc21hbGxlcih0cmVlLCB2LCBzLmhlYXBbal0sIHMuZGVwdGgpKSB7IGJyZWFrOyB9XG5cbiAgICAvKiBFeGNoYW5nZSB2IHdpdGggdGhlIHNtYWxsZXN0IHNvbiAqL1xuICAgIHMuaGVhcFtrXSA9IHMuaGVhcFtqXTtcbiAgICBrID0gajtcblxuICAgIC8qIEFuZCBjb250aW51ZSBkb3duIHRoZSB0cmVlLCBzZXR0aW5nIGogdG8gdGhlIGxlZnQgc29uIG9mIGsgKi9cbiAgICBqIDw8PSAxO1xuICB9XG4gIHMuaGVhcFtrXSA9IHY7XG59XG5cblxuLy8gaW5saW5lZCBtYW51YWxseVxuLy8gdmFyIFNNQUxMRVNUID0gMTtcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBTZW5kIHRoZSBibG9jayBkYXRhIGNvbXByZXNzZWQgdXNpbmcgdGhlIGdpdmVuIEh1ZmZtYW4gdHJlZXNcbiAqL1xuZnVuY3Rpb24gY29tcHJlc3NfYmxvY2socywgbHRyZWUsIGR0cmVlKVxuLy8gICAgZGVmbGF0ZV9zdGF0ZSAqcztcbi8vICAgIGNvbnN0IGN0X2RhdGEgKmx0cmVlOyAvKiBsaXRlcmFsIHRyZWUgKi9cbi8vICAgIGNvbnN0IGN0X2RhdGEgKmR0cmVlOyAvKiBkaXN0YW5jZSB0cmVlICovXG57XG4gIHZhciBkaXN0OyAgICAgICAgICAgLyogZGlzdGFuY2Ugb2YgbWF0Y2hlZCBzdHJpbmcgKi9cbiAgdmFyIGxjOyAgICAgICAgICAgICAvKiBtYXRjaCBsZW5ndGggb3IgdW5tYXRjaGVkIGNoYXIgKGlmIGRpc3QgPT0gMCkgKi9cbiAgdmFyIGx4ID0gMDsgICAgICAgICAvKiBydW5uaW5nIGluZGV4IGluIGxfYnVmICovXG4gIHZhciBjb2RlOyAgICAgICAgICAgLyogdGhlIGNvZGUgdG8gc2VuZCAqL1xuICB2YXIgZXh0cmE7ICAgICAgICAgIC8qIG51bWJlciBvZiBleHRyYSBiaXRzIHRvIHNlbmQgKi9cblxuICBpZiAocy5sYXN0X2xpdCAhPT0gMCkge1xuICAgIGRvIHtcbiAgICAgIGRpc3QgPSAocy5wZW5kaW5nX2J1ZltzLmRfYnVmICsgbHgqMl0gPDwgOCkgfCAocy5wZW5kaW5nX2J1ZltzLmRfYnVmICsgbHgqMiArIDFdKTtcbiAgICAgIGxjID0gcy5wZW5kaW5nX2J1ZltzLmxfYnVmICsgbHhdO1xuICAgICAgbHgrKztcblxuICAgICAgaWYgKGRpc3QgPT09IDApIHtcbiAgICAgICAgc2VuZF9jb2RlKHMsIGxjLCBsdHJlZSk7IC8qIHNlbmQgYSBsaXRlcmFsIGJ5dGUgKi9cbiAgICAgICAgLy9UcmFjZWN2KGlzZ3JhcGgobGMpLCAoc3RkZXJyLFwiICclYycgXCIsIGxjKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBIZXJlLCBsYyBpcyB0aGUgbWF0Y2ggbGVuZ3RoIC0gTUlOX01BVENIICovXG4gICAgICAgIGNvZGUgPSBfbGVuZ3RoX2NvZGVbbGNdO1xuICAgICAgICBzZW5kX2NvZGUocywgY29kZStMSVRFUkFMUysxLCBsdHJlZSk7IC8qIHNlbmQgdGhlIGxlbmd0aCBjb2RlICovXG4gICAgICAgIGV4dHJhID0gZXh0cmFfbGJpdHNbY29kZV07XG4gICAgICAgIGlmIChleHRyYSAhPT0gMCkge1xuICAgICAgICAgIGxjIC09IGJhc2VfbGVuZ3RoW2NvZGVdO1xuICAgICAgICAgIHNlbmRfYml0cyhzLCBsYywgZXh0cmEpOyAgICAgICAvKiBzZW5kIHRoZSBleHRyYSBsZW5ndGggYml0cyAqL1xuICAgICAgICB9XG4gICAgICAgIGRpc3QtLTsgLyogZGlzdCBpcyBub3cgdGhlIG1hdGNoIGRpc3RhbmNlIC0gMSAqL1xuICAgICAgICBjb2RlID0gZF9jb2RlKGRpc3QpO1xuICAgICAgICAvL0Fzc2VydCAoY29kZSA8IERfQ09ERVMsIFwiYmFkIGRfY29kZVwiKTtcblxuICAgICAgICBzZW5kX2NvZGUocywgY29kZSwgZHRyZWUpOyAgICAgICAvKiBzZW5kIHRoZSBkaXN0YW5jZSBjb2RlICovXG4gICAgICAgIGV4dHJhID0gZXh0cmFfZGJpdHNbY29kZV07XG4gICAgICAgIGlmIChleHRyYSAhPT0gMCkge1xuICAgICAgICAgIGRpc3QgLT0gYmFzZV9kaXN0W2NvZGVdO1xuICAgICAgICAgIHNlbmRfYml0cyhzLCBkaXN0LCBleHRyYSk7ICAgLyogc2VuZCB0aGUgZXh0cmEgZGlzdGFuY2UgYml0cyAqL1xuICAgICAgICB9XG4gICAgICB9IC8qIGxpdGVyYWwgb3IgbWF0Y2ggcGFpciA/ICovXG5cbiAgICAgIC8qIENoZWNrIHRoYXQgdGhlIG92ZXJsYXkgYmV0d2VlbiBwZW5kaW5nX2J1ZiBhbmQgZF9idWYrbF9idWYgaXMgb2s6ICovXG4gICAgICAvL0Fzc2VydCgodUludCkocy0+cGVuZGluZykgPCBzLT5saXRfYnVmc2l6ZSArIDIqbHgsXG4gICAgICAvLyAgICAgICBcInBlbmRpbmdCdWYgb3ZlcmZsb3dcIik7XG5cbiAgICB9IHdoaWxlIChseCA8IHMubGFzdF9saXQpO1xuICB9XG5cbiAgc2VuZF9jb2RlKHMsIEVORF9CTE9DSywgbHRyZWUpO1xufVxuXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29uc3RydWN0IG9uZSBIdWZmbWFuIHRyZWUgYW5kIGFzc2lnbnMgdGhlIGNvZGUgYml0IHN0cmluZ3MgYW5kIGxlbmd0aHMuXG4gKiBVcGRhdGUgdGhlIHRvdGFsIGJpdCBsZW5ndGggZm9yIHRoZSBjdXJyZW50IGJsb2NrLlxuICogSU4gYXNzZXJ0aW9uOiB0aGUgZmllbGQgZnJlcSBpcyBzZXQgZm9yIGFsbCB0cmVlIGVsZW1lbnRzLlxuICogT1VUIGFzc2VydGlvbnM6IHRoZSBmaWVsZHMgbGVuIGFuZCBjb2RlIGFyZSBzZXQgdG8gdGhlIG9wdGltYWwgYml0IGxlbmd0aFxuICogICAgIGFuZCBjb3JyZXNwb25kaW5nIGNvZGUuIFRoZSBsZW5ndGggb3B0X2xlbiBpcyB1cGRhdGVkOyBzdGF0aWNfbGVuIGlzXG4gKiAgICAgYWxzbyB1cGRhdGVkIGlmIHN0cmVlIGlzIG5vdCBudWxsLiBUaGUgZmllbGQgbWF4X2NvZGUgaXMgc2V0LlxuICovXG5mdW5jdGlvbiBidWlsZF90cmVlKHMsIGRlc2MpXG4vLyAgICBkZWZsYXRlX3N0YXRlICpzO1xuLy8gICAgdHJlZV9kZXNjICpkZXNjOyAvKiB0aGUgdHJlZSBkZXNjcmlwdG9yICovXG57XG4gIHZhciB0cmVlICAgICA9IGRlc2MuZHluX3RyZWU7XG4gIHZhciBzdHJlZSAgICA9IGRlc2Muc3RhdF9kZXNjLnN0YXRpY190cmVlO1xuICB2YXIgaGFzX3N0cmVlID0gZGVzYy5zdGF0X2Rlc2MuaGFzX3N0cmVlO1xuICB2YXIgZWxlbXMgICAgPSBkZXNjLnN0YXRfZGVzYy5lbGVtcztcbiAgdmFyIG4sIG07ICAgICAgICAgIC8qIGl0ZXJhdGUgb3ZlciBoZWFwIGVsZW1lbnRzICovXG4gIHZhciBtYXhfY29kZSA9IC0xOyAvKiBsYXJnZXN0IGNvZGUgd2l0aCBub24gemVybyBmcmVxdWVuY3kgKi9cbiAgdmFyIG5vZGU7ICAgICAgICAgIC8qIG5ldyBub2RlIGJlaW5nIGNyZWF0ZWQgKi9cblxuICAvKiBDb25zdHJ1Y3QgdGhlIGluaXRpYWwgaGVhcCwgd2l0aCBsZWFzdCBmcmVxdWVudCBlbGVtZW50IGluXG4gICAqIGhlYXBbU01BTExFU1RdLiBUaGUgc29ucyBvZiBoZWFwW25dIGFyZSBoZWFwWzIqbl0gYW5kIGhlYXBbMipuKzFdLlxuICAgKiBoZWFwWzBdIGlzIG5vdCB1c2VkLlxuICAgKi9cbiAgcy5oZWFwX2xlbiA9IDA7XG4gIHMuaGVhcF9tYXggPSBIRUFQX1NJWkU7XG5cbiAgZm9yIChuID0gMDsgbiA8IGVsZW1zOyBuKyspIHtcbiAgICBpZiAodHJlZVtuICogMl0vKi5GcmVxKi8gIT09IDApIHtcbiAgICAgIHMuaGVhcFsrK3MuaGVhcF9sZW5dID0gbWF4X2NvZGUgPSBuO1xuICAgICAgcy5kZXB0aFtuXSA9IDA7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdHJlZVtuKjIgKyAxXS8qLkxlbiovID0gMDtcbiAgICB9XG4gIH1cblxuICAvKiBUaGUgcGt6aXAgZm9ybWF0IHJlcXVpcmVzIHRoYXQgYXQgbGVhc3Qgb25lIGRpc3RhbmNlIGNvZGUgZXhpc3RzLFxuICAgKiBhbmQgdGhhdCBhdCBsZWFzdCBvbmUgYml0IHNob3VsZCBiZSBzZW50IGV2ZW4gaWYgdGhlcmUgaXMgb25seSBvbmVcbiAgICogcG9zc2libGUgY29kZS4gU28gdG8gYXZvaWQgc3BlY2lhbCBjaGVja3MgbGF0ZXIgb24gd2UgZm9yY2UgYXQgbGVhc3RcbiAgICogdHdvIGNvZGVzIG9mIG5vbiB6ZXJvIGZyZXF1ZW5jeS5cbiAgICovXG4gIHdoaWxlIChzLmhlYXBfbGVuIDwgMikge1xuICAgIG5vZGUgPSBzLmhlYXBbKytzLmhlYXBfbGVuXSA9IChtYXhfY29kZSA8IDIgPyArK21heF9jb2RlIDogMCk7XG4gICAgdHJlZVtub2RlICogMl0vKi5GcmVxKi8gPSAxO1xuICAgIHMuZGVwdGhbbm9kZV0gPSAwO1xuICAgIHMub3B0X2xlbi0tO1xuXG4gICAgaWYgKGhhc19zdHJlZSkge1xuICAgICAgcy5zdGF0aWNfbGVuIC09IHN0cmVlW25vZGUqMiArIDFdLyouTGVuKi87XG4gICAgfVxuICAgIC8qIG5vZGUgaXMgMCBvciAxIHNvIGl0IGRvZXMgbm90IGhhdmUgZXh0cmEgYml0cyAqL1xuICB9XG4gIGRlc2MubWF4X2NvZGUgPSBtYXhfY29kZTtcblxuICAvKiBUaGUgZWxlbWVudHMgaGVhcFtoZWFwX2xlbi8yKzEgLi4gaGVhcF9sZW5dIGFyZSBsZWF2ZXMgb2YgdGhlIHRyZWUsXG4gICAqIGVzdGFibGlzaCBzdWItaGVhcHMgb2YgaW5jcmVhc2luZyBsZW5ndGhzOlxuICAgKi9cbiAgZm9yIChuID0gKHMuaGVhcF9sZW4gPj4gMS8qaW50IC8yKi8pOyBuID49IDE7IG4tLSkgeyBwcWRvd25oZWFwKHMsIHRyZWUsIG4pOyB9XG5cbiAgLyogQ29uc3RydWN0IHRoZSBIdWZmbWFuIHRyZWUgYnkgcmVwZWF0ZWRseSBjb21iaW5pbmcgdGhlIGxlYXN0IHR3b1xuICAgKiBmcmVxdWVudCBub2Rlcy5cbiAgICovXG4gIG5vZGUgPSBlbGVtczsgICAgICAgICAgICAgIC8qIG5leHQgaW50ZXJuYWwgbm9kZSBvZiB0aGUgdHJlZSAqL1xuICBkbyB7XG4gICAgLy9wcXJlbW92ZShzLCB0cmVlLCBuKTsgIC8qIG4gPSBub2RlIG9mIGxlYXN0IGZyZXF1ZW5jeSAqL1xuICAgIC8qKiogcHFyZW1vdmUgKioqL1xuICAgIG4gPSBzLmhlYXBbMS8qU01BTExFU1QqL107XG4gICAgcy5oZWFwWzEvKlNNQUxMRVNUKi9dID0gcy5oZWFwW3MuaGVhcF9sZW4tLV07XG4gICAgcHFkb3duaGVhcChzLCB0cmVlLCAxLypTTUFMTEVTVCovKTtcbiAgICAvKioqL1xuXG4gICAgbSA9IHMuaGVhcFsxLypTTUFMTEVTVCovXTsgLyogbSA9IG5vZGUgb2YgbmV4dCBsZWFzdCBmcmVxdWVuY3kgKi9cblxuICAgIHMuaGVhcFstLXMuaGVhcF9tYXhdID0gbjsgLyoga2VlcCB0aGUgbm9kZXMgc29ydGVkIGJ5IGZyZXF1ZW5jeSAqL1xuICAgIHMuaGVhcFstLXMuaGVhcF9tYXhdID0gbTtcblxuICAgIC8qIENyZWF0ZSBhIG5ldyBub2RlIGZhdGhlciBvZiBuIGFuZCBtICovXG4gICAgdHJlZVtub2RlICogMl0vKi5GcmVxKi8gPSB0cmVlW24gKiAyXS8qLkZyZXEqLyArIHRyZWVbbSAqIDJdLyouRnJlcSovO1xuICAgIHMuZGVwdGhbbm9kZV0gPSAocy5kZXB0aFtuXSA+PSBzLmRlcHRoW21dID8gcy5kZXB0aFtuXSA6IHMuZGVwdGhbbV0pICsgMTtcbiAgICB0cmVlW24qMiArIDFdLyouRGFkKi8gPSB0cmVlW20qMiArIDFdLyouRGFkKi8gPSBub2RlO1xuXG4gICAgLyogYW5kIGluc2VydCB0aGUgbmV3IG5vZGUgaW4gdGhlIGhlYXAgKi9cbiAgICBzLmhlYXBbMS8qU01BTExFU1QqL10gPSBub2RlKys7XG4gICAgcHFkb3duaGVhcChzLCB0cmVlLCAxLypTTUFMTEVTVCovKTtcblxuICB9IHdoaWxlIChzLmhlYXBfbGVuID49IDIpO1xuXG4gIHMuaGVhcFstLXMuaGVhcF9tYXhdID0gcy5oZWFwWzEvKlNNQUxMRVNUKi9dO1xuXG4gIC8qIEF0IHRoaXMgcG9pbnQsIHRoZSBmaWVsZHMgZnJlcSBhbmQgZGFkIGFyZSBzZXQuIFdlIGNhbiBub3dcbiAgICogZ2VuZXJhdGUgdGhlIGJpdCBsZW5ndGhzLlxuICAgKi9cbiAgZ2VuX2JpdGxlbihzLCBkZXNjKTtcblxuICAvKiBUaGUgZmllbGQgbGVuIGlzIG5vdyBzZXQsIHdlIGNhbiBnZW5lcmF0ZSB0aGUgYml0IGNvZGVzICovXG4gIGdlbl9jb2Rlcyh0cmVlLCBtYXhfY29kZSwgcy5ibF9jb3VudCk7XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBTY2FuIGEgbGl0ZXJhbCBvciBkaXN0YW5jZSB0cmVlIHRvIGRldGVybWluZSB0aGUgZnJlcXVlbmNpZXMgb2YgdGhlIGNvZGVzXG4gKiBpbiB0aGUgYml0IGxlbmd0aCB0cmVlLlxuICovXG5mdW5jdGlvbiBzY2FuX3RyZWUocywgdHJlZSwgbWF4X2NvZGUpXG4vLyAgICBkZWZsYXRlX3N0YXRlICpzO1xuLy8gICAgY3RfZGF0YSAqdHJlZTsgICAvKiB0aGUgdHJlZSB0byBiZSBzY2FubmVkICovXG4vLyAgICBpbnQgbWF4X2NvZGU7ICAgIC8qIGFuZCBpdHMgbGFyZ2VzdCBjb2RlIG9mIG5vbiB6ZXJvIGZyZXF1ZW5jeSAqL1xue1xuICB2YXIgbjsgICAgICAgICAgICAgICAgICAgICAvKiBpdGVyYXRlcyBvdmVyIGFsbCB0cmVlIGVsZW1lbnRzICovXG4gIHZhciBwcmV2bGVuID0gLTE7ICAgICAgICAgIC8qIGxhc3QgZW1pdHRlZCBsZW5ndGggKi9cbiAgdmFyIGN1cmxlbjsgICAgICAgICAgICAgICAgLyogbGVuZ3RoIG9mIGN1cnJlbnQgY29kZSAqL1xuXG4gIHZhciBuZXh0bGVuID0gdHJlZVswKjIgKyAxXS8qLkxlbiovOyAvKiBsZW5ndGggb2YgbmV4dCBjb2RlICovXG5cbiAgdmFyIGNvdW50ID0gMDsgICAgICAgICAgICAgLyogcmVwZWF0IGNvdW50IG9mIHRoZSBjdXJyZW50IGNvZGUgKi9cbiAgdmFyIG1heF9jb3VudCA9IDc7ICAgICAgICAgLyogbWF4IHJlcGVhdCBjb3VudCAqL1xuICB2YXIgbWluX2NvdW50ID0gNDsgICAgICAgICAvKiBtaW4gcmVwZWF0IGNvdW50ICovXG5cbiAgaWYgKG5leHRsZW4gPT09IDApIHtcbiAgICBtYXhfY291bnQgPSAxMzg7XG4gICAgbWluX2NvdW50ID0gMztcbiAgfVxuICB0cmVlWyhtYXhfY29kZSsxKSoyICsgMV0vKi5MZW4qLyA9IDB4ZmZmZjsgLyogZ3VhcmQgKi9cblxuICBmb3IgKG4gPSAwOyBuIDw9IG1heF9jb2RlOyBuKyspIHtcbiAgICBjdXJsZW4gPSBuZXh0bGVuO1xuICAgIG5leHRsZW4gPSB0cmVlWyhuKzEpKjIgKyAxXS8qLkxlbiovO1xuXG4gICAgaWYgKCsrY291bnQgPCBtYXhfY291bnQgJiYgY3VybGVuID09PSBuZXh0bGVuKSB7XG4gICAgICBjb250aW51ZTtcblxuICAgIH0gZWxzZSBpZiAoY291bnQgPCBtaW5fY291bnQpIHtcbiAgICAgIHMuYmxfdHJlZVtjdXJsZW4gKiAyXS8qLkZyZXEqLyArPSBjb3VudDtcblxuICAgIH0gZWxzZSBpZiAoY3VybGVuICE9PSAwKSB7XG5cbiAgICAgIGlmIChjdXJsZW4gIT09IHByZXZsZW4pIHsgcy5ibF90cmVlW2N1cmxlbiAqIDJdLyouRnJlcSovKys7IH1cbiAgICAgIHMuYmxfdHJlZVtSRVBfM182KjJdLyouRnJlcSovKys7XG5cbiAgICB9IGVsc2UgaWYgKGNvdW50IDw9IDEwKSB7XG4gICAgICBzLmJsX3RyZWVbUkVQWl8zXzEwKjJdLyouRnJlcSovKys7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcy5ibF90cmVlW1JFUFpfMTFfMTM4KjJdLyouRnJlcSovKys7XG4gICAgfVxuXG4gICAgY291bnQgPSAwO1xuICAgIHByZXZsZW4gPSBjdXJsZW47XG5cbiAgICBpZiAobmV4dGxlbiA9PT0gMCkge1xuICAgICAgbWF4X2NvdW50ID0gMTM4O1xuICAgICAgbWluX2NvdW50ID0gMztcblxuICAgIH0gZWxzZSBpZiAoY3VybGVuID09PSBuZXh0bGVuKSB7XG4gICAgICBtYXhfY291bnQgPSA2O1xuICAgICAgbWluX2NvdW50ID0gMztcblxuICAgIH0gZWxzZSB7XG4gICAgICBtYXhfY291bnQgPSA3O1xuICAgICAgbWluX2NvdW50ID0gNDtcbiAgICB9XG4gIH1cbn1cblxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFNlbmQgYSBsaXRlcmFsIG9yIGRpc3RhbmNlIHRyZWUgaW4gY29tcHJlc3NlZCBmb3JtLCB1c2luZyB0aGUgY29kZXMgaW5cbiAqIGJsX3RyZWUuXG4gKi9cbmZ1bmN0aW9uIHNlbmRfdHJlZShzLCB0cmVlLCBtYXhfY29kZSlcbi8vICAgIGRlZmxhdGVfc3RhdGUgKnM7XG4vLyAgICBjdF9kYXRhICp0cmVlOyAvKiB0aGUgdHJlZSB0byBiZSBzY2FubmVkICovXG4vLyAgICBpbnQgbWF4X2NvZGU7ICAgICAgIC8qIGFuZCBpdHMgbGFyZ2VzdCBjb2RlIG9mIG5vbiB6ZXJvIGZyZXF1ZW5jeSAqL1xue1xuICB2YXIgbjsgICAgICAgICAgICAgICAgICAgICAvKiBpdGVyYXRlcyBvdmVyIGFsbCB0cmVlIGVsZW1lbnRzICovXG4gIHZhciBwcmV2bGVuID0gLTE7ICAgICAgICAgIC8qIGxhc3QgZW1pdHRlZCBsZW5ndGggKi9cbiAgdmFyIGN1cmxlbjsgICAgICAgICAgICAgICAgLyogbGVuZ3RoIG9mIGN1cnJlbnQgY29kZSAqL1xuXG4gIHZhciBuZXh0bGVuID0gdHJlZVswKjIgKyAxXS8qLkxlbiovOyAvKiBsZW5ndGggb2YgbmV4dCBjb2RlICovXG5cbiAgdmFyIGNvdW50ID0gMDsgICAgICAgICAgICAgLyogcmVwZWF0IGNvdW50IG9mIHRoZSBjdXJyZW50IGNvZGUgKi9cbiAgdmFyIG1heF9jb3VudCA9IDc7ICAgICAgICAgLyogbWF4IHJlcGVhdCBjb3VudCAqL1xuICB2YXIgbWluX2NvdW50ID0gNDsgICAgICAgICAvKiBtaW4gcmVwZWF0IGNvdW50ICovXG5cbiAgLyogdHJlZVttYXhfY29kZSsxXS5MZW4gPSAtMTsgKi8gIC8qIGd1YXJkIGFscmVhZHkgc2V0ICovXG4gIGlmIChuZXh0bGVuID09PSAwKSB7XG4gICAgbWF4X2NvdW50ID0gMTM4O1xuICAgIG1pbl9jb3VudCA9IDM7XG4gIH1cblxuICBmb3IgKG4gPSAwOyBuIDw9IG1heF9jb2RlOyBuKyspIHtcbiAgICBjdXJsZW4gPSBuZXh0bGVuO1xuICAgIG5leHRsZW4gPSB0cmVlWyhuKzEpKjIgKyAxXS8qLkxlbiovO1xuXG4gICAgaWYgKCsrY291bnQgPCBtYXhfY291bnQgJiYgY3VybGVuID09PSBuZXh0bGVuKSB7XG4gICAgICBjb250aW51ZTtcblxuICAgIH0gZWxzZSBpZiAoY291bnQgPCBtaW5fY291bnQpIHtcbiAgICAgIGRvIHsgc2VuZF9jb2RlKHMsIGN1cmxlbiwgcy5ibF90cmVlKTsgfSB3aGlsZSAoLS1jb3VudCAhPT0gMCk7XG5cbiAgICB9IGVsc2UgaWYgKGN1cmxlbiAhPT0gMCkge1xuICAgICAgaWYgKGN1cmxlbiAhPT0gcHJldmxlbikge1xuICAgICAgICBzZW5kX2NvZGUocywgY3VybGVuLCBzLmJsX3RyZWUpO1xuICAgICAgICBjb3VudC0tO1xuICAgICAgfVxuICAgICAgLy9Bc3NlcnQoY291bnQgPj0gMyAmJiBjb3VudCA8PSA2LCBcIiAzXzY/XCIpO1xuICAgICAgc2VuZF9jb2RlKHMsIFJFUF8zXzYsIHMuYmxfdHJlZSk7XG4gICAgICBzZW5kX2JpdHMocywgY291bnQtMywgMik7XG5cbiAgICB9IGVsc2UgaWYgKGNvdW50IDw9IDEwKSB7XG4gICAgICBzZW5kX2NvZGUocywgUkVQWl8zXzEwLCBzLmJsX3RyZWUpO1xuICAgICAgc2VuZF9iaXRzKHMsIGNvdW50LTMsIDMpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbmRfY29kZShzLCBSRVBaXzExXzEzOCwgcy5ibF90cmVlKTtcbiAgICAgIHNlbmRfYml0cyhzLCBjb3VudC0xMSwgNyk7XG4gICAgfVxuXG4gICAgY291bnQgPSAwO1xuICAgIHByZXZsZW4gPSBjdXJsZW47XG4gICAgaWYgKG5leHRsZW4gPT09IDApIHtcbiAgICAgIG1heF9jb3VudCA9IDEzODtcbiAgICAgIG1pbl9jb3VudCA9IDM7XG5cbiAgICB9IGVsc2UgaWYgKGN1cmxlbiA9PT0gbmV4dGxlbikge1xuICAgICAgbWF4X2NvdW50ID0gNjtcbiAgICAgIG1pbl9jb3VudCA9IDM7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgbWF4X2NvdW50ID0gNztcbiAgICAgIG1pbl9jb3VudCA9IDQ7XG4gICAgfVxuICB9XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb25zdHJ1Y3QgdGhlIEh1ZmZtYW4gdHJlZSBmb3IgdGhlIGJpdCBsZW5ndGhzIGFuZCByZXR1cm4gdGhlIGluZGV4IGluXG4gKiBibF9vcmRlciBvZiB0aGUgbGFzdCBiaXQgbGVuZ3RoIGNvZGUgdG8gc2VuZC5cbiAqL1xuZnVuY3Rpb24gYnVpbGRfYmxfdHJlZShzKSB7XG4gIHZhciBtYXhfYmxpbmRleDsgIC8qIGluZGV4IG9mIGxhc3QgYml0IGxlbmd0aCBjb2RlIG9mIG5vbiB6ZXJvIGZyZXEgKi9cblxuICAvKiBEZXRlcm1pbmUgdGhlIGJpdCBsZW5ndGggZnJlcXVlbmNpZXMgZm9yIGxpdGVyYWwgYW5kIGRpc3RhbmNlIHRyZWVzICovXG4gIHNjYW5fdHJlZShzLCBzLmR5bl9sdHJlZSwgcy5sX2Rlc2MubWF4X2NvZGUpO1xuICBzY2FuX3RyZWUocywgcy5keW5fZHRyZWUsIHMuZF9kZXNjLm1heF9jb2RlKTtcblxuICAvKiBCdWlsZCB0aGUgYml0IGxlbmd0aCB0cmVlOiAqL1xuICBidWlsZF90cmVlKHMsIHMuYmxfZGVzYyk7XG4gIC8qIG9wdF9sZW4gbm93IGluY2x1ZGVzIHRoZSBsZW5ndGggb2YgdGhlIHRyZWUgcmVwcmVzZW50YXRpb25zLCBleGNlcHRcbiAgICogdGhlIGxlbmd0aHMgb2YgdGhlIGJpdCBsZW5ndGhzIGNvZGVzIGFuZCB0aGUgNSs1KzQgYml0cyBmb3IgdGhlIGNvdW50cy5cbiAgICovXG5cbiAgLyogRGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgYml0IGxlbmd0aCBjb2RlcyB0byBzZW5kLiBUaGUgcGt6aXAgZm9ybWF0XG4gICAqIHJlcXVpcmVzIHRoYXQgYXQgbGVhc3QgNCBiaXQgbGVuZ3RoIGNvZGVzIGJlIHNlbnQuIChhcHBub3RlLnR4dCBzYXlzXG4gICAqIDMgYnV0IHRoZSBhY3R1YWwgdmFsdWUgdXNlZCBpcyA0LilcbiAgICovXG4gIGZvciAobWF4X2JsaW5kZXggPSBCTF9DT0RFUy0xOyBtYXhfYmxpbmRleCA+PSAzOyBtYXhfYmxpbmRleC0tKSB7XG4gICAgaWYgKHMuYmxfdHJlZVtibF9vcmRlclttYXhfYmxpbmRleF0qMiArIDFdLyouTGVuKi8gIT09IDApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICAvKiBVcGRhdGUgb3B0X2xlbiB0byBpbmNsdWRlIHRoZSBiaXQgbGVuZ3RoIHRyZWUgYW5kIGNvdW50cyAqL1xuICBzLm9wdF9sZW4gKz0gMyoobWF4X2JsaW5kZXgrMSkgKyA1KzUrNDtcbiAgLy9UcmFjZXYoKHN0ZGVyciwgXCJcXG5keW4gdHJlZXM6IGR5biAlbGQsIHN0YXQgJWxkXCIsXG4gIC8vICAgICAgICBzLT5vcHRfbGVuLCBzLT5zdGF0aWNfbGVuKSk7XG5cbiAgcmV0dXJuIG1heF9ibGluZGV4O1xufVxuXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogU2VuZCB0aGUgaGVhZGVyIGZvciBhIGJsb2NrIHVzaW5nIGR5bmFtaWMgSHVmZm1hbiB0cmVlczogdGhlIGNvdW50cywgdGhlXG4gKiBsZW5ndGhzIG9mIHRoZSBiaXQgbGVuZ3RoIGNvZGVzLCB0aGUgbGl0ZXJhbCB0cmVlIGFuZCB0aGUgZGlzdGFuY2UgdHJlZS5cbiAqIElOIGFzc2VydGlvbjogbGNvZGVzID49IDI1NywgZGNvZGVzID49IDEsIGJsY29kZXMgPj0gNC5cbiAqL1xuZnVuY3Rpb24gc2VuZF9hbGxfdHJlZXMocywgbGNvZGVzLCBkY29kZXMsIGJsY29kZXMpXG4vLyAgICBkZWZsYXRlX3N0YXRlICpzO1xuLy8gICAgaW50IGxjb2RlcywgZGNvZGVzLCBibGNvZGVzOyAvKiBudW1iZXIgb2YgY29kZXMgZm9yIGVhY2ggdHJlZSAqL1xue1xuICB2YXIgcmFuazsgICAgICAgICAgICAgICAgICAgIC8qIGluZGV4IGluIGJsX29yZGVyICovXG5cbiAgLy9Bc3NlcnQgKGxjb2RlcyA+PSAyNTcgJiYgZGNvZGVzID49IDEgJiYgYmxjb2RlcyA+PSA0LCBcIm5vdCBlbm91Z2ggY29kZXNcIik7XG4gIC8vQXNzZXJ0IChsY29kZXMgPD0gTF9DT0RFUyAmJiBkY29kZXMgPD0gRF9DT0RFUyAmJiBibGNvZGVzIDw9IEJMX0NPREVTLFxuICAvLyAgICAgICAgXCJ0b28gbWFueSBjb2Rlc1wiKTtcbiAgLy9UcmFjZXYoKHN0ZGVyciwgXCJcXG5ibCBjb3VudHM6IFwiKSk7XG4gIHNlbmRfYml0cyhzLCBsY29kZXMtMjU3LCA1KTsgLyogbm90ICsyNTUgYXMgc3RhdGVkIGluIGFwcG5vdGUudHh0ICovXG4gIHNlbmRfYml0cyhzLCBkY29kZXMtMSwgICA1KTtcbiAgc2VuZF9iaXRzKHMsIGJsY29kZXMtNCwgIDQpOyAvKiBub3QgLTMgYXMgc3RhdGVkIGluIGFwcG5vdGUudHh0ICovXG4gIGZvciAocmFuayA9IDA7IHJhbmsgPCBibGNvZGVzOyByYW5rKyspIHtcbiAgICAvL1RyYWNldigoc3RkZXJyLCBcIlxcbmJsIGNvZGUgJTJkIFwiLCBibF9vcmRlcltyYW5rXSkpO1xuICAgIHNlbmRfYml0cyhzLCBzLmJsX3RyZWVbYmxfb3JkZXJbcmFua10qMiArIDFdLyouTGVuKi8sIDMpO1xuICB9XG4gIC8vVHJhY2V2KChzdGRlcnIsIFwiXFxuYmwgdHJlZTogc2VudCAlbGRcIiwgcy0+Yml0c19zZW50KSk7XG5cbiAgc2VuZF90cmVlKHMsIHMuZHluX2x0cmVlLCBsY29kZXMtMSk7IC8qIGxpdGVyYWwgdHJlZSAqL1xuICAvL1RyYWNldigoc3RkZXJyLCBcIlxcbmxpdCB0cmVlOiBzZW50ICVsZFwiLCBzLT5iaXRzX3NlbnQpKTtcblxuICBzZW5kX3RyZWUocywgcy5keW5fZHRyZWUsIGRjb2Rlcy0xKTsgLyogZGlzdGFuY2UgdHJlZSAqL1xuICAvL1RyYWNldigoc3RkZXJyLCBcIlxcbmRpc3QgdHJlZTogc2VudCAlbGRcIiwgcy0+Yml0c19zZW50KSk7XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDaGVjayBpZiB0aGUgZGF0YSB0eXBlIGlzIFRFWFQgb3IgQklOQVJZLCB1c2luZyB0aGUgZm9sbG93aW5nIGFsZ29yaXRobTpcbiAqIC0gVEVYVCBpZiB0aGUgdHdvIGNvbmRpdGlvbnMgYmVsb3cgYXJlIHNhdGlzZmllZDpcbiAqICAgIGEpIFRoZXJlIGFyZSBubyBub24tcG9ydGFibGUgY29udHJvbCBjaGFyYWN0ZXJzIGJlbG9uZ2luZyB0byB0aGVcbiAqICAgICAgIFwiYmxhY2sgbGlzdFwiICgwLi42LCAxNC4uMjUsIDI4Li4zMSkuXG4gKiAgICBiKSBUaGVyZSBpcyBhdCBsZWFzdCBvbmUgcHJpbnRhYmxlIGNoYXJhY3RlciBiZWxvbmdpbmcgdG8gdGhlXG4gKiAgICAgICBcIndoaXRlIGxpc3RcIiAoOSB7VEFCfSwgMTAge0xGfSwgMTMge0NSfSwgMzIuLjI1NSkuXG4gKiAtIEJJTkFSWSBvdGhlcndpc2UuXG4gKiAtIFRoZSBmb2xsb3dpbmcgcGFydGlhbGx5LXBvcnRhYmxlIGNvbnRyb2wgY2hhcmFjdGVycyBmb3JtIGFcbiAqICAgXCJncmF5IGxpc3RcIiB0aGF0IGlzIGlnbm9yZWQgaW4gdGhpcyBkZXRlY3Rpb24gYWxnb3JpdGhtOlxuICogICAoNyB7QkVMfSwgOCB7QlN9LCAxMSB7VlR9LCAxMiB7RkZ9LCAyNiB7U1VCfSwgMjcge0VTQ30pLlxuICogSU4gYXNzZXJ0aW9uOiB0aGUgZmllbGRzIEZyZXEgb2YgZHluX2x0cmVlIGFyZSBzZXQuXG4gKi9cbmZ1bmN0aW9uIGRldGVjdF9kYXRhX3R5cGUocykge1xuICAvKiBibGFja19tYXNrIGlzIHRoZSBiaXQgbWFzayBvZiBibGFjay1saXN0ZWQgYnl0ZXNcbiAgICogc2V0IGJpdHMgMC4uNiwgMTQuLjI1LCBhbmQgMjguLjMxXG4gICAqIDB4ZjNmZmMwN2YgPSBiaW5hcnkgMTExMTAwMTExMTExMTExMTExMDAwMDAwMDExMTExMTFcbiAgICovXG4gIHZhciBibGFja19tYXNrID0gMHhmM2ZmYzA3ZjtcbiAgdmFyIG47XG5cbiAgLyogQ2hlY2sgZm9yIG5vbi10ZXh0dWFsIChcImJsYWNrLWxpc3RlZFwiKSBieXRlcy4gKi9cbiAgZm9yIChuID0gMDsgbiA8PSAzMTsgbisrLCBibGFja19tYXNrID4+Pj0gMSkge1xuICAgIGlmICgoYmxhY2tfbWFzayAmIDEpICYmIChzLmR5bl9sdHJlZVtuKjJdLyouRnJlcSovICE9PSAwKSkge1xuICAgICAgcmV0dXJuIFpfQklOQVJZO1xuICAgIH1cbiAgfVxuXG4gIC8qIENoZWNrIGZvciB0ZXh0dWFsIChcIndoaXRlLWxpc3RlZFwiKSBieXRlcy4gKi9cbiAgaWYgKHMuZHluX2x0cmVlWzkgKiAyXS8qLkZyZXEqLyAhPT0gMCB8fCBzLmR5bl9sdHJlZVsxMCAqIDJdLyouRnJlcSovICE9PSAwIHx8XG4gICAgICBzLmR5bl9sdHJlZVsxMyAqIDJdLyouRnJlcSovICE9PSAwKSB7XG4gICAgcmV0dXJuIFpfVEVYVDtcbiAgfVxuICBmb3IgKG4gPSAzMjsgbiA8IExJVEVSQUxTOyBuKyspIHtcbiAgICBpZiAocy5keW5fbHRyZWVbbiAqIDJdLyouRnJlcSovICE9PSAwKSB7XG4gICAgICByZXR1cm4gWl9URVhUO1xuICAgIH1cbiAgfVxuXG4gIC8qIFRoZXJlIGFyZSBubyBcImJsYWNrLWxpc3RlZFwiIG9yIFwid2hpdGUtbGlzdGVkXCIgYnl0ZXM6XG4gICAqIHRoaXMgc3RyZWFtIGVpdGhlciBpcyBlbXB0eSBvciBoYXMgdG9sZXJhdGVkIChcImdyYXktbGlzdGVkXCIpIGJ5dGVzIG9ubHkuXG4gICAqL1xuICByZXR1cm4gWl9CSU5BUlk7XG59XG5cblxudmFyIHN0YXRpY19pbml0X2RvbmUgPSBmYWxzZTtcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBJbml0aWFsaXplIHRoZSB0cmVlIGRhdGEgc3RydWN0dXJlcyBmb3IgYSBuZXcgemxpYiBzdHJlYW0uXG4gKi9cbmZ1bmN0aW9uIF90cl9pbml0KHMpXG57XG5cbiAgaWYgKCFzdGF0aWNfaW5pdF9kb25lKSB7XG4gICAgdHJfc3RhdGljX2luaXQoKTtcbiAgICBzdGF0aWNfaW5pdF9kb25lID0gdHJ1ZTtcbiAgfVxuXG4gIHMubF9kZXNjICA9IG5ldyBUcmVlRGVzYyhzLmR5bl9sdHJlZSwgc3RhdGljX2xfZGVzYyk7XG4gIHMuZF9kZXNjICA9IG5ldyBUcmVlRGVzYyhzLmR5bl9kdHJlZSwgc3RhdGljX2RfZGVzYyk7XG4gIHMuYmxfZGVzYyA9IG5ldyBUcmVlRGVzYyhzLmJsX3RyZWUsIHN0YXRpY19ibF9kZXNjKTtcblxuICBzLmJpX2J1ZiA9IDA7XG4gIHMuYmlfdmFsaWQgPSAwO1xuXG4gIC8qIEluaXRpYWxpemUgdGhlIGZpcnN0IGJsb2NrIG9mIHRoZSBmaXJzdCBmaWxlOiAqL1xuICBpbml0X2Jsb2NrKHMpO1xufVxuXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogU2VuZCBhIHN0b3JlZCBibG9ja1xuICovXG5mdW5jdGlvbiBfdHJfc3RvcmVkX2Jsb2NrKHMsIGJ1Ziwgc3RvcmVkX2xlbiwgbGFzdClcbi8vRGVmbGF0ZVN0YXRlICpzO1xuLy9jaGFyZiAqYnVmOyAgICAgICAvKiBpbnB1dCBibG9jayAqL1xuLy91bGcgc3RvcmVkX2xlbjsgICAvKiBsZW5ndGggb2YgaW5wdXQgYmxvY2sgKi9cbi8vaW50IGxhc3Q7ICAgICAgICAgLyogb25lIGlmIHRoaXMgaXMgdGhlIGxhc3QgYmxvY2sgZm9yIGEgZmlsZSAqL1xue1xuICBzZW5kX2JpdHMocywgKFNUT1JFRF9CTE9DSzw8MSkrKGxhc3QgPyAxIDogMCksIDMpOyAgICAvKiBzZW5kIGJsb2NrIHR5cGUgKi9cbiAgY29weV9ibG9jayhzLCBidWYsIHN0b3JlZF9sZW4sIHRydWUpOyAvKiB3aXRoIGhlYWRlciAqL1xufVxuXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogU2VuZCBvbmUgZW1wdHkgc3RhdGljIGJsb2NrIHRvIGdpdmUgZW5vdWdoIGxvb2thaGVhZCBmb3IgaW5mbGF0ZS5cbiAqIFRoaXMgdGFrZXMgMTAgYml0cywgb2Ygd2hpY2ggNyBtYXkgcmVtYWluIGluIHRoZSBiaXQgYnVmZmVyLlxuICovXG5mdW5jdGlvbiBfdHJfYWxpZ24ocykge1xuICBzZW5kX2JpdHMocywgU1RBVElDX1RSRUVTPDwxLCAzKTtcbiAgc2VuZF9jb2RlKHMsIEVORF9CTE9DSywgc3RhdGljX2x0cmVlKTtcbiAgYmlfZmx1c2gocyk7XG59XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBEZXRlcm1pbmUgdGhlIGJlc3QgZW5jb2RpbmcgZm9yIHRoZSBjdXJyZW50IGJsb2NrOiBkeW5hbWljIHRyZWVzLCBzdGF0aWNcbiAqIHRyZWVzIG9yIHN0b3JlLCBhbmQgb3V0cHV0IHRoZSBlbmNvZGVkIGJsb2NrIHRvIHRoZSB6aXAgZmlsZS5cbiAqL1xuZnVuY3Rpb24gX3RyX2ZsdXNoX2Jsb2NrKHMsIGJ1Ziwgc3RvcmVkX2xlbiwgbGFzdClcbi8vRGVmbGF0ZVN0YXRlICpzO1xuLy9jaGFyZiAqYnVmOyAgICAgICAvKiBpbnB1dCBibG9jaywgb3IgTlVMTCBpZiB0b28gb2xkICovXG4vL3VsZyBzdG9yZWRfbGVuOyAgIC8qIGxlbmd0aCBvZiBpbnB1dCBibG9jayAqL1xuLy9pbnQgbGFzdDsgICAgICAgICAvKiBvbmUgaWYgdGhpcyBpcyB0aGUgbGFzdCBibG9jayBmb3IgYSBmaWxlICovXG57XG4gIHZhciBvcHRfbGVuYiwgc3RhdGljX2xlbmI7ICAvKiBvcHRfbGVuIGFuZCBzdGF0aWNfbGVuIGluIGJ5dGVzICovXG4gIHZhciBtYXhfYmxpbmRleCA9IDA7ICAgICAgICAvKiBpbmRleCBvZiBsYXN0IGJpdCBsZW5ndGggY29kZSBvZiBub24gemVybyBmcmVxICovXG5cbiAgLyogQnVpbGQgdGhlIEh1ZmZtYW4gdHJlZXMgdW5sZXNzIGEgc3RvcmVkIGJsb2NrIGlzIGZvcmNlZCAqL1xuICBpZiAocy5sZXZlbCA+IDApIHtcblxuICAgIC8qIENoZWNrIGlmIHRoZSBmaWxlIGlzIGJpbmFyeSBvciB0ZXh0ICovXG4gICAgaWYgKHMuc3RybS5kYXRhX3R5cGUgPT09IFpfVU5LTk9XTikge1xuICAgICAgcy5zdHJtLmRhdGFfdHlwZSA9IGRldGVjdF9kYXRhX3R5cGUocyk7XG4gICAgfVxuXG4gICAgLyogQ29uc3RydWN0IHRoZSBsaXRlcmFsIGFuZCBkaXN0YW5jZSB0cmVlcyAqL1xuICAgIGJ1aWxkX3RyZWUocywgcy5sX2Rlc2MpO1xuICAgIC8vIFRyYWNldigoc3RkZXJyLCBcIlxcbmxpdCBkYXRhOiBkeW4gJWxkLCBzdGF0ICVsZFwiLCBzLT5vcHRfbGVuLFxuICAgIC8vICAgICAgICBzLT5zdGF0aWNfbGVuKSk7XG5cbiAgICBidWlsZF90cmVlKHMsIHMuZF9kZXNjKTtcbiAgICAvLyBUcmFjZXYoKHN0ZGVyciwgXCJcXG5kaXN0IGRhdGE6IGR5biAlbGQsIHN0YXQgJWxkXCIsIHMtPm9wdF9sZW4sXG4gICAgLy8gICAgICAgIHMtPnN0YXRpY19sZW4pKTtcbiAgICAvKiBBdCB0aGlzIHBvaW50LCBvcHRfbGVuIGFuZCBzdGF0aWNfbGVuIGFyZSB0aGUgdG90YWwgYml0IGxlbmd0aHMgb2ZcbiAgICAgKiB0aGUgY29tcHJlc3NlZCBibG9jayBkYXRhLCBleGNsdWRpbmcgdGhlIHRyZWUgcmVwcmVzZW50YXRpb25zLlxuICAgICAqL1xuXG4gICAgLyogQnVpbGQgdGhlIGJpdCBsZW5ndGggdHJlZSBmb3IgdGhlIGFib3ZlIHR3byB0cmVlcywgYW5kIGdldCB0aGUgaW5kZXhcbiAgICAgKiBpbiBibF9vcmRlciBvZiB0aGUgbGFzdCBiaXQgbGVuZ3RoIGNvZGUgdG8gc2VuZC5cbiAgICAgKi9cbiAgICBtYXhfYmxpbmRleCA9IGJ1aWxkX2JsX3RyZWUocyk7XG5cbiAgICAvKiBEZXRlcm1pbmUgdGhlIGJlc3QgZW5jb2RpbmcuIENvbXB1dGUgdGhlIGJsb2NrIGxlbmd0aHMgaW4gYnl0ZXMuICovXG4gICAgb3B0X2xlbmIgPSAocy5vcHRfbGVuKzMrNykgPj4+IDM7XG4gICAgc3RhdGljX2xlbmIgPSAocy5zdGF0aWNfbGVuKzMrNykgPj4+IDM7XG5cbiAgICAvLyBUcmFjZXYoKHN0ZGVyciwgXCJcXG5vcHQgJWx1KCVsdSkgc3RhdCAlbHUoJWx1KSBzdG9yZWQgJWx1IGxpdCAldSBcIixcbiAgICAvLyAgICAgICAgb3B0X2xlbmIsIHMtPm9wdF9sZW4sIHN0YXRpY19sZW5iLCBzLT5zdGF0aWNfbGVuLCBzdG9yZWRfbGVuLFxuICAgIC8vICAgICAgICBzLT5sYXN0X2xpdCkpO1xuXG4gICAgaWYgKHN0YXRpY19sZW5iIDw9IG9wdF9sZW5iKSB7IG9wdF9sZW5iID0gc3RhdGljX2xlbmI7IH1cblxuICB9IGVsc2Uge1xuICAgIC8vIEFzc2VydChidWYgIT0gKGNoYXIqKTAsIFwibG9zdCBidWZcIik7XG4gICAgb3B0X2xlbmIgPSBzdGF0aWNfbGVuYiA9IHN0b3JlZF9sZW4gKyA1OyAvKiBmb3JjZSBhIHN0b3JlZCBibG9jayAqL1xuICB9XG5cbiAgaWYgKChzdG9yZWRfbGVuKzQgPD0gb3B0X2xlbmIpICYmIChidWYgIT09IC0xKSkge1xuICAgIC8qIDQ6IHR3byB3b3JkcyBmb3IgdGhlIGxlbmd0aHMgKi9cblxuICAgIC8qIFRoZSB0ZXN0IGJ1ZiAhPSBOVUxMIGlzIG9ubHkgbmVjZXNzYXJ5IGlmIExJVF9CVUZTSVpFID4gV1NJWkUuXG4gICAgICogT3RoZXJ3aXNlIHdlIGNhbid0IGhhdmUgcHJvY2Vzc2VkIG1vcmUgdGhhbiBXU0laRSBpbnB1dCBieXRlcyBzaW5jZVxuICAgICAqIHRoZSBsYXN0IGJsb2NrIGZsdXNoLCBiZWNhdXNlIGNvbXByZXNzaW9uIHdvdWxkIGhhdmUgYmVlblxuICAgICAqIHN1Y2Nlc3NmdWwuIElmIExJVF9CVUZTSVpFIDw9IFdTSVpFLCBpdCBpcyBuZXZlciB0b28gbGF0ZSB0b1xuICAgICAqIHRyYW5zZm9ybSBhIGJsb2NrIGludG8gYSBzdG9yZWQgYmxvY2suXG4gICAgICovXG4gICAgX3RyX3N0b3JlZF9ibG9jayhzLCBidWYsIHN0b3JlZF9sZW4sIGxhc3QpO1xuXG4gIH0gZWxzZSBpZiAocy5zdHJhdGVneSA9PT0gWl9GSVhFRCB8fCBzdGF0aWNfbGVuYiA9PT0gb3B0X2xlbmIpIHtcblxuICAgIHNlbmRfYml0cyhzLCAoU1RBVElDX1RSRUVTPDwxKSArIChsYXN0ID8gMSA6IDApLCAzKTtcbiAgICBjb21wcmVzc19ibG9jayhzLCBzdGF0aWNfbHRyZWUsIHN0YXRpY19kdHJlZSk7XG5cbiAgfSBlbHNlIHtcbiAgICBzZW5kX2JpdHMocywgKERZTl9UUkVFUzw8MSkgKyAobGFzdCA/IDEgOiAwKSwgMyk7XG4gICAgc2VuZF9hbGxfdHJlZXMocywgcy5sX2Rlc2MubWF4X2NvZGUrMSwgcy5kX2Rlc2MubWF4X2NvZGUrMSwgbWF4X2JsaW5kZXgrMSk7XG4gICAgY29tcHJlc3NfYmxvY2socywgcy5keW5fbHRyZWUsIHMuZHluX2R0cmVlKTtcbiAgfVxuICAvLyBBc3NlcnQgKHMtPmNvbXByZXNzZWRfbGVuID09IHMtPmJpdHNfc2VudCwgXCJiYWQgY29tcHJlc3NlZCBzaXplXCIpO1xuICAvKiBUaGUgYWJvdmUgY2hlY2sgaXMgbWFkZSBtb2QgMl4zMiwgZm9yIGZpbGVzIGxhcmdlciB0aGFuIDUxMiBNQlxuICAgKiBhbmQgdUxvbmcgaW1wbGVtZW50ZWQgb24gMzIgYml0cy5cbiAgICovXG4gIGluaXRfYmxvY2socyk7XG5cbiAgaWYgKGxhc3QpIHtcbiAgICBiaV93aW5kdXAocyk7XG4gIH1cbiAgLy8gVHJhY2V2KChzdGRlcnIsXCJcXG5jb21wcmxlbiAlbHUoJWx1KSBcIiwgcy0+Y29tcHJlc3NlZF9sZW4+PjMsXG4gIC8vICAgICAgIHMtPmNvbXByZXNzZWRfbGVuLTcqbGFzdCkpO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFNhdmUgdGhlIG1hdGNoIGluZm8gYW5kIHRhbGx5IHRoZSBmcmVxdWVuY3kgY291bnRzLiBSZXR1cm4gdHJ1ZSBpZlxuICogdGhlIGN1cnJlbnQgYmxvY2sgbXVzdCBiZSBmbHVzaGVkLlxuICovXG5mdW5jdGlvbiBfdHJfdGFsbHkocywgZGlzdCwgbGMpXG4vLyAgICBkZWZsYXRlX3N0YXRlICpzO1xuLy8gICAgdW5zaWduZWQgZGlzdDsgIC8qIGRpc3RhbmNlIG9mIG1hdGNoZWQgc3RyaW5nICovXG4vLyAgICB1bnNpZ25lZCBsYzsgICAgLyogbWF0Y2ggbGVuZ3RoLU1JTl9NQVRDSCBvciB1bm1hdGNoZWQgY2hhciAoaWYgZGlzdD09MCkgKi9cbntcbiAgLy92YXIgb3V0X2xlbmd0aCwgaW5fbGVuZ3RoLCBkY29kZTtcblxuICBzLnBlbmRpbmdfYnVmW3MuZF9idWYgKyBzLmxhc3RfbGl0ICogMl0gICAgID0gKGRpc3QgPj4+IDgpICYgMHhmZjtcbiAgcy5wZW5kaW5nX2J1ZltzLmRfYnVmICsgcy5sYXN0X2xpdCAqIDIgKyAxXSA9IGRpc3QgJiAweGZmO1xuXG4gIHMucGVuZGluZ19idWZbcy5sX2J1ZiArIHMubGFzdF9saXRdID0gbGMgJiAweGZmO1xuICBzLmxhc3RfbGl0Kys7XG5cbiAgaWYgKGRpc3QgPT09IDApIHtcbiAgICAvKiBsYyBpcyB0aGUgdW5tYXRjaGVkIGNoYXIgKi9cbiAgICBzLmR5bl9sdHJlZVtsYyoyXS8qLkZyZXEqLysrO1xuICB9IGVsc2Uge1xuICAgIHMubWF0Y2hlcysrO1xuICAgIC8qIEhlcmUsIGxjIGlzIHRoZSBtYXRjaCBsZW5ndGggLSBNSU5fTUFUQ0ggKi9cbiAgICBkaXN0LS07ICAgICAgICAgICAgIC8qIGRpc3QgPSBtYXRjaCBkaXN0YW5jZSAtIDEgKi9cbiAgICAvL0Fzc2VydCgodXNoKWRpc3QgPCAodXNoKU1BWF9ESVNUKHMpICYmXG4gICAgLy8gICAgICAgKHVzaClsYyA8PSAodXNoKShNQVhfTUFUQ0gtTUlOX01BVENIKSAmJlxuICAgIC8vICAgICAgICh1c2gpZF9jb2RlKGRpc3QpIDwgKHVzaClEX0NPREVTLCAgXCJfdHJfdGFsbHk6IGJhZCBtYXRjaFwiKTtcblxuICAgIHMuZHluX2x0cmVlWyhfbGVuZ3RoX2NvZGVbbGNdK0xJVEVSQUxTKzEpICogMl0vKi5GcmVxKi8rKztcbiAgICBzLmR5bl9kdHJlZVtkX2NvZGUoZGlzdCkgKiAyXS8qLkZyZXEqLysrO1xuICB9XG5cbi8vICghKSBUaGlzIGJsb2NrIGlzIGRpc2FibGVkIGluIHpsaWIgZGVmYWlsdHMsXG4vLyBkb24ndCBlbmFibGUgaXQgZm9yIGJpbmFyeSBjb21wYXRpYmlsaXR5XG5cbi8vI2lmZGVmIFRSVU5DQVRFX0JMT0NLXG4vLyAgLyogVHJ5IHRvIGd1ZXNzIGlmIGl0IGlzIHByb2ZpdGFibGUgdG8gc3RvcCB0aGUgY3VycmVudCBibG9jayBoZXJlICovXG4vLyAgaWYgKChzLmxhc3RfbGl0ICYgMHgxZmZmKSA9PT0gMCAmJiBzLmxldmVsID4gMikge1xuLy8gICAgLyogQ29tcHV0ZSBhbiB1cHBlciBib3VuZCBmb3IgdGhlIGNvbXByZXNzZWQgbGVuZ3RoICovXG4vLyAgICBvdXRfbGVuZ3RoID0gcy5sYXN0X2xpdCo4O1xuLy8gICAgaW5fbGVuZ3RoID0gcy5zdHJzdGFydCAtIHMuYmxvY2tfc3RhcnQ7XG4vL1xuLy8gICAgZm9yIChkY29kZSA9IDA7IGRjb2RlIDwgRF9DT0RFUzsgZGNvZGUrKykge1xuLy8gICAgICBvdXRfbGVuZ3RoICs9IHMuZHluX2R0cmVlW2Rjb2RlKjJdLyouRnJlcSovICogKDUgKyBleHRyYV9kYml0c1tkY29kZV0pO1xuLy8gICAgfVxuLy8gICAgb3V0X2xlbmd0aCA+Pj49IDM7XG4vLyAgICAvL1RyYWNldigoc3RkZXJyLFwiXFxubGFzdF9saXQgJXUsIGluICVsZCwgb3V0IH4lbGQoJWxkJSUpIFwiLFxuLy8gICAgLy8gICAgICAgcy0+bGFzdF9saXQsIGluX2xlbmd0aCwgb3V0X2xlbmd0aCxcbi8vICAgIC8vICAgICAgIDEwMEwgLSBvdXRfbGVuZ3RoKjEwMEwvaW5fbGVuZ3RoKSk7XG4vLyAgICBpZiAocy5tYXRjaGVzIDwgKHMubGFzdF9saXQ+PjEpLyppbnQgLzIqLyAmJiBvdXRfbGVuZ3RoIDwgKGluX2xlbmd0aD4+MSkvKmludCAvMiovKSB7XG4vLyAgICAgIHJldHVybiB0cnVlO1xuLy8gICAgfVxuLy8gIH1cbi8vI2VuZGlmXG5cbiAgcmV0dXJuIChzLmxhc3RfbGl0ID09PSBzLmxpdF9idWZzaXplLTEpO1xuICAvKiBXZSBhdm9pZCBlcXVhbGl0eSB3aXRoIGxpdF9idWZzaXplIGJlY2F1c2Ugb2Ygd3JhcGFyb3VuZCBhdCA2NEtcbiAgICogb24gMTYgYml0IG1hY2hpbmVzIGFuZCBiZWNhdXNlIHN0b3JlZCBibG9ja3MgYXJlIHJlc3RyaWN0ZWQgdG9cbiAgICogNjRLLTEgYnl0ZXMuXG4gICAqL1xufVxuXG5leHBvcnRzLl90cl9pbml0ICA9IF90cl9pbml0O1xuZXhwb3J0cy5fdHJfc3RvcmVkX2Jsb2NrID0gX3RyX3N0b3JlZF9ibG9jaztcbmV4cG9ydHMuX3RyX2ZsdXNoX2Jsb2NrICA9IF90cl9mbHVzaF9ibG9jaztcbmV4cG9ydHMuX3RyX3RhbGx5ID0gX3RyX3RhbGx5O1xuZXhwb3J0cy5fdHJfYWxpZ24gPSBfdHJfYWxpZ247IiwiJ3VzZSBzdHJpY3QnO1xuXG5cbmZ1bmN0aW9uIFpTdHJlYW0oKSB7XG4gIC8qIG5leHQgaW5wdXQgYnl0ZSAqL1xuICB0aGlzLmlucHV0ID0gbnVsbDsgLy8gSlMgc3BlY2lmaWMsIGJlY2F1c2Ugd2UgaGF2ZSBubyBwb2ludGVyc1xuICB0aGlzLm5leHRfaW4gPSAwO1xuICAvKiBudW1iZXIgb2YgYnl0ZXMgYXZhaWxhYmxlIGF0IGlucHV0ICovXG4gIHRoaXMuYXZhaWxfaW4gPSAwO1xuICAvKiB0b3RhbCBudW1iZXIgb2YgaW5wdXQgYnl0ZXMgcmVhZCBzbyBmYXIgKi9cbiAgdGhpcy50b3RhbF9pbiA9IDA7XG4gIC8qIG5leHQgb3V0cHV0IGJ5dGUgc2hvdWxkIGJlIHB1dCB0aGVyZSAqL1xuICB0aGlzLm91dHB1dCA9IG51bGw7IC8vIEpTIHNwZWNpZmljLCBiZWNhdXNlIHdlIGhhdmUgbm8gcG9pbnRlcnNcbiAgdGhpcy5uZXh0X291dCA9IDA7XG4gIC8qIHJlbWFpbmluZyBmcmVlIHNwYWNlIGF0IG91dHB1dCAqL1xuICB0aGlzLmF2YWlsX291dCA9IDA7XG4gIC8qIHRvdGFsIG51bWJlciBvZiBieXRlcyBvdXRwdXQgc28gZmFyICovXG4gIHRoaXMudG90YWxfb3V0ID0gMDtcbiAgLyogbGFzdCBlcnJvciBtZXNzYWdlLCBOVUxMIGlmIG5vIGVycm9yICovXG4gIHRoaXMubXNnID0gJycvKlpfTlVMTCovO1xuICAvKiBub3QgdmlzaWJsZSBieSBhcHBsaWNhdGlvbnMgKi9cbiAgdGhpcy5zdGF0ZSA9IG51bGw7XG4gIC8qIGJlc3QgZ3Vlc3MgYWJvdXQgdGhlIGRhdGEgdHlwZTogYmluYXJ5IG9yIHRleHQgKi9cbiAgdGhpcy5kYXRhX3R5cGUgPSAyLypaX1VOS05PV04qLztcbiAgLyogYWRsZXIzMiB2YWx1ZSBvZiB0aGUgdW5jb21wcmVzc2VkIGRhdGEgKi9cbiAgdGhpcy5hZGxlciA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gWlN0cmVhbTsiLG51bGwsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIl19
