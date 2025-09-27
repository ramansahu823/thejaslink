// src/utils/recaptcha.js
export async function executeRecaptcha(action = 'REGISTER') {
    if (!window.grecaptcha || !window.grecaptcha.enterprise) {
      throw new Error('reCAPTCHA not loaded');
    }
  
    return new Promise((resolve, reject) => {
      try {
        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute(
              'RECAPTCHA_SITE_KEY', // replace or keep a constant import
              { action }
            );
            resolve(token);
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  