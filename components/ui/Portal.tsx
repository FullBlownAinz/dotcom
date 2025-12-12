import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // The portal root is guaranteed to exist by index.html
    setContainer(document.getElementById('portal-root'));
  }, []);

  return container ? ReactDOM.createPortal(children, container) : null;
};

export default Portal;