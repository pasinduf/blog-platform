import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendWelcomeEmail(to: string, name: string) {
    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Skipping welcome email.');
        return;
    }

    const siteUrl = process.env.PUBLIC_SITE_URL;

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to,
            subject: 'Welcome to the BlogHub!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #111;">Welcome, ${name}!</h2>
                    <p>Your account on the Blog Platform has been <strong>approved</strong> by an administrator.</p>
                    <p>You can now log in and start reading, reacting to, and writing your own blog posts.</p>
                    <p>We are excited to have you on board!</p>
                    
                    <div style="margin: 32px 0;">
                        <a href="${siteUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                            Visit the BlogHub
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 26px 0;" />
                    <p style="font-size: 12px; color: #666;">
                        Best regards,<br/>The BlogHub Team
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend API Error:', error);
        }
        return { data, error };
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return { error };
    }
}
