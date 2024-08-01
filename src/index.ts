import fs from 'fs';

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
  directions: CommandType[];
}

interface RobotOutput extends RobotState {
  status: StatusType;
  path: CommandType[];
}

export function runWith(_input: RobotInput): RobotOutput {
  const { arena, location, heading, directions } = _input;

  let currentState = { location, heading }; // initialise to starting coordinates
  const path: CommandType[] = [];

  for (const command of directions) {
    path.push(command);

    if (!isValidCommand(command)) {
      return { status: 'error', ...currentState, path };
    }

    if (!isWithinArena(currentState, arena)) {
      return { status: 'crash', ...currentState, path };
    }
  }

  return { status: 'ok', ...currentState, path };
}

function isValidCommand(command: any) {
  return Object.values(Command).includes(command);
}

function isWithinArena({ location }: RobotState, { corner1, corner2 }: RobotInput['arena']): boolean {
  const { x: minX, y: minY } = corner1;
  const { x: maxX, y: maxY } = corner2;

  return location.x >= minX && location.x <= maxX && location.y >= minY && location.y <= maxY;
}

// get the input from stdin and parse
const stdin = fs.readFileSync(0, 'utf8');
const parsedInput = JSON.parse(stdin);
const output = runWith(parsedInput);

process.stdout.write(JSON.stringify(output) + '\n');
