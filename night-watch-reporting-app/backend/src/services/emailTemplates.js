const templates = {
  'confirm_email': {
    fr: ({ link, username }) => ({
      subject: `Confirmez votre adresse email, ${username}`,
      text: `Bonjour ${username},\n\nMerci de vous être inscrit. Confirmez votre email en ouvrant le lien suivant : ${link}\n\nCordialement,\nL'équipe`,
      html: `<p>Bonjour ${username},</p><p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p><p><a href="${link}">${link}</a></p><p>Cordialement,<br/>L'équipe</p>`
    }),
    en: ({ link, username }) => ({
      subject: `Confirm your email, ${username}`,
      text: `Hello ${username},\n\nThanks for signing up. Confirm your email by opening the following link: ${link}\n\nRegards,\nThe team`,
      html: `<p>Hello ${username},</p><p>Thanks for signing up. Click the link below to confirm your email address:</p><p><a href="${link}">${link}</a></p><p>Regards,<br/>The team</p>`
    }
  }
};

function render(templateName, vars = {}, locale = 'fr') {
  const t = templates[templateName];
  if (!t) throw new Error('Template not found: ' + templateName);
  const lang = (locale || 'fr').startsWith('en') ? 'en' : 'fr';
  return t[lang](vars);
}

module.exports = { render };
