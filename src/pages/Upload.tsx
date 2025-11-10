import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { imageApi } from '@/db/api';
import { webhookService } from '@/services/webhookService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, X, Loader2, Image as ImageIcon } from 'lucide-react';
import WebhookStatus from '@/components/common/WebhookStatus';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JPG, PNG, or GIF image',
        variant: 'destructive'
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Image must be smaller than 5MB',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    try {
      setUploading(true);

      // Upload image to Supabase Storage for display purposes
      const imageUrl = await imageApi.uploadImage(file, user.id);

      // Create image record in database
      const imageRecord = await imageApi.createImage({
        user_id: user.id,
        original_url: imageUrl,
        filename: file.name
      });

      toast({
        title: 'Analyzing Image',
        description: 'Please wait while we analyze your image...'
      });

      // Send the actual image file to webhook for analysis and WAIT for completion
      await webhookService.sendImageForAnalysis(imageRecord.id, file);

      toast({
        title: 'Analysis Complete',
        description: 'Your image has been analyzed successfully!'
      });

      // Navigate to analysis page after webhook completes
      navigate(`/analyze/${imageRecord.id}`);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-bold text-foreground bg-[#ff0000ff] bg-none text-[40px]">Upload Image</h1>
        <p className="text-muted-foreground mt-2">
          Upload an image to detect and analyze errors
        </p>
      </div>
      
      {/* Webhook Status Indicator */}
      <div className="mb-6">
        <WebhookStatus />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Image</CardTitle>
          <CardDescription>
            Drag and drop or click to select an image (JPG, PNG, GIF - Max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{!preview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors
                ${dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your image here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain mx-auto"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file && (file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
