import { readFileSync } from 'fs';

enum Heading {
  north = 'north',
  east = 'east',
  south = 'south',
  west = 'west',
}
type HeadingType = keyof typeof Heading;

enum Command {
  forward = 'forward',
  left = 'left',
  right = 'right',
  backward = 'backward',
}
type CommandType = keyof typeof Command;

enum Status {
  ok = 'ok',
  error = 'error',
  crash = 'crash',
}
type StatusType = keyof typeof Status;

type Coordinate = { x: number; y: number };

interface RobotState {
  location: Coordinate;
  heading: HeadingType;
}

interface RobotInput extends RobotState {
  arena: { corner1: Coordinate; corner2: Coordinate };
  directions: string[];
}

interface RobotOutput extends RobotState {
  status: StatusType;
  path: CommandType[];
}

export function runWith(_input: RobotInput): RobotOutput {
  const { arena, location, heading, directions } = _input;

  let currentState = { location, heading }; // initialise to starting coordinates
  const path: CommandType[] = [];

  const directions2: CommandType[] = [];

  // forward(3)
  directions.forEach((command) => {
    if (command.includes('(')) {
      const [cmd, reps] = command.split('(');
      const numberOfTime = Number(reps.split(')')[0]);
      for (let i = 0; i < numberOfTime; i++) {
        directions2.push(cmd as CommandType);
      }
    } else {
      directions2.push(command as CommandType);
    }
  });

  for (const command of directions2) {
    path.push(command as CommandType);

    if (!isValidCommand(command)) {
      return { status: 'error', ...currentState, path };
    }

    try {
      currentState = runCommand(command as CommandType, currentState, arena); // update the state
    } catch (e) {
      return { status: 'crash', ...currentState, path };
    }
  }

  return { status: 'ok', ...currentState, path };
}

function runCommand(command: CommandType, currentState: RobotState, arena: RobotInput['arena']): RobotState {
  const { location, heading } = currentState;

  let nextState;

  switch (command) {
    case Command.forward:
      switch (heading) {
        case Heading.north:
          nextState = { ...currentState, location: { x: location.x, y: location.y + 1 } };
          break;
        case Heading.south:
          nextState = { ...currentState, location: { x: location.x, y: location.y - 1 } };
          break;
        case Heading.east:
          nextState = { ...currentState, location: { x: location.x + 1, y: location.y } };
          break;
        case Heading.west:
          nextState = { ...currentState, location: { x: location.x - 1, y: location.y } };
          break;
      }
      break;
    case Command.backward:
      switch (heading) {
        case Heading.north:
          nextState = { ...currentState, location: { x: location.x, y: location.y - 1 } };
          break;
        case Heading.south:
          nextState = { ...currentState, location: { x: location.x, y: location.y + 1 } };
          break;
        case Heading.east:
          nextState = { ...currentState, location: { x: location.x - 1, y: location.y } };
          break;
        case Heading.west:
          nextState = { ...currentState, location: { x: location.x + 1, y: location.y } };
          break;
      }
      break;
    case Command.left:
      switch (heading) {
        case Heading.north:
          nextState = { ...currentState, heading: Heading.west };
          break;
        case Heading.south:
          nextState = { ...currentState, heading: Heading.east };
          break;
        case Heading.east:
          nextState = { ...currentState, heading: Heading.north };
          break;
        case Heading.west:
          nextState = { ...currentState, heading: Heading.south };
          break;
      }
      break;
    case Command.right:
      switch (heading) {
        case Heading.north:
          nextState = { ...currentState, heading: Heading.east };
          break;
        case Heading.south:
          nextState = { ...currentState, heading: Heading.west };
          break;
        case Heading.east:
          nextState = { ...currentState, heading: Heading.south };
          break;
        case Heading.west:
          nextState = { ...currentState, heading: Heading.north };
          break;
      }
      break;
  }

  if (!isWithinArena(nextState as RobotState, arena)) {
    throw new Error('Coordinate out of arena');
  }

  return nextState as RobotState;
}

function isValidCommand(command: string) {
  return Object.values(Command).includes(command as Command);
}

function isWithinArena({ location }: RobotState, { corner1, corner2 }: RobotInput['arena']): boolean {
  const { x: minX, y: minY } = corner1;
  const { x: maxX, y: maxY } = corner2;

  return location.x >= minX && location.x <= maxX && location.y >= minY && location.y <= maxY;
}

if (require.main === module) {
  // get the input from stdin and parse
  const stdin = readFileSync(0, 'utf8');
  const parsedInput = JSON.parse(stdin);
  const output = runWith(parsedInput);

  process.stdout.write(JSON.stringify(output) + '\n');
}
