import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ADMIN_EMAILS = ['Dmanopla91@gmail.com', 'sahilcharandwary@gmail.com'];
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface AccountRequestData {
  full_name: string;
  email: string;
  message: string;
}

interface RequestBody {
  type: 'new_account_request' | 'account_approved' | 'account_rejected';
  data: AccountRequestData;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { type, data } = body;

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email notification');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email service not configured' 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    let subject = '';
    let htmlContent = '';

    if (type === 'new_account_request') {
      subject = `🔔 New ClearAI Account Request from ${data.full_name}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3d4152 0%, #7dd3c0 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7dd3c0; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; color: #3d4152; }
              .button { display: inline-block; background: #7dd3c0; color: #3d4152; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 New Account Request</h1>
                <p>Someone has requested access to ClearAI</p>
              </div>
              <div class="content">
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">Full Name:</span> ${data.full_name}
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span> ${data.email}
                  </div>
                  <div class="info-row">
                    <span class="label">Message:</span><br>
                    ${data.message || 'No message provided'}
                  </div>
                </div>
                
                <p>Please review this request and approve or reject it from the admin dashboard.</p>
                
                <a href="${Deno.env.get('APP_URL') || 'https://your-app-url.com'}/admin" class="button">
                  Go to Admin Dashboard →
                </a>
                
                <div class="footer">
                  <p>This is an automated notification from ClearAI Image Text Error Detection</p>
                  <p>You received this email because you are an administrator</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Send email to all admin emails
    const emailPromises = ADMIN_EMAILS.map(async (adminEmail) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'ClearAI <noreply@clearai.app>',
          to: [adminEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send email to ${adminEmail}:`, error);
        throw new Error(`Failed to send email: ${error}`);
      }

      return response.json();
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Email notification results: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent to ${successCount} admin(s)`,
        details: {
          sent: successCount,
          failed: failureCount,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in notify-admins function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
