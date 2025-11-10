import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WebhookStatus() {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const isConfigured = webhookUrl && webhookUrl !== 'https://your-n8n-instance.com/webhook/image-analysis';
  const isPlaceholder = !webhookUrl || webhookUrl === 'https://your-n8n-instance.com/webhook/image-analysis';

  if (isConfigured) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">Webhook Configured</AlertTitle>
        <AlertDescription className="text-green-500/80">
          Images will be analyzed using your N8N webhook integration.
        </AlertDescription>
      </Alert>
    );
  }

  if (isPlaceholder) {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <Info className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Demo Mode</AlertTitle>
        <AlertDescription className="text-yellow-500/80">
          Webhook not configured. Using mock data for demonstration. 
          See <code className="text-xs bg-yellow-500/20 px-1 py-0.5 rounded">WEBHOOK_CONFIGURATION_GUIDE.md</code> to set up your webhook.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-500/50 bg-red-500/10">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <AlertTitle className="text-red-500">Webhook Error</AlertTitle>
      <AlertDescription className="text-red-500/80">
        Unable to connect to webhook. Check your configuration.
      </AlertDescription>
    </Alert>
  );
}
