import { createClient } from '@/lib/supabase/server';
import type { CreateDebtInput, Debt } from '@/types/debt';
import { validateDebtInput } from '@/lib/validations/debt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'settled' | 'unsettled' | 'all' | null;
    const type = searchParams.get('type') as 'owed_to_me' | 'i_owe' | 'all' | null;

    let query = supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status === 'settled') {
      query = query.not('settled_at', 'is', null);
    } else if (status === 'unsettled') {
      query = query.is('settled_at', null);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data kasbon' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Debt[]);
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateDebtInput;

    const errors = validateDebtInput(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        type: body.type,
        counterpart_name: body.counterpart_name.trim(),
        amount: body.amount,
        note: body.note?.trim() || null,
        due_date: body.due_date || null,
        settled_at: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal membuat kasbon' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Debt, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
