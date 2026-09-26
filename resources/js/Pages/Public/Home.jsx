import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Heart, Sparkles } from 'lucide-react';
import PublicLayout, { Action, Reveal } from './components/PublicLayout';
import ActivityGallery, { ActivityImage } from './components/ActivityGallery';

function HeroMedia() {
    const videoRef = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches) videoRef.current?.pause();
    }, []);

    return <div className="tt-hero-photo">
        <ActivityImage item={{ file: 'activity-1.jpg', title: 'Creative learning', color: 'pink', mark: '✿' }} />
        {!videoFailed && <video
            ref={videoRef}
            className={`tt-hero-video ${videoReady ? 'tt-hero-video-ready' : ''}`}
            autoPlay muted loop playsInline preload="metadata"
            poster="/images/activities/activity-1.jpg"
            aria-label="Tinta Tots activity video"
            onCanPlay={() => {
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    videoRef.current?.pause();
                } else {
                    setVideoReady(true);
                }
            }}
            onError={() => setVideoFailed(true)}
        ><source src="/videos/hero.mp4" type="video/mp4" /></video>}
        <span className="tt-sticker">✦ Learn through play</span>
        <span className="tt-sticker tt-sticker-bottom">A place to belong ♡</span>
    </div>;
}

export default function Home() {
    return <PublicLayout current="/"><Head title="Home | Tinta Tots Clubhouse" />
        <section className="tt-hero"><div className="tt-wrap tt-hero-inner"><Reveal><span className="tt-eyebrow">Welcome to Tinta Tots Clubhouse</span><h1>A little world of <em>big wonder.</em></h1><p className="tt-lead">A nurturing, creative place in Labu where young children can learn, play and grow. Every little step deserves to be celebrated.</p><div className="tt-hero-actions"><Action href="/registration-enquiry">Enquire about a place</Action><Action href="/programmes" outline>Explore programmes</Action></div><div className="tt-numbers"><div><strong>15+</strong><span>years of founder experience</span></div><div><strong>7–6</strong><span>weekday opening hours</span></div></div></Reveal><Reveal delay={160} className="tt-hero-art"><HeroMedia/><span className="tt-star tt-star-one" aria-hidden="true">✳</span><span className="tt-star tt-star-two" aria-hidden="true">✦</span></Reveal></div></section>
        <div className="tt-marquee" aria-hidden="true"><div className="tt-marquee-track">{Array.from({ length: 4 }, (_, i) => <span key={i}>PLAY WITH PURPOSE &nbsp; ✳ &nbsp; GROW WITH HEART &nbsp; ✳ &nbsp; DISCOVER EVERY DAY &nbsp; ✳ &nbsp;</span>)}</div></div>
        <section className="tt-section"><div className="tt-wrap"><Reveal className="tt-section-title"><span className="tt-eyebrow">Why families choose us</span><h2>Where curiosity <em>comes alive.</em></h2><p>Play-based learning and structured activities support children's social, emotional, cognitive and physical development.</p></Reveal><div className="tt-grid">{[[Heart,'Care with heart','A welcoming, joyful space where each child is encouraged to explore.'],[BookOpen,'Learning through play','Sensory activities, art, music, early language and outdoor discoveries.'],[Sparkles,'Moments that matter','Meaningful everyday experiences and a strong foundation for life.']].map(([Icon,title,desc],i)=><Reveal key={title} delay={i*100}><div className="tt-card"><span className="tt-icon"><Icon size={27}/></span><h3>{title}</h3><p>{desc}</p></div></Reveal>)}</div></div></section>
        <section className="tt-section tt-activity-section"><div className="tt-wrap"><Reveal className="tt-section-title"><span className="tt-eyebrow">Life at Tinta Tots</span><h2>Little moments, <em>lasting memories.</em></h2><p>From curious experiments to creative play, each day is a chance to discover something new.</p></Reveal><ActivityGallery limit={3}/><div style={{marginTop:35}}><Action href="/activities">See more activities</Action></div></div></section>
        <section className="tt-section tt-dark"><div className="tt-wrap tt-split"><Reveal><span className="tt-eyebrow">Our flagship programme</span><h2>Meet <em>Tots Club.</em></h2><p className="tt-lead">A joyful early childhood experience built around play, creativity, exploration and connection. Discover a daily rhythm that includes guided learning, meals and time to recharge.</p><div style={{marginTop:30}}><Action href="/programmes">See what a day looks like</Action></div></Reveal><Reveal delay={130}><div className="tt-visual"><span className="tt-sticker">Ages 1–4 in the brochure</span><img src="/images/logo.jpg" alt="Tinta Tots Clubhouse" /><span className="tt-sticker tt-sticker-bottom">Play • Learn • Grow</span></div></Reveal></div></section>
        <section className="tt-section"><div className="tt-wrap tt-split"><Reveal><div className="tt-visual" style={{background:'#f7dfbd'}}><span className="tt-sticker">✳ Family first</span><img src="/images/logo.jpg" alt="Tinta Tots Clubhouse" /></div></Reveal><Reveal><span className="tt-eyebrow">Let's get to know each other</span><h2>Find your child's <em>happy place.</em></h2><p className="tt-lead">Explore flexible schedules and get in touch to ask about enrolment and availability.</p><div style={{marginTop:28}}><Action href="/packages">View packages</Action></div></Reveal></div></section>
        <section className="tt-section tt-dark"><div className="tt-wrap" style={{textAlign:'center',maxWidth:780}}><Reveal><span className="tt-eyebrow">Come say hello</span><h2>We'd love to <em>meet you.</em></h2><p className="tt-lead">Tinta Residensi, Jalan Nada Bidara 4, Taman Nada Bidara, Labu, Negeri Sembilan.</p><div style={{marginTop:30}}><Action href="/registration-enquiry">Enquire about registration <ArrowUpRight size={16}/></Action></div></Reveal></div></section>
    </PublicLayout>;
}
