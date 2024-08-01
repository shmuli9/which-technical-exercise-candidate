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

  return { status: 'ok', location, heading, path: directions };
}

// get the input from stdin and parse
const stdin = fs.readFileSync(0, 'utf8');
const parsedInput = JSON.parse(stdin);
const output = runWith(parsedInput);

process.stdout.write(JSON.stringify(output) + '\n');
