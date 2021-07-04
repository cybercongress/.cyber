import React from 'react';
import { Link } from 'react-router-dom';
import { getValidatorsInfo } from '../../utils/search/utils';
import { trimString } from '../../utils/utils';
import { Dots } from '../ui/Dots';
import { CYBER } from '../../utils/config';

class Account extends React.Component {
  constructor(props) {
    super(props);
    const { address } = this.props;
    this.state = {
      account: `/network/bostrom/contract/${address}`,
      moniker: address,
      loading: true,
    };
  }

  componentDidMount() {
    const { address } = this.props;
    if (address) {
      if (address.includes(CYBER.BECH32_PREFIX_ACC_ADDR_CYBERVALOPER)) {
        this.updateAccount();
      } else {
        this.setState({
          account: `/network/bostrom/contract/${address}`,
          moniker: `${trimString(address, 9, 6)}`,
          loading: false,
        });
      }
    }
  }

  updateAccount = async () => {
    const { address } = this.props;

    const result = await getValidatorsInfo(address);
    if (result) {
      this.setState({
        account: `/network/bostrom/hero/${address}`,
        moniker: `${result.description.moniker}`,
        loading: false,
      });
    }
  };

  render() {
    const { moniker, account, loading } = this.state;
    const { children, colorText } = this.props;

    if (loading) {
      return <Dots />;
    }

    return (
      <span>
        <Link style={{ color: colorText || '#36d6ae' }} to={account}>
          {moniker}
        </Link>
        {children}
      </span>
    );
  }
}

export default Account;
