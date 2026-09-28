import { Entity, PortalData } from './models'
import { applyDelete, applySave, MembersRepository } from './repository'
import { supabaseAdmin } from './supabase'

export class SupabaseMembersRepository implements MembersRepository {
  private async snapshot(): Promise<{ data: PortalData; revision: number }> {
    const { data, error } = await supabaseAdmin().from('caesar_workspace').select('data, revision').eq('id', 1).single()
    if (error || !data) throw new Error('Workspace is unavailable. Apply the Supabase migration first.')
    return data
  }
  async read() { return (await this.snapshot()).data }
  async save(entity: Entity, input: unknown, actor: string, id?: string): Promise<PortalData> {
    return this.change(data => applySave(data, entity, input, actor, id))
  }
  async remove(entity: Entity, id: string, actor: string): Promise<PortalData> {
    return this.change(data => applyDelete(data, entity, id, actor))
  }
  private async change(transform: (data: PortalData) => PortalData): Promise<PortalData> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const snapshot = await this.snapshot()
      const changed = transform(snapshot.data)
      // Compare-and-swap prevents simultaneous saves on different server instances
      // from losing unrelated records. The record and activity commit together.
      const { data, error } = await supabaseAdmin().from('caesar_workspace')
        .update({ data: changed, revision: snapshot.revision + 1 })
        .eq('id', 1).eq('revision', snapshot.revision).select('revision')
      if (error) throw error
      if (data?.length) return changed
    }
    throw new Error('The workspace is busy. Please save again.')
  }
}
