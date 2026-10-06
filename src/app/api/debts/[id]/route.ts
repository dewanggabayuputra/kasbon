import { createClient } from '@/lib/supabase/server';
import type { Debt, UpdateDebtInput } from '@/types/debt';
import { validateDebtInput } from '@/lib/validations/debt';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = (await request.json()) as UpdateDebtInput;

    // Check if debt belongs to user
    const { data: existingDebt } = await supabase
      .from('debts')
      .select('*')
      .eq('id', id)
      .single() as { data: Debt | null };

    if (!existingDebt || existingDebt.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Kasbon tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate if updating amount fields
    if (body.type || body.counterpart_name || body.amount || body.note !== undefined || body.due_date !== undefined) {
      const validateData = {
        type: body.type || existingDebt.type,
        counterpart_name: body.counterpart_name || existingDebt.counterpart_name,
        amount: body.amount || existingDebt.amount,
        note: body.note !== undefined ? body.note : (existingDebt.note || undefined),
        due_date: body.due_date !== undefined ? body.due_date : (existingDebt.due_date || undefined),
      };

      const errors = validateDebtInput(validateData);
      if (Object.keys(errors).length > 0) {
        return NextResponse.json(
          { error: 'Validasi gagal', details: errors },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.type) updateData.type = body.type;
    if (body.counterpart_name) updateData.counterpart_name = body.counterpart_name.trim();
    if (body.amount) updateData.amount = body.amount;
    if (body.note !== undefined) updateData.note = body.note?.trim() || null;
    if (body.due_date !== undefined) updateData.due_date = body.due_date || null;
    if (body.settled_at !== undefined) updateData.settled_at = body.settled_at;

    const { data, error } = await supabase
      .from('debts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengupdate kasbon' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Debt);
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if debt belongs to user
    const { data: debt } = await supabase
      .from('debts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!debt || debt.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Kasbon tidak ditemukan' },
        { status: 404 }
      );
    }

    const { error } = await supabase.from('debts').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menghapus kasbon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
