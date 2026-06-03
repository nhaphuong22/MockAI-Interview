export const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  USER: 'USER'
};

export const CLIENT_ROLES = {
  ADMIN: 'Admin',
  RECRUITER: 'Recruiter',
  CANDIDATE: 'Candidate'
};

export const mapRoleToClient = (dbRole) => {
  if (dbRole === ROLES.ADMIN) return CLIENT_ROLES.ADMIN;
  if (dbRole === ROLES.HR) return CLIENT_ROLES.RECRUITER;
  return CLIENT_ROLES.CANDIDATE;
};

export const mapRoleToDb = (clientRole) => {
  if (clientRole === CLIENT_ROLES.ADMIN) return ROLES.ADMIN;
  if (clientRole === CLIENT_ROLES.RECRUITER) return ROLES.HR;
  return ROLES.USER;
};
