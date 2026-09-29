// Public editorial content, separate from private workspace projects and team relationships.
// Phobos type, target altitude and current-project status were confirmed by CAESAR.
// System descriptions summarise the existing team pages; they are not subprojects.
export type RocketProject = {
  slug: string
  name: string
  type: string
  tagline: string
  summary: string
  purpose: string
  target: { value: string; unit: string; description: string }
  image: { path: string; alt: string; caption: string }
  status: { label: string; description: string }
  systems: { team: string; path: string; title: string; description: string }[]
  development: { title: string; description: string }[]
  updates: { date: string; title: string; description: string }[]
}

export const phobos: RocketProject = {
  slug: 'phobos',
  name: 'PHOBOS',
  type: 'Hybrid rocket',
  tagline: 'CAESAR’s hybrid rocket aiming for an altitude of 3 km.',
  summary: 'Phobos is CAESAR’s current rocket project. Students are developing a hybrid rocket with a target altitude of 3 km, bringing individual systems together into one working vehicle.',
  purpose: 'We are building Phobos to put engineering theory into practice. Through design, manufacturing and testing, students gain hands-on experience developing rockets together. That knowledge lays the foundation for increasingly ambitious rocket projects.',
  target: { value: '3', unit: 'km', description: 'The goal is to reach an altitude of 3 km. This is the project’s target, not an achieved flight result.' },
  image: { path: 'assets/phobos.png', alt: 'Phobos render showing a black rocket body with the CAESAR logo', caption: 'Phobos / project render' },
  status: { label: 'Current Project', description: 'Phobos is CAESAR’s current rocket project. This page brings together the project’s direction and updates on its development.' },
  systems: [
    { team: 'Propulsion', path: 'propulsion', title: 'Propulsion', description: 'The hybrid engine and its supporting fluid systems. Work includes designing, manufacturing and testing propulsion components.' },
    { team: 'Electronics', path: 'electronics', title: 'Electronics & flight data', description: 'Sensors, embedded systems and communications. The electronics collect data and connect the rocket’s systems with each other and with the ground.' },
    { team: 'Structures', path: 'structures', title: 'Structures & recovery', description: 'Mechanical design, aerodynamics and recovery systems. The work brings together material selection, manufacturing and integration of the rocket’s parts.' },
  ],
  development: [
    { title: 'Concept & design', description: 'Requirements, analysis and design give the systems a shared direction.' },
    { title: 'Manufacturing & integration', description: 'Components take physical form and come together as systems that need to work with each other.' },
    { title: 'Testing & learning', description: 'Tests and analysis provide evidence to evaluate and improve the design.' },
    { title: 'Towards launch', description: 'The systems need to be verified together before a future flight.' },
  ],
  updates: [],
}

export const rocketProjects: RocketProject[] = [phobos]
