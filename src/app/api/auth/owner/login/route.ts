import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongoose';
import Owner from '@/models/Owner';
import { encrypt } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    const owner = await Owner.findOne({ email });
    if (!owner) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, owner.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const token = await encrypt({ owner: { id: owner._id.toString(), email: owner.email }, expires });

    // The Android App expects { token, owner: { id, name, email } }
    return NextResponse.json({
      token,
      owner: {
        id: owner._id.toString(),
        name: owner.name || 'Admin',
        email: owner.email
      }
    });

  } catch (error: any) {
    console.error('Owner login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
