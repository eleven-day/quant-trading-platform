import React from 'react';

const TermContext = React.createContext({
  termsData: {},
  setTermsData: () => {},
});

export default TermContext;