import { describe,it,expect } from 'vitest'
import { liveDatabaseConfig,DatabaseConfigurationError } from './database-config'
describe('live NHBBI DB settings',()=>{
  it('fails closed when production credentials are missing',()=>{
    expect(()=>liveDatabaseConfig({NODE_ENV:'production'})).toThrow(DatabaseConfigurationError)
    expect(()=>liveDatabaseConfig({VERCEL:'1',TURSO_DATABASE_URL:'file:nhbbi-local.db'})).toThrow(DatabaseConfigurationError)
  })
  it('rejects unauthenticated remote connections',()=>{
    expect(()=>liveDatabaseConfig({NODE_ENV:'production',TURSO_DATABASE_URL:'libsql://db.example.turso.io'})).toThrow(DatabaseConfigurationError)
  })
  it('accepts authenticated Turso configuration without reporting secrets',()=>{
    expect(liveDatabaseConfig({NODE_ENV:'production',TURSO_DATABASE_URL:'libsql://db.example.turso.io',TURSO_AUTH_TOKEN:'secret'}))
      .toEqual({url:'libsql://db.example.turso.io',authToken:'secret'})
  })
  it('permits local SQLite only for development',()=>{
    expect(liveDatabaseConfig({NODE_ENV:'development'})).toEqual({url:'file:nhbbi-local.db'})
    expect(()=>liveDatabaseConfig({NODE_ENV:'production',TURSO_DATABASE_URL:'file:some.db',TURSO_AUTH_TOKEN:'x'})).toThrow(DatabaseConfigurationError)
  })
})
