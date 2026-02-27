export function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
export function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
export function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
