---
mcp-servers:
  european-parliament:
    container: "node:26-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.3.10", "--timeout", "180000"]
    env:
      EP_REQUEST_TIMEOUT_MS: "180000"
  world-bank:
    container: "node:26-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "worldbank-mcp@1.0.1"]
  fetch-proxy:
    container: "node:26-alpine"
    entrypoint: "node"
    entrypointArgs: ["-e", "const r=require,rl=r('readline').createInterface({input:process.stdin}),nl=String.fromCharCode(10),send=o=>process.stdout.write(JSON.stringify(o)+nl),fail=(id,e)=>send({jsonrpc:'2.0',id:id||0,error:{code:-1,message:String(e&&e.message||e)}}),allowed=u=>{try{const x=new URL(u);return x.protocol==='https:'&&x.hostname==='api.imf.org'&&x.pathname.startsWith('/external/sdmx/3.0/')&&(x.port===''||x.port==='443')&&x.username===''&&x.password===''}catch{return false}},keys=[process.env.IMF_API_PRIMARY_KEY,process.env.IMF_API_SECONDARY_KEY].filter(k=>typeof k==='string'&&k.length>0),attempts=keys.length>0?keys:[null],baseHeaders={'User-Agent':'euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)',Accept:'application/json, application/vnd.sdmx.data+json, */*;q=0.8','Accept-Language':'en-US,en;q=0.9','Cache-Control':'no-cache'},doFetch=async u=>{let last;for(let i=0;i<attempts.length;i++){const k=attempts[i],h=Object.assign({},baseHeaders);if(k)h['Ocp-Apim-Subscription-Key']=k;const res=await fetch(u,{headers:h,signal:AbortSignal.timeout(180000)});last=res;if((res.status===401||res.status===403)&&i+1<attempts.length)continue;return res}return last};rl.on('line',async l=>{let mid=0;try{const m=JSON.parse(l);mid=m.id||0;if(m.method==='initialize')send({jsonrpc:'2.0',id:m.id,result:{protocolVersion:'2024-11-05',capabilities:{tools:{}}}});else if(m.method==='notifications/initialized');else if(m.method==='tools/list')send({jsonrpc:'2.0',id:m.id,result:{tools:[{name:'fetch_url',description:'Fetch an IMF SDMX URL and return its content',inputSchema:{type:'object',properties:{url:{type:'string',description:'IMF SDMX URL to fetch'}},required:['url']}}]}});else if(m.method==='tools/call'&&m.params&&m.params.name==='fetch_url'){const u=m.params.arguments&&m.params.arguments.url;if(!allowed(u))return fail(m.id,'fetch_url only allows https://api.imf.org/external/sdmx/3.0/ URLs');const res=await doFetch(u);const t=await res.text();if(res.status===204)return fail(m.id,'HTTP 204 No Content from api.imf.org — likely missing or invalid Ocp-Apim-Subscription-Key (set IMF_API_PRIMARY_KEY)');if(!res.ok)return fail(m.id,'HTTP '+res.status+' '+res.statusText);send({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:t}]}})}else send({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:'unknown method'}]}})}catch(e){fail(mid,e)}})"]
    env:
      IMF_API_PRIMARY_KEY: "${{ secrets.IMF_API_PRIMARY_KEY }}"
      IMF_API_SECONDARY_KEY: "${{ secrets.IMF_API_SECONDARY_KEY }}"
  memory:
    container: "node:26-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-memory"]
  sequential-thinking:
    container: "node:26-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
---
