'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { users, memberships, memberProfiles } from '@/lib/db'

type Member = Pick<typeof users.$inferSelect,'id'|'email'|'role'|'firstName'|'lastName'|'createdAt'> & {
  membership: typeof memberships.$inferSelect | null
  profile: typeof memberProfiles.$inferSelect | null
}
export function MembersTable({members,canManage}:{members:Member[];canManage:boolean}) {
  const router=useRouter()
  const [busy,setBusy]=useState<string|null>(null)
  const [error,setError]=useState('')
  async function approve(userId:string) {
    setBusy(userId);setError('')
    try {
      const res=await fetch('/api/admin/members',{method:'PATCH',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({userId,profileApproved:true})})
      if(!res.ok) {const data=await res.json() as {error?:string};throw new Error(data.error||'Approval was not saved')}
      router.refresh()
    } catch(e){setError(e instanceof Error?e.message:'Approval failed')}
    finally{setBusy(null)}
  }
  return <div className="overflow-x-auto">
    {error&&<p role="alert" className="mb-3 rounded-lg border border-red-300 p-3 text-sm text-red-800">{error}</p>}
    <table className="w-full text-sm">
      <thead className="border-b"><tr className="text-left text-slate-600">
        <th className="pb-3 font-medium">Member</th><th className="pb-3 font-medium">Company</th>
        <th className="pb-3 font-medium">Plan</th><th className="pb-3 font-medium">Membership</th>
        <th className="pb-3 font-medium">Joined</th><th className="pb-3 font-medium">Profile</th>
      </tr></thead>
      <tbody className="divide-y">{members.map(m=><tr key={m.id}>
        <td className="py-4"><p className="font-medium">{m.firstName} {m.lastName}</p><p className="text-xs text-slate-500">{m.email}</p></td>
        <td className="py-4">{m.profile?.companyName||'—'}</td>
        <td className="py-4 capitalize">{m.membership?.tier||'—'}</td>
        <td className="py-4"><Badge variant={m.membership?.status==='active'?'navy':'outline'}>{m.membership?.status||'None'}</Badge></td>
        <td className="py-4">{m.createdAt?formatDate(m.createdAt):'—'}</td>
        <td className="py-4">{m.profile?.approved?<Badge variant="gold">Approved</Badge>
          :canManage?<Button disabled={busy===m.id} size="sm" variant="outline" onClick={()=>void approve(m.id)}>Approve profile</Button>
          :<span className="text-slate-500">Pending</span>}</td>
      </tr>)}</tbody>
    </table>
    <p className="mt-4 text-xs text-slate-500">Membership plan and payment status are read-only here and must match the payment provider.</p>
  </div>
}
