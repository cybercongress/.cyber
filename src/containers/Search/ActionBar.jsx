import React from 'react';
import InnerActionBarContainer from './ActionBarContainer';
import { AppContext, AppContextSigner } from '../../context';

const ActionBarContainer = (props) => {
  return (
    <AppContext.Consumer>
      {(valueAppContext) => (
        <AppContextSigner.Consumer>
          {(valueAppContextSigner) => (
            <InnerActionBarContainer
              valueAppContext={valueAppContext}
              valueAppContextSigner={valueAppContextSigner}
              {...props}
            />
          )}
        </AppContextSigner.Consumer>
      )}
    </AppContext.Consumer>
  );
};

export default ActionBarContainer;
