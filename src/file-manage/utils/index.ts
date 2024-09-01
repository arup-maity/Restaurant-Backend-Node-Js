import * as Minio from 'minio'

export const minioClient = new Minio.Client({
   endPoint: 'minio.ovh.arupmaity.in',
   port: 9000,
   useSSL: false,
   accessKey: process.env.MINIO_ACCESSKEY as string,
   secretKey: process.env.MINIO_SECRETKEY as string
})

export async function deleteFile(bucketName: string, fileName: string) {
   try {
      await minioClient.removeObject(bucketName, fileName)
   } catch (error) {
      console.log(error)
   }
}