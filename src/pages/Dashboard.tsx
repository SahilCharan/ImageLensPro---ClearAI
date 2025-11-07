import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { imageApi } from '@/db/api';
import type { Image } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Eye, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [user]);

  const loadImages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await imageApi.getUserImages(user.id);
      setImages(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load images',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      setDeleting(imageId);
      await imageApi.deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
      toast({
        title: 'Success',
        description: 'Image deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive'
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: Image['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-[hsl(var(--error-suggestions))] text-white';
      case 'processing':
        return 'bg-[hsl(var(--error-space))] text-white';
      case 'failed':
        return 'bg-[hsl(var(--error-spelling))] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">My Images</h1>
          <p className="text-muted-foreground mt-2">
            Manage and analyze your uploaded images
          </p>
        </div>
        <Button onClick={() => navigate('/upload')} size="lg">
          <Upload className="mr-2 h-5 w-5" />
          Upload New Image
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first image to get started with error detection
            </p>
            <Button onClick={() => navigate('/upload')}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img
                  src={image.original_url}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg truncate flex-1">
                    {image.filename}
                  </CardTitle>
                  <Badge className={getStatusColor(image.status)}>
                    {image.status}
                  </Badge>
                </div>
                <CardDescription>
                  {format(new Date(image.created_at), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/analyze/${image.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(image.id)}
                    disabled={deleting === image.id}
                  >
                    {deleting === image.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
