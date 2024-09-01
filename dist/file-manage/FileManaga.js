"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const stream_1 = require("stream");
const Minio = __importStar(require("minio"));
const fileRoute = new hono_1.Hono();
const minioClient = new Minio.Client({
    endPoint: 'minio.ovh.arupmaity.in',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY
});
fileRoute.post("/upload-image", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formData = yield c.req.formData();
        // Access and validate the uploaded file (if necessary)
        const file = formData.get('file');
        const bucketName = formData.get('bucket');
        if (!bucketName)
            return c.json({ success: false, message: 'Bucket name not found' });
        // bucket
        const exists = yield minioClient.bucketExists(bucketName);
        if (!exists) {
            yield minioClient.makeBucket(bucketName);
        }
        if (!file) {
            return c.json({ success: false, message: 'No file uploaded' }, 409);
        }
        // Check file type (example validation)
        if (!file.type.startsWith('image/')) {
            return c.json({ success: false, message: 'Invalid file type. Only images allowed.' }, 409);
        }
        // Create a Readable stream from the File object
        const fileStream = stream_1.Readable.from(file.stream()); // Assuming file.stream() exists
        // Handle file upload to Minio
        yield minioClient.putObject(bucketName, file.name, fileStream, file.size);
        // console.log('Upload', upload)
        const object = {
            bucket: bucketName,
            name: file === null || file === void 0 ? void 0 : file.name,
            size: file.size,
            contentType: file.type,
            url: `${bucketName}/${file === null || file === void 0 ? void 0 : file.name}`
        };
        // const data = []
        // const stream = minioClient.listObjects(bucketName, '', true)
        // stream.on('data', function (obj) {
        //    data.push(obj)
        // })
        // stream.on('end', function (obj) {
        //    console.log('end =>', data)
        // })
        // stream.on('error', function (err) {
        //    console.log('error =>', err)
        // })
        // console.log('all =>', data)
        return c.json({ success: true, object }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
exports.default = fileRoute;
