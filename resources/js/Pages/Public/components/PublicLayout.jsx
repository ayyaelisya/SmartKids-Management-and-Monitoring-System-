import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, LogIn, Menu, X } from 'lucide-react';
import './public.css';

const links = [
    { label: 'Home', href: '/' }, { label: 'About', href: '/about' },
    { label: 'Programmes', href: '/programmes' }, { label: 'Activities', href: '/activities' },
    { label: 'Packages', href: '/packages' }, { label: 'Registration enquiry', href: '/registration-enquiry' },
    { label: 'Careers', href: '/careers' }, { label: 'Contact', href: '/contact' },
];

export function Reveal({ children, className = '', delay = 0, style = {} }) {
    const nodeRef = useRef(null);
    useEffect(() => {
        if (!nodeRef.current || !('IntersectionObserver' in window)) {
            nodeRef.current?.classList.add('is-visible');
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        observer.observe(nodeRef.current);
        return () => observer.disconnect();
    }, []);
    return <div ref={nodeRef} className={`tt-reveal ${className}`} style={{ ...style, '--reveal-delay': `${delay}ms` }}>{children}</div>;
}

export function Action({ href, children, outline = false }) {
    return <Link href={href} className={`tt-action ${outline ? 'tt-action-outline' : ''}`}>{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}

export function PageIntro({ eyebrow, title, description, accent }) {
    return <section className="tt-page-intro"><div className="tt-wrap"><Reveal><span className="tt-eyebrow">{eyebrow}</span><h1>{title} {accent && <em>{accent}</em>}</h1><p>{description}</p></Reveal></div><span className="tt-intro-orb" aria-hidden="true" /></section>;
}

export default function PublicLayout({ children, current }) {
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => { setMenuOpen(false); }, [current]);
    return <div className="tt-site" id="top">
        <div className="tt-announcement">A joyful place to learn, play & grow <span aria-hidden="true">✳</span> Labu, Negeri Sembilan</div>
        <header className="tt-header"><div className="tt-wrap tt-nav">
            <Link href="/" className="tt-brand" aria-label="Tinta Tots Clubhouse home"><img src="/images/logo.jpg" alt="" /><span>Tinta Tots <small>CLUBHOUSE</small></span></Link>
            <nav className="tt-desktop-nav" aria-label="Main navigation">
                <Link href="/" className={current === '/' ? 'active' : ''}>Home</Link>
                <div className="tt-dropdown"><button type="button" className={['/about','/programmes','/activities'].includes(current) ? 'active' : ''} aria-haspopup="true">Discover <ChevronDown size={14}/></button><div className="tt-dropdown-panel"><Link href="/about">Our story</Link><Link href="/programmes">Programmes</Link><Link href="/activities">Life at Tinta Tots</Link></div></div>
                <div className="tt-dropdown"><button type="button" className={['/packages','/registration-enquiry'].includes(current) ? 'active' : ''} aria-haspopup="true">Enrolment <ChevronDown size={14}/></button><div className="tt-dropdown-panel"><Link href="/packages">Packages & fees</Link><Link href="/registration-enquiry">Registration enquiry</Link></div></div>
                <Link href="/careers" className={current === '/careers' ? 'active' : ''}>Careers</Link><Link href="/contact" className={current === '/contact' ? 'active' : ''}>Contact</Link>
            </nav>
            <Link href="/login" className="tt-portal"><LogIn size={17} /> Portal login</Link>
            <button type="button" className="tt-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div></header>
        {menuOpen && <nav className="tt-mobile-nav" aria-label="Mobile navigation"><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link><details><summary>Discover</summary><Link href="/about" onClick={() => setMenuOpen(false)}>Our story</Link><Link href="/programmes" onClick={() => setMenuOpen(false)}>Programmes</Link><Link href="/activities" onClick={() => setMenuOpen(false)}>Life at Tinta Tots</Link></details><details><summary>Enrolment</summary><Link href="/packages" onClick={() => setMenuOpen(false)}>Packages & fees</Link><Link href="/registration-enquiry" onClick={() => setMenuOpen(false)}>Registration enquiry</Link></details><Link href="/careers" onClick={() => setMenuOpen(false)}>Careers</Link><Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link><Link href="/login" onClick={() => setMenuOpen(false)}>Portal login →</Link></nav>}
        <main>{children}</main>
        <footer className="tt-footer"><div className="tt-wrap"><div className="tt-footer-main"><div><Link href="/" className="tt-brand tt-brand-light"><img src="/images/logo.jpg" alt="" /><span>Tinta Tots <small>CLUBHOUSE</small></span></Link><p>Little steps. Bright beginnings.<br />Tinta Residensi, Labu, Negeri Sembilan.</p></div><div><strong>Explore</strong>{links.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div><div><strong>Get in touch</strong><a href="tel:+60174643036">017-464 3036</a><a href="https://wa.me/60174643036">WhatsApp us <ArrowRight size={14} /></a><a href="https://www.instagram.com/tintatotsclubhouse/" target="_blank" rel="noopener noreferrer">Instagram</a></div></div><div className="tt-footer-bottom"><span>© {new Date().getFullYear()} Tinta Tots Clubhouse.</span><Link href="/login">Smart Kids portal →</Link></div></div></footer>
    </div>;
}
