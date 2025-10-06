import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 8,
}) => {
  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageUpload = (res: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newImages = res.map((image: any) => image.url);
    const next = [...images, ...newImages];
    if (next.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images`);
      return;
    }
    onChange(next);
    toast.success("Upload Completed");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Label className="text-base">Product Images</Label>
          <span className="text-destructive">*</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {images.length} / {maxImages} images
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative">
            <Image
              src={imageUrl}
              alt={`Product ${index + 1}`}
              width={100}
              height={100}
              className="rounded"
            />
            <X
              className="absolute top-0 right-0 text-red-500 cursor-pointer bg-white rounded-full"
              onClick={() => removeImage(index)}
            />
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Main
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length < maxImages && (
        <UploadButton
          appearance={{
            button: "bg-primary text-white h-full py-2 px-4",
            container: "items-start justify-start",
          }}
          endpoint="imageUploader"
          onClientUploadComplete={handleImageUpload}
          onUploadError={(error: Error) => {
            toast.error(`Upload error: ${error.message}`);
          }}
        />
      )}

      <p className="text-sm text-muted-foreground">
        Recommended image size: 1200x1200px. Maximum file size: 4MB.
      </p>
    </div>
  );
};

export default ImageUpload;
