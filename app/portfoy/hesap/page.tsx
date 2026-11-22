import PasswordForm from '@/components/PasswordForm';
import { PageTitle } from '@/components/Shell';
import { requireManager } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function Account() { const u = await requireManager(); return <><PageTitle title="Hesabım" /><PasswordForm /></>; }
