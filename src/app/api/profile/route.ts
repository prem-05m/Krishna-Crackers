import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      _id: (user as any)._id.toString(),
      phone: (user as any).phone,
      name: (user as any).name || '',
      town: (user as any).town || '',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name: body.name, town: body.town },
      { new: true }
    ).lean();

    return NextResponse.json({
      _id: (user as any)._id.toString(),
      phone: (user as any).phone,
      name: (user as any).name || '',
      town: (user as any).town || '',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
