'use client';

import OwnerProfilePage from 'components/owner/OwnerProfilePage';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
  const params = useParams();
  const ownerId = params?.ownerId as string; // use your dynamic route param name

  return <OwnerProfilePage ownerId={ownerId} />;
}
