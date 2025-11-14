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

/**
 * Parse coordinates from webhook response
 * Supports both string format "x: 295, y: 126, width: 440, height: 10"
 * and object format { x: 295, y: 126, width: 440, height: 10 }
 * Also converts percentages to pixels if needed
 */
function parseCoordinatesFromWebhook(
  coordInput: string | { x: number; y: number; width?: number; height?: number } | undefined,
  naturalWidth: number,
  naturalHeight: number
): { x: number; y: number; width: number; height: number } {
  if (!coordInput) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let coords: { x: number; y: number; width?: number; height?: number };

  // Parse string format
  if (typeof coordInput === 'string') {
    const parts = coordInput.split(',').map(p => p.trim());
    const parsed: Record<string, number> = {};
    
    parts.forEach(part => {
      const [key, value] = part.split(':').map(s => s.trim());
      // Handle percentage values
      if (value.includes('%')) {
        const percentage = parseFloat(value.replace('%', '')) / 100;
        if (key === 'x' || key === 'width') {
          parsed[key] = percentage * naturalWidth;
        } else if (key === 'y' || key === 'height') {
          parsed[key] = percentage * naturalHeight;
        }
      } else {
        parsed[key] = parseFloat(value);
      }
    });
    
    coords = {
      x: parsed.x || 0,
      y: parsed.y || 0,
      width: parsed.width,
      height: parsed.height
    };
  } else {
    coords = coordInput;
  }

  return {
    x: coords.x || 0,
    y: coords.y || 0,
    width: coords.width || 0,
    height: coords.height || 0
  };
}

export default function ImageAnalysis() {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageData, setImageData] = useState<ImageWithErrors | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredError, setHoveredError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [imageNaturalDimensions, setImageNaturalDimensions] = useState({ width: 0, height: 0 });
  const [containerOffset, setContainerOffset] = useState({ left: 0, top: 0 });
  const [isReady, setIsReady] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadImageData();
  }, [imageId]);

  // Handle window resize to recalculate dimensions
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current && containerRef.current) {
        updateDimensions();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageData]);

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

  const updateDimensions = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    // Use getBoundingClientRect for accurate displayed dimensions
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Store displayed dimensions
    const displayed = {
      width: imgRect.width,
      height: imgRect.height
    };

    // Calculate container offset (for padding/borders)
    const offset = {
      left: imgRect.left - containerRect.left,
      top: imgRect.top - containerRect.top
    };

    // Use Gemini-provided dimensions if available, otherwise use natural dimensions
    const original = {
      width: imageData?.original_width || img.naturalWidth,
      height: imageData?.original_height || img.naturalHeight
    };

    console.log('Image dimensions updated:', {
      displayed,
      original,
      offset,
      geminiProvided: !!(imageData?.original_width && imageData?.original_height),
      scaleX: displayed.width / original.width,
      scaleY: displayed.height / original.height
    });

    setImageDimensions(displayed);
    setImageNaturalDimensions(original);
    setContainerOffset(offset);
    setIsReady(true);
  };

  const handleImageLoad = () => {
    updateDimensions();
  };

  const getErrorPosition = (error: ImageError) => {
    // Guard: Don't render until dimensions are ready
    if (!isReady || !imageDimensions.width || !imageDimensions.height || 
        !imageNaturalDimensions.width || !imageNaturalDimensions.height) {
      return { left: 0, top: 0, width: 0, height: 0, visible: false };
    }

    // Calculate scale factors
    const scaleX = imageDimensions.width / imageNaturalDimensions.width;
    const scaleY = imageDimensions.height / imageNaturalDimensions.height;

    // Get coordinates from error (already in pixels from webhook)
    const x = Number(error.x_coordinate) || 0;
    const y = Number(error.y_coordinate) || 0;
    const w = Number(error.width) || 0;
    const h = Number(error.height) || 0;

    // Scale to displayed size
    let left = x * scaleX;
    let top = y * scaleY;
    let width = w * scaleX;
    let height = h * scaleY;

    // Apply minimum dimensions (3px) to prevent invisible boxes
    width = Math.max(width, 3);
    height = Math.max(height, 3);

    // Clamp to image boundaries to prevent overflow
    left = Math.max(0, Math.min(left, imageDimensions.width - width));
    top = Math.max(0, Math.min(top, imageDimensions.height - height));

    console.log('Error position calculation:', {
      errorId: error.id,
      errorType: error.error_type,
      original: { x, y, w, h },
      scale: { scaleX: scaleX.toFixed(4), scaleY: scaleY.toFixed(4) },
      result: { 
        left: left.toFixed(2), 
        top: top.toFixed(2), 
        width: width.toFixed(2), 
        height: height.toFixed(2) 
      },
      containerOffset
    });

    return { left, top, width, height, visible: true };
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

      <div className="flex flex-col gap-6">
        {/* Image Section */}
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
              <div className="flex gap-2">
                {imageData.errors && imageData.errors.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBoxes(!showBoxes)}
                  >
                    {showBoxes ? 'Hide Boxes' : 'Show Boxes'}
                  </Button>
                )}
                {(imageData.status === 'pending' || imageData.status === 'processing') && (
                  <Button onClick={loadImageData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Status
                  </Button>
                )}
              </div>
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
              
              {showBoxes && imageData.errors?.map((error) => {
                const position = getErrorPosition(error);
                
                // Don't render if not visible or dimensions not ready
                if (!position.visible || position.width === 0 || position.height === 0) {
                  return null;
                }
                
                const isHovered = hoveredError === error.id;
                
                // Normalize error type to lowercase for color lookup
                const errorTypeKey = error.error_type.toLowerCase();
                const errorColor = ERROR_COLORS[errorTypeKey] || ERROR_COLORS.spelling;
                const errorLabel = ERROR_LABELS[errorTypeKey] || error.error_type;
                
                // Calculate tooltip position (below by default, above if would overflow)
                const tooltipTop = position.height + 8;
                const wouldOverflowBottom = position.top + position.height + 200 > imageDimensions.height;
                const tooltipStyle = wouldOverflowBottom 
                  ? { bottom: `${position.height + 8}px` }
                  : { top: `${tooltipTop}px` };
                
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
                        borderColor: errorColor,
                        backgroundColor: isHovered 
                          ? `${errorColor}40` 
                          : `${errorColor}20`,
                        boxShadow: isHovered 
                          ? `0 0 20px ${errorColor}` 
                          : `0 2px 4px rgba(0,0,0,0.2)`
                      }}
                    />
                    
                    {isHovered && (
                      <div
                        className="absolute left-0 bg-popover text-popover-foreground p-3 rounded-lg shadow-xl border border-border min-w-64 z-20"
                        style={{ 
                          pointerEvents: 'none',
                          ...tooltipStyle
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: errorColor }}
                          />
                          <span className="font-semibold text-sm">
                            {errorLabel}
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

        {/* Error Table Section - Full Width Below Image */}
        <Card>
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
            <CardDescription>
              Hover over rows to highlight errors on the image
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
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">#</TableHead>
                          <TableHead className="w-32">Type</TableHead>
                          <TableHead className="min-w-[200px]">Original Text</TableHead>
                          <TableHead className="min-w-[200px]">Suggested Correction</TableHead>
                          <TableHead className="min-w-[250px]">Description</TableHead>
                          <TableHead className="w-32">Location</TableHead>
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
                            <TableCell className="font-medium">
                              {error.original_text || '-'}
                            </TableCell>
                            <TableCell className="text-[hsl(var(--error-suggestions))] font-medium">
                              {error.suggested_correction || '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {error.description || '-'}
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
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
