import { q } from './db';
export const threadOf = (cid: number) => q(`SELECT m.*, COALESCE((SELECT json_agg(json_build_object('id', f.id, 'name', f.name, 'size', f.size)) FROM message_files mf JOIN files f ON f.id = mf.file_id WHERE mf.message_id = m.id), '[]') AS files
  FROM messages m WHERE m.client_id = $1 AND m.created_at <= now() ORDER BY m.id`, [cid]);
