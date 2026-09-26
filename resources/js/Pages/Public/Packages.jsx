import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Clock3 } from 'lucide-react';
import PublicLayout, { Action, PageIntro, Reveal } from './components/PublicLayout';

const optional = [
    {name:'Tots Playdate', age:'Ages 2–4', price:'RM200', unit:'/ month', detail:'Tuesday–Thursday, 9:00 AM–12:00 PM. 12 sessions a month.', registration:'Annual registration RM499'},
    {name:'Tots Dailyplay', age:'Ages 2–4', price:'RM35', unit:'/ session', detail:'Choose a 3-hour morning or afternoon session between Monday and Thursday.', registration:'No annual registration'},
    {name:'Tots Club Afternoon', age:'Ages 2–4', price:'From RM300', unit:'/ month', detail:'Flexi: 2:00–6:00 PM, RM300. Advance: 12:00–6:00 PM, RM400.', registration:'Annual registration RM499'},
];

export default function Packages({ packages = [] }) {
    const [selected, setSelected] = useState('all');
    const groups = [...new Set(packages.map(p => p.age_group))];
    const filtered = packages.filter(p => selected === 'all' || p.age_group === selected);
    return <PublicLayout current="/packages"><Head title="Packages | Tinta Tots Clubhouse" /><PageIntro eyebrow="Fees and schedules" title="The right fit for" accent="your family." description="Compare Tots Club schedules and explore other ways for your little one to join in. Monthly Tots Club fees are read from our active packages." />
        <section className="tt-section"><div className="tt-wrap"><Reveal className="tt-section-title"><span className="tt-eyebrow">Tots Club</span><h2>Choose your <em>daily rhythm.</em></h2><p>Current active monthly packages from the Smart Kids system. Contact the centre to confirm availability and enrolment terms.</p></Reveal><div className="tt-package-tabs" role="group" aria-label="Filter packages by age"><button type="button" className={selected === 'all' ? 'active' : ''} onClick={() => setSelected('all')}>All ages</button>{groups.map(group => <button type="button" className={selected === group ? 'active' : ''} key={group} onClick={() => setSelected(group)}>{group}</button>)}</div><div className="tt-grid">{filtered.map((item, index) => <Reveal key={item.package_id} delay={(index % 3) * 100}><article className="tt-card" style={{height:'100%'}}><span className="tt-eyebrow">{item.age_group}</span><h3 style={{fontSize:29}}>{item.package_name}</h3><p>{item.description}</p><div className="tt-price">RM{Number(item.monthly_fee).toFixed(2)} <small>/ month</small></div><ul className="tt-list"><li><Clock3 size={17}/> {String(item.start_time).slice(0,5)}–{String(item.end_time).slice(0,5)}</li></ul><div style={{marginTop:24}}><Action href="/registration-enquiry">Enquire now</Action></div></article></Reveal>)}</div>{packages.length === 0 && <p className="tt-note">Package information is being updated. Please contact the centre for current options.</p>}<Reveal className="tt-note" style={{marginTop:28}}><strong>Tots Club annual registration: RM999.</strong> The brochure lists registration RM300, facilities RM200, and learning tools and materials RM499. Confirm current fees with the centre before enrolment.</Reveal></div></section>
        <section className="tt-section" style={{background:'#e9f1e3'}}><div className="tt-wrap"><Reveal className="tt-section-title"><span className="tt-eyebrow">Optional programmes</span><h2>More ways to <em>join the fun.</em></h2><p>These options are shown in the centre brochure. Please confirm availability and fees before registering.</p></Reveal><div className="tt-grid">{optional.map((item,index) => <Reveal key={item.name} delay={index*100}><article className="tt-card" style={{height:'100%'}}><span className="tt-eyebrow">{item.age}</span><h3>{item.name}</h3><p>{item.detail}</p><div className="tt-price">{item.price} <small>{item.unit}</small></div><p>{item.registration}</p><Action href="/registration-enquiry">Ask our team</Action></article></Reveal>)}</div></div></section>
    </PublicLayout>;
}
