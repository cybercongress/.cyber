import React from 'react';
import InnerActionBarContainerDetail from './actionBarDatail';
import { AppContext, AppContextSigner } from '../../context';

const ActionBarContainer = (props) => {
  return (
    <AppContext.Consumer>
      {(valueAppContext) => (
        <AppContextSigner.Consumer>
          {(valueAppContextSigner) => (
            <InnerActionBarContainerDetail
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
