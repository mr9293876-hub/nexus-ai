import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { api } from './api'
import './styles.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com'), [password, setPassword] = useState('change-me'), [error, setError] = useState('')
  async function submit(e) { e.preventDefault(); try { const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); localStorage.setItem('hub_token', data.access_token); onLogin() } catch (err) { setError(err.message) } }
  return <main className="auth"><form onSubmit={submit}><span className="eyebrow">HUB UNIVERSAL</span><h1>Controle seus provedores.</h1><p>Entre no painel para gerenciar chaves e roteamento.</p><input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" type="email" /><input value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" type="password" /><button>Entrar</button>{error && <small className="error">{error}</small>}</form></main>
}

function App() {
  const [logged, setLogged] = useState(Boolean(localStorage.getItem('hub_token'))), [providers, setProviders] = useState([]), [sites, setSites] = useState([]), [message, setMessage] = useState('')
  async function load() { try { setProviders(await api('/providers')); setSites(await api('/sites')) } catch { localStorage.removeItem('hub_token'); setLogged(false) } }
  useEffect(() => { if (logged) load() }, [logged])
  async function addProvider(e) { e.preventDefault(); const f = new FormData(e.target); try { await api('/providers', { method: 'POST', body: JSON.stringify({ name: f.get('name'), kind: f.get('kind'), base_url: f.get('base_url'), api_key: f.get('api_key') }) }); e.target.reset(); setMessage('Provedor adicionado'); load() } catch (err) { setMessage(err.message) } }
  async function addSite(e) { e.preventDefault(); const f = new FormData(e.target); try { await api('/sites', { method: 'POST', body: JSON.stringify({ name: f.get('name'), slug: f.get('slug'), description: f.get('description'), active_provider_id: Number(f.get('provider')) || null }) }); e.target.reset(); setMessage('Site adicionado'); load() } catch (err) { setMessage(err.message) } }
  if (!logged) return <Login onLogin={() => setLogged(true)} />
  return <main className="shell"><header><div><span className="eyebrow">HUB UNIVERSAL</span><h1>Orquestração de IA</h1></div><button className="secondary" onClick={() => { localStorage.removeItem('hub_token'); setLogged(false) }}>Sair</button></header><p className="muted">Gerencie provedores, sites e a chave ativa de cada serviço.</p>{message && <div className="notice">{message}</div>}<section className="grid"><article><h2>Novo provedor</h2><form onSubmit={addProvider}><input name="name" placeholder="Nome (ex.: OpenAI)" required /><input name="kind" placeholder="Tipo" defaultValue="openai" /><input name="base_url" placeholder="https://api.openai.com/v1" required /><input name="api_key" placeholder="Chave da API" type="password" required /><button>Salvar provedor</button></form><ul>{providers.map(p => <li key={p.id}><strong>{p.name}</strong><span>{p.kind} · {p.base_url}</span></li>)}</ul></article><article><h2>Novo site</h2><form onSubmit={addSite}><input name="name" placeholder="Nome do site" required /><input name="slug" placeholder="meu-site" pattern="[a-z0-9-]+" required /><input name="description" placeholder="Descrição" /><select name="provider" defaultValue=""><option value="">Sem provedor ativo</option>{providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><button>Salvar site</button></form><ul>{sites.map(s => <li key={s.id}><strong>{s.name}</strong><span>/{s.slug} · provedor #{s.active_provider_id || '—'}</span></li>)}</ul></article></section></main>
}

createRoot(document.getElementById('root')).render(<App />)
