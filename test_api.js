import { fetchUsersList } from './backend/src/services/userService.js';

const run = async () => {
  try {
    const res = await fetchUsersList({ page: 1, limit: 10, search: '', role: 'Recruiter', status: 'All' });
    console.log('Recruiters only:', res.users.map(u => ({ name: u.name, role: u.role })));

    const res2 = await fetchUsersList({ page: 1, limit: 10, search: 'tam', role: 'Candidate', status: 'All' });
    console.log('Search + Candidate:', res2.users.map(u => ({ name: u.name, role: u.role })));

  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}
run();
