import { 
  archiveboxIcon, 
  foldersIcon, 
  signaturesIcon, 
  archivebox2Icon, 
  shreddersIcon,
  emailmarketingIcon,
  documentsIcon,
  penIcon,
  signaturesFlowIcon,
  documentSapIcon,
  creditcardIcon,
  banknotesIcon,
  calculatorIcon,
  documentDollorIcon,
  pasteSapIcon,
  envelopeIcon,
  copyIcon,
  strategyIcon,
  documentTaxIcon,
  gearsIcon,
  documentsFlowIcon,
  docIcon,
  jpgIcon,
  gifIcon,
  pdfIcon,
  pngIcon,
  pptIcon,
  txtIcon,
  xlsIcon,
  zipIcon,
  fileIcon
} from './assets/images';

interface MappingIcon {
  backgroundColor?: string;
  image: string;
}

// flow list 아이콘 매핑 가져오기
export const getFlowIcon = (areaCode: string): MappingIcon => {
  switch (areaCode) {
    case 'TODO':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.08)',
        image: archiveboxIcon,
      };
    case 'APPROVING':
      return {
        backgroundColor: 'rgba(0, 52, 125, 0.08)',
        image: foldersIcon,
      };
    case 'START':
      return {
        backgroundColor: 'rgba(77, 103, 235, 0.08)',
        image: signaturesIcon,
      };
    case 'APPROVED':
      return {
        backgroundColor: 'rgba(0, 168, 98, 0.08)',
        image: archivebox2Icon,
      };
    case 'REJECT':
      return {
        backgroundColor: 'rgba(255, 43, 100, 0.08)',
        image: shreddersIcon,
      };
    case 'REFERENCE':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.08)',
        image: emailmarketingIcon,
      };
    case 'ORG':
      return {
        backgroundColor: 'rgba(77, 90, 235, 0.08)',
        image: documentsIcon,
      };
    case 'IFORD':
      return {
        backgroundColor: 'rgba(137, 77, 235, 0.04)',
        image: penIcon,
      };
    case 'IFOR2':
      return {
        backgroundColor: 'rgba(235, 115, 77, 0.04)',
        image: signaturesFlowIcon,
      };
    case 'IA910':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: documentSapIcon,
      };
    case 'IA102':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: creditcardIcon,
      };
    case 'IA103':
      return {
        backgroundColor: 'rgba(0, 168, 98, 0.04)',
        image: banknotesIcon,
      };
    case 'IA201':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: calculatorIcon,
      };
    case 'IA602':
      return {
        backgroundColor: 'rgba(77, 90, 235, 0.04)',
        image: documentDollorIcon,
      };
    case 'IA204':
      return {
        backgroundColor: 'rgba(122, 77, 235, 0.04)',
        image: calculatorIcon,
      };
    case 'IA601':
      return {
        backgroundColor: 'rgba(77, 127, 235, 0.04)',
        image: pasteSapIcon,
      };
    case 'IA203':
      return {
        backgroundColor: 'rgba(77, 103, 235, 0.04)',
        image: envelopeIcon,
      };
    case 'IFOR3':
      return {
        backgroundColor: 'rgba(255, 43, 100, 0.04)',
        image: copyIcon,
      };
    case 'IA610':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: strategyIcon,
      };
    case 'IA202':
      return {
        backgroundColor: 'rgba(77, 103, 235, 0.04)',
        image: documentTaxIcon,
      };
    case 'MA021':
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: gearsIcon,
      };
    case 'MA011':
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: gearsIcon,
      };
    case 'MA001':
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: gearsIcon,
      };
    case 'MA012':
      return {
        backgroundColor: 'rgba(0, 52, 125, 0.04)',
        image: gearsIcon,
      };
    case 'MA002':
      return {
        backgroundColor: 'rgba(0, 52, 125, 0.04)',
        image: gearsIcon,
      };
    default:
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: documentsFlowIcon,
      };
  }
};

// 파일 확장자 아이콘 매핑 가져오기
export const getFileTypeIcon = (fileName: string): MappingIcon => {
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.includes('doc')) {
    return {
      image: docIcon,
    };
  } else if (lowerFileName.includes('jpg')) {
    return {
      image: jpgIcon,
    };
  } else if (lowerFileName.includes('gif')) {
    return {
      image: gifIcon,
    };
  } else if (lowerFileName.includes('pdf')) {
    return {
      image: pdfIcon,
    };
  } else if (lowerFileName.includes('png')) {
    return {
      image: pngIcon,
    };
  } else if (lowerFileName.includes('ppt')) {
    return {
      image: pptIcon,
    };
  } else if (lowerFileName.includes('txt')) {
    return {
      image: txtIcon,
    };
  } else if (lowerFileName.includes('xls')) {
    return {
      image: xlsIcon,
    };
  } else if (lowerFileName.includes('zip')) {
    return {
      image: zipIcon,
    };
  }
  
  return {
    image: fileIcon,
  };
};

export function getPlatformMode(): 'md' | 'ios' {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf('android') > -1 ? 'md' : 'ios';
}