import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import OfficialShell from './components/OfficialShell'
import MoleculeArt from '@/components/MoleculeArt'
import { brand, coursePrograms, subjectAreas } from '@/content/siteContent'

export default function OfficialHomePage() {
  return (
    <OfficialShell>
      <section className="academic-hero">
        <div className="hero-copy">
          <p className="eyebrow">CHEMISTRY OLYMPIAD</p>
          <h1>{brand.name}<span>化学竞赛团队</span></h1>
          <p className="hero-subjects">{subjectAreas.join(' / ')}</p>
          <div className="hero-actions">
            <Link to="/discover" className="academic-button">进入学习平台 <ArrowRight size={17} /></Link>
            <Link to="/programs" className="academic-link">探索课程 <ArrowUpRight size={17} /></Link>
          </div>
          <div className="hero-footnote"><span />专注每一次思考，每一步进阶。</div>
        </div>
        <MoleculeArt />
      </section>
      <section className="academic-section">
        <div className="section-heading"><div><p className="eyebrow">LEARNING PATH</p><h2>找到你的下一步</h2></div><Link to="/programs" className="academic-link">全部课程 <ArrowUpRight size={16} /></Link></div>
        <div className="program-grid">
          {coursePrograms.slice(0, 3).map((program, index) => (
            <Link to="/programs" key={program.id} className="program-card">
              <div className="card-topline"><span>{program.season}</span><span>0{index + 1}</span></div>
              <h3>{program.name}</h3><p>{program.target}</p>
              <div className="card-bottomline"><span>{program.paperCount}</span><ArrowUpRight size={19} /></div>
            </Link>
          ))}
        </div>
      </section>
      <section className="academic-contact"><div><p className="eyebrow">LET’S BEGIN</p><h2>从一次交流开始。</h2></div><Link to="/enroll" className="academic-button">课程咨询 <ArrowRight size={17} /></Link></section>
    </OfficialShell>
  )
}
