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

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 100px' }}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>Conditions Générales de Vente</h1>
        <p style={{ color: '#555', fontSize: 13, margin: '0 0 40px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <Section title="1. Objet">
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent la souscription à l'abonnement « Pro » du
            service Pro Blackjack Trainer, édité par <TODO>nom de l'exploitant</TODO> (voir Mentions légales).
            Toute souscription implique l'acceptation pleine et entière des présentes CGV.
          </p>
        </Section>

        <Section title="2. Description du service">
          <p>
            Pro Blackjack Trainer propose un accès gratuit limité (« Gratuit ») et un accès payant par abonnement
            (« Pro »), donnant accès à l'ensemble des modules d'entraînement (comptage True Count, déviations,
            simulation casino), aux statistiques de session et au mode révision. Le contenu exact de chaque offre est
            décrit sur la page Tarifs au moment de la souscription.
          </p>
        </Section>

        <Section title="3. Prix et paiement">
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises si applicable. Le paiement est traité par notre
            prestataire <strong>Stripe</strong> et débité immédiatement à la souscription, puis automatiquement à
            chaque échéance (mensuelle ou annuelle) jusqu'à résiliation. Aucune donnée bancaire n'est stockée ou
            traitée par nos serveurs.
          </p>
        </Section>

        <Section title="4. Durée, renouvellement et résiliation">
          <p>
            L'abonnement est souscrit pour une durée d'un mois ou d'un an selon l'offre choisie, et se renouvelle
            automatiquement par tacite reconduction pour une durée identique, sauf résiliation par l'utilisateur
            avant l'échéance. La résiliation peut être effectuée à tout moment depuis le portail de gestion
            d'abonnement (lien « Gérer » disponible dans l'en-tête du site une fois connecté) ; elle prend effet à la
            fin de la période déjà payée, sans remboursement de la période en cours (voir article 6).
          </p>
        </Section>

        <Section title="5. Droit de rétractation">
          <p>
            Conformément à l'article L221-18 du Code de la consommation, tout consommateur dispose en principe d'un
            délai de 14 jours pour exercer son droit de rétractation sur un achat à distance.
          </p>
          <p>
            Toutefois, l'abonnement Pro Blackjack Trainer donne accès à un contenu numérique et à un service
            immédiatement disponibles dès la souscription. Conformément à l'article L221-28, 13° du Code de la
            consommation, <strong>l'utilisateur qui souhaite bénéficier d'un accès immédiat au service (au lieu
            d'attendre la fin du délai de 14 jours) doit expressément renoncer à son droit de rétractation</strong>,
            en cochant la case prévue à cet effet lors de la souscription. Cette renonciation est un préalable
            obligatoire à l'activation immédiate du compte.
          </p>
          <p>
            À défaut de cette renonciation expresse, l'utilisateur conserve son droit de rétractation de 14 jours et
            peut demander l'annulation et le remboursement de sa souscription dans ce délai, en écrivant à
            <TODO>adresse email de contact</TODO>.
          </p>
        </Section>

        <Section title="6. Politique de remboursement">
          <p>
            Une fois la renonciation au droit de rétractation effectuée (article 5) et l'accès au service activé,
            <strong> aucun remboursement ne sera accordé</strong>, y compris en cas de non-utilisation, d'insatisfaction,
            de résiliation en cours de période, ou de non-renouvellement — sauf disposition légale impérative contraire
            ou erreur de facturation avérée de notre part. Les paiements déjà effectués restent dus au titre de la
            période d'accès en cours.
          </p>
        </Section>

        <Section title="7. Responsabilité">
          <p>
            Le service est fourni à titre pédagogique. L'exploitant ne garantit aucun résultat financier lié à
            l'application des méthodes enseignées et ne pourra être tenu responsable des pertes éventuelles subies
            par l'utilisateur dans un contexte de jeu réel. Voir également l'avertissement figurant dans les
            Mentions légales.
          </p>
        </Section>

        <Section title="8. Modification des CGV">
          <p>
            Les présentes CGV peuvent être modifiées à tout moment ; la version applicable est celle en vigueur au
            jour de la souscription ou du renouvellement.
          </p>
        </Section>

        <Section title="9. Droit applicable et litiges">
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée
            avant toute action judiciaire. À défaut, les tribunaux compétents seront ceux du lieu de résidence de
            l'exploitant, sauf disposition impérative contraire protégeant le consommateur.
          </p>
        </Section>
      </div>
    </div>
  );
}
