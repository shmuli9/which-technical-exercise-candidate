import { readFileSync } from 'fs';

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

enum Command {
  forward = 'forward',
  left = 'left',
  right = 'right',
  backward = 'backward',
}
type CommandType = keyof typeof Command;

enum Heading {
  north = 'north',
  east = 'east',
  south = 'south',
  west = 'west',
}
type HeadingType = keyof typeof Heading;

type CommandWithReps = `${CommandType}(${number})` | CommandType;

interface RobotInput extends RobotState {
  arena: { corner1: Coordinate; corner2: Coordinate };
  directions: CommandWithReps[];
}

interface RobotOutput extends RobotState {
  status: StatusType;
  path: CommandType[];
}

function isCommandWithReps(command: string): command is `${CommandType}(${number})` {
  const parts = command.split('(');
  if (parts.length !== 2 || !parts[1].endsWith(')')) {
    return false;
  }
  const cmd = parts[0] as Command;
  const reps = parts[1].slice(0, -1);
  return Object.values(Command).includes(cmd) && !isNaN(Number(reps));
}

function parseCommandWithReps(command: `${CommandType}(${number})`): { command: CommandType; reps: number } {
  const [cmd, reps] = command.split('(');
  return { command: cmd as CommandType, reps: Number(reps.split(')')[0]) };
}

export function runWith(_input: RobotInput): RobotOutput {
  const { arena, location, heading, directions } = _input;

  let currentState = { location, heading }; // initialise to starting coordinates
  const path: CommandType[] = [];

  const directions2: CommandType[] = [];

  directions.forEach((command) => {
    if (isCommandWithReps(command)) {
      const { command: cmd, reps } = parseCommandWithReps(command);
      for (let i = 0; i < reps; i++) {
        directions2.push(cmd);
      }
    } else {
      directions2.push(command);
    }
  });

  for (const command of directions2) {
    path.push(command);

    if (!isValidCommand(command)) {
      return { status: 'error', ...currentState, path };
    }

    try {
      currentState = runCommand(command, currentState, arena); // update the state
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
        default:
          throw new Error('Invalid heading');
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
