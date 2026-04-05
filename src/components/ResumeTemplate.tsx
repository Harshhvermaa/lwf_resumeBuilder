import { ResumeData } from '../lib/supabase';
import ATSCleanTemplate from './templates/ATSCleanTemplate';
import ProfessionalModernTemplate from './templates/ProfessionalModernTemplate';
import CompactExecutiveTemplate from './templates/CompactExecutiveTemplate';
import DubaiStandardTemplate from './templates/DubaiStandardTemplate';
import EuropeStandardTemplate from './templates/EuropeStandardTemplate';
import CanadaStandardTemplate from './templates/CanadaStandardTemplate';
import SidebarPortraitTemplate from './templates/SidebarPortraitTemplate';
import CreativeDesignerTemplate from './templates/CreativeDesignerTemplate';
import SplitAccentTemplate from './templates/SplitAccentTemplate';
import TealBandTemplate from './templates/TealBandTemplate';
import SpotlightResumeTemplate from './templates/SpotlightResumeTemplate';
import ClassicBandTemplate from './templates/ClassicBandTemplate';
import { prepareResumeForRender } from './templates/templateUtils';

interface ResumeTemplateProps {
  data: ResumeData;
  scale?: number;
}

export default function ResumeTemplate({ data, scale = 1 }: ResumeTemplateProps) {
  const templateId = data.template_id || 'modern';
  const preparedData = prepareResumeForRender(data);

  let template;

  switch (templateId) {
    case 'ats-clean':
      template = <ATSCleanTemplate data={preparedData} />;
      break;
    case 'modern':
      template = <ProfessionalModernTemplate data={preparedData} />;
      break;
    case 'executive':
      template = <CompactExecutiveTemplate data={preparedData} />;
      break;
    case 'dubai':
      template = <DubaiStandardTemplate data={preparedData} />;
      break;
    case 'europe':
      template = <EuropeStandardTemplate data={preparedData} />;
      break;
    case 'canada':
      template = <CanadaStandardTemplate data={preparedData} />;
      break;
    case 'portrait-sidebar':
      template = <SidebarPortraitTemplate data={preparedData} />;
      break;
    case 'creative-designer':
      template = <CreativeDesignerTemplate data={preparedData} />;
      break;
    case 'split-accent':
      template = <SplitAccentTemplate data={preparedData} />;
      break;
    case 'teal-band':
      template = <TealBandTemplate data={preparedData} />;
      break;
    case 'spotlight':
      template = <SpotlightResumeTemplate data={preparedData} />;
      break;
    case 'classic-band':
      template = <ClassicBandTemplate data={preparedData} />;
      break;
    default:
      template = <ProfessionalModernTemplate data={preparedData} />;
  }

  return (
    <div className="resume-scale" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <div className="resume-container">
        {template}
      </div>
    </div>
  );
}
