import { getBaseQuery } from './backend/src/models/userModel.js';
import db from './backend/src/db/knex.js';

const run = async () => {
  try {
    const query = getBaseQuery()
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .select(['users.id', 'roles.name as db_role']);
    
    query.where('roles.name', 'HR');

    // the buggy line
    const countQuery = db.select(db.raw('COUNT(*) as total')).from(query.as('subquery')).first();
    const countResult = await countQuery;
    console.log('Count:', countResult);

    const users = await query.orderBy('users.id', 'desc').limit(10);
    console.log('Users:', users);
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}
run();
