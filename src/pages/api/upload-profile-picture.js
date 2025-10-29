import { uploadImageToAzure, generateFileName } from '../../lib/azure-storage'
import { updateMentorImage } from '../../server/airtable-mentors'
import { getOneMentorById } from '../../server/mentors-data'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const uploadProfilePictureHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ success: false, error: 'Method not allowed' })
  }

  // Validate query parameters
  req.query.id = parseInt(req.query.id, 10)
  if (isNaN(req.query.id)) {
    return res.status(404).send({ success: false, error: 'Mentor not found.' })
  }

  try {
    // Verify mentor exists and token is valid
    const mentor = await getOneMentorById(req.query.id, { showHiddenFields: true })

    if (!mentor) {
      return res.status(404).send({ success: false, error: 'Mentor not found.' })
    }
    if (!req.query.token || mentor.authToken !== req.query.token) {
      return res.status(403).send({ success: false, error: 'Access denied.' })
    }

    // Parse the base64 image from request body
    const { image, fileName, contentType } = req.body

    if (!image || !fileName || !contentType) {
      return res
        .status(400)
        .send({ success: false, error: 'Missing required fields: image, fileName, contentType' })
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).send({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      })
    }

    // Validate file size (max 10MB)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const fileSizeInMB = buffer.length / (1024 * 1024)

    if (fileSizeInMB > 10) {
      return res.status(400).send({
        success: false,
        error: 'File size exceeds 10MB limit.',
      })
    }

    // Generate unique filename
    const uniqueFileName = generateFileName(mentor.id, fileName)

    // Upload to Azure Storage
    const azureImageUrl = await uploadImageToAzure(buffer, uniqueFileName, contentType)

    // Return success immediately - the Airtable update will happen asynchronously
    res.status(200).send({
      success: true,
      message: 'Image uploaded successfully. Your profile will be updated shortly.',
      imageUrl: azureImageUrl,
    })

    // Update Airtable asynchronously (don't await)
    updateMentorImage(mentor.airtableId, azureImageUrl).catch((error) => {
      console.error('Error updating Airtable with new image:', error)
      // Log the error but don't fail the request since Azure upload succeeded
    })
  } catch (error) {
    console.error('Error in upload-profile-picture handler:', error)
    return res.status(500).send({
      success: false,
      error: 'An error occurred while uploading your profile picture. Please try again later.',
    })
  }
}

export default uploadProfilePictureHandler
