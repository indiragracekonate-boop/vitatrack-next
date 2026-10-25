export type Role = 'admin' | 'medecin' | 'patient'

export interface User {
  id: string
  auth_id: string
  nom: string
  prenom: string
  email: string
  telephone: string | null
  role: Role
  actif: boolean
  created_at: string
}

export interface Medecin {
  user_id: string
  specialite: string
  users?: User
}

export interface Patient {
  id: string
  user_id: string | null
  nom: string
  prenom: string
  date_naissance: string | null
  telephone: string | null
  email: string | null
  adresse: string | null
  created_at: string
}

export interface AffectationMedecin {
  id: string
  patient_id: string
  medecin_id: string
  date_debut: string
  date_fin: string | null
  affecte_par: string | null
}

export interface SortieHospitaliere {
  id: string
  patient_id: string
  medecin_id: string
  service: string
  motif: string
  date_entree: string
  date_sortie: string
  consignes: string | null
  contact_etablissement: string | null
  created_at: string
}

export interface Suivi {
  id: string
  sortie_id: string
  libelle: string
  date_prevue: string
  effectue_le: string | null
  effectue_par: string | null
  created_at: string
}

export interface RendezVous {
  id: string
  sortie_id: string
  patient_id: string
  medecin_id: string
  date_rdv: string
  motif: string
  consignes: string | null
  statut: 'planifie' | 'confirme_patient' | 'absence_annoncee' | 'realise' | 'absence_constatee' | 'annule'
  commentaire_patient: string | null
  created_at: string
  updated_at: string | null
}

export interface Signalement {
  id: string
  patient_id: string
  medecin_id: string | null
  type_symptome: 'douleur' | 'mal_de_tete' | 'fievre' | 'blessure' | 'autre'
  debut_approximatif: string | null
  intensite: number | null
  description: string
  contact_souhaite: boolean
  statut: 'envoye' | 'a_examiner' | 'examine' | 'suivi_en_cours' | 'cloture'
  created_at: string
  updated_at: string | null
}

export interface SignalementAction {
  id: string
  signalement_id: string
  user_id: string | null
  type_action: 'envoi' | 'prise_en_charge' | 'observation' | 'conduite' | 'examine' | 'suivi' | 'cloture'
  contenu: string | null
  created_at: string
}

export interface Prescription {
  id: string
  sortie_id: string
  prescripteur_id: string
  date_prescription: string
}

export interface LignePrescription {
  id: string
  prescription_id: string
  medicament: string
  posologie: string
  voie: string | null
  frequence: string | null
  duree_jours: number | null
  date_debut: string | null
  date_fin: string | null
  instructions: string | null
  remplace_id: string | null
  actif: boolean
  created_at: string
}

export interface Questionnaire {
  id: string
  titre: string
  description: string | null
  cree_par: string
  created_at: string
}

export interface Question {
  id: string
  questionnaire_id: string
  libelle: string
  type_reponse: 'texte' | 'oui_non' | 'echelle'
  obligatoire: boolean
  ordre: number
}

export interface ReponseSuivi {
  id: string
  questionnaire_id: string
  patient_id: string
  medecin_id: string
  statut: 'a_remplir' | 'soumis' | 'consulte'
  envoye_le: string
  soumis_le: string | null
  observation_medecin: string | null
  suite_suivi: string | null
}

export interface ReponseItem {
  id: string
  reponse_id: string
  question_id: string
  valeur: string
}

export interface Notification {
  id: string
  destinataire_id: string
  message: string
  lien: string | null
  statut_lecture: 'non_lue' | 'lue'
  statut_traitement: 'a_traiter' | 'traitee'
  created_at: string
}

export interface JournalAction {
  id: string
  user_id: string | null
  action: string
  objet_type: string | null
  objet_id: string | null
  details: string | null
  created_at: string
}

export interface Invitation {
  token: string
  user_id: string
  expire_le: string
}
