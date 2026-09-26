import { Head } from '@inertiajs/react';
import PublicLayout, { Action, PageIntro, Reveal } from './components/PublicLayout';
import ActivityGallery from './components/ActivityGallery';

export default function Activities() { return <PublicLayout current="/activities"><Head title="Activities | Tinta Tots Clubhouse"/><PageIntro eyebrow="Life at Tinta Tots" title="See the joy in" accent="everyday moments." description="A glimpse into creative play, discovery and time spent growing together."/><section className="tt-section"><div className="tt-wrap"><Reveal className="tt-section-title"><span className="tt-eyebrow">Our little moments</span><h2>Where memories <em>begin.</em></h2><p>Creative activities, outdoor discoveries and friends learning together.</p></Reveal><ActivityGallery/><div style={{marginTop:45,textAlign:'center'}}><Action href="/registration-enquiry">Ask about joining us</Action></div></div></section></PublicLayout>; }
