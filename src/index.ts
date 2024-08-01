import fs from 'fs';

export function runWith(_input: any) {
  return { status: 'error' };
}

// get the input from stdin and parse
const stdin = fs.readFileSync(0, 'utf8');
const parsedInput = JSON.parse(stdin);
const output = runWith(parsedInput);

process.stdout.write(JSON.stringify(output) + '\n');
