export function runWith(_input: any) {
  return { status: 'error' };
}

// get the input from stdin and parse
const input = require('fs').readFileSync(0, 'utf8');
const parsedInput = JSON.parse(input);

runWith(parsedInput);
