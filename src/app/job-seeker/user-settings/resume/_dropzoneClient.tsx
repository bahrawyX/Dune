"use client"
import { UploadDropzone } from '@/services/uploadthing/components/UploadThing'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

const DropzoneClient = () => {
    const router = useRouter()
    
    return (
      <UploadDropzone
          endpoint="resumeUploader"
          onClientUploadComplete={(res) => {
            console.log('=== CV UPLOAD CLIENT: Upload completed successfully ===');
            console.log('CV UPLOAD CLIENT: Response data:', res);
            res?.forEach((file, index) => {
              console.log(`CV UPLOAD CLIENT: File ${index + 1} - name: ${file.name}, url: ${file.url}, key: ${file.key}, size: ${file.size}`);
            });
            
            toast.success('Resume uploaded successfully! AI analysis starting...', { id: 'upload-toast' });
            
            // Refresh the page to show the new resume and start AI processing
            console.log('CV UPLOAD CLIENT: Refreshing page to show new resume and start AI processing');
            router.refresh();
          }}
          onUploadError={(error) => {
            console.error('=== CV UPLOAD CLIENT: Upload error occurred ===');
            console.error('CV UPLOAD CLIENT: Error message:', error.message);
            console.error('CV UPLOAD CLIENT: Error details:', error);
            toast.error(`Upload failed: ${error.message}`, { id: 'upload-toast' });
          }}
          onUploadBegin={(name) => {
            console.log('=== CV UPLOAD CLIENT: Upload started ===');
            console.log('CV UPLOAD CLIENT: File name:', name);
            toast.loading('Uploading resume...', { id: 'upload-toast' });
          }}
          onUploadProgress={(progress) => {
            console.log('CV UPLOAD CLIENT: Upload progress:', progress + '%');
            toast.loading(`Uploading... ${progress}%`, { id: 'upload-toast' });
          }}
      />
    )
}

export default DropzoneClient