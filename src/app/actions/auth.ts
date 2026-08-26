'use server';
import { loginUser, logoutUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export async function loginAction(phone: string) {
  try {
    await connectToDatabase();
    let user = await User.findOne({ phone });
    if (!user) { user = await User.create({ phone }); }
    await loginUser(user._id.toString(), user.phone);
    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to authenticate' };
  }
}

export async function logoutAction(formData?: FormData) {
  await logoutUser();
}