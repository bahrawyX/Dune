"use client"
import {
  generateUploadDropzone,
} from "@uploadthing/react";
  import { CustomFileRouter } from "../router";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
import { Json } from "@uploadthing/shared";
  
   const UploadDropzoneComponent = generateUploadDropzone<CustomFileRouter>();
  
   export function UploadDropzone({className ,onClientUploadComplete,onUploadError, ...props}:ComponentProps<typeof UploadDropzoneComponent>){
        return <UploadDropzoneComponent 
                    className={cn("border-dashed border-2 border-muted rounded-lg items-center justify-center flex",className)} 
                    onClientUploadComplete={res =>{
                        // Dismiss any loading toasts
                        toast.dismiss('upload-toast');
                        
                        // Show success message from server
                        res.forEach(({serverData})=>{
                            if (serverData?.message) {
                                toast.success(serverData.message);
                            }
                        });
                        
                        // Call the parent callback
                        onClientUploadComplete?.(res);
                    }} 
                    onUploadError={(err:UploadThingError<Json>) =>{
                        // Dismiss any loading toasts
                        toast.dismiss('upload-toast');
                        
                        // Show error message
                        toast.error(err.message);
                        
                        // Call the parent callback
                        onUploadError?.(err);
                    }} 
                    {...props} />
   }

 