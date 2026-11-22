import PasswordForm from '@/components/PasswordForm';
import { PageTitle } from '@/components/Shell';
import { requireContractor } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function Account() { await requireContractor(); return <><PageTitle title="Hesabım" /><PasswordForm /></>; }
