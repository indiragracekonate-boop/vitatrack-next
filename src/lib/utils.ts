export function dateFr(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR')
}

export function datetimeFr(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function statutSuivi(datePrevue: string, effectueLe: string | null): string {
  if (effectueLe) return 'effectue'
  const today = new Date().toISOString().slice(0, 10)
  if (datePrevue < today) return 'en_retard'
  if (datePrevue === today) return 'aujourd_hui'
  return 'a_venir'
}

export function libelleStatutSuivi(statut: string): string {
  const map: Record<string, string> = {
    a_venir: 'À venir',
    aujourd_hui: "À effectuer aujourd'hui",
    en_retard: 'En retard',
    effectue: 'Effectué',
  }
  return map[statut] ?? statut
}

export function libelleStatutRdv(statut: string): string {
  const map: Record<string, string> = {
    planifie: 'Planifié',
    confirme_patient: 'Confirmé par le patient',
    absence_annoncee: 'Absence annoncée',
    realise: 'Réalisé',
    absence_constatee: 'Absence constatée',
    annule: 'Annulé',
  }
  return map[statut] ?? statut
}

export function libelleStatutSignalement(statut: string): string {
  const map: Record<string, string> = {
    envoye: 'Envoyé',
    a_examiner: 'À examiner',
    examine: 'Examiné',
    suivi_en_cours: 'Suivi en cours',
    cloture: 'Clôturé',
  }
  return map[statut] ?? statut
}

export function libelleTypeSymptome(type: string): string {
  const map: Record<string, string> = {
    douleur: 'Douleur',
    mal_de_tete: 'Mal de tête',
    fievre: 'Fièvre',
    blessure: 'Blessure',
    autre: 'Autre',
  }
  return map[type] ?? type
}

export function nomPatient(p: { prenom: string; nom: string }): string {
  return `${p.prenom} ${p.nom}`
}

export function nomUser(u: { prenom: string; nom: string }): string {
  return `${u.prenom} ${u.nom}`
}
