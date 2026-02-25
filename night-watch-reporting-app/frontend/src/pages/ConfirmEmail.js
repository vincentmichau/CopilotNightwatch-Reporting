import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function ConfirmEmail() {
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Jeton manquant.');
      return;
    }
    setStatus('pending');
    fetch(`/api/auth/confirm?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Erreur serveur');
        }
        return res.json();
      })
      .then(() => {
        setStatus('success');
        setMessage('Votre adresse e-mail a été confirmée. Vous pouvez vous connecter.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Échec de la confirmation.');
      });
  }, [location.search]);

  return (
    <div className="confirm-page">
      {status === 'pending' && <p>Confirmation en cours…</p>}
      {status === 'success' && (
        <>
          <h2>Confirmation réussie</h2>
          <p>{message}</p>
          <Link to="/login">Se connecter</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h2>Erreur de confirmation</h2>
          <p>{message}</p>
          <Link to="/">Retour à l'accueil</Link>
        </>
      )}
    </div>
  );
}

export default ConfirmEmail;
