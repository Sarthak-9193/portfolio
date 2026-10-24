import { useEffect, useMemo, useRef, useState } from 'react';
import LiquidChrome from './components/LiquidChrome.jsx';
import GooeyNav from './components/GooeyNav.jsx';
import FlexCarousel from './components/FlexCarousel.jsx';
import CircularCarousel from './components/CircularCarousel.jsx';
import DitherVeil from './components/DitherVeil.jsx';
import { makeCardImage } from './components/makeCardImage.js';
import './portfolio.css';

const asset = path => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const projects = [
  {
    number: '01', title: 'Canteen',
    description: 'Campus Bites is a day-based canteen ordering demo with searchable menus, category filters, a cart, budget-aware meal combos, and order tracking.',
    tags: ['Python', 'Flask', 'JavaScript'],
    url: 'https://github.com/Sarthak-9193/canteen',
    linkLabel: 'GitHub',
    images: [asset('projects/canteen-1.png'), asset('projects/canteen-2.png'), asset('projects/canteen-3.png')],
    portfolioImage: asset('projects/canteen-portfolio.png'),
    imageAlts: ['Campus Bites daily menu with day and category filters', 'Friday lunch menu with biryani dishes', 'Budget meal combinations and order tracking'],
    cardTitles: ['Campus Bites menu', 'Friday lunch', 'Budget meal combos'],
    cardSubtitles: ['Daily menu, search & categories', 'Filter the menu by day and meal', 'Compose meals within a budget']
  },
  {
    number: '02', title: 'Strength Protocol',
    description: 'Choose an exercise, starting point, rep goal, weekly schedule, and program length, then log sessions and track total reps and progress. Plans stay in browser storage; exercises can be edited and data imported or exported. The AI Coach is optional and connects with a user-provided OpenRouter key.',
    tags: ['Web App', 'Local Storage', 'Optional AI Coach'],
    url: 'https://sarthak-9193.github.io/strength-protocol-/',
    linkLabel: 'Live app',
    images: [asset('projects/strength-protocol-1.png'), asset('projects/strength-protocol-2.png'), asset('projects/strength-protocol-3.png')],
    portfolioImage: asset('projects/strength-protocol-portfolio.png'),
    imageAlts: ['Strength Protocol push-up dashboard showing a personalized target', 'Foundation training phase with session logging and notes', 'Build phase of the structured training program'],
    cardTitles: ['Personalized dashboard', 'Foundation phase', 'Build phase'],
    cardSubtitles: ['Set a baseline and a reachable goal', 'Log workouts, reps and notes', 'Progress through a phased plan']
  }
];

const journey = [
  { label: 'NOW', title: 'B.Tech — Computer Science & Engineering', place: 'Symbiosis, Pune', detail: 'Currently studying computer science and exploring programming, web development, and practical software projects.' },
  { label: 'SENIOR SCHOOL', title: 'NTIS', place: 'Up to Grade 12', detail: 'Completed senior school education at NTIS.' },
  { label: 'SCHOOL', title: 'Delhi Public School, Pune', place: 'Up to Grade 10', detail: 'Completed schooling through Grade 10 at Delhi Public School, Pune.' },
  { label: 'CURRENT FOCUS', title: 'Learning by building', place: 'Programming · Web Development', detail: 'Practising C, C++, and Python while experimenting with AI-assisted building and learning HTML, CSS, and JavaScript.' }
];

const navItems = [
  ['top', 'Home'], ['about', 'About'], ['projects', 'Projects'],
  ['skills', 'Skills'], ['journey', 'Education'], ['contact', 'Contact']
];

function useReducedMotion(){const [reduced,setReduced]=useState(false);useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener?.('change',update);return()=>query.removeEventListener?.('change',update)},[]);return reduced;}

function FoldHeading({ lines, className = '' }) {
  const headingRef = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = headingRef.current;
    if (!node) return;
    // Toggle the reveal state as the heading enters and leaves the viewport.
    // This lets the slide-up animation replay on both downward and upward scrolling.
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 0.18, rootMargin: '0px 0px -4% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <h2 ref={headingRef} className={`fold-heading reveal-heading ${visible ? 'is-visible' : ''} ${className}`.trim()}>{lines.map((line, lineIndex) => <span className="fold-heading-line" key={lineIndex}>{line.map((part, partIndex) => <span key={`${lineIndex}-${partIndex}`} className={part.accent ? 'heading-accent' : ''}>{part.text}</span>)}</span>)}</h2>;
}

