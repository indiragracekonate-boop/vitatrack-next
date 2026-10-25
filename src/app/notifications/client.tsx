'use client'
import { useRouter } from 'next/navigation'
import { datetimeFr } from '@/lib/utils'
import Link from 'next/link'

export default function NotificationsClient({ notifications }: {
  notifications: { id: string; created_at: string; message: string; lien: string | null; statut_lecture: string }[]
}) {
  const router = useRouter()

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    router.refresh()
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    router.refresh()
  }

  const unread = notifications.filter(n => n.statut_lecture === 'non_lue')

  return (
    <div className="carte">
      {unread.length > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="secondaire" onClick={markAllRead}>
            Tout marquer comme lu ({unread.length})
          </button>
        </div>
      )}
      <table>
        <thead>
          <tr><th>Date</th><th>Message</th><th>Lu ?</th><th></th></tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id} style={{ fontWeight: n.statut_lecture === 'non_lue' ? '600' : 'normal' }}>
              <td style={{ whiteSpace: 'nowrap' }}>{datetimeFr(n.created_at)}</td>
              <td>
                {n.lien ? <Link href={n.lien}>{n.message}</Link> : n.message}
              </td>
              <td>
                <span className={`tag ${n.statut_lecture === 'lue' ? 'st-effectue' : 'st-a_venir'}`}>
                  {n.statut_lecture === 'lue' ? 'Lu' : 'Non lu'}
                </span>
              </td>
              <td>
                {n.statut_lecture === 'non_lue' && (
                  <button type="button" className="secondaire petit" onClick={() => markRead(n.id)}>
                    Marquer lu
                  </button>
                )}
              </td>
            </tr>
          ))}
          {!notifications.length && (
            <tr><td colSpan={4} className="muted">Aucune notification.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
