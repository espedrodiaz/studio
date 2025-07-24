// This file is no longer used. The POS page has been moved to /dashboard/pos
import { redirect } from 'next/navigation'

export default function DeprecatedPosPage() {
  redirect('/dashboard/pos')
}

    