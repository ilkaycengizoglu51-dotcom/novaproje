import { q } from './db';
const COLS = `m.id, m.file_id, m.caption, to_char(m.taken_at,'YYYY-MM-DD') AS taken_at, m.created_at, m.show_client, m.show_manager, ms.title AS ms_title, m.project_id`;
const J = 'FROM project_media m LEFT JOIN milestones ms ON ms.id = m.milestone_id';
export const mediaOfProject = (pid: number, who: 'admin' | 'client' | 'manager') =>
  q(`SELECT ${COLS} ${J} WHERE m.project_id = $1 ${who === 'client' ? 'AND m.show_client' : who === 'manager' ? 'AND m.show_manager' : ''} ORDER BY COALESCE(m.taken_at, m.created_at::date) DESC, m.id DESC`, [pid]);
export const mediaOfClient = (cid: number, limit = 8) =>
  q(`SELECT ${COLS} ${J} JOIN projects p ON p.id = m.project_id WHERE p.client_id = $1 AND m.show_client ORDER BY m.created_at DESC LIMIT ${limit}`, [cid]);
export const mediaForManager = (mid: number) =>
  q(`SELECT ${COLS}, p.name AS project_name, c.name AS client_name ${J} JOIN projects p ON p.id = m.project_id JOIN users c ON c.id = p.client_id WHERE c.manager_id = $1 AND m.show_manager ORDER BY m.created_at DESC LIMIT 60`, [mid]);
