import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongoose';
import Owner from '@/models/Owner';

export async function GET() {
  try {
    await connectToDatabase();
    
    const ownerEmail = 'admin'; // Hardcoded username
    const ownerPassword = '3265';
    
    let owner = await Owner.findOne({ email: ownerEmail });
    const passwordHash = await bcrypt.hash(ownerPassword, 10);
    
    if (!owner) {
      owner = await Owner.create({
        email: ownerEmail,
        passwordHash,
        name: 'Super Admin'
      });
      return NextResponse.json({ message: 'Owner account created successfully', email: ownerEmail });
    } else {
      owner.passwordHash = passwordHash;
      await owner.save();
      return NextResponse.json({ message: 'Owner account password updated successfully' });
    }
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
