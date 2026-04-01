function buildTable(limit = 256) {
    const ONE = "[]==[]";
    const cost = [0, 1, ...Array(limit - 1).fill(Infinity)];
    const expr = ["", ONE, ...Array(limit - 1).fill("")];

    for (let i = 2; i <= limit; i++) {
        for (let a = 2; a <= Math.floor(Math.sqrt(i)); a++) {
            if (i % a === 0) {
                const b = Math.floor(i / a);
                const c = cost[a] + cost[b];
                if (c < cost[i]) {
                    cost[i] = c;
                    expr[i] = `(${expr[a]})*(${expr[b]})`;
                }
            }
        }
        for (let a = 1; a <= Math.floor(i / 2); a++) {
            const b = i - a;
            const c = cost[a] + cost[b];
            if (c < cost[i]) {
                cost[i] = c;
                expr[i] = `(${expr[a]})+(${expr[b]})`;
            }
        }
    }

    return expr;
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error(`usage: node pyfuck.js <file.py>`);
    process.exit(1);
}

const content = readFileSync(args[0], 'utf-8');
const table = buildTable(256);

const parts = [];
for (const ch of content) {
    parts.push(`'%c'%(${table[ch.charCodeAt(0)]})`);
}

const chunkSize = 20;
const lines = [];
for (let i = 0; i < parts.length; i += chunkSize) {
    const chunk = parts.slice(i, i + chunkSize).join('+');
    if (i === 0) {
        lines.push(`x=${chunk}`);
    } else {
        lines.push(`x=x+${chunk}`);
    }
}
lines.push('exec(x)');
console.log(lines.join('\n'));
