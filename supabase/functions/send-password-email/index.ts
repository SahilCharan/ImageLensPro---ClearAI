import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendPasswordRequest {
  email: string;
  userName: string;
  password: string;
  isNewAccount?: boolean;
}

Deno.serve(async (req: Request) => {
  try {
    const { email, userName, password, isNewAccount = false }: SendPasswordRequest = await req.json();

    console.log("Sending password email to:", email);

    const subject = isNewAccount 
      ? "🎉 Welcome to ClearAI - Your Account Password"
      : "🔐 Your Password Reset - ClearAI";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">
              ${isNewAccount ? '🎉 Welcome to ClearAI!' : '🔐 Password Reset'}
            </h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hello <strong>${userName}</strong>,
            </p>
            
            ${isNewAccount ? `
              <p style="font-size: 16px; margin-bottom: 20px;">
                Your account has been approved! You can now access the ClearAI Image Text Error Detection system.
              </p>
            ` : `
              <p style="font-size: 16px; margin-bottom: 20px;">
                Your password reset request has been approved by an administrator.
              </p>
            `}

            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; text-align: center;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 18px;">Your Login Credentials</h3>
              <table style="width: 100%; margin: 15px 0;">
                <tr>
                  <td style="padding: 10px; text-align: right; font-weight: bold; width: 40%;">Email:</td>
                  <td style="padding: 10px; text-align: left; font-family: monospace; background: #f5f5f5; border-radius: 4px;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">Password:</td>
                  <td style="padding: 10px; text-align: left; font-family: monospace; background: #f5f5f5; border-radius: 4px; font-size: 18px; font-weight: bold; color: #667eea;">${password}</td>
                </tr>
              </table>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px;">
                <strong>⚠️ Important Security Notice:</strong>
              </p>
              <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>This password is system-generated and unique to your account</li>
                <li>Keep this password secure and do not share it with anyone</li>
                <li>This email contains sensitive information - please delete it after saving your password</li>
                <li>If you need to reset your password again, use the "Forgot Password" option on the login page</li>
              </ul>
            </div>

            <div style="margin: 30px 0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                Ready to get started? Click the button below to log in:
              </p>
              <a href="https://your-app-url.com/login" 
                 style="display: inline-block; background: #667eea; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Log In Now
              </a>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1976d2;">📋 Next Steps:</h4>
              <ol style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>Click the "Log In Now" button above</li>
                <li>Enter your email and the password provided</li>
                <li>Start using ClearAI to detect and correct image text errors</li>
                <li>If you encounter any issues, contact support</li>
              </ol>
            </div>

            ${isNewAccount ? `
              <div style="background: #d1f2eb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h4 style="margin-top: 0; color: #28a745;">✨ What You Can Do:</h4>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                  <li>Upload images for text error detection</li>
                  <li>View detailed error analysis with coordinates</li>
                  <li>Get AI-powered correction suggestions</li>
                  <li>Track your image processing history</li>
                </ul>
              </div>
            ` : ''}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
              <p>This is an automated email from ClearAI Image Text Error Detection System.</p>
              <p style="margin-top: 10px;">
                If you did not request this ${isNewAccount ? 'account' : 'password reset'}, please contact support immediately.
              </p>
              <p style="margin-top: 15px; font-weight: bold;">
                Need help? Contact us at support@clearai.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log("Password email sent successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password email sent successfully",
        emailId: result.id
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
    console.error("Error sending password email:", error);
    
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
