'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToActivation() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/manual-activation'); }, [router]);
  return null;
}
