"use client";
import {useState} from "react";

export default function Home(){
  const [query,setQuery]=useState("Who is good at Rust and free to mentor me this month?");
  const [matches,setMatches]=useState<{name:string;reason:string}[]>([]);
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);

  async function search(){
    setBusy(true);setStatus("");setMatches([]);
    try{
      const r=await fetch("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error);
      if(d.matches?.length) setMatches(d.matches); else setStatus(d.noMatch || "Nobody fits this request.");
    }catch(e){setStatus(e instanceof Error?e.message:"Search failed.");}
    finally{setBusy(false);}
  }

  return <main className="page">
    <div className="hero"><div className="eyebrow">ENS COMMUNITY FINDER</div><h1>Find the right person.</h1><p>Ask in normal language. We search live community profiles and only show people who actually exist in the retrieved ENS data.</p></div>
    <section className="card">
      <label>What do you need?</label>
      <textarea rows={5} value={query} onChange={e=>setQuery(e.target.value)}/>
      <button className="primary" onClick={search} disabled={busy}>{busy?"Searching community…":"Find someone"}</button>
    </section>
    {status && <div className="notice">{status}</div>}
    {matches.length>0 && <section><div className="eyebrow">MATCHES</div>{matches.map(m=><article className="person" key={m.name}><div><h2>{m.name}</h2><p>{m.reason}</p></div><span>ENS verified</span></article>)}</section>}
    <footer>Profiles are public ENS text records. Profile text is treated as untrusted data and never becomes a system instruction.</footer>
  </main>
}
