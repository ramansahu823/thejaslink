// functions/index.js
const functions = require('firebase-functions');
const axios = require('axios');

const PROJECT_ID = 'your-gcp-project-id-or-firebase-project-id'; // e.g. thejaslink-8c5a0
const RECAPTCHA_API_KEY = functions.config().recaptcha.key; // set via firebase CLI
const RECAPTCHA_SITE_KEY = functions.config().recaptcha.sitekey;

exports.verifyRecaptcha = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const { token, action } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Missing token' });

    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${RECAPTCHA_API_KEY}`;

    const body = {
      event: {
        token,
        siteKey: RECAPTCHA_SITE_KEY,
        expectedAction: action
      }
    };

    const r = await axios.post(url, body);
    const resp = r.data;

    // Basic checks:
    const tokenProps = resp.tokenProperties || {};
    const validToken = tokenProps.valid === true;
    const actionMatches = tokenProps.action === action;
    const score = resp.riskAnalysis?.score ?? null;

    if (!validToken) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }
    if (!actionMatches) {
      return res.status(400).json({ success: false, message: 'Action mismatch' });
    }

    // set your threshold
    const SCORE_THRESHOLD = 0.5;
    const pass = (typeof score === 'number') ? (score >= SCORE_THRESHOLD) : true;

    return res.json({ success: pass, score, tokenProperties: tokenProps, raw: resp });
  } catch (err) {
    console.error('verifyRecaptcha error', err?.response?.data || err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
