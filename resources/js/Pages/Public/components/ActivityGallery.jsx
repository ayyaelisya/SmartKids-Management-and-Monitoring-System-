import { useState } from 'react';
import { Reveal } from './PublicLayout';

const activities = [
    { file: 'activity-1.jpeg', title: 'Creative art', color: 'pink', mark: '✿' },
    { file: 'activity-2.jpeg', title: 'Learning through play', color: 'blue', mark: '✦' },
    { file: 'activity-3.jpeg', title: 'Outdoor discovery', color: 'green', mark: '☀' },
    { file: 'activity-4.jpeg', title: 'Sensory exploration', color: 'yellow', mark: '✳' },
    { file: 'activity-5.jpeg', title: 'Friends together', color: 'pink', mark: '♡' },
    { file: 'activity-6.jpeg', title: 'Music and movement', color: 'blue', mark: '♫' },
];

export function ActivityImage({ item, className = '' }) {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    return <div className={`tt-activity-image tt-activity-${item.color} ${className}`}>
        <span className="tt-activity-placeholder" aria-hidden="true">{item.mark}</span>
        {!failed && <img src={`/images/activities/${item.file}`} alt={item.title} loading="lazy" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={loaded ? 'tt-image-loaded' : ''}/>}
        <span className="tt-activity-caption">{item.title}</span>
    </div>;
}

export default function ActivityGallery({ limit = 6 }) {
    return <div className="tt-activity-grid">{activities.slice(0, limit).map((item, index) => <Reveal key={item.file} delay={(index % 3) * 90}><ActivityImage item={item}/></Reveal>)}</div>;
}
