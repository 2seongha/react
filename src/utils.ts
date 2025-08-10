interface MappingIcon {
  backgroundColor?: string;
  image: string;
}

const iconBasePath = '/assets/images/icon';

// flow list 아이콘 매핑 가져오기
export const getFlowIcon = (areaCode: string): MappingIcon => {
  switch (areaCode) {
    case 'TODO':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.08)',
        image: `${iconBasePath}/home/archivebox.webp`,
      };
    case 'APPROVING':
      return {
        backgroundColor: 'rgba(0, 52, 125, 0.08)',
        image: `${iconBasePath}/home/folders.webp`,
      };
    case 'START':
      return {
        backgroundColor: 'rgba(77, 103, 235, 0.08)',
        image: `${iconBasePath}/home/signatures.webp`,
      };
    case 'APPROVED':
      return {
        backgroundColor: 'rgba(0, 168, 98, 0.08)',
        image: `${iconBasePath}/home/archivebox2.webp`,
      };
    case 'REJECT':
      return {
        backgroundColor: 'rgba(255, 43, 100, 0.08)',
        image: `${iconBasePath}/home/shredders.webp`,
      };
    case 'REFERENCE':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.08)',
        image: `${iconBasePath}/home/emailmarketing.webp`,
      };
    case 'ORG':
      return {
        backgroundColor: 'rgba(77, 90, 235, 0.08)',
        image: `${iconBasePath}/home/documents.webp`,
      };
    case 'IFORD':
      return {
        backgroundColor: 'rgba(137, 77, 235, 0.04)',
        image: `${iconBasePath}/flowlist/pen.webp`,
      };
    case 'IFOR2':
      return {
        backgroundColor: 'rgba(235, 115, 77, 0.04)',
        image: `${iconBasePath}/flowlist/signatures.webp`,
      };
    case 'IA910':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: `${iconBasePath}/flowlist/document_sap.webp`,
      };
    case 'IA102':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: `${iconBasePath}/flowlist/creditcard.webp`,
      };
    case 'IA103':
      return {
        backgroundColor: 'rgba(0, 168, 98, 0.04)',
        image: `${iconBasePath}/flowlist/banknotes.webp`,
      };
    case 'IA201':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: `${iconBasePath}/flowlist/calculator.webp`,
      };
    case 'IA602':
      return {
        backgroundColor: 'rgba(77, 90, 235, 0.04)',
        image: `${iconBasePath}/flowlist/document_dollor.webp`,
      };
    case 'IA204':
      return {
        backgroundColor: 'rgba(122, 77, 235, 0.04)',
        image: `${iconBasePath}/flowlist/calculator.webp`,
      };
    case 'IA601':
      return {
        backgroundColor: 'rgba(77, 127, 235, 0.04)',
        image: `${iconBasePath}/flowlist/paste_sap.webp`,
      };
    case 'IA203':
      return {
        backgroundColor: 'rgba(77, 103, 235, 0.04)',
        image: `${iconBasePath}/flowlist/envelope.webp`,
      };
    case 'IFOR3':
      return {
        backgroundColor: 'rgba(255, 43, 100, 0.04)',
        image: `${iconBasePath}/flowlist/copy.webp`,
      };
    case 'IA610':
      return {
        backgroundColor: 'rgba(77, 174, 235, 0.04)',
        image: `${iconBasePath}/flowlist/strategy.webp`,
      };
    case 'IA202':
      return {
        backgroundColor: 'rgba(77, 103, 235, 0.04)',
        image: `${iconBasePath}/flowlist/document_tax.webp`,
      };
    case 'MA021':
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: `${iconBasePath}/flowlist/gears.webp`,
      };
    case 'MA011':
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: `${iconBasePath}/flowlist/gears.webp`,
      };
    case 'MA001':
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: `${iconBasePath}/flowlist/gears.webp`,
      };
    case 'MA012':
      return {
        backgroundColor: 'rgba(0, 52, 125, 0.04)',
        image: `${iconBasePath}/flowlist/gears.webp`,
      };
    case 'MA002':
      return {
        backgroundColor: 'rgba(0, 52, 125, 0.04)',
        image: `${iconBasePath}/flowlist/gears.webp`,
      };
    default:
      return {
        backgroundColor: 'rgba(0, 156, 255, 0.04)',
        image: `${iconBasePath}/flowlist/documents.webp`,
      };
  }
};

// 파일 확장자 아이콘 매핑 가져오기
export const getFileTypeIcon = (fileName: string): MappingIcon => {
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.includes('doc')) {
    return {
      image: `${iconBasePath}/filetype/doc.webp`,
    };
  } else if (lowerFileName.includes('jpg')) {
    return {
      image: `${iconBasePath}/filetype/jpg.webp`,
    };
  } else if (lowerFileName.includes('gif')) {
    return {
      image: `${iconBasePath}/filetype/gif.webp`,
    };
  } else if (lowerFileName.includes('pdf')) {
    return {
      image: `${iconBasePath}/filetype/pdf.webp`,
    };
  } else if (lowerFileName.includes('png')) {
    return {
      image: `${iconBasePath}/filetype/png.webp`,
    };
  } else if (lowerFileName.includes('ppt')) {
    return {
      image: `${iconBasePath}/filetype/ppt.webp`,
    };
  } else if (lowerFileName.includes('txt')) {
    return {
      image: `${iconBasePath}/filetype/txt.webp`,
    };
  } else if (lowerFileName.includes('xls')) {
    return {
      image: `${iconBasePath}/filetype/xls.webp`,
    };
  } else if (lowerFileName.includes('zip')) {
    return {
      image: `${iconBasePath}/filetype/zip.webp`,
    };
  }
  
  return {
    image: `${iconBasePath}/filetype/file.webp`,
  };
};