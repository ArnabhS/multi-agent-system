import express from 'express'
import { birthdayReminders, courseCompletionRate, dashboardAgentQueries, dashboardAgentSummary, getActiveClients, getAttendanceStats, getAttendanceStatsByClassname, getInactiveClients, getNewClients, getTopEnrollments } from '../controllers/agent.controller';

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

export default router;
