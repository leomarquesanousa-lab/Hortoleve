import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
function loader(overrides = {}) {
 const cache = new Map();
 function load(file) {
  file = path.resolve(file); if (cache.has(file)) return cache.get(file);
  const mod = { exports: {} }; cache.set(file, mod.exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const local = name => {
   if (name in overrides) return overrides[name]; if (name === 'server-only') return {};
   if (name.startsWith('@/') || name.startsWith('.')) { const base = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(file), name); return load(base.endsWith('.ts') ? base : base + '.ts'); }
   return require(name);
  };
  new Function('require','module','exports',code)(local,mod,mod.exports); return mod.exports;
 }
 return load;
}
const { validSlot, localNow, validateVisit } = loader()('src/modules/visits/validation.ts');
process.env.BETTER_AUTH_SECRET ||= 'test-only-secret-not-used-outside-tests';
const zone = 'America/Bahia', now = new Date('2026-11-02T12:00:00Z');
const input = { name:'Cliente Teste', phone:'(71) 99999-1234', email:'cliente@example.invalid', city:'Salvador, Centro', address:'Rua de teste, 123, Centro', notes:'', date:'2099-11-02', time:'10:00', consent:true, website:'', requestKey:'01234567-1234-1234-1234-123456789abc' };
test('fuso comercial determina data e hora, independentemente do host', () => { assert.deepEqual(localNow(zone,now),{date:'2026-11-02',time:'09:00'}); assert.equal(localNow(zone,new Date('2026-11-03T01:00:00Z')).date,'2026-11-02'); });
test('bloqueia fins de semana, datas inexistentes, passado e hora atual', () => { for(const [d,t] of [['2026-11-01','10:00'],['2026-11-07','10:00'],['2026-02-30','10:00'],['2026-11-02','08:00'],['2026-11-02','09:00'],['2026-11-03','09:00']]) assert.equal(validSlot(d,t,zone,now),false); assert.equal(validSlot('2026-11-02','10:00',zone,now),true); });
test('valida dados, consentimento e honeypot sem informações médicas', () => { assert.equal(validateVisit(input,zone).phone,'71999991234'); for(const patch of [{consent:false},{website:'spam'},{phone:'123'},{email:'invalido'},{name:'Teste'},{notes:'a'.repeat(1001)}]) assert.throws(()=>validateVisit({...input,...patch},zone)); });
function fakeDb() {
 const visits=[], jobs=[]; let fail=false;
 const tx={ homeVisit:{ create:async({data})=>{if(visits.some(v=>v.slotKey===data.slotKey)) throw Object.assign(new Error(),{code:'P2002'}); const v={...data,version:1,status:'PENDING'}; visits.push(v); return v;} }, visitNotification:{create:async({data})=>{if(fail)throw new Error('outbox unavailable');jobs.push(data);}}, rateLimit:{upsert:async()=>({count:1,lastRequest:BigInt(Date.now())})} };
 const db={...tx,homeVisit:{...tx.homeVisit,findUnique:async({where})=>visits.find(v=>v.requestKey===where.requestKey)},$transaction:async fn=>{const a=visits.length,b=jobs.length;try{return await fn(tx)}catch(e){visits.splice(a);jobs.splice(b);throw e;}}};
 return {db,visits,jobs,setFail:()=>{fail=true;}};
}
test('salva reserva e duas notificações; reenvio idempotente retorna mesmo protocolo', async()=>{const mock=fakeDb();const {reserve}=loader({'@/modules/admin/database':{getDatabase:()=>mock.db}})('src/modules/visits/service.ts');const first=await reserve(input);const second=await reserve(input);assert.equal(first.id,second.id);assert.equal(mock.visits.length,1);assert.equal(mock.jobs.length,2);await assert.rejects(reserve({...input,address:'Outro endereço, 123'}),/já foi utilizado/);});
test('falha na outbox reverte reserva na mesma transação',async()=>{const mock=fakeDb();mock.setFail();const {reserve}=loader({'@/modules/admin/database':{getDatabase:()=>mock.db}})('src/modules/visits/service.ts');await assert.rejects(reserve(input));assert.equal(mock.visits.length,0);});
test('conflito da restrição única vira horário indisponível',async()=>{const mock=fakeDb();mock.visits.push({slotKey:input.date+'/'+input.time,requestKey:'other'});const {reserve}=loader({'@/modules/admin/database':{getDatabase:()=>mock.db}})('src/modules/visits/service.ts');await assert.rejects(reserve(input),/ocupado/);});
test('API administrativa não consulta dados sem permissão',async()=>{let accessed=false;const api=loader({'@/modules/admin/session':{currentAdmin:async()=>null},'@/modules/admin/database':{getDatabase:()=>{accessed=true;throw new Error();}}})('src/app/api/admin-visits/route.ts');assert.equal((await api.GET(new Request('http://localhost/api/admin-visits'))).status,403);assert.equal(accessed,false);});
test('e-mail desabilitado não realiza chamadas externas',async()=>{const previous=process.env.VISITS_EMAIL_ENABLED;process.env.VISITS_EMAIL_ENABLED='false';let accessed=false;const {deliverVisitNotifications}=loader({'@/modules/admin/database':{getDatabase:()=>{accessed=true;throw new Error();}}})('src/modules/visits/notifications.ts');try{await deliverVisitNotifications();assert.equal(accessed,false);}finally{if(previous===undefined)delete process.env.VISITS_EMAIL_ENABLED;else process.env.VISITS_EMAIL_ENABLED=previous;}});
test('corpo recusa origem externa e excesso de dados',async()=>{const {visitBody}=loader({'@/modules/admin/environment':{adminEnvironment:()=>({baseURL:'http://localhost'})}})('src/modules/visits/http.ts');await assert.rejects(visitBody(new Request('http://localhost/api/visits',{method:'POST',headers:{origin:'https://example.invalid','content-type':'application/json'},body:'{}'})),/Origem/);await assert.rejects(visitBody(new Request('http://localhost/api/visits',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'},body:JSON.stringify({text:'a'.repeat(10001)})})),/longo/);});
test('falha de e-mail preserva job para retry e usa chave estável sem envio real', async()=>{
 const originalFetch=globalThis.fetch; const previous=Object.fromEntries(['VISITS_EMAIL_ENABLED','RESEND_API_KEY','VISITS_EMAIL_FROM','VISITS_EMAIL_TO'].map(k=>[k,process.env[k]]));
 Object.assign(process.env,{VISITS_EMAIL_ENABLED:'true',RESEND_API_KEY:'test-only',VISITS_EMAIL_FROM:'from@example.invalid',VISITS_EMAIL_TO:'company@example.invalid'});
 const updates=[];let idempotency;
 const job={id:'HL-test-1-COMPANY',visitId:'HL-test',audience:'COMPANY',payload:{subject:'Teste',text:'Teste',email:'client@example.invalid'},firstAttemptAt:null};
 const db={visitNotification:{findMany:async()=>[job],updateMany:async()=>({count:1}),update:async data=>{updates.push(data);}}};
 globalThis.fetch=async(_url,options)=>{idempotency=options.headers['Idempotency-Key'];throw new Error('simulated network failure');};
 try {const {deliverVisitNotifications}=loader({'@/modules/admin/database':{getDatabase:()=>db}})('src/modules/visits/notifications.ts');await deliverVisitNotifications();assert.equal(idempotency,job.id);assert.equal(updates.length,1);assert.match(updates[0].data.lastError,/confirmada/);assert.equal(updates[0].data.sentAt,undefined);assert.ok(updates[0].data.lockedUntil>new Date());}
 finally{globalThis.fetch=originalFetch;for(const [k,v] of Object.entries(previous)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
test('worker sem lease não envia e-mail',async()=>{
 const previous=Object.fromEntries(['VISITS_EMAIL_ENABLED','RESEND_API_KEY','VISITS_EMAIL_FROM','VISITS_EMAIL_TO'].map(k=>[k,process.env[k]]));const originalFetch=globalThis.fetch;let calls=0;
 Object.assign(process.env,{VISITS_EMAIL_ENABLED:'true',RESEND_API_KEY:'test-only',VISITS_EMAIL_FROM:'from@example.invalid',VISITS_EMAIL_TO:'company@example.invalid'});globalThis.fetch=async()=>{calls++;throw new Error('must not call');};
 const db={visitNotification:{findMany:async()=>[{id:'busy',firstAttemptAt:null}],updateMany:async()=>({count:0})}};
 try{await loader({'@/modules/admin/database':{getDatabase:()=>db}})('src/modules/visits/notifications.ts').deliverVisitNotifications();assert.equal(calls,0);}finally{globalThis.fetch=originalFetch;for(const [k,v] of Object.entries(previous)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
