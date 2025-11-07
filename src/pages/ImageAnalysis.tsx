import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { imageApi } from '@/db/api';
import type { ImageWithErrors, ImageError } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const ERROR_COLORS = {
  spelling: 'hsl(var(--error-spelling))',
  grammatical: 'hsl(var(--error-grammatical))',
  space: 'hsl(var(--error-space))',
  context: 'hsl(var(--error-context))',
  suggestions: 'hsl(var(--error-suggestions))'
};

const ERROR_LABELS = {
  spelling: 'Spelling',
  grammatical: 'Grammar',
  space: 'Spacing',
  context: 'Context',
  suggestions: 'Suggestion'
};

export default function ImageAnalysis() {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageData, setImageData] = useState<ImageWithErrors | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredError, setHoveredError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [imageNaturalDimensions, setImageNaturalDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadImageData();
  }, [imageId]);

  const loadImageData = async () => {
    if (!imageId) return;

    try {
      setLoading(true);
      const data = await imageApi.getImageById(imageId);
      if (!data) {
        toast({
          title: 'Error',
          description: 'Image not found',
          variant: 'destructive'
        });
        navigate('/dashboard');
        return;
      }
      setImageData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load image data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      // Store both displayed and natural dimensions
      setImageDimensions({
        width: img.offsetWidth,
        height: img.offsetHeight
      });
      setImageNaturalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    }
  };

  const getErrorPosition = (error: ImageError) => {
    if (!imageDimensions.width || !imageDimensions.height || !imageNaturalDimensions.width || !imageNaturalDimensions.height) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    
    // Coordinates from webhook are in actual image pixels
    // Scale them to the displayed image size
    const scaleX = imageDimensions.width / imageNaturalDimensions.width;
    const scaleY = imageDimensions.height / imageNaturalDimensions.height;
    
    const left = Number(error.x_coordinate) * scaleX;
    const top = Number(error.y_coordinate) * scaleY;
    const width = error.width ? Number(error.width) * scaleX : 20; // Default 20px if no width
    const height = error.height ? Number(error.height) * scaleY : 20; // Default 20px if no height
    
    return { left, top, width, height };
  };

  const groupedErrors = imageData?.errors?.reduce((acc, error) => {
    if (!acc[error.error_type]) {
      acc[error.error_type] = [];
    }
    acc[error.error_type].push(error);
    return acc;
  }, {} as Record<string, ImageError[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!imageData) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{imageData.filename}</CardTitle>
                  <CardDescription>
                    {imageData.status === 'completed' && imageData.errors?.length
                      ? `${imageData.errors.length} error${imageData.errors.length !== 1 ? 's' : ''} detected`
                      : 'No errors detected'}
                  </CardDescription>
                </div>
                {(imageData.status === 'pending' || imageData.status === 'processing') && (
                  <Button onClick={loadImageData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Status
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={containerRef}
                className="relative bg-card rounded-lg overflow-hidden border-2 border-border"
                style={{ minHeight: '400px' }}
              >
                <img
                  ref={imageRef}
                  src={imageData.original_url}
                  alt={imageData.filename}
                  className="w-full h-auto"
                  onLoad={handleImageLoad}
                />
                
                {imageData.errors?.map((error) => {
                  const position = getErrorPosition(error);
                  const isHovered = hoveredError === error.id;
                  
                  return (
                    <div
                      key={error.id}
                      className="absolute cursor-pointer transition-all"
                      style={{
                        left: `${position.left}px`,
                        top: `${position.top}px`,
                        width: `${position.width}px`,
                        height: `${position.height}px`,
                        zIndex: isHovered ? 10 : 1
                      }}
                      onMouseEnter={() => setHoveredError(error.id)}
                      onMouseLeave={() => setHoveredError(null)}
                    >
                      <div
                        className="w-full h-full border-2 rounded"
                        style={{
                          borderColor: ERROR_COLORS[error.error_type],
                          backgroundColor: isHovered 
                            ? `${ERROR_COLORS[error.error_type]}40` 
                            : `${ERROR_COLORS[error.error_type]}20`,
                          boxShadow: isHovered 
                            ? `0 0 20px ${ERROR_COLORS[error.error_type]}` 
                            : `0 2px 4px rgba(0,0,0,0.2)`
                        }}
                      />
                      
                      {isHovered && (
                        <div
                          className="absolute left-0 bg-popover text-popover-foreground p-3 rounded-lg shadow-xl border border-border min-w-64 z-20"
                          style={{ 
                            pointerEvents: 'none',
                            top: `${position.height + 8}px`
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: ERROR_COLORS[error.error_type] }}
                            />
                            <span className="font-semibold text-sm">
                              {ERROR_LABELS[error.error_type]}
                            </span>
                          </div>
                          {error.original_text && (
                            <p className="text-sm mb-1">
                              <span className="text-muted-foreground">Original:</span>{' '}
                              <span className="font-medium">{error.original_text}</span>
                            </p>
                          )}
                          {error.suggested_correction && (
                            <p className="text-sm mb-1">
                              <span className="text-muted-foreground">Suggestion:</span>{' '}
                              <span className="font-medium text-[hsl(var(--error-suggestions))]">
                                {error.suggested_correction}
                              </span>
                            </p>
                          )}
                          {error.description && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {error.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>
                Hover over markers to see details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {imageData.status === 'pending' && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>Analysis not started</span>
                </div>
              )}
              
              {imageData.status === 'processing' && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing image...</span>
                </div>
              )}
              
              {imageData.status === 'failed' && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>Analysis failed</span>
                </div>
              )}
              
              {imageData.status === 'completed' && (
                <>
                  {!imageData.errors?.length ? (
                    <div className="flex items-center gap-2 text-[hsl(var(--error-suggestions))]">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>No errors found</span>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Original Text</TableHead>
                            <TableHead>Correction</TableHead>
                            <TableHead>Location</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {imageData.errors.map((error, index) => (
                            <TableRow
                              key={error.id}
                              className="cursor-pointer hover:bg-accent transition-colors"
                              onMouseEnter={() => setHoveredError(error.id)}
                              onMouseLeave={() => setHoveredError(null)}
                            >
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="border-2"
                                  style={{
                                    borderColor: ERROR_COLORS[error.error_type],
                                    color: ERROR_COLORS[error.error_type]
                                  }}
                                >
                                  {ERROR_LABELS[error.error_type]}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {error.original_text || '-'}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-[hsl(var(--error-suggestions))] font-medium">
                                {error.suggested_correction || '-'}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">
                                x:{Math.round(Number(error.x_coordinate))}, y:{Math.round(Number(error.y_coordinate))}
                                {error.width && error.height && (
                                  <><br/>w:{Math.round(Number(error.width))}, h:{Math.round(Number(error.height))}</>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
