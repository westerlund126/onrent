//app/customer/page.tsx
import { redirect } from 'next/navigation';
export default function Home({}) {
  redirect('/customer/default');
  //i just made only 1 page in customer, it's catalog so redirected to it
}
