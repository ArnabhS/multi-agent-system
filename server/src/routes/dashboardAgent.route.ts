import express from 'express'
import { 
  birthdayReminders, 
  courseCompletionRate, 
  dashboardAgentQueries, 
  dashboardAgentSummary, 
  getActiveClients, 
  getAttendanceStats, 
  getAttendanceStatsByClassname, 
  getInactiveClients, 
  getNewClients, 
  getTopEnrollments,
  getSessionContext,
  clearSessionMemory,
  getActiveSessions,
  createNewSession
} from '../controllers/agent.controller';

const router = express.Router();

router.post('/query',dashboardAgentQueries);
router.get('/summary',dashboardAgentSummary);
router.get('/courses/top-enrollment',getTopEnrollments);
router.get('/attendance/:classname', getAttendanceStatsByClassname);
router.get('/attendance',getAttendanceStats);
router.get('/clients/inactive',getInactiveClients);
router.get('/clients/active',getActiveClients);
router.get('/clients/birthday-reminder',birthdayReminders);
router.get('/clients/new-this-month',getNewClients);
router.get('/clients/courses/completion-rates',courseCompletionRate);


router.post('/memory/sessions/new', createNewSession);
router.get('/memory/sessions/:sessionId', getSessionContext);
router.delete('/memory/sessions/:sessionId', clearSessionMemory);
router.get('/memory/sessions', getActiveSessions);

export default router;
