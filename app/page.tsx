'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, Check, ChevronRight, Download, FileText, LayoutTemplate, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';

type Experience = { company: string; role: string; period: string; bullets: string[] };
type Education = { school: string; degree: string; period: string };
type CV = {
  id: string; name: string; template: string; updatedAt: string;
  personal: { name: string; title: string; email: string; phone: string; location: string; website: string };
  summary: string; experience: Experience[]; education: Education[]; skills: string[]; projects: { name: string; description: string }[];
};
type Template = { id: string; name: string; description: string; layout: 'single' | 'split'; accent: string };

const templates: Template[] = [
  { id: 'professional', name: 'Professional', description: 'Clean and executive-friendly', layout: 'single', accent: '#1d4ed8' },
  { id: 'modern', name: 'Modern Split', description: 'Strong two-column visual hierarchy', layout: 'split', accent: '#0f766e' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, elegant and ATS-safe', layout: 'single', accent: '#111827' },
  { id: 'creative', name: 'Creative', description: 'Personal brand focused', layout: 'split', accent: '#7c3aed' },
  { id: 'developer', name: 'Developer', description: 'Technical projects and skills first', layout: 'split', accent: '#2563eb' },
  { id: 'graduate', name: 'Fresh Graduate', description: 'Projects, education and skills', layout: 'single', accent: '#b45309' },
];

const starterCV: CV = {
  id: 'demo-cv', name: 'My First CV', template: 'professional', updatedAt: new Date().toISOString(),
  personal: { name: 'Your Name', title: 'Professional Title', email: 'you@example.com', phone: '+92 300 0000000', location: 'Lahore, Pakistan', website: 'linkedin.com/in/yourname' },
  summary: 'Write a concise professional summary that explains your experience, strengths and the value you bring to an employer.',
  experience: [{ company: 'Company Name', role: 'Job Title', period: '2024 — Present', bullets: ['Describe a key responsibility or achievement.', 'Add a measurable result where possible.'] }],
  education: [{ school: 'University Name', degree: 'Degree / Program', period: '2020 — 2024' }],
  skills: ['JavaScript', 'React', 'Problem Solving', 'Communication'],
  projects: [{ name: 'Project Name', description: 'Briefly describe what you built, your role and the result.' }],
};

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'builder' | 'templates' | 'ai'>('dashboard');
  const [cvs, setCvs] = useState<CV[]>([]);
  const [active, setActive] = useState<CV>(starterCV);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cvforge-cvs');
    const list = saved ? JSON.parse(saved) : [starterCV];
    setCvs(list);
    setActive(list[0]);
    setSelectedTemplate(list[0]?.template ?? 'professional');
  }, []);

  useEffect(() => {
    if (!cvs.length) return;
    localStorage.setItem('cvforge-cvs', JSON.stringify(cvs));
  }, [cvs]);

  const template = templates.find(t => t.id === selectedTemplate) ?? templates[0];
  const update = (patch: Partial<CV>) => {
    setActive(prev => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }));
  };
  const save = () => {
    const next = cvs.some(c => c.id === active.id) ? cvs.map(c => c.id === active.id ? active : active) : [...cvs, active];
    setCvs(next); setView('dashboard');
  };
  const newCV = () => { const cv = { ...starterCV, id: uid(), name: `CV ${cvs.length + 1}`, updatedAt: new Date().toISOString() }; setActive(cv); setSelectedTemplate(cv.template); setView('builder'); };
  const duplicate = (cv: CV) => { const copy = { ...cv, id: uid(), name: `${cv.name} Copy`, updatedAt: new Date().toISOString() }; setCvs([...cvs, copy]); };
  const remove = (id: string) => setCvs(cvs.filter(c => c.id !== id));

  const aiSuggest = () => {
    if (!aiInput.trim()) return;
    const lower = aiInput.toLowerCase();
    let result = 'Turn this into a result-focused CV bullet: ' + aiInput.trim();
    if (lower.includes('react')) result = 'Developed and maintained responsive React applications, collaborating with cross-functional teams to deliver reliable user experiences and improve application performance.';
    if (lower.includes('manager')) result = 'Led day-to-day operations, coordinated team priorities, and improved delivery through clear planning, communication, and performance tracking.';
    setAiOutput(result);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><div><strong>CVForge</strong><span>AI Resume Studio</span></div></div>
        <nav>
          <button className={view === 'dashboard' ? 'nav active' : 'nav'} onClick={() => setView('dashboard')}><FileText size={18}/> My CVs</button>
          <button className={view === 'templates' ? 'nav active' : 'nav'} onClick={() => setView('templates')}><LayoutTemplate size={18}/> Templates</button>
          <button className={view === 'ai' ? 'nav active' : 'nav'} onClick={() => setView('ai')}><Bot size={18}/> AI Assistant</button>
        </nav>
        <div className="sidebar-bottom"><div className="pro-card"><Sparkles size={16}/><strong>AI-ready platform</strong><span>Smart writing, ATS checks and job matching are built into the product architecture.</span></div></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><span className="eyebrow">AI CV BUILDER</span><h1>{view === 'dashboard' ? 'My CVs' : view === 'builder' ? 'CV Editor' : view === 'templates' ? 'Template Studio' : 'AI Assistant'}</h1></div>{view === 'dashboard' && <button className="primary" onClick={newCV}><Plus size={18}/> Create CV</button>}</header>

        {view === 'dashboard' && <Dashboard cvs={cvs} onNew={newCV} onEdit={(cv) => { setActive(cv); setSelectedTemplate(cv.template); setView('builder'); }} onDuplicate={duplicate} onDelete={remove} />}
        {view === 'templates' && <TemplateStudio active={active} selected={selectedTemplate} setSelected={setSelectedTemplate} onUse={() => { update({ template: selectedTemplate }); setView('builder'); }} />}
        {view === 'ai' && <AIAssistant input={aiInput} setInput={setAiInput} output={aiOutput} onSuggest={aiSuggest} />}
        {view === 'builder' && <Builder active={active} update={update} template={template} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} onSave={save} onAI={() => setView('ai')} />}
      </section>
    </main>
  );
}

