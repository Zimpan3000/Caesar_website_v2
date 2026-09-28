import { PortalData } from './models'

// Illustrative prototype records, not actual engineering results or membership.
export function seedData(): PortalData {
  return {
    teams: [
      { id: 'avionics', name: 'Avionics', description: 'Electronics, embedded systems and reliable flight telemetry. From the flight computer to every sensor on board.', members: ['Avionics lead (sample)', 'Embedded engineer (sample)', 'Test engineer (sample)'], projectId: 'phobos', status: 'In Progress' },
      { id: 'propulsion', name: 'Propulsion', description: 'Developing and validating the propulsion system, feed components and test instrumentation.', members: ['Propulsion lead (sample)', 'Test engineer (sample)'], projectId: 'phobos', status: 'In Progress' },
      { id: 'structures', name: 'Structures', description: 'Design, materials and manufacturing for a lightweight and dependable airframe.', members: ['Structures lead (sample)', 'CAD engineer (sample)'], projectId: 'phobos', status: 'In Progress' },
      { id: 'marketing', name: 'Marketing', description: 'Documenting our work, building partnerships and sharing the mission with the next generation.', members: ['Communications lead (sample)', 'Designer (sample)'], projectId: 'outreach', status: 'In Progress' },
    ],
    projects: [
      { id: 'phobos', name: 'Phobos', teamId: 'avionics', description: 'A student-built research rocket. Bringing avionics, propulsion and structures together into one integrated flight vehicle.', status: 'In Progress', startDate: '2026-09-01', targetDate: '2027-06-01' },
      { id: 'outreach', name: 'Mission outreach', teamId: 'marketing', description: 'Make our engineering accessible through project stories, partner communication and campus events.', status: 'In Progress', startDate: '2026-09-01', targetDate: '2026-12-15' },
    ],
    goals: [
      { id: 'integration', title: 'Complete integration testing', teamId: 'avionics', projectId: 'phobos', description: 'Connect the flight computer, telemetry and sensor stack. Document bench-test observations and integration issues.', deadline: '2026-10-20', status: 'In Progress', progress: 65 },
      { id: 'test-plan', title: 'Prepare the engine test campaign', teamId: 'propulsion', projectId: 'phobos', description: 'Complete the instrumentation checklist and review the test plan with the team.', deadline: '2026-10-28', status: 'Planned', progress: 0 },
      { id: 'airframe', title: 'Review airframe manufacturing', teamId: 'structures', projectId: 'phobos', description: 'Resolve material availability before finalizing the manufacturing schedule.', deadline: '2026-11-05', status: 'Blocked', progress: 35 },
      { id: 'partner-pack', title: 'Publish the partner introduction', teamId: 'marketing', projectId: 'outreach', description: 'Prepare the initial project presentation and team overview.', deadline: '2026-09-25', status: 'Completed', progress: 100 },
    ],
    updates: [
      { id: 'flight-computer', title: 'Testing new flight computer', teamId: 'avionics', projectId: 'phobos', date: '2026-09-26', author: 'Avionics lead (sample)', description: 'The first bench integration is underway. We are checking sensor communication and logging the results before the next review.', status: 'In Progress', tags: ['flight computer', 'integration'] },
      { id: 'outreach-update', title: 'A new chapter for our partners', teamId: 'marketing', projectId: 'outreach', date: '2026-09-25', author: 'Communications lead (sample)', description: 'The introductory project pack is ready for review. Next up: documenting the teams in the workshop.', status: 'Completed', tags: ['partnerships'] },
    ],
    entries: [
      { id: 'sensor-sample', title: 'Sensor sampling check', teamId: 'avionics', projectId: 'phobos', date: '2026-09-26', description: 'Illustrative bench-test record for the sensor acquisition loop.', category: 'Sensor measurements', value: 100, unit: 'Hz', notes: 'Sample data only. Not an actual measured or validated result.' },
      { id: 'mass-sample', title: 'Airframe sample mass', teamId: 'structures', projectId: 'phobos', date: '2026-09-24', description: 'Illustrative entry showing how a manufacturing measurement can be documented.', category: 'Manufacturing', value: 245, unit: 'g', notes: 'Sample data only. Not an actual vehicle specification.' },
      { id: 'test-sample', title: 'Instrumentation channel check', teamId: 'propulsion', projectId: 'phobos', date: '2026-09-23', description: 'Illustrative test setup record.', category: 'Engine testing', value: 8, unit: 'channels', notes: 'Sample data only. No real engine test is represented.' },
    ],
    activity: [
      { id: 'sample-activity-1', date: '2026-09-26T10:00:00Z', actor: 'Admin', teamId: 'avionics', projectId: 'phobos', message: 'Avionics added a new test result: Sensor sampling check', entity: 'entries', entityId: 'sensor-sample' },
      { id: 'sample-activity-2', date: '2026-09-26T09:00:00Z', actor: 'Admin', teamId: 'avionics', projectId: 'phobos', message: 'Avionics posted an update: Testing new flight computer', entity: 'updates', entityId: 'flight-computer' },
      { id: 'sample-activity-3', date: '2026-09-25T14:00:00Z', actor: 'Admin', teamId: 'marketing', projectId: 'outreach', message: 'Marketing completed a goal: Publish the partner introduction', entity: 'goals', entityId: 'partner-pack' },
    ],
  }
}
