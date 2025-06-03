"use client";

import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

          const style = document.createElement('style');
  style.innerHTML = `
    .cloudinary-widget {
      z-index: 10000 !important;
    }
    .cloudinary-widget iframe {
      z-index: 10000 !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
}, []);



    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-28 h-32 rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <Button type="button" onClick={() => onRemove(url)} variant="destructive" className="h-6 w-6 p-0">
                                <Trash className="h-2 w-2" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}
            </div>
            <CldUploadWidget 
                onSuccess={onUpload} 
                uploadPreset="onrent"
                options={{
                    sources: ['local', 'url', 'camera', 'google_drive'],
                    multiple: true,
                    maxFiles: 5,
                    clientAllowedFormats: ['image'],
                    styles: {
                        palette: {
                            window: "#FFFFFF",
                            sourceBg: "#F4F4F5",
                            windowBorder: "#90a0b3",
                            tabIcon: "#000000",
                            inactiveTabIcon: "#555a5f",
                            menuIcons: "#555a5f",
                            link: "#000000",
                            action: "#000000",
                            inProgress: "#0078FF",
                            complete: "#00BFFF",
                            error: "#FF0000",
                        }
                    }
                }}
            >
                {({ open }) => {
                    return (
                        <Button 
                            disabled={disabled} 
                            type="button" 
                            onClick={() => open()}
                            variant="secondary"
                        >
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Upload Image
                        </Button>
                    )
                }}
            </CldUploadWidget>
        </div>
    );
};

export default ImageUpload;