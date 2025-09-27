// src/services/recaptchaService.js
export async function verifyRecaptchaOnServer(token, action = 'REGISTER') {
    const res = await fetch('/api/verify-recaptcha', {   // or your full backend URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action })
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to verify recaptcha');
    }
    const data = await res.json();
    return data; // { success: true, score: 0.9, tokenProperties: {...} }
  }
  