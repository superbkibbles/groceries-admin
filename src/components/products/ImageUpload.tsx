import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [images, onChange, maxImages]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images`);
      return;
    }

    const newImages: string[] = [...images];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds the maximum file size of 5MB`);
        return;
      }

      // Store the file object directly in the images array
      // This will be handled by the parent component when submitting the form
      newImages.push(file as unknown as string);
      
      // Also create a preview URL for display purposes
      const previewUrl = URL.createObjectURL(file);
      (file as any).previewUrl = previewUrl;
    });

    onChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);

    // In a real implementation with a backend:
    // const imageUrl = images[index];
    // productService.deleteProductImage(productId, imageUrl).then(() => {
    //   const newImages = [...images];
    //   newImages.splice(index, 1);
    //   onChange(newImages);
    // });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
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

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag and drop your images here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (JPEG, PNG, GIF, WEBP up to 5MB)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={images.length >= maxImages}
          >
            Choose Files
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileInput}
            disabled={images.length >= maxImages}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-md border overflow-hidden"
            >
              <img
                src={typeof image === 'string' ? image : (image as any).previewUrl}
                alt={`Product image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}

          {images.length < maxImages && (
            <div
              className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Add Image</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;