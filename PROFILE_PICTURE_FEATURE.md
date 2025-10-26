# Profile Picture Upload Feature

## Overview

This feature allows mentors to upload their own profile pictures directly from the profile edit page, eliminating the need to contact administrators manually.

## Implementation Flow

1. **User Interface** ([src/components/ProfileForm.js](src/components/ProfileForm.js))
   - Added file input field with preview functionality
   - Validates file type (JPEG, PNG, WebP) and size (max 10MB)
   - Shows current profile picture and preview of selected image
   - Separate upload button to trigger the upload process
   - Real-time status feedback (loading, success, error)

2. **API Endpoint** ([src/pages/api/upload-profile-picture.js](src/pages/api/upload-profile-picture.js))
   - Validates mentor ID and authentication token
   - Accepts base64-encoded image data
   - Validates file type and size server-side
   - Uploads image to Azure Blob Storage
   - Updates Airtable asynchronously with new image URL
   - Returns immediate response to avoid long wait times

3. **Azure Storage Integration** ([src/lib/azure-storage.js](src/lib/azure-storage.js))
   - Uploads images to `mentor-images` container
   - Generates unique filenames: `{mentorId}-{timestamp}.{extension}`
   - Sets proper content types for browser display
   - Returns public URL for the uploaded image

4. **Airtable Integration** ([src/server/airtable-mentors.js](src/server/airtable-mentors.js))
   - New function `updateMentorImage()` to update the `Image_Attachment` field
   - Accepts public URL and updates Airtable record
   - Triggers existing Airtable automation to process the image

## Architecture Decisions

### Asynchronous Processing
The API endpoint returns immediately after uploading to Azure, then updates Airtable in the background. This prevents users from experiencing long wait times while Airtable processes the image.

### Base64 Encoding
Images are sent as base64-encoded strings in JSON format instead of multipart/form-data. This simplifies the implementation with Next.js API routes and avoids the need for additional parsing libraries.

### Separate Endpoint
The profile picture upload is implemented as a separate API endpoint (`/api/upload-profile-picture`) rather than being part of the existing save-profile endpoint. This provides:
- Better separation of concerns
- Independent error handling
- Ability to upload images without saving the entire profile

### Azure First, Then Airtable
Images are uploaded to Azure Storage first, then the URL is sent to Airtable. This is necessary because:
- Airtable requires publicly accessible URLs for attachment fields
- The existing automation already handles image processing from Airtable

## Files Modified

1. **src/components/ProfileForm.js** - Added image upload UI
2. **src/pages/profile.js** - Added image upload handler
3. **src/pages/api/upload-profile-picture.js** - New API endpoint (created)
4. **src/lib/azure-storage.js** - Azure storage utilities (created)
5. **src/server/airtable-mentors.js** - Added `updateMentorImage` function
6. **.env.example** - Added `AZURE_STORAGE_CONNECTION_STRING`
7. **package.json** - Added `@azure/storage-blob` dependency

## Environment Variables

Add the following to your `.env` file:

```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
```

Get this from your Azure Storage account under "Access keys" section.

## Testing Checklist

### Local Testing
1. [ ] Set up Azure Storage connection string in `.env`
2. [ ] Start development server: `yarn dev`
3. [ ] Navigate to a profile edit page with valid ID and token
4. [ ] Verify current profile picture displays correctly
5. [ ] Select a valid image file (JPEG/PNG/WebP)
6. [ ] Verify preview appears correctly
7. [ ] Click "Загрузить фото" button
8. [ ] Verify loading state shows spinner
9. [ ] Verify success message appears
10. [ ] Check Azure Storage account to confirm image was uploaded
11. [ ] Check Airtable to confirm image was updated (may take a moment)

### Error Handling Tests
1. [ ] Try uploading without selecting a file - should show alert
2. [ ] Try uploading invalid file type (e.g., .pdf) - should show alert
3. [ ] Try uploading file larger than 10MB - should show alert
4. [ ] Test with invalid mentor ID - should return 404
5. [ ] Test with invalid auth token - should return 403
6. [ ] Test with missing Azure credentials - should return 500 with friendly error

### Edge Cases
1. [ ] Test uploading multiple times in succession
2. [ ] Test canceling after selecting an image
3. [ ] Test switching between different images before uploading
4. [ ] Test concurrent uploads (shouldn't be possible due to loading state)

## Deployment Considerations

1. **Environment Variables**: Ensure `AZURE_STORAGE_CONNECTION_STRING` is set in production
2. **Azure Container**: The `mentor-images` container will be created automatically if it doesn't exist
3. **Permissions**: Ensure the Azure Storage account has proper access configured
4. **Airtable**: No changes needed - existing automation should work with the new flow

## Future Improvements

1. **Image Optimization**: Consider adding server-side image resizing/optimization before upload
2. **Direct Upload**: Could use Azure SAS tokens for direct browser-to-Azure uploads
3. **Progress Indicator**: Add upload progress bar for large files
4. **Crop Tool**: Add image cropping functionality before upload
5. **Format Conversion**: Automatically convert all images to WebP for better performance
6. **CDN**: Consider adding Azure CDN for faster image delivery

## Troubleshooting

### "Failed to upload image to Azure storage"
- Check if `AZURE_STORAGE_CONNECTION_STRING` is set correctly
- Verify Azure Storage account is accessible
- Check Azure Storage account firewall rules

### "Image uploaded but not showing in Airtable"
- Check Airtable automation is still enabled
- Verify the `Image_Attachment` field name matches in Airtable
- Check API logs for any asynchronous update errors

### "File size limit exceeded"
- Current limit is 10MB (configurable in API endpoint)
- Consider optimizing images before upload
- Check Next.js body size limit configuration

## Git Branch

This feature is implemented in branch: `feature/profile-picture-upload`

To merge into main:
```bash
git checkout main
git merge feature/profile-picture-upload
git push origin main
```
