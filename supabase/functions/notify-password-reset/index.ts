import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface PasswordResetRequest {
  email: string;
  userName: string;
  userId: string;
  requestId?: string;
}

Deno.serve(async (req: Request) => {
  try {
    const { email, userName, userId, requestId }: PasswordResetRequest = await req.json();

    console.log("Password reset request received:", { email, userName, userId });

    // Admin email addresses
    const adminEmails = [
      "Dmanopla91@gmail.com",
      "sahilcharandwary@gmail.com"
    ];

    // Create email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              A user has requested a password reset for their account.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                  <td style="padding: 8px 0;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">User ID:</td>
                  <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${userId}</td>
                </tr>
                ${requestId ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Request ID:</td>
                  <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${requestId}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px;">
                <strong>⚠️ Action Required:</strong> Please review this password reset request in the admin dashboard.
              </p>
            </div>

            <div style="margin: 30px 0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                To process this request, please log in to the admin dashboard:
              </p>
              <a href="https://your-app-url.com/admin" 
                 style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 5px;">
                Go to Admin Dashboard
              </a>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1976d2;">📋 Next Steps:</h4>
              <ol style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>Review the user's request in the admin dashboard</li>
                <li>Verify the user's identity if needed</li>
                <li>Click "Accept" to generate and send a new password</li>
                <li>Or click "Reject" if the request seems suspicious</li>
              </ol>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
              <p>This is an automated notification from ClearAI Image Text Error Detection System.</p>
              <p style="margin-top: 10px;">
                If you did not expect this email, please contact the system administrator.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to all admins
    const emailPromises = adminEmails.map(adminEmail =>
      resend.emails.send({
        from: "onboarding@resend.dev",
        to: adminEmail,
        subject: `🔐 Password Reset Request - ${userName}`,
        html: htmlContent,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    console.log("Email send results:", results);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent to ${successCount} admin(s)`,
        details: {
          total: adminEmails.length,
          success: successCount,
          failed: failureCount
        }
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive"
        },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error sending password reset notification:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive"
        },
        status: 500
      }
    );
  }
});
