export const getOtpEmailTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f5;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #1e293b; margin-bottom: 10px;">Tap & Travel</h2>
      <p style="color: #475569; font-size: 18px; margin-bottom: 20px;">Enter this OTP to complete your verification</p>
      <div style="display: flex; justify-content: center; background: #f1f5f9; border: 2px solid #1e293b; border-radius: 12px; padding: 15px 20px; font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #1e293b; margin-bottom: 20px;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 14px;">This code is valid for <strong>10 minutes</strong>.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
`;
