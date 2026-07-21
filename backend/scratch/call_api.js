import db from '../src/db/knex.js';
import { generateToken } from '../src/auth/jwt.js';

async function testCall() {
  try {
    const hrs = await db('users')
      .join('user_roles', 'users.id', 'user_roles.user_id')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select('users.id', 'users.email', 'roles.name as role')
      .where('roles.name', 'HR');
    
    if (hrs.length === 0) {
      console.error("No HR user found in db!");
      return;
    }

    const hr = hrs[0];
    console.log("Using HR user for token generation:", hr);

    const token = generateToken({ id: hr.id, email: hr.email, role: hr.role });
    console.log("Generated Token:", token);

    // Call the local API using fetch
    console.log("Making fetch request to http://localhost:5000/api/jobs/applications ...");
    const response = await fetch("http://localhost:5000/api/jobs/applications", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("Response Status:", response.status);
    const text = await response.text();
    console.log("Response Text:", text);
  } catch (error) {
    console.error("API Call failed:", error);
  } finally {
    await db.destroy();
  }
}

testCall();