function CircularJourney({ progress, onProgress }) {
  const cards = useMemo(() => journey.map(item => ({
    src: makeCardImage({ kicker: item.label, title: item.title, sub: item.place }),
    alt: `${item.title} at ${item.place}`,
    title: item.title,
    subtitle: item.place
  })), []);
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1440 : window.innerWidth);
  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  const cardWidth = viewportWidth >= 1600 ? 500 : viewportWidth >= 1000 ? 460 : viewportWidth >= 620 ? 380 : 300;
  const selectJourneyItem = (_, itemIndex) => onProgress(itemIndex / (journey.length - 1));
  const reduced=useReducedMotion();
  return <div className={`journey-carousel-shell${reduced?' is-reduced':''}`}><div className="journey-carousel-top"><span className="eyebrow">SCROLL DOWN TO ROTATE THE TIMELINE</span><span className="carousel-hint">VERTICAL ↓ / TIMELINE ↻</span></div><div className="journey-carousel-frame">
    {reduced?<div className="native-card-row">{cards.map((card,i)=><article className="journey-slide" key={i}><img src={card.src} alt={card.alt}/><strong>{card.title}</strong><span>{card.subtitle}</span></article>)}</div>:<CircularCarousel items={cards} progress={progress} preset="cylinder" intro="assemble" cardWidth={cardWidth} aspectRatio={1.4} gap={18} autoplay="off" draggable snap pauseOnHover={false} fadeColor="#080607" cornerRadius={20} onItemClick={selectJourneyItem} />}
    </div></div>;
}
function ProjectCards({ progress }) {
 const cards=useMemo(()=>projects.map(project=>({
   src:project.portfolioImage??project.images?.[0]??makeCardImage({kicker:project.number,title:project.title,sub:project.tags.join(' · ')}),
   alt:project.imageAlts?.[0]??`${project.title} project preview`,
   title:project.title,
   subtitle:project.cardSubtitles?.[0]??project.tags.join(' · '),
   project
 })),[]);
 const reduced=useReducedMotion(); const holder=useRef(null); const [near,setNear]=useState(false);
 useEffect(()=>{const node=holder.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'900px 0px'});observer.observe(node);return()=>observer.disconnect()},[]);
 return <div ref={holder} className={`project-carousel-wrap${reduced?' is-reduced':''}`}>{reduced?<div className="native-card-row project-native-row">{cards.map((card,i)=><article className="journey-slide" key={i}><img src={card.src} alt={card.alt}/><strong>{card.title}</strong><span>{card.subtitle}</span></article>)}</div>:near?<FlexCarousel items={cards} progress={progress} preset="liquid" intro="bloom" fit="landscape" cardHeight={0.88} gap={20} squeeze={0.2} captions focusOnClick autoplay={false} captureWheel={false} onSelect={(index,item)=>window.open(item.project.url,'_blank','noopener,noreferrer')} />:<div className="project-carousel-loading" aria-hidden="true"/>}<div className="project-progress journey-progress"><span style={{width:`${progress*100}%`}} /></div><div className="project-github-links">{projects.map(project=><a key={project.number} href={project.url} target="_blank" rel="noreferrer">{project.title} ↗ {project.linkLabel}</a>)}</div></div>;
}

