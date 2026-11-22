import PasswordForm from '@/components/PasswordForm';
import { PageTitle } from '@/components/Shell';
import { requireAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function Account() { const u = await requireAdmin(); return <><PageTitle title="Hesabım" /><PasswordForm /></>; }
