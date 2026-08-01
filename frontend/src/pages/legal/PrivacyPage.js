import React from 'react';
import Header from '../../components/layout/Header';

function TODO({ children }) {
  return (
    <span style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>
      [À COMPLÉTER : {children}]
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 10px' }}>{title}</h2>
      <div style={{ color: '#888', fontSize: 14, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 100px' }}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>Politique de confidentialité</h1>
        <p style={{ color: '#555', fontSize: 13, margin: '0 0 40px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <Section title="1. Données collectées">
          <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li>Adresse email et mot de passe (chiffré) — pour la création et la connexion au compte</li>
            <li>Statut d'abonnement et date d'expiration — pour l'accès aux fonctionnalités Pro</li>
            <li>Identifiant client et de session Stripe — pour le traitement du paiement et sa vérification</li>
            <li>Statistiques d'entraînement locales (comptage, précision) — stockées sur votre appareil</li>
          </ul>
        </Section>

        <Section title="2. Finalité et base légale">
          <p>
            Ces données sont traitées pour l'exécution du contrat d'abonnement (article 6.1.b du RGPD) et, pour les
            informations de facturation, pour le respect de nos obligations légales et comptables.
          </p>
        </Section>

        <Section title="3. Sous-traitants et hébergement">
          <p>
            <strong>Stripe</strong> (paiement) et <strong>MongoDB / Railway</strong> (base de données) traitent tout
            ou partie de ces données pour notre compte, dans le cadre de leurs propres politiques de confidentialité.
            Aucune donnée bancaire n'est stockée par nos soins. Le site est hébergé par <strong>Vercel</strong>.
          </p>
        </Section>

        <Section title="4. Durée de conservation">
          <p>
            Les données de compte sont conservées pendant toute la durée de la relation contractuelle, puis archivées
            ou supprimées conformément aux délais légaux applicables (notamment en matière comptable et fiscale).
          </p>
        </Section>

        <Section title="5. Vos droits">
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, et
            d'opposition sur vos données personnelles. Pour exercer ces droits, contactez-nous à
            <TODO>adresse email de contact</TODO>.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            Le site utilise uniquement des identifiants techniques nécessaires au fonctionnement (session,
            préférence de langue, statut d'abonnement) stockés localement sur votre appareil. Aucun cookie
            publicitaire ou de traçage tiers n'est utilisé à ce jour.
          </p>
        </Section>

        <Section title="7. Contact et réclamation">
          <p>
            Pour toute question relative à vos données : <TODO>adresse email de contact</TODO>. Vous pouvez également
            introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont pas
            respectés.
          </p>
        </Section>
      </div>
    </div>
  );
}
