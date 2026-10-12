'use client'
import { useEffect, useState } from 'react'
import { DELEGABLE_PERMISSIONS, PERMISSIONS, type Permission } from '@/lib/admin/permission-catalog'
type Role = {id:string;name:string;description:string;permissions:Permission[];active:boolean}
type Person = {id:string;email:string;role:string}
type Assignment = {id:string;userId:string;roleId:string}
type Data = {roles:Role[];users:Person[];assignments:Assignment[]}

export function RoleManager() {
  const [data,setData]=useState<Data>()
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [editingId,setEditingId]=useState('')
  const [name,setName]=useState('')
  const [description,setDescription]=useState('')
  const [permissions,setPermissions]=useState<Permission[]>([])
  const [userId,setUserId]=useState('')
  const [roleId,setRoleId]=useState('')
  async function reload() {
    const result=await fetch('/api/admin/roles',{cache:'no-store'})
    if(!result.ok) throw new Error('Unable to load roles. Check database migration and permissions.')
    setData(await result.json() as Data)
  }
  useEffect(()=>{
    const controller=new AbortController()
    void fetch('/api/admin/roles',{cache:'no-store',signal:controller.signal})
      .then(async response=>{
        if(!response.ok) throw new Error('Unable to load roles. Verify migration and access.')
        return response.json() as Promise<Data>
      })
      .then(result=>setData(result))
      .catch(error=>{if(!controller.signal.aborted) setMessage(error instanceof Error?error.message:'Roles unavailable')})
    return ()=>controller.abort()
  },[])
  async function submit(url:string,method:string,body:Record<string,unknown>) {
    setBusy(true);setMessage('')
    try {
      const r=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      const json=await r.json() as {error?:string}
      if(!r.ok) throw new Error(json.error||'Unable to save')
      await reload()
      setMessage('Saved successfully. Changes are recorded in the audit log.')
      return true
    } catch(e) {setMessage(e instanceof Error?e.message:'Request failed');return false}
    finally {setBusy(false)}
  }
  return <div className="grid gap-6 lg:grid-cols-2">
    {message&&<p role="status" className="rounded-lg border bg-white p-4 text-sm lg:col-span-2">{message}</p>}
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 id="new-role" className="text-xl font-semibold">{editingId?'Edit staff role':'Create a role'}</h2>
      <p className="my-2 text-sm text-slate-600">Choose the minimum activities this role needs.</p>
      <form className="space-y-4" onSubmit={async e=>{e.preventDefault();if((!editingId || window.confirm('Changing a role changes permissions for everyone assigned to it. Continue?')) && await submit('/api/admin/roles',editingId?'PATCH':'POST',{...(editingId?{id:editingId}:{}),name,description,permissions})){setEditingId('');setName('');setDescription('');setPermissions([])}}}>
        <label className="block text-sm font-medium">Role name<input required minLength={2} maxLength={64} value={name} onChange={e=>setName(e.target.value)} placeholder="Events Coordinator" className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="block text-sm font-medium">Description<textarea maxLength={240} rows={2} value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
        <fieldset className="space-y-2"><legend className="mb-2 text-sm font-medium">Permissions</legend>
          {DELEGABLE_PERMISSIONS.map(p=><label key={p} className="flex cursor-pointer gap-3 rounded-lg border p-3 text-sm hover:bg-slate-50">
            <input type="checkbox" className="mt-1" checked={permissions.includes(p)} onChange={e=>setPermissions(old=>e.target.checked?[...old,p]:old.filter(v=>v!==p))}/>
            <span>{PERMISSIONS[p]}<small className="block text-slate-500">{p}</small></span>
          </label>)}
        </fieldset>
        <button disabled={busy||!permissions.length||!name.trim()} className="w-full rounded-lg bg-slate-950 p-3 font-medium text-white disabled:opacity-40">{editingId?'Save role changes':'Create staff role'}</button>
        {editingId&&<button type="button" className="w-full rounded-lg border p-3" onClick={()=>{setEditingId('');setName('');setDescription('');setPermissions([])}}>Cancel editing</button>}
      </form>
    </section>
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Assign a role</h2>
        <p className="my-2 text-sm text-slate-600">Only existing member accounts can receive delegated access.</p>
        <form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(await submit('/api/admin/roles/assignments','POST',{userId,roleId})){setUserId('');setRoleId('')}}}>
          <label className="block text-sm font-medium">Member<select required value={userId} onChange={e=>setUserId(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3">
            <option value="">Select member</option>{data?.users.filter(u=>u.role==='member').map(u=><option key={u.id} value={u.id}>{u.email}</option>)}
          </select></label>
          <label className="block text-sm font-medium">Role<select required value={roleId} onChange={e=>setRoleId(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3">
            <option value="">Select role</option>{data?.roles.filter(r=>r.active).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select></label>
          <button disabled={busy||!userId||!roleId} className="rounded-lg bg-amber-700 px-4 py-3 font-medium text-white disabled:opacity-40">Assign access</button>
        </form>
        <h3 className="mb-2 mt-6 font-semibold">Current assignments</h3>
        {data?.assignments.length===0&&<p className="text-sm text-slate-500">No assignments yet.</p>}
        {data?.assignments.map(a=><div key={a.id} className="my-2 flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <div className="min-w-0"><p className="truncate font-medium">{data.users.find(u=>u.id===a.userId)?.email}</p><p className="text-slate-600">{data.roles.find(r=>r.id===a.roleId)?.name}</p></div>
          <button type="button" disabled={busy} className="rounded border px-3 py-2 text-red-700" onClick={()=>{if(window.confirm('Revoke this role?'))void submit('/api/admin/roles/assignments','DELETE',{userId:a.userId,roleId:a.roleId})}}>Revoke</button>
        </div>)}
      </section>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Roles and status</h2>
        {data?.roles.length===0&&<p className="text-sm text-slate-500">No roles created yet.</p>}
        {data?.roles.map(r=><div key={r.id} className="mb-3 rounded-xl border p-4">
          <h3 className="font-semibold">{r.name} <span className="text-xs font-normal text-slate-500">{r.active?'Active':'Disabled'}</span></h3>
          <p className="my-2 text-sm text-slate-600">{r.description}</p>
          <p className="mb-3 text-xs text-slate-600">{r.permissions.join(' · ')}</p>
          <button type="button" disabled={busy} className="rounded-lg border px-3 py-2 text-sm" onClick={()=>{setEditingId(r.id);setName(r.name);setDescription(r.description);setPermissions(r.permissions);document.getElementById('new-role')?.scrollIntoView({behavior:'smooth'})}}>Edit</button>
          <button type="button" disabled={busy} className="ml-2 rounded-lg border px-3 py-2 text-sm" onClick={()=>void submit('/api/admin/roles','PATCH',{id:r.id,active:!r.active})}>{r.active?'Disable role':'Enable role'}</button>
          <button type="button" disabled={busy} className="ml-2 rounded-lg border px-3 py-2 text-sm text-red-700" onClick={()=>{if(window.confirm('Delete role? Remove its assignments first.'))void submit('/api/admin/roles?id='+r.id,'DELETE',{})}}>Delete</button>
        </div>)}
      </section>
    </div>
  </div>
}
