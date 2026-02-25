import React, { useEffect, useState } from 'react';
import { getConsent, setConsent, forgetMe } from '../services/api';

function RGPDPage() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [consent, setConsentState] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getConsent(token);
        setConsentState(res.consent);
      } catch (e) {
        setConsentState(null);
      } finally { setLoading(false); }
    })();
  }, [token]);

  const handleSetConsent = async (c) => {
    if (!token) return alert('Token missing. Connectez-vous ou collez un token.');
    await setConsent(token, c);
    setConsentState(c);
  };

  const handleForget = async () => {
    if (!token) return alert('Token missing. Connectez-vous ou collez un token.');
    await forgetMe(token);
    alert('Demande d\'effacement traitée. Vous serez anonymisé.');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Paramètres RGPD</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Token (localStorage token par défaut) :</label><br />
        <input value={token} onChange={e => setToken(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>Consentement :</strong> {loading ? 'Chargement...' : String(consent)}
      </div>
      <div>
        <button onClick={() => handleSetConsent(true)} style={{ marginRight: 8 }}>Accepter</button>
        <button onClick={() => handleSetConsent(false)} style={{ marginRight: 8 }}>Refuser</button>
        <button onClick={handleForget} style={{ background: '#c33', color: '#fff' }}>Demande d'effacement</button>
      </div>
    </div>
  );
}

export default RGPDPage;