export default function App() {
  const [active, setActive] = useState('top');
  const [projectProgress, setProjectProgress] = useState(0); const [journeyProgress, setJourneyProgress] = useState(0);
  const goToJourneyProgress=progress=>{const wrapper=document.getElementById('journey');if(!wrapper)return;const stage=wrapper.querySelector('.scene-sticky-stage');const range=Math.max(0,wrapper.offsetHeight-(stage?.getBoundingClientRect().height||window.innerHeight));const top=window.scrollY+wrapper.getBoundingClientRect().top;window.scrollTo({top:top+range*progress,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
  const mainRef=useRef(null), headerRef=useRef(null), spyLock=useRef(null);
  const navigate=id=>{const target=document.getElementById(id);if(!target)return;setActive(id);spyLock.current=id;target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});let timer;const unlock=()=>{clearTimeout(timer);spyLock.current=null;window.removeEventListener('scrollend',unlock);};window.addEventListener('scrollend',unlock,{once:true});timer=setTimeout(unlock,900);};
  useEffect(()=>{const main=mainRef.current,header=headerRef.current;if(!main||!header)return;let offsets=[],h=header.getBoundingClientRect().height,raf=0;const measure=()=>{h=header.getBoundingClientRect().height;document.documentElement.style.setProperty('--topbar-h',`${h}px`);offsets=navItems.map(([id])=>({id,node:document.getElementById(id)})).filter(x=>x.node).map(x=>({...x,top:x.node.getBoundingClientRect().top+window.scrollY}));update();};const progress=(id,y)=>{const o=offsets.find(x=>x.id===id);return o?Math.max(0,Math.min(1,(y-o.top)/Math.max(1,o.node.offsetHeight-window.innerHeight))):0;};const update=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const y=window.scrollY,line=y+h+window.innerHeight*.35,bottom=y+window.innerHeight>=document.documentElement.scrollHeight-2;let id=y<2?'top':bottom?'contact':offsets[0]?.id||'top';for(const x of offsets){if(x.top<=line)id=x.id;else break;}if(!spyLock.current)setActive(id);setProjectProgress(progress('projects',y));setJourneyProgress(progress('journey',y));});};const abort=()=>{if(spyLock.current){unlockRef.current?.();update();}};const observer=new ResizeObserver(measure);observer.observe(main);observer.observe(header);window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',measure);window.addEventListener('wheel',abort,{passive:true});window.addEventListener('touchstart',abort,{passive:true});document.fonts?.ready?.then(measure);measure();return()=>{observer.disconnect();window.removeEventListener('scroll',update);window.removeEventListener('resize',measure);window.removeEventListener('wheel',abort);window.removeEventListener('touchstart',abort);cancelAnimationFrame(raf);};},[]);

  return <div className="site-shell" onClick={event=>{const a=event.target.closest('a[href^="#"]');if(a){const id=a.getAttribute('href').slice(1);if(navItems.some(([key])=>key===id)){event.preventDefault();navigate(id);}}}}>
    <div className="liquid-backdrop" aria-hidden="true"><LiquidChrome color="#f4f1f2" speed={0.18} amplitude={0.26} frequencyX={2.4} frequencyY={2.8} detail={4} thickness={1.2} depth={0.9} roughness={0.48} exposure={0.8} interactive={false} rippleStrength={0} rippleSize={1} tilt={0} intro lightMode={false} maxDevicePixelRatio={1.5} /></div>
    <header className="topbar" ref={headerRef}>
      <a className="wordmark" href="#top" aria-label="Sarthak Jain home">SJ<span>.</span></a>
      <GooeyNav
        items={navItems.map(([id, label]) => ({ label, href: `#${id}` }))}
        activeIndex={Math.max(0, navItems.findIndex(([id]) => id === active))}
        theme="dark" color="#ef233c" activeTextColor="#ffffff" size="md" frame hoverEffect
        particleCount={15} spread={56} animationTime={600} timeVariance={300} gooeyness={0.5} wobble={0.5}
        colors={['#ef233c', '#ff5267', '#f4f1f2']}
        className="topbar-gooey-nav"
      />
      <a className="top-contact" href="#contact">LET'S CONNECT <span>↗</span></a>
    </header>

    <main ref={mainRef}>
      <section className="hero section" id="top">
        <div className="hero-main-row">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> B.TECH CSE · SYMBIOSIS PUNE</p>
          <h1 className="hero-title text-enter">Hi, I'm Sarthak<span>.</span></h1>
          <h1 className="hero-subtitle text-enter text-enter-delay">I build things<span>.</span></h1>
          <p className="hero-description"> A Computer Science student with a foundation in C, C++, and Python. I enjoy vibe coding — using AI and experimentation to turn ideas into working projects.</p>
          <div className="hero-actions"><a className="button-primary" href="#projects">Explore projects <span>↘</span></a><a className="button-ghost" href="#contact">Get in touch <span>↗</span></a></div>
        </div>
        <div className="hero-dither-shell" aria-hidden="true" style={{ '--portrait-mask-image': `url("${asset('dither-portrait-mask.png')}")` }}>
          <DitherVeil
            src={asset('dither-portrait.jpg')}
            fit="contain"
            pattern="floyd"
            pixelSize={2}
            inkColor="#120f17"
            paperColor="#f4f1ea"
            revealRadius={200}
            softness={0.6}
            linger={1}
          />
        </div>
        </div>
        <div className="hero-bottom"><span>PORTFOLIO / 2026</span><a href="#about">SCROLL TO EXPLORE ↓</a><span>18.5204° N / 73.8567° E</span></div>
      </section>

      <section className="section about-section" id="about">
        <div className="section-kicker"><span>01 / ABOUT</span><span>THE PERSON BEHIND THE PIXELS</span></div>
        <div className="about-grid"><FoldHeading className="about-fold-heading" lines={[[{ text: 'A little' }], [{ text: 'about ' }, { text: 'me.', accent: true }]]} /><div><p className="large-copy">I’m Sarthak Jain, a B.Tech Computer Science and Engineering student at Symbiosis, Pune.</p><p>I enjoy exploring technology, programming, and web development while building projects that turn ideas into useful digital experiences. My approach is simple: learn, experiment, build, and keep improving.</p><div className="about-facts"><div><span>STUDYING</span><strong>B.Tech CSE</strong></div><div><span>INSTITUTE</span><strong>Symbiosis, Pune</strong></div><div><span>INTERESTS</span><strong>Programming & Web</strong></div></div></div></div>
      </section>

      <div className="scene-scroll-zone projects-scroll-zone" id="projects"><section className="section projects-section scene-sticky-stage">
        <div className="section-kicker"><span>02 / SELECTED WORK</span><span>SMALL BUILDS, REAL LEARNING</span></div>
        <div className="projects-heading"><FoldHeading className="projects-fold-heading" lines={[[{ text: "Things I've" }], [{ text: 'built.', accent: true }]]} /><p>Campus Bites makes menus and ordering easier to explore. Strength Protocol turns a rep goal into a phased plan with progress tracking.</p></div>
        <ProjectCards progress={projectProgress} />
      </section></div>

      <section className="section skills-section" id="skills">
        <div className="section-kicker"><span>03 / SKILLS IN PROGRESS</span><span>LEARN BY MAKING</span></div>
        <FoldHeading className="skills-fold-heading" lines={[[{ text: "What I'm " }, { text: 'learning.', accent: true }]]} />
        <div className="skills-grid">
          <article><span>01</span><h3>Programming</h3><p>Basic programming and problem solving through coursework and practice.</p><div className="tag-list"><span>C</span><span>C++</span><span>Python</span></div></article>
          <article><span>02</span><h3>Vibe coding</h3><p>Using AI tools to experiment, build ideas, and learn how real projects are put together.</p><div className="tag-list"><span>AI tools</span><span>Experimenting</span></div></article>
          <article><span>03</span><h3>Web development</h3><p>Currently getting familiar with web development by making small projects and experimenting.</p><div className="tag-list"><span>HTML</span><span>CSS</span><span>Learning JS</span></div></article>
          <article><span>04</span><h3>Problem solving</h3><p>Breaking problems down, trying solutions, debugging, and learning from what doesn't work.</p><div className="tag-list"><span>Logic</span><span>Debugging</span><span>Practice</span></div></article>
        </div>
      </section>

      <div className="scene-scroll-zone journey-scroll-zone" id="journey"><section className="section journey-section scene-sticky-stage">
        <div className="section-kicker"><span>04 / MY JOURNEY</span><span>THEN, NOW & WHAT'S NEXT</span></div>
        <div className="journey-heading"><FoldHeading className="journey-fold-heading" lines={[[{ text: 'The learning' }], [{ text: 'path.', accent: true }]]} /><p>Scroll or drag through my education and current focus.</p></div>
        <CircularJourney progress={journeyProgress} onProgress={goToJourneyProgress} />
      </section></div>

      <section className="section contact-section" id="contact">
        <div className="section-kicker"><span>05 / CONTACT</span><span>OPEN TO LEARNING & BUILDING</span></div>
        <FoldHeading className="contact-fold-heading" lines={[[{ text: "Let's make" }], [{ text: 'something ' }, { text: 'useful.', accent: true }]]} />
        <p>Thanks for visiting my portfolio. Feel free to explore my projects and follow my work.</p>
        <div className="contact-actions"><a className="button-primary" href="mailto:sarthak.jain.btech2026@sitpune.edu.in">Email me ↗</a><a className="button-ghost" href="https://github.com/sarthak-9193" target="_blank" rel="noreferrer">GitHub ↗</a></div>
        <footer><span>© {new Date().getFullYear()} SARTHAK JAIN</span><a href="#top">BACK TO TOP ↑</a><span>BUILT WITH CURIOSITY & CODE</span></footer>
      </section>
    </main>
  </div>;
}
