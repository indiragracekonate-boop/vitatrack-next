interface Props {
  statut: string
  label: string
}

export default function Tag({ statut, label }: Props) {
  return (
    <span className={`tag st-${statut}`}>{label}</span>
  )
}
