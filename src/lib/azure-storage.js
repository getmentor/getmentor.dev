import { BlobServiceClient } from '@azure/storage-blob'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME

if (!connectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set')
}

export async function uploadImageToAzure(buffer, fileName, contentType) {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName)

    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'blob', // Public read access for blobs
    })

    const blobClient = containerClient.getBlockBlobClient(fileName)

    // Upload the image
    await blobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    })

    // Return the public URL
    return blobClient.url
  } catch (error) {
    console.error('Error uploading image to Azure:', error)
    throw new Error('Failed to upload image to Azure storage')
  }
}

export function generateFileName(mentorId, originalFileName) {
  const timestamp = Date.now()
  const extension = originalFileName.split('.').pop()
  return `tmp/${mentorId}-${timestamp}.${extension}`
}
