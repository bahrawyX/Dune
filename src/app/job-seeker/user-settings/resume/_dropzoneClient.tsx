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
            console.log('Client upload complete:', res);
            
            // Refresh the page to show the new resume
            router.refresh();
          }}
          onUploadError={(error) => {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}`);
          }}
          onUploadBegin={(name) => {
            console.log('Upload began for file:', name);
            toast.loading('Uploading resume...', { id: 'upload-toast' });
          }}
          onUploadProgress={(progress) => {
            console.log('Upload progress:', progress);
            toast.loading(`Uploading... ${progress}%`, { id: 'upload-toast' });
          }}
      />
    )
}

export default DropzoneClient