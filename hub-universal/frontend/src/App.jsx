import React, { useEffect, useState } from 'react'
import { api } from './api'

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('change-me')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('hub_token', data.access_token)
      onLogin()
    } catch (err) {
      setError(err.message)
    }
  }

  return <main className="auth"><form onSubmit={submit}><span className="eyebrow">HUB UNIVERSAL</span><h1>Controle seus provedores.</h1><p>Entre no painel para gerenciar chaves e roteamento.</p><input value={email} onChange={event => setEmail(event.target.value)} placeholder="E-mail" type="email" /><input value={password} onChange={event => setPassword(event.target.value)} placeholder="Senha" type="password" /><button>Entrar</button>{error && <small className="error">{error}</small>}</form></main>
}

export default function App() {
  const [logged, setLogged] = useState(Boolean(localStorage.getItem('hub_token')))
  const [providers, setProviders] = useState([])
  const [sites, setSites] = useState([])
  const [message, setMessage] = useState('')

  async function load() {
    try {
      setProviders(await api('/providers'))
      setSites(await api('/sites'))
    } catch {
      localStorage.removeItem('hub_token')
      setLogged(false)
    }
  }

  useEffect(() => { if (logged) load() }, [logged])

  async function addProvider(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    try {
      await api('/providers', { method: 'POST', body: JSON.stringify({ name: form.get('name'), kind: form.get('kind'), base_url: form.get('base_url'), api_key: form.get('api_key') }) })
      event.target.reset(); setMessage('Provedor adicionado'); load()
    } catch (err) { setMessage(err.message) }
  }

  async function addSite(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    try {
      await api('/sites', { method: 'POST', body: JSON.stringify({ name: form.get('name'), slug: form.get('slug'), description: form.get('description'), active_provider_id: Number(form.get('provider')) || null }) })
      event.target.reset(); setMessage('Site adicionado'); load()
    } catch (err) { setMessage(err.message) }
  }

  if (!logged) return <LoginScreen onLogin={() => setLogged(true)} />

  return <main className="shell"><header><div><span className="eyebrow">HUB UNIVERSAL</span><h1>Orquestração de IA</h1></div><button className="secondary" onClick={() => { localStorage.removeItem('hub_token'); setLogged(false) }}>Sair</button></header><p className="muted">Gerencie provedores, sites e a chave ativa de cada serviço.</p>{message && <div className="notice">{message}</div>}<section className="grid"><article><h2>Novo provedor</h2><form onSubmit={addProvider}><input name="name" placeholder="Nome (ex.: OpenAI)" required /><input name="kind" placeholder="Tipo" defaultValue="openai" /><input name="base_url" placeholder="https://api.openai.com/v1" required /><input name="api_key" placeholder="Chave da API" type="password" required /><button>Salvar provedor</button></form><ul>{providers.map(provider => <li key={provider.id}><strong>{provider.name}</strong><span>{provider.kind} · {provider.base_url}</span></li>)}</ul></article><article><h2>Novo site</h2><form onSubmit={addSite}><input name="name" placeholder="Nome do site" required /><input name="slug" placeholder="meu-site" pattern="[a-z0-9-]+" required /><input name="description" placeholder="Descrição" /><select name="provider" defaultValue=""><option value="">Sem provedor ativo</option>{providers.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select><button>Salvar site</button></form><ul>{sites.map(site => <li key={site.id}><strong>{site.name}</strong><span>/{site.slug} · provedor #{site.active_provider_id || '—'}</span></li>)}</ul></article></section></main>
}
