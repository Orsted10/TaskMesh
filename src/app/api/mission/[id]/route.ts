import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Delete quest dependencies manually just in case cascade is off
    await supabase.from('quest_steps').delete().eq('quest_id', id);
    await supabase.from('user_quest_progress').delete().eq('quest_id', id);
    const { error } = await supabase.from('quests').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Mission Terminated' }, { status: 200 });
  } catch (error: any) {
    console.error('Error terminating mission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