function Dashboard({ cvs, onNew, onEdit, onDuplicate, onDelete }: { cvs: CV[]; onNew: () => void; onEdit: (c: CV) => void; onDuplicate: (c: CV) => void; onDelete: (id: string) => void }) {
  return <div className="dashboard">
    <div className="hero"><div><div className="pill"><Sparkles size={14}/> AI-powered</div><h2>Create a CV that gets noticed.</h2><p>Build polished, ATS-friendly resumes with professional templates, AI writing and a visual editor.</p></div><button className="hero-action" onClick={onNew}>Start a new CV <ChevronRight size={17}/></button></div>
    <div className="section-head"><h2>Your documents</h2><span>{cvs.length} CV{cvs.length === 1 ? '' : 's'}</span></div>
    <div className="cv-grid">{cvs.map(cv => <article className="cv-card" key={cv.id}><div className="mini-page"><div className="mini-name">{cv.personal.name}</div><div className="mini-line"/><div className="mini-cols"><div/><div/></div></div><div className="cv-card-body"><span className="template-tag">{templates.find(t => t.id === cv.template)?.name}</span><h3>{cv.name}</h3><p>Updated {new Date(cv.updatedAt).toLocaleDateString()}</p><div className="card-actions"><button onClick={() => onEdit(cv)}>Edit</button><button onClick={() => onDuplicate(cv)}>Duplicate</button><button className="icon-btn" aria-label="Delete" onClick={() => onDelete(cv.id)}><Trash2 size={16}/></button></div></div></article>)}<button className="new-card" onClick={onNew}><Plus size={24}/><strong>Create another CV</strong><span>Start from your saved profile</span></button></div>
  </div>;
}

