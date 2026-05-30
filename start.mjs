import { spawn } from 'child_process';

console.log('==========================================================================');
console.log('Ebb: Concurrent Fullstack Launcher');
console.log('==========================================================================\n');

console.log('[Ebb] Starting API Backend Server on port 3000...');
const server = spawn('node', ['server.mjs'], { stdio: 'inherit', shell: true });

console.log('[Ebb] Starting React Dev Server via Vite on port 5173...');
const client = spawn('npm', ['run', 'dev', '--prefix', 'client'], { stdio: 'inherit', shell: true });

// Handle termination signals
const cleanup = () => {
    console.log('\n[Ebb] Shutting down all processes...');
    server.kill('SIGINT');
    client.kill('SIGINT');
    process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
