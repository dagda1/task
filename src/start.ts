import { sleep, Task } from 'effection';
import { main } from '@effection/node';

let attempt = 1;

function flakyConnection(): Promise<{ connected: boolean }> {
  return new Promise<{ connected: boolean }>((resolve) => {
    setTimeout(() => {
      attempt++;
      resolve({ connected: attempt === 5 });
    }, 100);
  });
}

main(function* (scope: Task) {
  console.log('in main');

  scope.spawn(function* (child) {
    child.spawn(function* () {
      console.log('primed to throw an Error');
      yield sleep(8000);

      throw new Error('you are out of time!  Better luck next time.');
    });

    while (true) {
      console.log(`connection attempt ${attempt}...`);
      const { connected } = yield flakyConnection();

      if (connected) {
        console.log('we are connected!');
        return true;
      }

      console.log('no cigar, we try again');

      yield sleep(2000);
    }
  });

  yield;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);