function TemplateStudio({ active, selected, setSelected, onUse }: { active: CV; selected: string; setSelected: (s: string) => void; onUse: () => void }) {
  return <div className="studio"><div className="template-grid">{templates.map(t => <button key={t.id} className={selected === t.id ? 'template-card selected' : 'template-card'} onClick={() => setSelected(t.id)}><div className="template-preview" style={{ borderTopColor: t.accent }}><div className="tp-title">{active.personal.name}</div><div className="tp-role">{active.personal.title}</div><div className={t.layout === 'split' ? 'tp-body split' : 'tp-body'}><span/><span/></div></div><div className="template-meta"><div><strong>{t.name}</strong><span>{t.description}</span></div>{selected === t.id && <Check size={20}/>}</div></button>)}</div><div className="studio-footer"><div><strong>Need your own design?</strong><span>Custom Template Studio is the next layer: choose layout, sections, fonts, colors, spacing and save it to My Templates.</span></div><button className="primary" onClick={onUse}>Use selected template <ChevronRight size={17}/></button></div></div>;
}

function Builder({ active, update, template, selectedTemplate, setSelectedTemplate, onSave, onAI }: { active: CV; update: (p: Partial<CV>) => void; template: Template; selectedTemplate: string; setSelectedTemplate: (s: string) => void; onSave: () => void; onAI: () => void }) {
  return <div className="builder"><div className="editor-panel">
    <div className="editor-top"><div><strong>Content</strong><span>Changes appear instantly</span></div><button className="ai-btn" onClick={onAI}><Wand2 size={16}/> AI Help</button></div>
    <Field label="CV name"><input value={active.name} onChange={e => update({ name: e.target.value })}/></Field>
    <div className="form-section"><h3>Personal information</h3><div className="form-grid"><Field label="Full name"><input value={active.personal.name} onChange={e => update({ personal: {...active.personal, name:e.target.value} })}/></Field><Field label="Professional title"><input value={active.personal.title} onChange={e => update({ personal: {...active.personal, title:e.target.value} })}/></Field><Field label="Email"><input value={active.personal.email} onChange={e => update({ personal: {...active.personal, email:e.target.value} })}/></Field><Field label="Phone"><input value={active.personal.phone} onChange={e => update({ personal: {...active.personal, phone:e.target.value} })}/></Field><Field label="Location"><input value={active.personal.location} onChange={e => update({ personal: {...active.personal, location:e.target.value} })}/></Field><Field label="LinkedIn / Website"><input value={active.personal.website} onChange={e => update({ personal: {...active.personal, website:e.target.value} })}/></Field></div></div>
    <Field label="Professional summary"><textarea rows={5} value={active.summary} onChange={e => update({ summary:e.target.value })}/></Field>
    <div className="form-section"><div className="section-row"><h3>Experience</h3><button onClick={() => update({ experience:[...active.experience,{company:'Company',role:'Role',period:'2025 — Present',bullets:['New achievement or responsibility.']}]})}><Plus size={15}/> Add</button></div>{active.experience.map((x,i)=><div className="repeat-card" key={i}><div className="form-grid"><Field label="Company"><input value={x.company} onChange={e => {const a=[...active.experience];a[i]={...x,company:e.target.value};update({experience:a})}}/></Field><Field label="Role"><input value={x.role} onChange={e => {const a=[...active.experience];a[i]={...x,role:e.target.value};update({experience:a})}}/></Field><Field label="Period"><input value={x.period} onChange={e => {const a=[...active.experience];a[i]={...x,period:e.target.value};update({experience:a})}}/></Field></div><textarea rows={3} value={x.bullets.join('\n')} onChange={e => {const a=[...active.experience];a[i]={...x,bullets:e.target.value.split('\n')};update({experience:a})}} placeholder="One achievement per line"/></div>)}</div>
    <div className="form-section"><div className="section-row"><h3>Education</h3><button onClick={() => update({ education:[...active.education,{school:'University',degree:'Degree',period:'2021 — 2025'}]})}><Plus size={15}/> Add</button></div>{active.education.map((x,i)=><div className="repeat-card" key={i}><div className="form-grid"><Field label="Institution"><input value={x.school} onChange={e => {const a=[...active.education];a[i]={...x,school:e.target.value};update({education:a})}}/></Field><Field label="Degree"><input value={x.degree} onChange={e => {const a=[...active.education];a[i]={...x,degree:e.target.value};update({education:a})}}/></Field><Field label="Period"><input value={x.period} onChange={e => {const a=[...active.education];a[i]={...x,period:e.target.value};update({education:a})}}/></Field></div></div>)}</div>
    <Field label="Skills (comma separated)"><input value={active.skills.join(', ')} onChange={e => update({skills:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/></Field>
    <div className="form-section"><div className="section-row"><h3>Template</h3><span className="hint">Built-in templates</span></div><select value={selectedTemplate} onChange={e => {setSelectedTemplate(e.target.value);update({template:e.target.value})}}>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
    <button className="primary save" onClick={onSave}><Check size={18}/> Save CV</button>
  </div><div className="preview-wrap"><div className="preview-tools"><span>Live A4 Preview</span><button title="Export PDF"><Download size={17}/></button></div><CVPreview cv={active} template={template}/></div></div>;
}

function CVPreview({ cv, template }: { cv: CV; template: Template }) {
  return <div className="paper" style={{ '--accent': template.accent } as React.CSSProperties}><header className="paper-header"><h1>{cv.personal.name}</h1><h2>{cv.personal.title}</h2><p>{cv.personal.email} · {cv.personal.phone} · {cv.personal.location} · {cv.personal.website}</p></header><div className={template.layout === 'split' ? 'paper-body split-layout' : 'paper-body'}><section><Section title="Profile"><p>{cv.summary}</p></Section><Section title="Experience">{cv.experience.map((e,i)=><div className="paper-item" key={i}><div className="item-top"><strong>{e.role}</strong><span>{e.period}</span></div><em>{e.company}</em><ul>{e.bullets.filter(Boolean).map((b,j)=><li key={j}>{b}</li>)}</ul></div>)}</Section><Section title="Education">{cv.education.map((e,i)=><div className="paper-item" key={i}><div className="item-top"><strong>{e.degree}</strong><span>{e.period}</span></div><em>{e.school}</em></div>)}</Section></section><aside><Section title="Skills"><div className="skill-list">{cv.skills.map(s=><span key={s}>{s}</span>)}</div></Section><Section title="Contact"><p>{cv.personal.email}</p><p>{cv.personal.phone}</p><p>{cv.personal.location}</p></Section><Section title="ATS"><p>Standard headings</p><p>Readable structure</p><p>Keyword-ready</p></Section></aside></div></div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div className="paper-section"><h3>{title}</h3>{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
function AIAssistant({ input, setInput, output, onSuggest }: { input: string; setInput: (s:string)=>void; output:string; onSuggest:()=>void }) { return <div className="ai-page"><div className="ai-hero"><div className="ai-icon"><Bot size={28}/></div><div><span className="eyebrow">AI WRITING ASSISTANT</span><h2>Turn your experience into stronger CV content.</h2><p>Describe what you actually did. The assistant will improve wording without inventing experience.</p></div></div><div className="ai-card"><label>What would you like to improve?</label><textarea rows={7} value={input} onChange={e=>setInput(e.target.value)} placeholder="Example: I worked as a React Native developer for 2 years and built mobile apps for clients."/><div className="ai-actions"><span>AI suggestions should be reviewed before adding them to your CV.</span><button className="primary" onClick={onSuggest}><Sparkles size={17}/> Improve with AI</button></div>{output && <div className="ai-result"><div className="result-label"><Check size={16}/> Suggested version</div><p>{output}</p><button className="secondary">Use in CV</button></div>}</div><div className="feature-row"><div><Wand2 size={20}/><strong>Professional writing</strong><span>Rewrite summaries, bullets and project descriptions.</span></div><div><Bot size={20}/><strong>Job matching</strong><span>Compare a job description against your CV.</span></div><div><Check size={20}/><strong>ATS optimization</strong><span>Find missing keywords and structural issues.</span></div></div></div>; }
