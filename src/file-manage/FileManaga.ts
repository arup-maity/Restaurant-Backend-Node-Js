import { Hono } from "hono";
import { adminAuthentication } from "../middleware";
import { Readable } from 'stream';

import * as Minio from 'minio'

const fileRoute = new Hono()

const minioClient = new Minio.Client({
   endPoint: 'minio.ovh.arupmaity.in',
   port: 9000,
   useSSL: false,
   accessKey: process.env.MINIO_ACCESSKEY as string,
   secretKey: process.env.MINIO_SECRETKEY as string
})



fileRoute.post("/upload-image", async c => {
   try {
      const formData = await c.req.formData();
      // Access and validate the uploaded file (if necessary)
      const file: any = formData.get('file');
      const bucketName: any = formData.get('bucket')
      if (!bucketName) return c.json({ success: false, message: 'Bucket name not found' })
      // bucket
      const exists = await minioClient.bucketExists(bucketName)
      if (!exists) {
         await minioClient.makeBucket(bucketName)
      }
      if (!file) {
         return c.json({ success: false, message: 'No file uploaded' }, 409)
      }
      // Check file type (example validation)
      if (!file.type.startsWith('image/')) {
         return c.json({ success: false, message: 'Invalid file type. Only images allowed.' }, 409)
      }
      // Create a Readable stream from the File object
      const fileStream = Readable.from(file.stream()); // Assuming file.stream() exists
      // Handle file upload to Minio
      await minioClient.putObject(bucketName, file.name, fileStream, file.size)
      // console.log('Upload', upload)
      const object = {
         bucket: bucketName,
         name: file?.name,
         size: file.size,
         contentType: file.type,
         url: `${bucketName}/${file?.name}`
      }
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

      return c.json({ success: true, object }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, message: error }, 500)
   }
})

export default fileRoute