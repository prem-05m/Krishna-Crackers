import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Category from '@/models/Category';

const mapCategory = (c: any) => ({
  _id: c._id.toString(),
  name: c.name,
  isActive: c.isActive
});

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ order: 1 });
    return NextResponse.json(categories.map(mapCategory));
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await connectToDatabase();

    const newCategory = await Category.create({
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isActive: data.isActive
    });

    return NextResponse.json(mapCategory(newCategory));
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
