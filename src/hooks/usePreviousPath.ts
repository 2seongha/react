import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

function usePreviousPath() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      setPrevPath(prevPathRef.current);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return { currentPath: location.pathname, prevPath };
}

export default usePreviousPath;