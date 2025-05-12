import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

let cloudflareAccessKey = import.meta.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
let cloudflareEndpoint = import.meta.env.CLOUDFLARE_R2_ENDPOINT;
let cloudflareAccessKeySecret = import.meta.env.CLOUDFLARE_R2_ACCESS_KEY_SECRET;
let cloudflarePublicEndpoint = import.meta.env.CLOUDFLARE_R2_PUBLIC_ENDPOINT;

// Configure AWS to use Cloudflare R2
const s3Client = new S3Client({
    endpoint: cloudflareEndpoint, // Your Cloudflare R2 endpoint
    region: "auto", // Adjust as needed
    credentials: {
        accessKeyId: cloudflareAccessKey, // Your Cloudflare R2 access key
        secretAccessKey: cloudflareAccessKeySecret, // Your Cloudflare R2 secret key
    },
    forcePathStyle: true, // For S3-compatible services
});

async function uploadMemeToS3Bucket(file) {
    const fileName = `${uuidv4()}.${file.fileName.split(".").pop()}`; // Generate a unique file name
    // console.log(file.fileObject.arrayBuffer())
    const bucketName = "memes"; // Replace with your actual bucket name

    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: fileName,
                Body: file.fileObject,
                ContentType: file.mimeType,
            },
        });

        // Optionally, listen to the upload progress
        upload.on("httpUploadProgress", (progress) => {
            console.log(
                `Upload progress: ${progress.loaded} of ${progress.total} bytes`,
            );
        });

        await upload.done();

        // Construct the URL of the uploaded file
        const fileUrl = `${cloudflarePublicEndpoint}/${fileName}`;
        return fileUrl;
    } catch (error) {
        console.error("Error uploading file to R2:", error);
        throw new Error("Failed to upload file.");
    }
}

export { uploadMemeToS3Bucket }