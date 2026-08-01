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

export default function LegalNoticePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 100px' }}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>Mentions légales</h1>
        <p style={{ color: '#555', fontSize: 13, margin: '0 0 40px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <Section title="1. Éditeur du site">
          <p>
            Le site Pro Blackjack Trainer, accessible à l'adresse pro-blackjack-trainer.vercel.app, est édité par :
          </p>
          <p>
            <TODO>Nom / raison sociale de l'exploitant</TODO><br />
            Statut : <TODO>ex. Entrepreneur individuel (auto-entrepreneur)</TODO><br />
            SIRET : <TODO>numéro SIRET</TODO><br />
            Adresse : <TODO>adresse du siège / domicile professionnel</TODO><br />
            Email de contact : <TODO>adresse email de contact</TODO>
          </p>
        </Section>

        <Section title="2. Hébergement">
          <p>
            Le site (frontend) est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            L'API et la base de données sont hébergées par <strong>Railway Corporation</strong>.
          </p>
        </Section>

        <Section title="3. Propriété intellectuelle">
          <p>
            L'ensemble des contenus présents sur le site (textes, méthodes pédagogiques, illustrations, code source, charte
            graphique) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale
            ou partielle, sans autorisation préalable est interdite.
          </p>
        </Section>

        <Section title="4. Nature du service — avertissement">
          <p>
            Pro Blackjack Trainer est un outil pédagogique d'entraînement à la stratégie de base et au comptage de cartes
            (méthode Hi-Lo) au blackjack. Le comptage de cartes est une technique mentale légale dans la plupart des
            juridictions ; elle ne repose sur aucun dispositif matériel ni aide extérieure. Le site ne propose ni jeu
            d'argent réel, ni pari, ni gain financier : les simulations et tableaux ont un but exclusivement éducatif.
            L'utilisateur reste seul responsable du respect des règles des établissements qu'il fréquente et de la
            réglementation locale applicable aux jeux de casino.
          </p>
        </Section>

        <Section title="5. Contact">
          <p>Pour toute question relative au site : <TODO>adresse email de contact</TODO></p>
        </Section>
      </div>
    </div>
  );
}
