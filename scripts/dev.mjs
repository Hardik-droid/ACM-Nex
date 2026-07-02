import { spawn } from 'node:child_process';

const children = [
  spawn('npx', ['tsx', 'server.ts'], { stdio: 'inherit', shell: true }),
  spawn('npx', ['vite', '--port=3000', '--host=0.0.0.0'], { stdio: 'inherit', shell: true }),
];

function shutdown(signal) {
  for (const child of children) {
    child.kill(signal);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

children.forEach(child => {
  child.on('exit', code => {
    if (code && code !== 0) {
      shutdown('SIGTERM');
      process.exit(code);
    }
  });
});
