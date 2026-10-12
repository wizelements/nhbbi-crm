import {describe,it,expect} from 'vitest'
import {can,canDelegate,parsePermissions,resolveAccess,type ReadClient} from './permissions'
describe('live NHBBI numeric account authorization',()=>{
  const reader=(grants:string[]):ReadClient=>({query:async <T extends Record<string,unknown>>(_sql:string,_args:readonly(number|string)[]) => grants.map(permissions=>({permissions} as unknown as T))})
  it('does not trust invalid or missing identity',async()=>{
    expect(await resolveAccess(null,reader(['["members.view"]']))).toEqual({isOwner:false,permissions:[]})
    expect(await resolveAccess({id:0,role:'admin'},reader([]))).toEqual({isOwner:false,permissions:[]})
  })
  it('owner receives full access without delegated role records',async()=>{
    const r=await resolveAccess({id:7,role:'admin'},reader([]))
    expect(can(r,'roles.manage')).toBe(true)
  })
  it('members need active role records for every staff operation',async()=>{
    const r=await resolveAccess({id:12,role:'member'},reader(['["directory.view","roles.manage","evil"]']))
    expect(r.permissions).toEqual(['directory.view'])
    expect(can(r,'roles.manage')).toBe(false)
  })
  it('fails closed when staff role table is missing or unavailable',async()=>{
    const database: ReadClient={query:async()=>{throw new Error('missing table')}}
    expect((await resolveAccess({id:12,role:'member'},database)).permissions).toEqual([])
  })
  it('forbids owner role delegation and invalid catalog values',()=>{
    expect(canDelegate(['roles.manage'])).toBe(false)
    expect(canDelegate(['leads.view','nonexistent'])).toBe(false)
    expect(canDelegate(['leads.view'])).toBe(true)
    expect(parsePermissions('{broken')).toEqual([])
  })
})
