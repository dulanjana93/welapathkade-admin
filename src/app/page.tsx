import { redirect } from 'next/navigation';
import { readTokens } from '@/lib/auth/cookies';

export default async function HomePage() {
  const { accessToken, refreshToken } = await readTokens();
  if (accessToken || refreshToken) {
    redirect('/dashboard');
  }
  redirect('/login');
}
