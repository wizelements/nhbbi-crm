import {describe, expect, it} from 'vitest'
import {assignRole,createRole,disableRole,revokeRole,Denied,type NativeDatabase,type NativeTransaction} from './management'
const owner={id:1,role:'admin'} as const
const user={id:2,role:'member'} as const
const roleId='47e5a019-4830-41a6-8a0f-413c282ef133'
const freshId=(()=>{let n=0;return ()=>`aaaaaaaa-aaaa-4aaa-8aaa-${(++n).toString().padStart(12,'0')}`})()

class TransactionalFake implements NativeDatabase {
  roles=new Map<string,{active:number}>()
  grants=new Set<string>()
  audit:string[]=[]
  failAudit=false
  async getAccountRole(id:number){return id===2?'member' as const:null}
  async transaction<T>(work:(tx:NativeTransaction)=>Promise<T>):Promise<T>{
    const snapshot={roles:new Map(this.roles),grants:new Set(this.grants),audit:[...this.audit]}
    const tx:NativeTransaction={
      query:async <R extends Record<string,unknown>>(sql:string,params:(string|number|null)[])=>{
        if(sql.includes('SELECT active FROM nhbbi_staff_roles')){
          const row=this.roles.get(String(params[0]))
          return (row?[row]:[]) as unknown as R[]
        }
        throw new Error('Unexpected query')
      },
      execute:async (sql:string,params:(string|number|null)[])=>{
        if(sql.startsWith('INSERT INTO nhbbi_access_audit')){
          if(this.failAudit)throw new Error('Audit unavailable')
          this.audit.push(String(params[2]));return {changes:1}
        }
        if(sql.startsWith('INSERT INTO nhbbi_staff_roles')){
          this.roles.set(String(params[0]),{active:1});return {changes:1}
        }
        if(sql.startsWith('INSERT INTO nhbbi_staff_role_assignments')){
          const k=String(params[0])+':'+String(params[1])
          if(this.grants.has(k))return {changes:0}
          this.grants.add(k);return {changes:1}
        }
        if(sql.startsWith('DELETE FROM nhbbi_staff_role_assignments')){
          const k=String(params[0])+':'+String(params[1])
          const had=this.grants.delete(k);return {changes:had?1:0}
        }
        if(sql.startsWith('UPDATE nhbbi_staff_roles')){
          const role=this.roles.get(String(params[0]))
          if(!role||role.active===0)return {changes:0}
          role.active=0;return {changes:1}
        }
        throw new Error('Unexpected mutation')
      }
    }
    try{return await work(tx)}
    catch(error){
      this.roles=snapshot.roles;this.grants=snapshot.grants;this.audit=snapshot.audit
      throw error
    }
  }
}
describe('native NHBBI administration atomicity',()=>{
  it('cannot grant staff authority to unauthenticated actors or existing admins',async()=>{
    const db=new TransactionalFake()
    db.roles.set(roleId,{active:1})
    await expect(assignRole(null,2,roleId,db,freshId)).rejects.toBeInstanceOf(Denied)
    await expect(assignRole(owner,1,roleId,db,freshId)).rejects.toBeInstanceOf(Denied)
    expect(db.grants.size).toBe(0)
  })
  it('refuses unrecognized permissions before writing role records',async()=>{
    const db=new TransactionalFake()
    await expect(createRole(owner,{name:'Admin',description:'',permissions:['roles.manage']},db,freshId)).rejects.toBeInstanceOf(Denied)
    expect(db.audit).toEqual([])
  })
  it('creates a role, then idempotently grants and revokes it with exact audit',async()=>{
    const db=new TransactionalFake()
    const r=await createRole(owner,{name:'Events coordinator',description:'',permissions:['events.view']},db,freshId)
    expect(db.roles.has(r.id)).toBe(true)
    const once=await assignRole(owner,2,r.id,db,freshId)
    const twice=await assignRole(owner,2,r.id,db,freshId)
    expect(once.assigned).toBe(true)
    expect(twice.assigned).toBe(false)
    expect(db.audit).toEqual(['role.created','role.assigned'])
    expect((await revokeRole(owner,2,r.id,db,freshId)).revoked).toBe(true)
    expect((await revokeRole(owner,2,r.id,db,freshId)).revoked).toBe(false)
    expect(db.audit).toEqual(['role.created','role.assigned','role.revoked'])
  })
  it('rolls back a role grant if its audit record cannot be written',async()=>{
    const db=new TransactionalFake()
    db.roles.set(roleId,{active:1})
    db.failAudit=true
    await expect(assignRole(owner,2,roleId,db,freshId)).rejects.toThrow('Audit unavailable')
    expect(db.grants.size).toBe(0)
  })
  it('immediately disables inherited role access and audits it',async()=>{
    const db=new TransactionalFake()
    db.roles.set(roleId,{active:1})
    expect((await disableRole(owner,roleId,db,freshId)).disabled).toBe(true)
    expect((await disableRole(owner,roleId,db,freshId)).disabled).toBe(false)
    expect(db.audit).toEqual(['role.disabled'])
  })
})
