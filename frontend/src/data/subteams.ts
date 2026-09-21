// Team descriptions and keywords supplied by CAESAR for the scroll presentation.
// A 100-unit timeline spans 1600svh of native scroll: 16svh per unit.
// Each team gets 5 units to appear, 12 to hold, and 3 to disappear.
// The complete copy and camera stay still for 192svh per team.
export const subteamTiming = { reveal: 5, hold: 12, exit: 3, cameraTravel: 8 } as const

export const subteams = [
  {
    id: 'electronics',
    name: 'ELECTRONICS',
    description: 'The Electronics subteam develops the rocket’s electrical systems, including electronics, sensors, and communication between subsystems. They design circuit boards, program embedded systems, and integrate hardware to ensure reliable data collection and system performance throughout the flight.',
    keywords: ['SENSORS', 'EMBEDDED SYSTEMS', 'PCB DESIGN', 'COMMUNICATION', 'DATA'],
    side: 'left',
    start: 10,
    end: 27,
    progress: .20,
    point: .29,
    zoom: 2.5,
  },
  {
    id: 'propulsion',
    name: 'PROPULSION',
    description: 'The Propulsion subteam develops the rocket’s propulsion system, from design and manufacturing to testing key components such as fuel tanks, feed systems, the combustion chamber, and the nozzle. By combining theory with hands-on engineering, the team works to create a safe, reliable, and efficient propulsion system.',
    keywords: ['FUEL SYSTEM', 'FEED SYSTEM', 'COMBUSTION', 'NOZZLE', 'TESTING'],
    side: 'left',
    start: 30,
    end: 47,
    progress: .40,
    point: .92,
    zoom: 2.65,
  },
  {
    id: 'structures',
    name: 'STRUCTURES',
    description: 'The Structures subteam designs and develops the rocket’s mechanical structure, ensuring it is lightweight, strong, and durable. They work with CAD, material selection, and manufacturing to create a structure that can withstand the stresses of launch and flight.',
    keywords: ['CAD', 'MATERIALS', 'MANUFACTURING', 'MECHANICAL DESIGN', 'STRUCTURAL LOADS'],
    side: 'left',
    start: 50,
    end: 67,
    progress: .60,
    point: .46,
    zoom: 2.3,
  },
  {
    id: 'marketing',
    name: 'MARKETING',
    description: 'The Marketing subteam manages the project’s external communication, building its visibility and brand. They create content for social media, produce graphic material, and collaborate with companies, sponsors, and partners to promote the project and inspire future students.',
    keywords: ['BRANDING', 'COMMUNICATION', 'PARTNERSHIPS', 'CONTENT', 'SPONSORS'],
    side: 'right',
    start: 70,
    end: 87,
    progress: .80,
    point: .54,
    zoom: 2.05,
  },
] as const

export type Subteam = typeof subteams[number]
